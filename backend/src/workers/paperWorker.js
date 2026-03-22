const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const Assignment = require('../models/Assignment');
const Job = require('../models/Job');
const Result = require('../models/Result');
const { generatePaper } = require('../services/llmService');
const { getIO } = require('../socket');

let worker = null;

function initWorker() {
  const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  connection.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Worker Redis] Connection error:', err);
    }
  });

  worker = new Worker(
    'paper-generation',
    async (bullJob) => {
      const { assignmentId, modifier } = bullJob.data;
      const jobId = bullJob.id;

      console.log(`[Worker] Processing job ${jobId} for assignment ${assignmentId}`);

      // 1. Processing... (Keep Job status updates for auditing but use assignmentId for the socket room)
      await Job.findOneAndUpdate(
        { bullJobId: jobId },
        { status: 'processing' }
      );
      
      const socketRoomId = assignmentId;

      // 2. Fetch Assignment from MongoDB
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // 3. Call LLM service
      const paperData = await generatePaper(assignment, modifier);

      // 4. Save Result to MongoDB
      const result = await Result.create({
        assignmentId: assignment._id,
        schoolName: paperData.schoolName || assignment.schoolName,
        subject: paperData.subject || assignment.subject,
        className: paperData.className || assignment.className,
        timeAllowed: paperData.timeAllowed,
        maximumMarks: paperData.maximumMarks || assignment.totalMarks,
        generalInstruction: paperData.generalInstruction,
        sections: paperData.sections,
        answerKey: paperData.answerKey,
        generatedAt: new Date(),
      });

      // 4.5 Generate PDF in Background via Puppeteer
      try {
        const { generateLocalPdf } = require('../services/pdfService');
        const pdfFileName = await generateLocalPdf(result);
        result.pdfUrl = pdfFileName;
        await result.save();
        console.log(`[Worker] PDF Generated successfully: ${pdfFileName}`);
      } catch (pdfErr) {
        console.error('[Worker] PDF Generation failed:', pdfErr);
      }

      // 5. Update Job status to 'done'
      await Job.findOneAndUpdate(
        { bullJobId: jobId },
        { status: 'done' }
      );

      // 6. Emit via Socket.io
      try {
        const io = getIO();
        io.to(socketRoomId).emit('job:done', {
          resultId: result._id,
          assignmentId: assignment._id,
        });
      } catch (socketErr) {
        console.warn('[Worker] Socket.io emit failed:', socketErr.message);
      }

      console.log(`[Worker] Job ${jobId} completed. Result ID: ${result._id}`);
      return { resultId: result._id };
    },
    { connection, concurrency: 2 }
  );

  worker.on('failed', async (bullJob, err) => {
    const jobId = bullJob?.id;
    const errorMessage = err?.message || 'Unknown error';
    console.error(`[Worker] Job ${jobId} failed:`, errorMessage);

    const socketRoomId = assignmentId || jobId?.toString();
    try {
      await Job.findOneAndUpdate(
        { bullJobId: jobId },
        { status: 'failed', errorMessage }
      );
    } catch (dbErr) {
      console.error('[Worker] Failed to update job status:', dbErr.message);
    }

    try {
      const io = getIO();
      if (socketRoomId) io.to(socketRoomId).emit('job:failed', { message: errorMessage });
    } catch (socketErr) {
      console.warn('[Worker] Socket.io emit on failure failed:', socketErr.message);
    }
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err.message);
  });

  console.log('[Worker] Paper generation worker initialised.');
  return worker;
}

module.exports = { initWorker };

const express = require('express');
const multer = require('multer');
const path = require('path');
const Assignment = require('../models/Assignment');
const Job = require('../models/Job');
const Result = require('../models/Result');
const { paperQueue } = require('../queues/paperQueue');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── Multer Configuration ────────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── POST /api/assignments ───────────────────────────────────────────────────
router.post('/', protect, upload.single('file'), async (req, res, next) => {
  try {
    const {
      title,
      schoolName,
      subject,
      className,
      dueDate,
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions,
    } = req.body;

    // --- Validation --------------------------------------------------------
    if (!title || !schoolName || !subject || !className || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, schoolName, subject, className, dueDate.',
      });
    }

    let parsedQuestionTypes;
    try {
      parsedQuestionTypes =
        typeof questionTypes === 'string'
          ? JSON.parse(questionTypes)
          : questionTypes;
    } catch {
      return res.status(400).json({
        success: false,
        message: 'questionTypes must be a valid JSON string.',
      });
    }

    if (
      !Array.isArray(parsedQuestionTypes) ||
      parsedQuestionTypes.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'questionTypes must be a non-empty array.',
      });
    }

    const numTotal = Number(totalQuestions);
    const numMarks = Number(totalMarks);

    if (isNaN(numTotal) || numTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'totalQuestions must be a positive number.',
      });
    }
    if (isNaN(numMarks) || numMarks <= 0) {
      return res.status(400).json({
        success: false,
        message: 'totalMarks must be a positive number.',
      });
    }

    // Validate individual question types
    for (const qt of parsedQuestionTypes) {
      if (!qt.type || qt.numQuestions == null || qt.marksPerQuestion == null) {
        return res.status(400).json({
          success: false,
          message:
            'Each questionType must have type, numQuestions, and marksPerQuestion.',
        });
      }
      if (qt.numQuestions < 0 || qt.marksPerQuestion < 0) {
        return res.status(400).json({
          success: false,
          message: 'numQuestions and marksPerQuestion cannot be negative.',
        });
      }
    }

    // --- Determine file info -----------------------------------------------
    let fileUrl = null;
    let fileType = null;
    if (req.file) {
      fileUrl = req.file.path;
      if (req.file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      } else {
        fileType = 'image';
      }
    }

    // --- Save Assignment ---------------------------------------------------
    const assignment = await Assignment.create({
      userId: req.user._id,
      title,
      schoolName,
      subject,
      className,
      fileUrl,
      fileType,
      dueDate: new Date(dueDate),
      questionTypes: parsedQuestionTypes,
      totalQuestions: numTotal,
      totalMarks: numMarks,
      additionalInstructions: additionalInstructions || '',
    });

    // --- Enqueue BullMQ job ------------------------------------------------
    const bullJob = await paperQueue.add('generate-paper', {
      assignmentId: assignment._id.toString(),
    });

    // --- Save Job document -------------------------------------------------
    const jobDoc = await Job.create({
      assignmentId: assignment._id,
      bullJobId: bullJob.id,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      data: {
        assignmentId: assignment._id,
        jobId: jobDoc._id,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/assignments ────────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/assignments/:id ────────────────────────────────────────────────
router.get('/:id', protect, async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    return res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/assignments/:id ─────────────────────────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    // Also delete the associated result (if any)
    await Result.deleteMany({ assignmentId: req.params.id });
    await Job.deleteMany({ assignmentId: req.params.id });
    return res.json({ success: true, message: 'Assignment deleted.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/assignments/:id/regenerate ─────────────────────────────────────
router.post('/:id/regenerate', protect, async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!assignment) {
       return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Delete old result
    await Result.deleteMany({ assignmentId: req.params.id });

    // Ensure we create a new job entry for the new generation task
    const bullJob = await paperQueue.add('generate-paper', {
      assignmentId: assignment._id.toString(),
      modifier: req.body.modifier || 'same',
    });

    const jobDoc = await Job.create({
      assignmentId: assignment._id,
      bullJobId: bullJob.id,
      status: 'pending',
    });

    return res.status(200).json({
      success: true,
      data: {
        jobId: jobDoc._id,
      },
      message: 'Regeneration started.'
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/assignments/:id/pdf ──────────────────────────────────────────────
router.get('/:id/pdf', protect, async (req, res, next) => {
  try {
    const result = await Result.findOne({ assignmentId: req.params.id });
    if (!result || !result.pdfUrl) {
      return res.status(404).json({ success: false, message: 'PDF not found or not yet generated.' });
    }
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(__dirname, '../../', uploadDir, result.pdfUrl);

    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file missing from disk.' });
    }
    
    res.download(filePath, `QuestionPaper_${req.params.id}.pdf`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

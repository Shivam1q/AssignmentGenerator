const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Shared Redis connection config — reused by Worker in paperWorker.js
const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const paperQueue = new Queue('paper-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  }
});

module.exports = { paperQueue, redisConnection };

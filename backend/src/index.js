require('dotenv').config();

// ─── Environment Validation ────────────────────────────────────────────────────
const REQUIRED_ENV = ['PORT', 'MONGODB_URI', 'REDIS_URL', 'OPENAI_API_KEY', 'FRONTEND_URL'];
for (const envVar of REQUIRED_ENV) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const { initSocket } = require('./socket');
const { initWorker } = require('./workers/paperWorker');
const authRouter = require('./routes/auth');
const assignmentsRouter = require('./routes/assignments');
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// ─── Security & Architecture Middleware ─────────────────────────────────────────
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true 
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "https://fonts.googleapis.com"],
      connectSrc: ["'self'", "http://localhost:8000", "ws://localhost:8000", "wss://localhost:8000"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:8000"],
      fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, // Increased for dev/socket stability
  message: { success: false, message: 'Too many requests' }
});

app.use('/api', globalLimiter);

// ─── Ensure uploads directory exists ─────────────────────────────────────────
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/assignments', assignmentsRouter);

const Result = require('./models/Result');

app.get('/api/results/:assignmentId', protect, async (req, res, next) => {
  try {
    const result = await Result.findOne({
      assignmentId: req.params.assignmentId,
    });
    if (!result) {
      return res.status(200).json({ success: true, pending: true, message: 'Result not yet generated.' });
    }
    return res.json({ success: true, pending: false, data: result });
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connection.on('error', (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[DB] Mongoose connection error:', err);
  }
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DB] Connected to MongoDB');
    }

    initSocket(server);
    initWorker();

    server.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Server] VedaAI backend listening on port ${PORT}`);
      }
    });

    // Graceful Shutdown Mapping
    const gracefulShutdown = async () => {
      if (process.env.NODE_ENV !== 'production') console.log('[System] Shutting down gracefully...');
      try {
        await mongoose.connection.close();
        if (process.env.NODE_ENV !== 'production') console.log('[System] Mongoose connection closed.');
        process.exit(0);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.error(err);
        process.exit(1);
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Server] Failed to start:', err);
    }
    process.exit(1);
  }
}

start();

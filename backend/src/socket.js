const { Server } = require('socket.io');

let io = null;

/**
 * Initialise Socket.io and attach to the HTTP server.
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket) => {

    // Clients join a room identified by their jobId so they
    // receive real-time updates for that specific job.
    socket.on('join', (jobId) => {
      socket.join(jobId);
    });

    socket.on('disconnect', () => {
    });
  });

  return io;
}

/**
 * Retrieve the Socket.io instance (singleton).
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialised. Call initSocket(httpServer) first.');
  }
  return io;
}

module.exports = { initSocket, getIO };

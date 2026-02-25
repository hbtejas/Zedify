const { Server } = require('socket.io');

let io;
// Map: userId -> socketId
const onlineUsers = new Map();
// Map: socketId -> userId
const socketToUser = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── User comes online ───────────────────────────────────────────────────
    socket.on('userOnline', (userId) => {
      onlineUsers.set(userId, socket.id);
      socketToUser.set(socket.id, userId);

      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`✅ User ${userId} is online`);
    });

    // ─── Private Chat ────────────────────────────────────────────────────────
    socket.on('sendMessage', ({ senderId, receiverId, message, tempId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      const payload = { senderId, receiverId, message, tempId, createdAt: new Date() };

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', payload);
      }
      // Confirm back to sender
      socket.emit('messageSent', payload);
    });

    // ─── Typing indicator ────────────────────────────────────────────────────
    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', { senderId });
      }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userStopTyping', { senderId });
      }
    });

    // ─── Video Signaling (WebRTC) ─────────────────────────────────────────────
    // Join a video room
    socket.on('joinVideoRoom', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      console.log(`📹 ${userName} joined room ${roomId}`);

      // Notify others in the room that a new peer has arrived
      socket.to(roomId).emit('userJoinedRoom', { userId, userName, socketId: socket.id });
    });

    // Relay WebRTC Offer
    socket.on('videoOffer', ({ offer, roomId, targetSocketId, fromSocketId, fromUserId }) => {
      io.to(targetSocketId).emit('videoOffer', {
        offer,
        fromSocketId,
        fromUserId,
        roomId,
      });
    });

    // Relay WebRTC Answer
    socket.on('videoAnswer', ({ answer, targetSocketId, fromSocketId }) => {
      io.to(targetSocketId).emit('videoAnswer', { answer, fromSocketId });
    });

    // Relay ICE Candidates
    socket.on('iceCandidate', ({ candidate, targetSocketId, fromSocketId }) => {
      io.to(targetSocketId).emit('iceCandidate', { candidate, fromSocketId });
    });

    // Leave video room
    socket.on('leaveVideoRoom', ({ roomId, userId, userName }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('userLeftRoom', { userId, userName, socketId: socket.id });
      console.log(`📹 ${userName} left room ${roomId}`);
    });

    // Screen sharing toggle broadcast
    socket.on('screenShareStarted', ({ roomId, userId }) => {
      socket.to(roomId).emit('screenShareStarted', { userId, socketId: socket.id });
    });
    socket.on('screenShareStopped', ({ roomId, userId }) => {
      socket.to(roomId).emit('screenShareStopped', { userId, socketId: socket.id });
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        onlineUsers.delete(userId);
        socketToUser.delete(socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        console.log(`❌ User ${userId} went offline`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIO, getOnlineUsers };

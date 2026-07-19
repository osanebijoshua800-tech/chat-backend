const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change to your frontend URL later
    methods: ["GET", "POST"]
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Chat server is running' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Broadcast when a user joins
  socket.broadcast.emit('user-joined', {
    id: socket.id,
    message: 'A new user has joined the chat'
  });

  // Handle incoming messages
  socket.on('send-message', (data) => {
    // Broadcast to everyone except sender
    socket.broadcast.emit('receive-message', {
      id: socket.id,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', {
      id: socket.id,
      isTyping: data.isTyping
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socket.broadcast.emit('user-left', {
      id: socket.id,
      message: 'A user has left the chat'
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
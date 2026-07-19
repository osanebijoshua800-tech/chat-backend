const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// 1. Enable Global CORS for both standard HTTP requests and Postman
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Add Body Parsers so your routes can read incoming JSON payloads from Postman
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Create the HTTP server wrapper required by Socket.io
const server = http.createServer(app);

// 4. Initialize Socket.io with open CORS permissions for testing
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 5. Your working root route to verify the deployment status
app.get('/', (req, res) => {
  res.json({ message: "Chat server is running" });
});

// 6. Basic HTTP POST route placeholder for fallback message saving
app.post('/messages', (req, res) => {
  const { sender, text } = req.body;
  console.log(`Received via HTTP POST - Sender: ${sender}, Text: ${text}`);
  
  // Replace this placeholder logic with your actual database saving layer when ready
  res.status(201).json({
    status: "success",
    message: "Message received via HTTP",
    data: { sender, text, timestamp: new Date() }
  });
});

// 7. Socket.io Connection Logic for real-time messaging
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // Listen for real-time incoming messages from clients or Postman
  socket.on('send_message', (data) => {
    console.log('Real-time message received:', data);
    
    // Broadcast the message instantly to all other connected clients
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 8. Bind to process.env.PORT so Render can dynamically assign a port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is actively running on port ${PORT}`);
});
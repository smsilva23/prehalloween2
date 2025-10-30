const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Store user colors
const userColors = new Map();
const colors = [
  { color: '#ff4444', name: 'Red' },
  { color: '#4444ff', name: 'Blue' },
  { color: '#44ff44', name: 'Green' },
  { color: '#ffff44', name: 'Yellow' },
  { color: '#ff44ff', name: 'Magenta' },
  { color: '#44ffff', name: 'Cyan' }
];

// Store canvas state (all drawing strokes)
const canvasState = [];

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);
  
  // Assign color to new user
  socket.on('requestColor', () => {
    const assignedColor = colors[userColors.size % colors.length];
    userColors.set(socket.id, assignedColor);
    
    console.log(`🎨 Assigned ${assignedColor.name} to ${socket.id}`);
    
    // Send color to the user
    socket.emit('colorAssigned', {
      color: assignedColor.color,
      colorName: assignedColor.name,
      userId: socket.id
    });
    
    // Send other users' colors to this user
    userColors.forEach((color, userId) => {
      if (userId !== socket.id) {
        socket.emit('otherUserColor', {
          color: color.color,
          colorName: color.name,
          userId
        });
      }
    });
    
    // Notify other users about this user's color
    socket.broadcast.emit('otherUserColor', {
      color: assignedColor.color,
      colorName: assignedColor.name,
      userId: socket.id
    });
    
    // Send current canvas state to the new user
    if (canvasState.length > 0) {
      console.log(`📋 Sending canvas state (${canvasState.length} strokes) to ${socket.id}`);
      socket.emit('canvasState', canvasState);
    }
  });

  // Handle drawing start
  socket.on('drawingStart', (data) => {
    console.log(`🖌️ Drawing start from ${socket.id}`);
    
    // Store the stroke start in canvas state
    canvasState.push({
      type: 'start',
      x: data.x,
      y: data.y,
      color: data.color,
      tool: data.tool,
      timestamp: Date.now()
    });
    
    socket.broadcast.emit('drawingStart', {
      x: data.x,
      y: data.y,
      color: data.color,
      tool: data.tool,
      userId: socket.id
    });
  });

  // Handle drawing movement
  socket.on('drawingMove', (data) => {
    // Store the stroke movement in canvas state
    canvasState.push({
      type: 'move',
      x: data.x,
      y: data.y,
      color: data.color,
      tool: data.tool,
      timestamp: Date.now()
    });
    
    socket.broadcast.emit('drawingMove', {
      x: data.x,
      y: data.y,
      color: data.color,
      tool: data.tool,
      userId: socket.id
    });
  });

  // Handle drawing end
  socket.on('drawingEnd', () => {
    console.log(`🖌️ Drawing end from ${socket.id}`);
    
    // Store the stroke end in canvas state
    canvasState.push({
      type: 'end',
      timestamp: Date.now()
    });
    
    socket.broadcast.emit('drawingEnd', { userId: socket.id });
  });

  // Handle canvas clear
  socket.on('clearCanvas', () => {
    console.log(`🧹 Canvas cleared by ${socket.id}`);
    
    // Clear the canvas state
    canvasState.length = 0;
    
    io.emit('canvasCleared');
  });

  // Handle user color update
  socket.on('setColor', (data) => {
    const requested = data && typeof data.color === 'string' ? data.color.trim() : '';
    const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(requested);
    if (!isValidHex) return;

    userColors.set(socket.id, { color: requested, name: requested });

    socket.emit('colorAssigned', {
      color: requested,
      colorName: requested,
      userId: socket.id
    });

    socket.broadcast.emit('otherUserColor', {
      color: requested,
      colorName: requested,
      userId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
    
    // Remove user's color
    userColors.delete(socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
});

module.exports = { app, server, io };

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

const users = {};
app.use(express.static(path.join(__dirname))); // Serve static files from the 'public' folder


io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  socket.emit('howmanyusers', Object.keys(users).length);

  socket.on('new-user', (name) => {
    users[socket.id] = name;
    console.log(`User is connected: ${name}`);
    socket.broadcast.emit('user-connected', name);
    io.emit('update-user-list', Object.values(users));
  });

  socket.on('send-file', (data) => {
    data.userName = users[data.fileuser];
    socket.broadcast.emit('receive-file', data);
  });

  socket.on('send-chat-message', (message) => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id], id1: socket.id });
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      io.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
      console.log(`User disconnected: ${socket.id}`);
      io.emit('update-user-list', Object.values(users)); //  updated user list
      socket.emit('howmanyusers', Object.keys(users).length);
    
    }
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});

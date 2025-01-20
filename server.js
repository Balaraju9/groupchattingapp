const io = require('socket.io')(3000, {
  cors: {
    origin: '*',
  },
});

const users = {};

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('new-user', (name) => {
    users[socket.id] = name;
    console.log(`User is connected: ${name}`);
    socket.broadcast.emit('user-connected', name);
  });
  socket.on('send-file', (data) => {
    socket.broadcast.emit('receive-file', data);
  });

  socket.on('send-chat-message', (message) => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] ,id1:socket.id});
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      io.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

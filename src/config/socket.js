const socketIo = require('socket.io');
const Message = require('../api/models/message');
const { socketAuthMiddleware } = require('../middlewares/auth');

const connectSocket = (server) => {
  const io = socketIo(server, {
    path: '/socket.io',
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('Socket.io configurado en el puerto 8686');

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);
    if (socket.user) {
      console.log(`Usuario autenticado: ${socket.user.profile.name}`);
    }

    socket.on('send_message', async (data) => {
      try {
        if (!socket.user) {
          return socket.emit('message_sent', { success: false, error: 'Usuario no autenticado' });
        }

        const { receiverId, text } = data;
        if (!receiverId || !text) {
          throw new Error('Faltan datos necesarios: receiverId y/o text');
        }

        const message = new Message({
          sender: socket.user._id,
          receiver: receiverId,
          text: text,
        });

        await message.save();

        io.to(receiverId).emit('receive_message', {
          id: message._id,
          sender: socket.user._id,
          text: text,
          timestamp: message.timestamp,
        });

        socket.emit('message_sent', { success: true });
      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        socket.emit('message_sent', { success: false, error: error.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Cliente desconectado: ${socket.id} - Razón: ${reason}`);
    });
  });

  return io;
};

module.exports = connectSocket;



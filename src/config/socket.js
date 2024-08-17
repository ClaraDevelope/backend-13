const socketIo = require('socket.io');
const { keyVerifyer } = require('../utils/jwt');
const Message = require('../api/models/message');
const USER = require('../api/models/users');

const connectSocket = (server) => {
  const io = socketIo(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  console.log('Socket.io configurado en el puerto 8686');

  io.use(async (socket, next) => {
    console.log('Middleware de autenticación iniciado');
    try {
      console.log('Middleware de autenticación iniciado');
      const token = socket.handshake.query.token;
      console.log('Token recibido:', token);

      if (token) {
        console.log('Verificando token...');
        const decoded = keyVerifyer(token);
        console.log('Token verificado, decoded:', decoded);

        const userId = decoded.id;
        console.log('ID del usuario:', userId);

        const user = await USER.findById(userId);
        console.log('Consulta a la base de datos realizada');

        if (user) {
          socket.user = user;
          console.log('Usuario autenticado:', user.profile.name);
          next();
        } else {
          console.log('Usuario no encontrado');
          next(new Error('Usuario no encontrado'));
        }
      } else {
        console.log('No se recibió token');
        next();
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      next(error);
    }
  });

  io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);
    if (socket.user) {
      console.log(`Usuario autenticado: ${socket.user.profile.name}`);
    }

    socket.on('send_message', async (data) => {
      try {
        console.log('Mensaje recibido:', data);
        if (!socket.user) {
          return socket.emit('message_sent', { success: false, error: 'Usuario no autenticado' });
        }

        const { receiverId, text } = data;
        const message = new Message({
          sender: socket.user._id,
          receiver: receiverId,
          text: text,
        });
        await message.save();

        io.to(receiverId).emit('receive_message', {
          sender: socket.user._id,
          text: text,
          timestamp: message.timestamp,
        });

        socket.emit('message_sent', { success: true });
      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

module.exports = connectSocket;






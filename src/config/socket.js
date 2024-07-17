const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { Server } = require('http');
const { connectDB } = require('./db.js');
const { keyVerifyer } = require('../utils/jwt.js');
const USER = require('../api/models/users.js');

// connectDB(); // Asegúrate de que la conexión a la base de datos está establecida


// TODO   TAREA PARA MAÑANA: EN EL INDEX.JS: 
// *HACER IMPORTACIÓN: const connectSocket = require('./socketConfig.js');
// * const server = http.createServer(app);
// * const io = connectSocket(server);



const connectSocket = (server) => {
  const io = socketIo(server);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      const decoded = keyVerifyer(token); // Verifica el token JWT
      const userId = decoded.id;

      // Aquí puedes hacer una consulta a la base de datos para obtener los detalles del usuario
      // En este ejemplo, asumiremos que ya tienes una función para buscar usuario por ID

      // Reemplaza este código con tu lógica para buscar al usuario en la base de datos
      const user = await USER.findById(userId); // Asegúrate de importar tu modelo de usuario adecuadamente
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.user = user; // Almacena los detalles del usuario en el socket para usarlo más tarde
      next();
    } catch (error) {
      next(error); // Pasa cualquier error al siguiente middleware de Socket.IO
    }
  });

  io.on('connection', (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);
    console.log(`Usuario autenticado: ${socket.user.username}`); // Ejemplo: Accede al nombre de usuario del socket

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

module.exports = connectSocket;
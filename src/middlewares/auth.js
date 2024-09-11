const USER = require("../api/models/users");
const { keyVerifyer } = require("../utils/jwt");

const tokenVerifyer = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json('No se proporcionó un token de autorización');
    }
    const parsedToken = token.substring(7);

    const { id } = keyVerifyer(parsedToken);
    const user = await USER.findById(id);
    user.password = null;

    req.user = user;
    next();
  } catch (error) {
    return res.status(400).json('No estás autorizado');
  }
};

const isAuth = async (req, res, next) => {
  try {
    await tokenVerifyer(req, res, next);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'No estás autorizado' });
  }
};

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.query.token; 
    
    if (!token) {
      return next(new Error('Token no recibido'));
    }

    const parsedToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    const { id } = keyVerifyer(parsedToken); 
    const user = await USER.findById(id);

    if (!user) {
      return next(new Error('Usuario no encontrado'));
    }

    socket.user = user; 
    next(); 
  } catch (error) {
    console.error('Error en la autenticación del socket:', error);
    return next(new Error('Autenticación fallida'));
  }
};

module.exports = { isAuth, socketAuthMiddleware, tokenVerifyer };

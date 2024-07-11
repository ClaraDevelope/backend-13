const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('CONECTADO A LA BBDD');
  } catch (error) {
    console.log('ERROR EN AL CONEXIÓN A LA BBDD:', error);
  }
};

module.exports = { connectDB };


// const connectDB = async () => {
//   try {
//     const dbUrl = process.env.DB_URL;
//     if (!dbUrl) {
//       throw new Error('DB_URL no está definido en las variables de entorno');
//     }   
//     await mongoose.connect(dbUrl, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('CONECTADO A LA BBDD');
//   } catch (error) {
//     console.error('ERROR EN AL CONEXIÓN A LA BBDD:', error);
//   }
// };
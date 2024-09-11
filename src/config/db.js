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


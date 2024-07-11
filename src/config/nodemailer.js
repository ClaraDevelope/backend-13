const nodemailer = require('nodemailer');
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: 'clara.manzano.corona@gmail.com', 
    pass: process.env.CLAVE_APLICACION 
  }
});

module.exports = {transporter};

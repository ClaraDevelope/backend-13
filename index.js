require('dotenv').config()
const express = require('express');
const cors = require('cors')
const { connectDB } = require('./src/config/db.js');
const { mainRouter } = require('./src/api/routes/mainRouter.js');
const cloudinary = require('cloudinary').v2

connectDB()
const app = express();
app.use(cors())
app.use(express.json())

const PORT =  8686;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

app.use('/api/v1', mainRouter)

app.use('*', (req, res, next) => {
  return res.status(404).json('RUTA NO ENCONTRADA')
})

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

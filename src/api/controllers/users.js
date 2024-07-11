const USER = require("../models/users");
const CALENDARY = require("../models/calendary");
const POST = require("../models/posts");
const COMMENT = require("../models/comments");
const { keyGenerator } = require("../../utils/jwt");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { transporter } = require("../../config/nodemailer");
const { deleteImgCloudinary } = require("../../utils/deleteFile");
require('dotenv').config();

const getUsers = async (req, res, next) => {
    try {
        const populateFields = [
            { path: 'calendary', model: 'Calendary' },
            { path: 'contacts.user', model: 'User' },
            { path: 'posts', model: 'Post' },
            { path: 'comments', model: 'Comment' }
        ];

        const users = await USER.find().populate(populateFields);
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Error al hacer get de los usuarios' });
    }
};
const getUserByID = async (req, res, next) =>{
try {
  const {id} = req.params
  const user = await USER.findById(id)
  console.log(user);
  return res.status(200).json(user)
} catch (error) {
  return res.status(400).json('error al hacer get por ID de los usuarios')
}

}
const register = async (req, res, next) =>{
  try {
    const duplicatedUser = await USER.findOne({
      email: req.body.email
    })
    if (duplicatedUser) {
      return res.status(400).json('Usuario ya existente')
    }
    const newUser = new USER({
    profile : {    
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    },
  })

  if (req.file) {
    newUser.profile.img = req.file.path
  }
  const user = await newUser.save()

  if(user.profile.email){
    const mailOptions = {
      from: 'clara.manzano.corona@gmail.com',
      to: user.profile.email,
      subject: 'Te has registrado correctamente en la mejor red social menstrual',
      text: `Hola, ${user.profile.name} ¡Bienvenida a nuestra comunidad! Nos alegra mucho tenerte con nosotros en la mejor red social menstrual. Aquí podrás encontrar información valiosa, compartir tus experiencias, y conectar con otras personas que entienden lo que estás viviendo. Estamos comprometidos a ofrecerte un espacio seguro, lleno de apoyo y comprensión. Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. ¡Estamos aquí para ti! Gracias por unirte a nuestra comunidad. ¡Estamos emocionados de acompañarte en este viaje!`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo electrónico de prueba:', error);
      } else {
        console.log('Correo electrónico de prueba enviado:', info.response);
      }
    }); 
  

  console.log('usuario creado correctamente:', user);
  return res.status(201).json(user)
}
   
  } catch (error) {
    console.error(error)
    return res.status(400).json('Error al hacer post de los usuarios')
  }
}
const login = async (req, res, next) =>{
  try {
    const {email, password} = req.body

    if (!email || !password) {
      switch (true) {
        case !email && !password:
          return res.status(400).json({ error: 'Email o contraseña incorrectas' });
        case !email:
          return res.status(400).json({ error: 'Error en el email' });
        case !password:
          return res.status(400).json({ error: 'Error en la contraseña' });
      }
    }
    const user = await USER.findOne({ 'profile.email': email })
    console.log(user);
    if(!user){
      return res.status(404).json({error: 'Usuario no encontrado'})
    }
    const validPassword = bcrypt.compareSync(password, user.profile.password)

    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' })
    }

    const token = keyGenerator(user._id)
    console.log({token: token, user: user});
    return res.status(200).json({ token, user })

  } catch (error) {
    console.log(error);
    return res.status(400).json({error: 'no se ha realizado el login correctamente'})
  }
}

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const newImage = req.file

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron datos válidos para actualizar' });
    }

    const user = await USER.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (newImage && user.profile.img) {
      deleteImgCloudinary(user.profile.img); 
    }else if (newImage.path){
      user.profile.img = newImage.path
    }

    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (key !== 'password' && key !== 'img') {
          user.profile[key] = updates[key];
        } else if (key === 'password') {
          user.profile.password = bcrypt.hashSync(updates.password, 10);
        } else if (key === 'img') {
          user.profile.img = updates.img;
        }
      }
    }

    const updatedUser = await user.save();

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error en updateUser:', error);
    return res.status(400).json({ error: 'Error al actualizar el usuario' });
  }
};

const deleteUser = async (req, res, next) =>{
  try {
    const {id} = req.params
    const userToDelete = await USER.findById(id)
    if(userToDelete.profile.img){
      deleteImgCloudinary(userToDelete.profile.img)
    }
    const user = await USER.findByIdAndDelete(id) 
    return res
    .status(200)
    .json({ message: 'la cuenta ha sido eliminada con éxito', user })
  } catch (error) {
    return res.status(400).json('Error al eliminar el usuario')
  }
}

module.exports = {
    getUsers, getUserByID, register, login, updateUser, deleteUser
};

const USER = require("../models/users");
const CALENDARY = require("../models/calendary");
const POST = require("../models/posts");
const COMMENT = require("../models/comments");
const { keyGenerator } = require("../../utils/jwt");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { transporter } = require("../../config/nodemailer");
const { deleteImgCloudinary } = require("../../utils/deleteFile");
const MENSTRUALCYCLE = require("../models/menstrualCycle");
const Notification = require("../models/notifications");
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
const getUserByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await USER.findById(id)
      .populate({
        path: 'menstrualCycle',
        model: 'MenstrualCycle'
      })
      .populate({
        path: 'calendary',
        model: 'Calendary',
        populate: [
          {
            path: 'events',
            model: 'Event'
          },
          {
            path: 'mood',
            model: 'Mood'
          }
        ]
      })
      .populate({
        path: 'contacts.user',
        model: 'User'
      })
      .populate({
        path: 'posts',
        model: 'Post',
        populate: {
          path: 'comments',
          model: 'Comment'
        }
      })
      .populate({
        path: 'comments',
        model: 'Comment'
      });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log(user);
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(400).json('Error al obtener los datos del usuario por ID');
  }
};

const register = async (req, res, next) => {
  try {
    const { email, name, password, birthDate, averageCycleLength, averagePeriodLength } = req.body;
    console.log('Password recibido:', password)
    const duplicatedUser = await USER.findOne({ 'profile.email': email });

    if (duplicatedUser) {
      return res.status(400).json('Usuario ya existente');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new USER({
      profile: {
        name,
        email,
        password: hashedPassword,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        img: req.file ? req.file.path : undefined,
      },
      role: 'user',
      menstrualCycle: null,
      calendary: null,
      contacts: [],
      posts: [],
      comments: []
    });

    const user = await newUser.save();

    if (user.profile.email) {
      const mailOptions = {
        from: 'clara.manzano.corona@gmail.com',
        to: user.profile.email,
        subject: 'Te has registrado correctamente en la mejor red social menstrual',
        text: `Hola, ${user.profile.name} ¡Bienvenida a nuestra comunidad! ...`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error al enviar el correo electrónico de prueba:', error);
        } else {
          console.log('Correo electrónico de prueba enviado:', info.response);
        }
      });
    }
    console.log('Body:', req.body);

    const defaultCycleLength = 28; 
    const defaultPeriodLength = 5;  

    const cycleLength = averageCycleLength ? parseInt(averageCycleLength, 10) : defaultCycleLength;
    const periodLength = averagePeriodLength ? parseInt(averagePeriodLength, 10) : defaultPeriodLength;

    try {
      const menstrualCycle = new MENSTRUALCYCLE({
        user: user._id,
        averageCycleLength: cycleLength,
        averagePeriodLength: periodLength,
        history: [] 
      });

      await menstrualCycle.save();
      user.menstrualCycle = menstrualCycle._id;
      await user.save();

      console.log('Ciclo menstrual guardado y asociado correctamente:', menstrualCycle);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'No se ha guardado correctamente el ciclo menstrual' });
    }

    try {
      const calendary = new CALENDARY({
        user: user._id,
        menstrualCycle: user.menstrualCycle._id,
        events: [],
        personalTags: [],
        symptoms: [],
        mood: []
      });

      await calendary.save();
      user.calendary = calendary._id;
      await user.save();

      console.log('Calendario creado y asociado correctamente:', calendary);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'No se ha guardado correctamente el calendario' });
    }

    console.log('Usuario creado correctamente:', user);
    return res.status(201).json(user);

  } catch (error) {
    console.error(error);
    return res.status(400).json('Error al hacer post de los usuarios');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

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

  try {
    const user = await USER.findOne({ 'profile.email': email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.profile.password);
    if (validPassword) {
      const token = keyGenerator(user._id);
      console.log({user:user, token:token});
      return res.status(200).json({ user, token });
    } else {
      return res.status(409).json({ message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'no se ha realizado el login correctamente' });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const newImage = req.file;

    console.log(updates);

    if (Object.keys(updates).length === 0 && !newImage) {
      console.log(Object.keys(updates).length);
      return res.status(400).json({ error: 'No se proporcionaron datos válidos para actualizar' });
    }

    const user = await USER.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }


    if (newImage) {
      if (user.profile.img) {
        deleteImgCloudinary(user.profile.img);
      }
      user.profile.img = newImage.path; 
    }

    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        if (key !== 'password' && key !== 'img') {
          user.profile[key] = updates[key];
        } else if (key === 'password') {
          user.profile.password = bcrypt.hashSync(updates.password, 10);
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

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query; 
    console.log(query);

    if (!query) {
      return res.status(400).json({ message: 'El término de búsqueda es requerido' });
    }
    const users = await USER.find({
      $or: [
        { 'profile.name': { $regex: query, $options: 'i' } },
        { 'profile.email': { $regex: query, $options: 'i' } }
      ]
    }).select('profile.name profile.email profile.img'); 
    console.log(users);
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    return res.status(500).json({ message: 'Error al buscar usuarios' });
  }
};

const addContact = async (req, res, next) => {
  const { userId } = req.params; 
  const currentUserId = req.user.id; 

  try {
    const existingRequest = await Notification.findOne({
      sender: currentUserId,
      receiver: userId,
      type: 'contact_request',
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Ya has enviado una solicitud de contacto a este usuario' });
    }

    const newNotification = new Notification({
      sender: currentUserId,
      receiver: userId,
      type: 'contact_request',
      status: 'pending'
    });

    await newNotification.save();

    return res.status(200).json({ message: 'Solicitud de contacto enviada' });
  } catch (error) {
    console.error('Error al enviar solicitud de contacto:', error);
    return res.status(500).json({ message: 'Error al enviar solicitud de contacto' });
  }
};


const getContacts = async (req, res, next) => {
  const currentUserId = req.user.id;

  try {
    const user = await USER.findById(currentUserId)
      .populate('contacts.user', 'profile.name profile.email profile.img'); 

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ contacts: user.contacts });
  } catch (error) {
    console.error('Error al obtener los contactos:', error);
    res.status(500).json({ message: 'Error al obtener los contactos' });
  }
};

module.exports = {
    getUsers, getUserByID, register, login, updateUser, deleteUser, searchUsers, addContact, getContacts
};


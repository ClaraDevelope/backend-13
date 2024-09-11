const CALENDARY = require("../models/calendary");
const USER = require('../models/users');
const MENSTRUALCYCLE = require('../models/menstrualCycle');
const { parseDate } = require("../../utils/parseDate");
const mongoose = require('mongoose');


const getAllEvents = async (req, res) => {
  try {
    const calendary = await CALENDARY.findOne({ user: req.user._id });
    if (!calendary) {
      return res.status(404).json({ message: 'Calendary not found' });
    }

    const { events, personalTags, symptoms, mood } = calendary;
    const allEvents = [
      ...events.map(event => ({ ...event.toObject(), type: 'event' })),
      ...personalTags.map(tag => ({ ...tag.toObject(), type: 'personalTag' })),
      ...symptoms.map(symptom => ({ ...symptom.toObject(), type: 'symptom' })),
      ...mood.map(mood => ({ ...mood.toObject(), type: 'mood' })),
    ];

    res.status(200).json(allEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEntryValues = async(req, res) =>{
  try {
    
    const entryValues = {
      event: ['deporte', 'relaciones', 'hormonaciones', 'viaje', 'enfermedad', 'menstruacion', 'fiesta', 'cumpleaños', 'medico'],
      mood: ['enojada', 'ansiosa', 'calmada', 'deprimida', 'con energía', 'fatigada', 'feliz', 'hambrienta', 'frustrada', 'voluble', 'nerviosa', 'sensible', 'cansada', 'estresada', 'irritable', 'dormida', 'atrevida'],
      symptom: [], 
      personalTag: [] 
    };
    return res.status(200).json(entryValues)
  } catch (error) {
    res.status(400).json({ message: 'solicitud errónea' })
  }
}

const getCalendary = async (req, res) => {
  try {
    const userId  = req.user._id;
    const calendary = await CALENDARY.findOne({ user: userId });
    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }
    res.status(200).json(calendary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el calendario' });
  }
};

const addEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { entryType, date, type, value } = req.body;
    const calendary = await CALENDARY.findOne({ user: userId });

    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    let newEntry;
    const entryId = new mongoose.Types.ObjectId(); 

    switch (entryType) {
      case 'event':
        newEntry = { _id: entryId, date: parseDate(date), value };
        calendary.events.push(newEntry);
        break;
      case 'personalTag':
        newEntry = { _id: entryId, date: parseDate(date), value };
        calendary.personalTags.push(newEntry);
        break;
      case 'symptom':
        newEntry = { _id: entryId, date: parseDate(date), value };
        calendary.symptoms.push(newEntry);
        break;
      case 'mood':
        newEntry = { _id: entryId, date: parseDate(date), value };
        calendary.mood.push(newEntry);
        break;
      default:
        return res.status(400).json({ message: 'Tipo de entrada no válido' });
    }

    await calendary.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar la entrada' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { entryType, entryId } = req.params; 

    if (!entryId) {
      return res.status(400).json({ message: 'ID de entrada no proporcionado' });
    }

    const calendary = await CALENDARY.findOne({ user: userId });

    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    let removedEntry;

    switch (entryType) {
      case 'event':
        const eventIndex = calendary.events.findIndex(event => event._id === entryId);
        if (eventIndex === -1) {
          return res.status(404).json({ message: 'Evento no encontrado' });
        }
        removedEntry = calendary.events[eventIndex];
        calendary.events.splice(eventIndex, 1);
        break;

      case 'personalTag':

        const personalTagIndex = calendary.personalTags.findIndex(tag => tag._id == entryId);
        if (personalTagIndex === -1) {
          return res.status(404).json({ message: 'Etiqueta personal no encontrada' });
        }
        removedEntry = calendary.personalTags[personalTagIndex];
        calendary.personalTags.splice(personalTagIndex, 1);
        break;

      case 'symptom':

        const symptomIndex = calendary.symptoms.findIndex(symptom => symptom._id == entryId);
        if (symptomIndex === -1) {
          return res.status(404).json({ message: 'Síntoma no encontrado' });
        }
        removedEntry = calendary.symptoms[symptomIndex];
        calendary.symptoms.splice(symptomIndex, 1);
        break;

      case 'mood':

        const moodIndex = calendary.mood.findIndex(mood => mood._id == entryId);
        if (moodIndex === -1) {
          return res.status(404).json({ message: 'Mood no encontrado' });
        }
        removedEntry = calendary.mood[moodIndex];
        calendary.mood.splice(moodIndex, 1);
        break;

      default:
        return res.status(400).json({ message: 'Tipo de entrada no válido' });
    }


    await calendary.save();
    res.status(200).json({ message: 'Entrada eliminada', removedEntry });
  } catch (error) {
    console.error('Error al eliminar la entrada:', error);
    res.status(500).json({ message: 'Error al eliminar la entrada' });
  }
};


module.exports = { getAllEvents, getEntryValues , getCalendary, addEntry, deleteEntry };
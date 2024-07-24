const MENSTRUALCYCLE = require('../models/menstrualCycle');
const USER = require('../models/users');
const CALENDARY = require('../models/calendary');
const { parseDate } = require('../../utils/parseDate');

const addOrUpdateMenstrualCycle = async (req, res) => {
  try {
    const userId = req.params.id;
    const { averageCycleLength, averagePeriodLength } = req.body;

    if (!averageCycleLength || !averagePeriodLength) {
      return res.status(400).json({ message: 'Los datos del ciclo menstrual son necesarios' });
    }

    let menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });

    if (menstrualCycle) {
      menstrualCycle.averageCycleLength = averageCycleLength;
      menstrualCycle.averagePeriodLength = averagePeriodLength;
    } else {
      menstrualCycle = new MENSTRUALCYCLE({
        user: userId,
        averageCycleLength,
        averagePeriodLength,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + averagePeriodLength * 24 * 60 * 60 * 1000)
      });
    }
    await menstrualCycle.save();
    await USER.findByIdAndUpdate(userId, { menstrualCycle: menstrualCycle._id }, { new: true });

    return res.status(200).json(menstrualCycle);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al agregar o actualizar el ciclo menstrual' });
  }
};
//TODO no está modificando la fecha de comienzo y de fin de menstruación. Te aparece la que viene por defecto con tu ciclo.
const recordMenstruationStart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const { startDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'La fecha de inicio es necesaria' });
    }

    const parsedStartDate = parseDate(startDate);

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });
    console.log({menstrualCycle: menstrualCycle});
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const endDate = new Date(parsedStartDate.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);

    const event = {
      date: parsedStartDate,
      type: 'menstruacion'
    };

    const calendary = new CALENDARY({
      user: userId,
      menstrualCycle: menstrualCycle._id,
      events: [event],
      startDate: parsedStartDate,
      endDate: endDate
    });
  console.log({calendary: calendary.user});
    await calendary.save();

    return res.status(200).json(calendary);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al registrar el inicio de la menstruación' });
  }
};

const recordMenstruationEnd = async (req, res) => {
  try {
    const userId = req.user._id;
    const { endDate } = req.body;

    if (!endDate) {
      return res.status(400).json({ message: 'La fecha de fin es necesaria' });
    }

    const parsedEndDate = parseDate(endDate);

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const calendary = await CALENDARY.findOne({ user: userId, menstrualCycle: menstrualCycle._id });
    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    calendary.endDate = parsedEndDate;
    await calendary.save();

    return res.status(200).json(calendary);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al registrar el fin de la menstruación' });
  }
};

const getCurrentMenstrualCycle = async (req, res) => {
  try {
    const userId = req.user._id;

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const calendary = await CALENDARY.findOne({ user: userId, menstrualCycle: menstrualCycle._id });
    
    const nextCycleStart = new Date(menstrualCycle.endDate.getTime() + menstrualCycle.averageCycleLength * 24 * 60 * 60 * 1000);

    return res.status(200).json({
      menstrualCycle,
      calendary,
      nextCycleStart
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al obtener el estado del ciclo menstrual' });
  }
};


module.exports = { addOrUpdateMenstrualCycle, recordMenstruationStart, recordMenstruationEnd, getCurrentMenstrualCycle };






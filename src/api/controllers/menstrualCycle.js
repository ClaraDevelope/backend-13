const MENSTRUALCYCLE = require('../models/menstrualCycle');
const USER = require('../models/users');
const CALENDARY = require('../models/calendary');
const { parseDate } = require('../../utils/parseDate');
const { calculateNextCycle } = require('../../utils/nextCycle');

const addOrUpdateMenstrualCycle = async (req, res) => {
  try {
    const userId = req.user._id;
    const { averageCycleLength, averagePeriodLength } = req.body;

    let menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });

    if (menstrualCycle) {
      if (averageCycleLength !== undefined) {
        menstrualCycle.averageCycleLength = averageCycleLength;
      }
      if (averagePeriodLength !== undefined) {
        menstrualCycle.averagePeriodLength = averagePeriodLength;
      }

      const lastCycle = menstrualCycle.history.length > 0 ? menstrualCycle.history[menstrualCycle.history.length - 1] : { endDate: menstrualCycle.endDate };
      if (lastCycle.endDate) {
        const nextCycle = calculateNextCycle(new Date(lastCycle.endDate), menstrualCycle.averageCycleLength, menstrualCycle.averagePeriodLength);
        menstrualCycle.nextCycles.push(nextCycle);
      }

      menstrualCycle = await MENSTRUALCYCLE.findByIdAndUpdate(menstrualCycle._id, menstrualCycle, { new: true });
    } else {
      menstrualCycle = new MENSTRUALCYCLE({
        user: userId,
        averageCycleLength: averageCycleLength || 28,  
        averagePeriodLength: averagePeriodLength || 5, 
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + (averagePeriodLength || 5) * 24 * 60 * 60 * 1000),
        history: [],
        nextCycles: []
      });

      const nextCycle = calculateNextCycle(menstrualCycle.endDate, menstrualCycle.averageCycleLength, menstrualCycle.averagePeriodLength);
      menstrualCycle.nextCycles.push(nextCycle);

      await menstrualCycle.save();
    }

    await USER.findByIdAndUpdate(userId, { menstrualCycle: menstrualCycle._id }, { new: true });

    return res.status(200).json(menstrualCycle);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al agregar o actualizar el ciclo menstrual' });
  }
};



const recordMenstruationStart = async (req, res) => {
  try {
    console.log('Cuerpo de la solicitud:', req.body);
    const userId = req.user._id;
    const { startDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'La fecha de inicio es necesaria' });
    }

    const parsedStartDate = parseDate(startDate);

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const endDate = new Date(parsedStartDate.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);
    menstrualCycle.startDate = parsedStartDate;
    menstrualCycle.endDate = endDate;
    menstrualCycle.history.push({ startDate: parsedStartDate, endDate: endDate });

    const nextCycle = calculateNextCycle(endDate, menstrualCycle.averageCycleLength, menstrualCycle.averagePeriodLength);
    menstrualCycle.nextCycle = nextCycle;

    await menstrualCycle.save();
    return res.status(200).json(menstrualCycle)

 
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al registrar el inicio de la menstruación' });
  }
};


const recordMenstruationEnd = async (req, res) => {
  try {
    console.log('Cuerpo de la solicitud:', req.body);
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

    menstrualCycle.endDate = parsedEndDate;
    await menstrualCycle.save();

    return res.status(200).json(menstrualCycle);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al registrar el fin de la menstruación' });
  }
};
const getCurrentMenstrualCycle = async (req, res) => {
  try {
    const userId = req.user._id;
    const cycleId = req.params.cycleId;
    const limitDate = new Date();
    limitDate.setFullYear(limitDate.getFullYear() + 50); 

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ _id: cycleId, user: userId }).exec();
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const calendary = await CALENDARY.findOne({ user: userId }).exec();
    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    const lastMenstruationEvent = menstrualCycle.history.length > 0
      ? menstrualCycle.history[menstrualCycle.history.length - 1]
      : null;

    let currentCycleStart, currentCycleEnd;
    if (lastMenstruationEvent) {
      currentCycleStart = new Date(lastMenstruationEvent.startDate);
      currentCycleEnd = new Date(lastMenstruationEvent.endDate);
    } else {
      return res.status(200).json({
        menstrualCycle,
        calendary,
        currentCycle: null,
        nextCycles: []
      });
    }

    menstrualCycle.nextCycles = [];
    let nextCycleStart = new Date(currentCycleStart.getTime() + menstrualCycle.averageCycleLength * 24 * 60 * 60 * 1000);
    let nextCycleEnd = new Date(nextCycleStart.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);

    while (nextCycleStart <= limitDate) {
      menstrualCycle.nextCycles.push({
        start: nextCycleStart,
        end: nextCycleEnd
      });

      nextCycleStart = new Date(nextCycleStart.getTime() + menstrualCycle.averageCycleLength * 24 * 60 * 60 * 1000);
      nextCycleEnd = new Date(nextCycleStart.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);
    }

    await menstrualCycle.save();

    return res.status(200).json({
      menstrualCycle,
      calendary,
      currentCycle: {
        start: currentCycleStart.toISOString(),
        end: currentCycleEnd.toISOString()
      },
      nextCycles: menstrualCycle.nextCycles.map(cycle => ({
        start: cycle.start.toISOString(),
        end: cycle.end.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error in getCurrentMenstrualCycle:', error);
    return res.status(400).json({ message: 'Error al obtener el estado del ciclo menstrual' });
  }
};

module.exports = { addOrUpdateMenstrualCycle, recordMenstruationStart, recordMenstruationEnd, getCurrentMenstrualCycle };

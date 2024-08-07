const MENSTRUALCYCLE = require('../models/menstrualCycle');
const USER = require('../models/users');
const CALENDARY = require('../models/calendary');
const { parseDate } = require('../../utils/parseDate');
const {calculateNextCycle} = require('../../utils/nextCycle')

const addOrUpdateMenstrualCycle = async (req, res) => {
  try {
    const userId = req.user._id
      const { averageCycleLength, averagePeriodLength } = req.body;

      if (!averageCycleLength || !averagePeriodLength) {
          return res.status(400).json({ message: 'Los datos del ciclo menstrual son necesarios' });
      }

      // Buscar el ciclo menstrual actual del usuario
      let menstrualCycle = await MENSTRUALCYCLE.findOne({ user: userId });

      if (menstrualCycle) {
          menstrualCycle.averageCycleLength = averageCycleLength;
          menstrualCycle.averagePeriodLength = averagePeriodLength;

          // Recalcular nextCycle basado en el último ciclo en el historial
          const lastCycle = menstrualCycle.history.length > 0 ? menstrualCycle.history[menstrualCycle.history.length - 1] : { endDate: menstrualCycle.endDate };
          if (lastCycle.endDate) {
              menstrualCycle.nextCycle = calculateNextCycle(new Date(lastCycle.endDate), averageCycleLength, averagePeriodLength);
          }
          console.log({menstrualCycle: menstrualCycle.averageCycleLength, periodCycle: averagePeriodLength});
          // Actualizar el ciclo menstrual en la base de datos
          menstrualCycle = await MENSTRUALCYCLE.findByIdAndUpdate(menstrualCycle._id, menstrualCycle, { new: true });
      } else {
          // Si es un nuevo ciclo
          menstrualCycle = new MENSTRUALCYCLE({
              user: userId,
              averageCycleLength,
              averagePeriodLength,
              startDate: new Date(),
              endDate: new Date(new Date().getTime() + averagePeriodLength * 24 * 60 * 60 * 1000),
              history: []
          });
          // Calcular nextCycle para el nuevo ciclo
          menstrualCycle.nextCycle = calculateNextCycle(menstrualCycle.endDate, averageCycleLength, averagePeriodLength);

          // Guardar el nuevo ciclo menstrual en la base de datos
          await menstrualCycle.save();
      }

      // Actualizar la referencia al ciclo menstrual en el usuario
      await USER.findByIdAndUpdate(userId, { menstrualCycle: menstrualCycle._id }, { new: true });
      console.log({menstrualCycle: menstrualCycle.averageCycleLength, periodCycle: averagePeriodLength});
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

      const calendary = await CALENDARY.findOne({ user: userId });
      if (!calendary) {
          return res.status(404).json({ message: 'Calendario no encontrado' });
      }

      const event = {
          date: parsedStartDate,
          value: 'menstruacion'
      };

      calendary.events.push(event);
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

    const calendary = await CALENDARY.findOne({ user: userId});
    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    menstrualCycle.endDate = parsedEndDate;
    await menstrualCycle.save();

    return res.status(200).json(calendary);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Error al registrar el fin de la menstruación' });
  }
};

const getCurrentMenstrualCycle = async (req, res) => {
  try {
    const userId = req.user._id; 
    console.log(userId);
    const cycleId = req.params.cycleId; 

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ _id: cycleId, user: userId }).exec();
    console.log('Menstrual Cycle:', menstrualCycle); 
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const calendary = await CALENDARY.findOne({ user: userId }).exec();
    console.log('Calendary:', calendary); 

    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    const lastMenstruationEvent = calendary.events
      .filter(event => event.value === 'menstruacion')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    console.log('Last Menstruation Event:', lastMenstruationEvent);

    if (!lastMenstruationEvent) {
      return res.status(404).json({ message: 'No se encontró una menstruación registrada' });
    }

    const lastMenstrualCycle = menstrualCycle.history
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    console.log('Last Menstrual Cycle:', lastMenstrualCycle); 

    let currentCycleStart, currentCycleEnd;

    if (lastMenstrualCycle) {
      currentCycleStart = new Date(lastMenstrualCycle.startDate);
      currentCycleEnd = new Date(lastMenstrualCycle.endDate);
    } else {
      currentCycleStart = new Date(lastMenstruationEvent.date);
      currentCycleEnd = new Date(currentCycleStart.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);
    }

    const nextCycleStart = new Date(currentCycleEnd.getTime() + menstrualCycle.averageCycleLength * 24 * 60 * 60 * 1000);
    const nextCycleEnd = new Date(nextCycleStart.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);

    return res.status(200).json({
      menstrualCycle,
      calendary,
      currentCycle: {
        start: currentCycleStart.toISOString(),
        end: currentCycleEnd.toISOString()
      },
      nextCycle: {
        start: nextCycleStart.toISOString(),
        end: nextCycleEnd.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getCurrentMenstrualCycle:', error);
    return res.status(400).json({ message: 'Error al obtener el estado del ciclo menstrual' });
  }
};

module.exports = { addOrUpdateMenstrualCycle, recordMenstruationStart, recordMenstruationEnd, getCurrentMenstrualCycle };






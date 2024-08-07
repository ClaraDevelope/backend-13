const getCurrentMenstrualCycle = async (req, res) => {
  try {
    const userId = req.user._id; 
    const cycleId = req.params.cycleId; 

    const menstrualCycle = await MENSTRUALCYCLE.findOne({ _id: cycleId, user: userId }).exec();
    if (!menstrualCycle) {
      return res.status(404).json({ message: 'Ciclo menstrual no encontrado' });
    }

    const calendary = await CALENDARY.findOne({ user: userId }).exec();
    if (!calendary) {
      return res.status(404).json({ message: 'Calendario no encontrado' });
    }

    const lastMenstruationEvent = calendary.events
      .filter(event => event.value === 'menstruacion')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const lastMenstrualCycle = menstrualCycle.history
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

    let currentCycleStart, currentCycleEnd;

    if (lastMenstrualCycle) {
      currentCycleStart = new Date(lastMenstrualCycle.startDate);
      currentCycleEnd = new Date(lastMenstrualCycle.endDate);
    } else if (lastMenstruationEvent) {
      currentCycleStart = new Date(lastMenstruationEvent.date);
      currentCycleEnd = new Date(currentCycleStart.getTime() + menstrualCycle.averagePeriodLength * 24 * 60 * 60 * 1000);
    } else {
      return res.status(404).json({ message: 'No se encontró una menstruación registrada ni un ciclo menstrual' });
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

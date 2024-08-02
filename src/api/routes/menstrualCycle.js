const { addOrUpdateMenstrualCycle, recordMenstruationStart, recordMenstruationEnd, getCurrentMenstrualCycle } = require('../controllers/menstrualCycle')

const menstrualCycleRouter = require('express').Router()

menstrualCycleRouter.post('/new', addOrUpdateMenstrualCycle )
menstrualCycleRouter.post('/start', recordMenstruationStart)
menstrualCycleRouter.post('/end', recordMenstruationEnd)
menstrualCycleRouter.get('/:cycleId', getCurrentMenstrualCycle)

module.exports = { menstrualCycleRouter }
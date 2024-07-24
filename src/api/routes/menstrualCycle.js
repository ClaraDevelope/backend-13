const { addOrUpdateMenstrualCycle, recordMenstruationStart, recordMenstruationEnd, getCurrentMenstrualCycle } = require('../controllers/menstrualCycle')

const menstrualCycleRouter = require('express').Router()

menstrualCycleRouter.post('/new', addOrUpdateMenstrualCycle )
menstrualCycleRouter.post('/start', recordMenstruationStart)
menstrualCycleRouter.post('/end', recordMenstruationEnd)
menstrualCycleRouter.get('/:id', getCurrentMenstrualCycle)

module.exports = { menstrualCycleRouter, recordMenstruationStart }
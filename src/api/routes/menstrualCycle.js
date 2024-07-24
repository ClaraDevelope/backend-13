const { addOrUpdateMenstrualCycle, recordMenstruationStart } = require('../controllers/menstrualCycle')

const menstrualCycleRouter = require('express').Router()

menstrualCycleRouter.post('/new', addOrUpdateMenstrualCycle )
menstrualCycleRouter.post('/start', recordMenstruationStart)

module.exports = { menstrualCycleRouter, recordMenstruationStart }
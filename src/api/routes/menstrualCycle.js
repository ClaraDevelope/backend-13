const { addOrUpdateMenstrualCycle } = require('../controllers/menstrualCycle')

const menstrualCycleRouter = require('express').Router()

menstrualCycleRouter.post('/new', addOrUpdateMenstrualCycle )

module.exports = { menstrualCycleRouter }
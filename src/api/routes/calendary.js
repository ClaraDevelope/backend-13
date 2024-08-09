const { getAllEvents, getCalendary, addEntry, deleteEntry, getEntryValues } = require('../controllers/calendary')

const calendaryRouter = require('express').Router()

calendaryRouter.get('/', getAllEvents)
calendaryRouter.get('/entry', getEntryValues)
calendaryRouter.get('/:id', getCalendary)
calendaryRouter.post('/entry/add', addEntry);
calendaryRouter.delete('/entry/:entryType/:entryId', deleteEntry)

module.exports = { calendaryRouter }
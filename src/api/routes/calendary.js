const { getCalendary, addEvent, addEntry, deleteEntry } = require('../controllers/calendary')

const calendaryRouter = require('express').Router()


calendaryRouter.get('/:id', getCalendary)
calendaryRouter.post('/entry', addEntry);
calendaryRouter.delete('/entry/:entryType/:entryId', deleteEntry)

module.exports = { calendaryRouter }
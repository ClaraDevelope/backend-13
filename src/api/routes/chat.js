
const { getMessages } = require('../controllers/chat');

const chatRouter = require('express').Router()

chatRouter.get('/messages/:userId', getMessages);

module.exports = chatRouter;
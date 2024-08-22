
const express = require('express');
const { sendMessage, getMessages } = require('../controllers/message');
const { isAuth } = require('../../middlewares/auth');
const messageRouter = express.Router();

messageRouter.post('/send', isAuth, sendMessage);
messageRouter.get('/messages/:userId', isAuth , getMessages);

module.exports = messageRouter;

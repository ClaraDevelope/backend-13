const { getNotifications, respondToContactRequest } = require('../controllers/notifications');

const notificationRouter = require('express').Router();

notificationRouter.get('/', getNotifications);
notificationRouter.post('/respond/:notificationId', respondToContactRequest);

module.exports = { notificationRouter };

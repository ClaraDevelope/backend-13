const { getNotifications, respondToContactRequest, markNotificationAsRead } = require('../controllers/notifications');

const notificationRouter = require('express').Router();

notificationRouter.get('/', getNotifications);
notificationRouter.post('/respond/:notificationId', respondToContactRequest);
notificationRouter.post('/mark-read/:notificationId', markNotificationAsRead); 

module.exports = { notificationRouter };


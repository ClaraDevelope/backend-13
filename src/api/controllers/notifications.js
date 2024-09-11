const Notification = require("../models/notifications");
const USER = require("../models/users");

const getNotifications = async (req, res, next) => {
  const currentUserId = req.user.id;

  try {
    const notifications = await Notification.find({
      receiver: currentUserId,
      status: 'pending'
    }).populate('sender', 'profile.name profile.email profile.img');

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({ message: 'Error al obtener notificaciones.' });
  }
};

const respondToContactRequest = async (req, res, next) => {
  const { notificationId } = req.params;
  const { response } = req.body; 
  const currentUserId = req.user.id;

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      receiver: currentUserId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Solicitud de contacto no encontrada.' });
    }

    notification.status = response;
    notification.updatedAt = Date.now();
    await notification.save();

    if (response === 'accepted') {
      await USER.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { contacts: { user: notification.sender } } }
      );

      await USER.findByIdAndUpdate(
        notification.sender,
        { $addToSet: { contacts: { user: currentUserId } } }
      );
    }

    return res.status(200).json({ message: `Solicitud de contacto ${response}.` });
  } catch (error) {
    console.error('Error al responder a la solicitud de contacto:', error);
    return res.status(500).json({ message: 'Error al responder a la solicitud de contacto.' });
  }
};


const markNotificationAsRead = async (req, res, next) => {
  const { notificationId } = req.params;
  const currentUserId = req.user.id;

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      receiver: currentUserId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada.' });
    }

    notification.status = 'read'; 
    notification.updatedAt = Date.now();
    await notification.save();

    return res.status(200).json({ message: 'Notificación marcada como leída.' });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({ message: 'Error al marcar notificación como leída.' });
  }
};

module.exports = { getNotifications, respondToContactRequest, markNotificationAsRead };
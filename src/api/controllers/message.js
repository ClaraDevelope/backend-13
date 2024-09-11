const Message = require('../models/message');
const Notification = require('../models/notifications'); 

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const sender = req.user._id;

    if (!receiverId || !text) {
      return res.status(400).json({ success: false, error: 'Faltan datos necesarios' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }


    const message = new Message({
      sender: sender,
      receiver: receiverId,
      text: text,
    });
    await message.save();


    const notification = new Notification({
      sender: sender,
      receiver: receiverId,
      type: 'message',
      status: 'pending'
    });
    await notification.save();

    if (req.io) {
      req.io.to(receiverId).emit('receive_message', {
        id: message._id,
        sender: user._id,
        text: text,
        timestamp: message.timestamp,
      });
    } else {
      console.error('Socket.io no está definido en req');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { currentUserId } = req.query;

    if (!currentUserId || !receiverId) {
      return res.status(400).json({ success: false, message: "Faltan parámetros necesarios." });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'profile.name')
    .populate('receiver', 'profile.name'); 

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      sender: {
        id: msg.sender._id,
        name: msg.sender.profile.name,
      },
      receiver: {
        id: msg.receiver._id,
        name: msg.receiver.profile.name,
      },
      text: msg.text,
      timestamp: msg.timestamp,
    }));

    res.status(200).json({ success: true, messages: formattedMessages });
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { sendMessage, getMessages };
const Message = require('../models/message');


const getMessages = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id; 

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).json({ message: 'Error al obtener los mensajes' });
  }
};

module.exports = {
  getMessages
};
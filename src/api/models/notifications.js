const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  type: { type: String, enum: ['contact_request', 'message'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'read'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema, 'Notification');

module.exports = Notification;

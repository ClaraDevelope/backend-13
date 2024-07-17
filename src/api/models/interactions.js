const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InteractionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    reaction: { type: String, enum: ['support', 'love', 'surprise', 'sad', 'interesting'] },
});

const INTERACTION = mongoose.model('Interaction', InteractionSchema, 'Interaction');

module.exports = INTERACTION;

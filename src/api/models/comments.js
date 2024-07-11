const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CommentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    commentDate: { type: Date, default: Date.now }
});

const COMMENT = mongoose.model('Comment', CommentSchema, 'Comment');

module.exports = COMMENT;
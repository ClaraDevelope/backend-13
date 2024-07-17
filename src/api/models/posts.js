const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    img: {type: String, required: false , trim: true},
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],   
    interactions: [{ type: Schema.Types.ObjectId, ref: 'Interaction' }]
});

const POST = mongoose.model('Post', PostSchema, 'Post');

module.exports = POST;
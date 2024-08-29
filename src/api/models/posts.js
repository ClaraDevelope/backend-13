const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    img: {type: String, required: false , trim: true},
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],   
});

const POST = mongoose.model('Post', PostSchema, 'Post');

module.exports = POST;
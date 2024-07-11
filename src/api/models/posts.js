const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    img: {type: String, required: false},
    content: { type: String, required: true },
    postDate: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],   
});

const POST = mongoose.model('Post', PostSchema, 'Post');

module.exports = POST;
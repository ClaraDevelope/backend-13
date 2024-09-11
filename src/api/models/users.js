const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

const ContactsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const UserSchema = new Schema({
    profile: {
        name: { type: String, trim:true, required: true },
        email: { type: String,trim:true, required: true, unique: true },
        password: { type: String, trim:true, required: true},
        birthDate: { type: Date, trim:true, required: false },
        img: { type: String, trim: true, required: false },
    },
    role: {type: String, enum:['user', 'admin'], default: 'user' },
    menstrualCycle:{type: Schema.Types.ObjectId, ref: 'MenstrualCycle'},
    calendary:{ type: Schema.Types.ObjectId, ref: 'Calendary' },
    contacts: [ContactsSchema], 
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});


const USER = mongoose.model('User' , UserSchema, 'User');
module.exports = USER;
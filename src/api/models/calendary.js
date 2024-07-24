const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    date: { type: Date},
    type: { type: String, enum: ['deporte', 'relaciones', 'hormonaciones', 'viajes', 'enfermedad,', 'menstruacion']}
}, { _id: false });

const MoodSchema = new Schema({
    date: { type: Date },
    type: { type: String, enum: ['enojada', 'ansiosa', 'calmada', 'deprimida', 'con energía', 'fatigada', 'feliz', 'hambrienta', 'frustrada', 'voluble', 'nerviosa', 'sensible', 'cansada', 'estresada', 'irritable', 'dormida', 'atrevida']}
}, { _id: false });

const CalendarySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menstrualCycle: { type: Schema.Types.ObjectId, ref: 'MenstrualCycle', required: false },
    events: [EventSchema],
    personalTags: [String],
    symptoms: [String],
    mood: [MoodSchema]
});

const CALENDARY = mongoose.model('Calendary', CalendarySchema, 'Calendary');

module.exports = CALENDARY;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CalendarySchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User' },
    menstrualCycle: { type: Schema.Types.ObjectId, ref: 'MenstrualCycle' },
    events: [{ type: String, enum: ['deporte', 'relaciones', 'hormonaciones', 'viajes', 'enfermedad'] }],
    personalTags: [{ type: String }],
    symptoms: [{ type: String }],
    mood:[{type: String, enum: ['enojada', 'ansiosa', 'calmada', 'deprimida', 'con energía', 'fatigada', 'feliz', 'hambrienta', 'frustrada', 'voluble', 'nerviosa', 'sensible', 'cansada', 'estresada', ' irritable', 'dormida', 'atrevida']}]
});

const CALENDARY = mongoose.model('Calendary', CalendarySchema, 'Calendary');

module.exports = CALENDARY;
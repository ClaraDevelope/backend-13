const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    date: { type: Date, required: true },
    value: { type: String, enum: ['deporte', 'relaciones', 'hormonaciones', 'viaje', 'enfermedad', 'menstruacion', 'fiesta', 'cumpleaños', 'medico'], required: true }
});

const PersonalTagSchema = new Schema({
    date: { type: Date, required: true },
    value: { type: String, required: true }
});

const MoodSchema = new Schema({
    date: { type: Date, required: true },
    value: { type: String, enum: ['enojada', 'ansiosa', 'calmada', 'deprimida', 'con energía', 'fatigada', 'feliz', 'hambrienta', 'frustrada', 'voluble', 'nerviosa', 'sensible', 'cansada', 'estresada', 'irritable', 'dormida', 'atrevida'], required: true }
});

const SymptomSchema = new Schema({
    date: { type: Date, required: true },
    value: { type: String, required: true }
});

const CalendarySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menstrualCycle: { type: Schema.Types.ObjectId, ref: 'MenstrualCycle', required: false },
    events: [EventSchema],
    personalTags: [PersonalTagSchema],
    symptoms: [SymptomSchema],
    mood: [MoodSchema]
});

const CALENDARY = mongoose.model('Calendary', CalendarySchema, 'Calendary');

module.exports = CALENDARY;



// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const EventSchema = new Schema({
//     date: { type: Date },
//     type: { type: String, enum: ['deporte', 'relaciones', 'hormonaciones', 'viajes', 'enfermedad', 'menstruacion'] }
// }, { _id: false });

// const MoodSchema = new Schema({
//     date: { type: Date },
//     type: { type: String, enum: ['enojada', 'ansiosa', 'calmada', 'deprimida', 'con energía', 'fatigada', 'feliz', 'hambrienta', 'frustrada', 'voluble', 'nerviosa', 'sensible', 'cansada', 'estresada', 'irritable', 'dormida', 'atrevida'] }
// }, { _id: false });

// const PersonalTagSchema = new Schema({
//     date: { type: Date },
//     value: { type: String }
// }, { _id: false });

// const SymptomSchema = new Schema({
//     date: { type: Date },
//     value: { type: String }
// }, { _id: false });

// const CalendarySchema = new Schema({
//     user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     menstrualCycle: { type: Schema.Types.ObjectId, ref: 'MenstrualCycle', required: false },
//     events: [EventSchema],
//     personalTags: [PersonalTagSchema], 
//     mood: [MoodSchema],
//     symptoms: [SymptomSchema], 
// });

// const CALENDARY = mongoose.model('Calendary', CalendarySchema, 'Calendary');

// module.exports = CALENDARY;

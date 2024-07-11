const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menstrualCycleSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    average: { type: Number, required: false }
});

const MENSTRUALCYCLE = mongoose.model('MenstrualCycle', menstrualCycleSchema, 'MenstrualCycle');

module.exports = MENSTRUALCYCLE;
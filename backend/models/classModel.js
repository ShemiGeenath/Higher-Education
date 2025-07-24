// classModel.js

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher',
    required: true 
  },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  fee: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
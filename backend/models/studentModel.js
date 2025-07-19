const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nic: { type: String, required: true },
  schoolName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
  contact: { type: String, required: true },
  address: { type: String },
  guardianName: { type: String },
  guardianContact: { type: String },
  admissionDate: { type: Date, default: Date.now },
  stream: { type: String, required: true },
  profilePicture: { type: String } // stored as filename
});

module.exports = mongoose.model('Student', studentSchema);

// attendanceModel.js

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true 
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class',
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'excused'], 
    default: 'present' 
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: { type: String }
}, { 
  timestamps: true,
  // Ensure one attendance record per student per class per day
  index: { student: 1, class: 1, date: 1 }, 
});

// Prevent duplicate attendance for same student/class/day
attendanceSchema.index(
  { student: 1, class: 1, date: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
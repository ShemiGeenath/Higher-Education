const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceModel');
const Class = require('../models/classModel');
const Student = require('../models/studentModel');

// GET attendance for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId })
      .populate('class', 'className subject teacher')
      .populate({
        path: 'class',
        populate: {
          path: 'teacher',
          select: 'name'
        }
      })
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST record attendance
router.post('/', async (req, res) => {
  try {
    const { studentId, classId, date, status, notes } = req.body;
    
    // Verify student and class exist
    const student = await Student.findById(studentId);
    const classData = await Class.findById(classId);
    
    if (!student || !classData) {
      return res.status(404).json({ error: 'Student or Class not found' });
    }

    const newAttendance = new Attendance({
      student: studentId,
      class: classId,
      date,
      status,
      notes
    });

    await newAttendance.save();
    
    res.status(201).json({ message: 'Attendance recorded successfully', attendance: newAttendance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

module.exports = router;
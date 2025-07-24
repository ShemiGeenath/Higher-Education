const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceModel');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose');

// GET attendance records for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    let query = { student: req.params.studentId };
    
    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('class', 'className subject day time')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// POST mark attendance via QR scan
router.post('/scan', async (req, res) => {
  try {
    const { studentId, classId, status, notes } = req.body;
    const markedBy = req.user._id; // Assuming you have user auth

    // Validate input
    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Student ID and Class ID are required' });
    }

    // Check if student exists and is enrolled in the class
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isEnrolled = student.enrolledClasses?.some(
      ec => ec.class.toString() === classId && ec.active !== false
    );

    if (!isEnrolled) {
      return res.status(400).json({ error: 'Student is not enrolled in this class' });
    }

    // Check for existing attendance today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      student: studentId,
      class: classId,
      date: { $gte: today }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        error: 'Attendance already marked for today',
        existingRecord: existingAttendance
      });
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      student: studentId,
      class: classId,
      status: status || 'present',
      notes,
      markedBy
    });

    await newAttendance.save();

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance: await newAttendance.populate('class markedBy')
    });

  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// GET today's attendance for a class
router.get('/class/:classId/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      class: req.params.classId,
      date: { $gte: today }
    })
    .populate('student', 'name nic profilePicture')
    .populate('markedBy', 'name')
    .sort({ createdAt: -1 });

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today\'s attendance' });
  }
});

module.exports = router;
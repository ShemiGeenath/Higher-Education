const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceModel');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');

// Middleware to simulate logged-in user (replace with real auth)
const mockAuth = (req, res, next) => {
  req.user = { _id: '64de1234567890abcdef1234', name: 'Admin User' }; 
  next();
};

router.use(mockAuth);

// GET attendance records for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = { student: req.params.studentId };

    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const attendance = await Attendance.find(query)
      .populate('class', 'className subject day time')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// POST mark attendance
router.post('/scan', async (req, res) => {
  try {
    const { studentId, classId, status, notes } = req.body;
    const markedBy = req.user?._id || null;

    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Student ID and Class ID are required' });
    }

    // Fetch student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch class
    const classData = await Class.findById(classId);
    if (!classData) return res.status(404).json({ error: 'Class not found' });

    // Check enrollment
    const isEnrolled = student.enrolledClasses?.some(
      ec => ec.class.toString() === classId && ec.active !== false
    );
    if (!isEnrolled) return res.status(400).json({ error: 'Student is not enrolled in this class' });

    // Prevent duplicate attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      student: studentId,
      class: classId,
      date: { $gte: today }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already marked for today', existingRecord: existingAttendance });
    }

    const newAttendance = new Attendance({
      student: studentId,
      class: classId,
      status: status || 'present',
      notes: notes || '',
      markedBy
    });

    await newAttendance.save();

    // Populate class and markedBy before sending response
    const populated = await newAttendance.populate('class markedBy', 'className subject name');
    res.status(201).json({ message: 'Attendance recorded successfully', attendance: populated });

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
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch today\'s attendance' });
  }
});

// POST mark absentees for a class
router.post('/class/:classId/mark-absentees', async (req, res) => {
  try {
    const classId = req.params.classId;
    const markedBy = req.user?._id || null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studentsInClass = await Student.find({
      'enrolledClasses.class': classId,
      'enrolledClasses.active': true
    });

    const alreadyMarked = await Attendance.find({
      class: classId,
      date: { $gte: today }
    });

    const markedStudentIds = alreadyMarked.map(a => a.student.toString());

    const absentees = studentsInClass.filter(
      s => !markedStudentIds.includes(s._id.toString())
    );

    const absentRecords = absentees.map(student => ({
      student: student._id,
      class: classId,
      date: today,
      status: 'absent',
      markedBy,
      notes: 'Auto-marked as absent'
    }));

    await Attendance.insertMany(absentRecords);

    res.status(201).json({ message: `${absentees.length} students marked as absent`, absentees });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark absentees' });
  }
});

module.exports = router;

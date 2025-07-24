// studentRoutes.js

const express = require('express');
const multer = require('multer');
const Student = require('../models/studentModel');

const router = express.Router();

// File storage config (save to /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });

// @route   POST /api/students
// @desc    Add new student
// @access  Public
router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Incoming Data:', req.body);
    console.log('Uploaded File:', req.file);

    const {
      name,
      nic,
      schoolName,
      email,
      age,
      contact,
      address,
      guardianName,
      guardianContact,
      admissionDate,
      stream
    } = req.body;

    const newStudent = new Student({
      name,
      nic,
      schoolName,
      email,
      age,
      contact,
      address,
      guardianName,
      guardianContact,
      admissionDate,
      stream,
      profilePicture: req.file?.filename || ''
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student added successfully' });
  } catch (err) {
    console.error('[❌ Error Adding Student]', err.message);
    res.status(500).json({ error: 'Failed to add student', details: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error('[❌ Error Fetching Students]', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('[❌ Error Deleting Student]', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});


// @route   PUT /api/students/:id
// @desc    Update a student
// @access  Public
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      name,
      nic,
      schoolName,
      email,
      age,
      contact,
      address,
      guardianName,
      guardianContact,
      admissionDate,
      stream,
    } = req.body;

    const updateFields = {
      name,
      nic,
      schoolName,
      email,
      age,
      contact,
      address,
      guardianName,
      guardianContact,
      admissionDate,
      stream,
    };

    if (req.file) {
      updateFields.profilePicture = req.file.filename;
    }

    await Student.findByIdAndUpdate(req.params.id, updateFields);
    res.status(200).json({ message: 'Student updated successfully' });
  } catch (err) {
    console.error('[❌ Error Updating Student]', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Add these endpoints to your existing studentRoutes.js

// @route   GET /api/students/:id
// @desc    Get single student with enrolled classes
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'enrolledClasses.class',
        select: 'className subject fee teacher day time',
        populate: {
          path: 'teacher',
          select: 'name'
        }
      });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json(student);
  } catch (err) {
    console.error('[❌ Error Fetching Student]', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// @route   POST /api/students/:id/enroll
// @desc    Enroll student in a class
// @access  Public
router.post('/:id/enroll', async (req, res) => {
  try {
    const { classId } = req.body;
    
    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = student.enrolledClasses && 
      student.enrolledClasses.some(
        ec => ec.class.toString() === classId && ec.active
      );

    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Student already enrolled in this class' });
    }

    // Initialize enrolledClasses if it doesn't exist
    if (!student.enrolledClasses) {
      student.enrolledClasses = [];
    }

    student.enrolledClasses.push({ 
      class: classId,
      enrolledDate: new Date()
    });
    
    await student.save();
    
    res.status(200).json({ 
      message: 'Student enrolled successfully', 
      student: await Student.findById(student._id).populate('enrolledClasses.class') 
    });
  } catch (err) {
    console.error('[❌ Error Enrolling Student]', err);
    res.status(500).json({ error: 'Failed to enroll student' });
  }
});

// @route   POST /api/students/:id/unenroll
// @desc    Unenroll student from a class
// @access  Public
router.post('/:id/unenroll', async (req, res) => {
  try {
    const { classId } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.enrolledClasses) {
      return res.status(400).json({ error: 'Student is not enrolled in any classes' });
    }

    const enrollmentIndex = student.enrolledClasses.findIndex(
      ec => ec.class.toString() === classId && ec.active !== false
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: 'Student is not enrolled in this class' });
    }

    // Mark as inactive rather than removing to preserve history
    student.enrolledClasses[enrollmentIndex].active = false;
    student.enrolledClasses[enrollmentIndex].unenrolledDate = new Date();
    
    await student.save();
    
    res.status(200).json({ 
      message: 'Student unenrolled successfully', 
      student: await Student.findById(student._id).populate('enrolledClasses.class') 
    });
  } catch (err) {
    console.error('[❌ Error Unenrolling Student]', err);
    res.status(500).json({ error: 'Failed to unenroll student' });
  }
});

// @route   GET /api/students/lookup
// @desc    Lookup by id OR nic OR email
router.get('/lookup', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'q required' });

    let student = null;

    // try ObjectId
    if (q.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(q);
    }

    if (!student) {
      student = await Student.findOne({
        $or: [{ nic: q }, { email: q }]
      });
    }

    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});



module.exports = router;

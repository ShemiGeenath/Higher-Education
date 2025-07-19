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
    console.error('[❌ Error Adding Student]', err);
    res.status(500).json({ error: 'Failed to add student' });
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



module.exports = router;

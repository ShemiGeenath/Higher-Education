// classRoutes.js

const express = require('express');
const router = express.Router();
const Class = require('../models/classModel');
const Teacher = require('../models/teacherModel');

// POST /api/classes — add a new class
router.post('/', async (req, res) => {
  try {
    // Verify teacher exists
    const teacher = await Teacher.findById(req.body.teacher);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const newClass = new Class(req.body);
    await newClass.save();
    
    // Populate teacher details in the response
    const populatedClass = await Class.findById(newClass._id).populate('teacher', 'name subject');
    
    res.status(201).json({ message: 'Class added successfully', class: populatedClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add class' });
  }
});

// GET /api/classes — fetch all classes with teacher details
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'name subject').sort({ createdAt: -1 });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// PUT /api/classes/:id — update a class
router.put('/:id', async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teacher', 'name subject');
    
    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.status(200).json({ message: 'Class updated successfully', class: updatedClass });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// DELETE /api/classes/:id — delete a class
router.delete('/:id', async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

module.exports = router;
// paymentRoutes.js

const express = require('express');
const router = express.Router();
const Payment = require('../models/paymentModel');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose'); // add this at top of paymentRoutes.js


// GET payments for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId })
      .populate('class', 'className subject fee teacher')
      .populate({
        path: 'class',
        populate: {
          path: 'teacher',
          select: 'name'
        }
      })
      .sort({ month: -1, paymentDate: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST create a new payment
router.post('/', async (req, res) => {
  try {
    const { studentId, classId, amount, month } = req.body;
    
    // Verify student and class exist
    const student = await Student.findById(studentId);
    const classData = await Class.findById(classId);
    
    if (!student || !classData) {
      return res.status(404).json({ error: 'Student or Class not found' });
    }

    const newPayment = new Payment({
      student: studentId,
      class: classId,
      amount,
      month
    });

    await newPayment.save();
    
    res.status(201).json({ message: 'Payment recorded successfully', payment: newPayment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// GET payment summary for a student
router.get('/summary/:studentId', async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      { $match: { student: mongoose.Types.ObjectId(req.params.studentId) } },
      { 
        $group: {
          _id: "$month",
          totalPaid: { $sum: "$amount" },
          payments: { $push: "$$ROOT" }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

module.exports = router;
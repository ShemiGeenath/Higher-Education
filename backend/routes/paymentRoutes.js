// paymentRoutes.js

// routes/paymentRoutes.js
const express = require('express');
const dayjs = require('dayjs');
const Payment = require('../models/paymentModel');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');

const router = express.Router();

/**
 * Helper: month string (YYYY-MM)
 */
const monthString = (date = new Date()) => dayjs(date).format('YYYY-MM');

/**
 * POST /api/payments
 * Create a payment (for a student, for a class, for a month).
 * Body: { studentId, classId, month (YYYY-MM), amount?, method?, reference? }
 */
router.post('/', async (req, res) => {
  try {
    const { studentId, classId, month, amount, method, reference } = req.body;
    if (!studentId || !classId || !month) {
      return res.status(400).json({ error: 'studentId, classId and month are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    // default to class fee if amount not provided
    const finalAmount = amount ?? classDoc.fee;

    const payment = await Payment.create({
      student: studentId,
      class: classId,
      month,
      amount: finalAmount,
      method,
      reference
    });

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Payment already exists for this month' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

/**
 * POST /api/payments/enroll-and-pay
 * Enroll a student in a class if not already, then pay.
 * Body: { studentId, classId, month, amount?, method?, reference? }
 */
router.post('/enroll-and-pay', async (req, res) => {
  try {
    const { studentId, classId, month, amount, method, reference } = req.body;
    if (!studentId || !classId || !month) {
      return res.status(400).json({ error: 'studentId, classId and month are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    // Check enrollment
    const alreadyEnrolled = (student.enrolledClasses || []).some(
      ec => ec.class.toString() === classId && ec.active !== false
    );

    if (!alreadyEnrolled) {
      student.enrolledClasses = student.enrolledClasses || [];
      student.enrolledClasses.push({
        class: classId,
        enrolledDate: new Date(),
        active: true
      });
      await student.save();
    }

    // Pay
    const finalAmount = amount ?? classDoc.fee;

    const payment = await Payment.create({
      student: studentId,
      class: classId,
      month,
      amount: finalAmount,
      method,
      reference
    });

    res.status(201).json({ message: 'Enrolled and paid', payment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Payment already exists for this month' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to enroll and pay' });
  }
});

/**
 * GET /api/payments/student/:studentId
 * Returns:
 * {
 *   student: { ... },
 *   enrolled: [
 *     {
 *       class: {...},
 *       history: [ { _id, month, amount, method, paidAt } ],
 *       paidThisMonth: boolean
 *     }
 *   ],
 *   availableClasses: [ ...classesNotEnrolled ]
 * }
 */
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const nowMonth = monthString();

    const student = await Student.findById(studentId)
      .populate({
        path: 'enrolledClasses.class',
        select: 'className subject fee teacher day time',
        populate: { path: 'teacher', select: 'name subject' }
      });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch payments of this student (all classes)
    const payments = await Payment.find({ student: studentId })
      .populate({
        path: 'class',
        select: 'className subject fee teacher',
        populate: { path: 'teacher', select: 'name subject' }
      })
      .sort({ month: -1, createdAt: -1 });

    // Map by classId for quick grouping
    const byClass = {};
    payments.forEach(p => {
      const cid = p.class?._id?.toString() || p.class.toString();
      if (!byClass[cid]) byClass[cid] = [];
      byClass[cid].push(p);
    });

    const enrolled = (student.enrolledClasses || []).map(ec => {
      const cid = ec.class?._id?.toString() || ec.class.toString();
      const history = (byClass[cid] || []).map(p => ({
        _id: p._id,
        month: p.month,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        paidAt: p.paidAt
      }));

      const paidThisMonth = history.some(h => h.month === nowMonth);

      return {
        class: ec.class,
        active: ec.active !== false,
        history,
        paidThisMonth
      };
    });

    // available classes (not actively enrolled)
    const allClasses = await Class.find().populate('teacher', 'name subject');
    const enrolledActiveIds = new Set(
      (student.enrolledClasses || [])
        .filter(ec => ec.active !== false)
        .map(ec => ec.class.toString())
    );
    const availableClasses = allClasses.filter(c => !enrolledActiveIds.has(c._id.toString()));

    res.json({
      student: {
        _id: student._id,
        name: student.name,
        nic: student.nic,
        email: student.email
      },
      enrolled,
      availableClasses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load student payments' });
  }
});

module.exports = router;

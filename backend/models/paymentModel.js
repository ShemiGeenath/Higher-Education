const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'paid' },
  notes: { type: String },
  receiptNumber: { type: String, unique: true } // Added receipt number
}, { timestamps: true });

// Generate receipt number before saving
paymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.receiptNumber = `REC-${Date.now().toString().slice(-6)}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
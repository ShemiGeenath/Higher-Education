// backend/models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  // keep month as YYYY-MM (string) for quick queries
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'card', 'bank', 'online', 'other'], default: 'cash' },
  reference: { type: String },
  paidAt: { type: Date, default: Date.now },
}, { timestamps: true });

// unique payment per student+class+month
paymentSchema.index({ student: 1, class: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);

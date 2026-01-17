const mongoose = require('mongoose');

const recurringDepositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    required: true,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly']
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastDepositDate: {
    type: Date
  },
  totalDeposited: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

recurringDepositSchema.index({ user: 1 });
recurringDepositSchema.index({ isActive: 1 });
recurringDepositSchema.index({ frequency: 1 });

module.exports = mongoose.model('RecurringDeposit', recurringDepositSchema);


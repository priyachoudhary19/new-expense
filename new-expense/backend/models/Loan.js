const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['given', 'taken'],
    required: true,
    default: 'given'
  },
  friendName: {
    type: String,
    required: function() {
      return this.loanType === 'given';
    },
    trim: true
  },
  lenderName: {
    type: String,
    required: function() {
      return this.loanType === 'taken';
    },
    trim: true
  },
  amountGiven: {
    type: Number,
    required: true,
    min: 0
  },
  amountReturned: {
    type: Number,
    default: 0,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dateGiven: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Overdue'],
    default: 'Active'
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  lastReminderSent: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for remaining amount
loanSchema.virtual('totalDue').get(function () {
  const rate = Number(this.interestRate || 0);
  const interest = (Number(this.amountGiven || 0) * rate) / 100;
  return Number(this.amountGiven || 0) + interest;
});

loanSchema.virtual('amountRemaining').get(function() {
  if (this.loanType === 'given') {
    return Math.max(0, this.totalDue - Number(this.amountReturned || 0));
  } else {
    // For loans taken, remaining is what we still owe
    return Math.max(0, this.totalDue - Number(this.amountPaid || 0));
  }
});

// Method to update status
loanSchema.methods.updateStatus = function() {
  if (this.amountRemaining <= 0) {
    this.status = 'Completed';
  } else if (this.expectedReturnDate && new Date() > this.expectedReturnDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Active';
  }
};

// Method to add payment (for loans taken)
loanSchema.methods.addPayment = function(amount) {
  this.amountPaid = (this.amountPaid || 0) + amount;
  if (this.amountPaid > this.totalDue) {
    throw new Error('Payment amount cannot exceed total due');
  }
  this.updateStatus();
};

loanSchema.index({ friendName: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ expectedReturnDate: 1 });

module.exports = mongoose.model('Loan', loanSchema);


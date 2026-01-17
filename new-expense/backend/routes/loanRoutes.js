const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');

// Get all loans (both active and completed/overdue)
router.get('/', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ dateGiven: -1 });
    const loansWithRemaining = loans.map(loan => ({
      ...loan.toObject(),
      totalDue: loan.totalDue,
      amountRemaining: loan.amountRemaining
    }));
    res.json(loansWithRemaining);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active loans
router.get('/active', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ status: 'Active', user: req.user._id }).sort({ dateGiven: -1 });
    const loansWithRemaining = loans.map(loan => ({
      ...loan.toObject(),
      totalDue: loan.totalDue,
      amountRemaining: loan.amountRemaining
    }));
    res.json(loansWithRemaining);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single loan
router.get('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    const loanObj = loan.toObject();
    loanObj.totalDue = loan.totalDue;
    loanObj.amountRemaining = loan.amountRemaining;
    res.json(loanObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create loan
router.post('/', protect, async (req, res) => {
  try {
    const loan = new Loan({ ...req.body, user: req.user._id });
    loan.updateStatus();
    await loan.save();
    const loanObj = loan.toObject();
    loanObj.totalDue = loan.totalDue;
    loanObj.amountRemaining = loan.amountRemaining;
    res.status(201).json(loanObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update loan (e.g., add returned amount)
router.put('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // If amountReturned is being updated, set explicit value
    if (req.body.amountReturned !== undefined) {
      loan.amountReturned = req.body.amountReturned;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'amountReturned' && key !== '_id') {
        loan[key] = req.body[key];
      }
    });

    loan.updateStatus();
    await loan.save();
    
    const loanObj = loan.toObject();
    loanObj.totalDue = loan.totalDue;
    loanObj.amountRemaining = loan.amountRemaining;
    res.json(loanObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add returned amount (for loans given)
router.patch('/:id/return', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid return amount required' });
    }

    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.loanType === 'taken') {
      return res.status(400).json({ error: 'Use /payment endpoint for loans taken' });
    }

    loan.amountReturned += amount;
    if (loan.amountReturned > loan.totalDue) {
      return res.status(400).json({ error: 'Return amount cannot exceed total due (principal + interest)' });
    }

    loan.updateStatus();
    await loan.save();
    
    const loanObj = loan.toObject();
    loanObj.totalDue = loan.totalDue;
    loanObj.amountRemaining = loan.amountRemaining;
    res.json(loanObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add payment (for loans taken)
router.patch('/:id/payment', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount required' });
    }

    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.loanType === 'given') {
      return res.status(400).json({ error: 'Use /return endpoint for loans given' });
    }

    loan.addPayment(amount);
    await loan.save();
    
    const loanObj = loan.toObject();
    loanObj.totalDue = loan.totalDue;
    loanObj.amountRemaining = loan.amountRemaining;
    res.json(loanObj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete loan
router.delete('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


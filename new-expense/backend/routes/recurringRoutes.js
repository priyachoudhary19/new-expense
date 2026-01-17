const express = require('express');
const router = express.Router();
const RecurringDeposit = require('../models/RecurringDeposit');
const { protect } = require('../middleware/auth');

// Get all recurring deposits
router.get('/', protect, async (req, res) => {
  try {
    const deposits = await RecurringDeposit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active recurring deposits
router.get('/active', protect, async (req, res) => {
  try {
    const deposits = await RecurringDeposit.find({ isActive: true, user: req.user._id }).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recurring deposit
router.get('/:id', protect, async (req, res) => {
  try {
    const deposit = await RecurringDeposit.findOne({ _id: req.params.id, user: req.user._id });
    if (!deposit) {
      return res.status(404).json({ error: 'Recurring deposit not found' });
    }
    res.json(deposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create recurring deposit
router.post('/', protect, async (req, res) => {
  try {
    const deposit = new RecurringDeposit({ ...req.body, user: req.user._id });
    await deposit.save();
    res.status(201).json(deposit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update recurring deposit
router.put('/:id', protect, async (req, res) => {
  try {
    const deposit = await RecurringDeposit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!deposit) {
      return res.status(404).json({ error: 'Recurring deposit not found' });
    }
    res.json(deposit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record a deposit
router.patch('/:id/deposit', protect, async (req, res) => {
  try {
    const deposit = await RecurringDeposit.findOne({ _id: req.params.id, user: req.user._id });
    if (!deposit) {
      return res.status(404).json({ error: 'Recurring deposit not found' });
    }

    if (!deposit.isActive) {
      return res.status(400).json({ error: 'Recurring deposit is not active' });
    }

    deposit.totalDeposited += deposit.amount;
    deposit.lastDepositDate = new Date();

    // Check if end date reached
    if (deposit.endDate && new Date() >= deposit.endDate) {
      deposit.isActive = false;
    }

    await deposit.save();
    res.json(deposit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete recurring deposit
router.delete('/:id', protect, async (req, res) => {
  try {
    const deposit = await RecurringDeposit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deposit) {
      return res.status(404).json({ error: 'Recurring deposit not found' });
    }
    res.json({ message: 'Recurring deposit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


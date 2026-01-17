const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Get all expenses
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily expenses
router.get('/daily', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({ expenses, total, date: startOfDay });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly expenses
router.get('/monthly', protect, async (req, res) => {
  try {
    const { year, month } = req.query;
    const queryDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const startOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1);
    const endOfMonth = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({ expenses, total, byCategory, month: startOfMonth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get yearly expenses
router.get('/yearly', protect, async (req, res) => {
  try {
    const { year } = req.query;
    const queryYear = year || new Date().getFullYear();
    const startOfYear = new Date(queryYear, 0, 1);
    const endOfYear = new Date(queryYear, 11, 31, 23, 59, 59, 999);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfYear, $lte: endOfYear }
    }).sort({ date: -1 });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    const byMonth = expenses.reduce((acc, exp) => {
      const month = exp.date.getMonth() + 1;
      acc[month] = (acc[month] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({ expenses, total, byCategory, byMonth, year: queryYear });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', protect, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, user: req.user._id });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


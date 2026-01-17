const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const RecurringDeposit = require('../models/RecurringDeposit');
const { protect } = require('../middleware/auth');

// Get spending analysis
router.get('/spending', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(dateFilter);

    // Category-wise analysis
    const byCategory = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { total: 0, count: 0, expenses: [] };
      }
      acc[exp.category].total += exp.amount;
      acc[exp.category].count += 1;
      acc[exp.category].expenses.push(exp);
      return acc;
    }, {});

    // Payment method analysis
    const byPaymentMethod = expenses.reduce((acc, exp) => {
      acc[exp.paymentMethod] = (acc[exp.paymentMethod] || 0) + exp.amount;
      return acc;
    }, {});

    // Daily spending trend
    const dailyTrend = expenses.reduce((acc, exp) => {
      const date = exp.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
    const maxExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
    const minExpense = expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0;

    res.json({
      totalSpent,
      averageExpense,
      maxExpense,
      minExpense,
      totalTransactions: expenses.length,
      byCategory,
      byPaymentMethod,
      dailyTrend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive dashboard data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Today's expenses
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const todayExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Monthly expenses
    const monthExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfMonth }
    });
    const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Yearly expenses
    const yearExpenses = await Expense.find({
      user: req.user._id,
      date: { $gte: startOfYear }
    });
    const yearTotal = yearExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Active loans
    const activeLoans = await Loan.find({ status: 'Active', user: req.user._id });
    const totalGiven = activeLoans.reduce((sum, loan) => sum + loan.amountGiven, 0);
    const totalReturned = activeLoans.reduce((sum, loan) => sum + loan.amountReturned, 0);
    const totalRemaining = totalGiven - totalReturned;

    // Active recurring deposits
    const activeDeposits = await RecurringDeposit.find({ isActive: true, user: req.user._id });
    const totalDeposited = activeDeposits.reduce((sum, dep) => sum + dep.totalDeposited, 0);

    res.json({
      expenses: {
        today: todayTotal,
        month: monthTotal,
        year: yearTotal
      },
      loans: {
        active: activeLoans.length,
        totalGiven,
        totalReturned,
        totalRemaining
      },
      recurringDeposits: {
        active: activeDeposits.length,
        totalDeposited
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense prediction for next month based on last 3 months
router.get('/prediction', protect, async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get last 3 months of expenses
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
      
      const expenses = await Expense.find({
        user: req.user._id,
        date: { $gte: month, $lt: nextMonth }
      });
      
      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const byCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});
      
      months.push({
        month: month.toISOString().split('T')[0],
        monthName: month.toLocaleString('default', { month: 'long', year: 'numeric' }),
        total,
        count: expenses.length,
        byCategory,
        average: expenses.length > 0 ? total / expenses.length : 0
      });
    }
    
    // Calculate predictions using weighted moving average and trend analysis
    const weights = [0.5, 0.3, 0.2]; // More weight to recent months
    const weightedAverage = months.reduce((sum, month, idx) => {
      return sum + (month.total * weights[idx]);
    }, 0);
    
    // Calculate trend (simple linear regression)
    const trend = months.length >= 2 
      ? (months[months.length - 1].total - months[0].total) / months.length
      : 0;
    
    // Predict next month total
    const predictedTotal = weightedAverage + (trend * 0.5); // Apply trend with damping
    
    // Predict by category
    const predictedByCategory = {};
    const allCategories = new Set();
    months.forEach(m => Object.keys(m.byCategory).forEach(cat => allCategories.add(cat)));
    
    allCategories.forEach(category => {
      const categoryTotals = months.map(m => m.byCategory[category] || 0);
      const categoryWeighted = categoryTotals.reduce((sum, val, idx) => sum + (val * weights[idx]), 0);
      const categoryTrend = categoryTotals.length >= 2
        ? (categoryTotals[categoryTotals.length - 1] - categoryTotals[0]) / categoryTotals.length
        : 0;
      predictedByCategory[category] = Math.max(0, categoryWeighted + (categoryTrend * 0.5));
    });
    
    // Calculate confidence based on data consistency
    const totals = months.map(m => m.total);
    const avgTotal = totals.reduce((a, b) => a + b, 0) / totals.length;
    const variance = totals.reduce((sum, val) => sum + Math.pow(val - avgTotal, 2), 0) / totals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgTotal > 0 ? stdDev / avgTotal : 1;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - Math.min(coefficientOfVariation, 1)) * 100)));
    
    // Next month info
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    const nextMonthName = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    res.json({
      prediction: {
        month: nextMonth.toISOString().split('T')[0],
        monthName: nextMonthName,
        predictedTotal: Math.round(predictedTotal * 100) / 100,
        predictedByCategory,
        confidence,
        averageTransactionAmount: months.length > 0 
          ? months.reduce((sum, m) => sum + m.average, 0) / months.length 
          : 0
      },
      historicalData: months,
      methodology: {
        method: 'Weighted Moving Average with Trend Analysis',
        description: 'Uses last 3 months with weights [0.5, 0.3, 0.2] and applies trend adjustment',
        confidenceExplanation: `Based on spending consistency. ${confidence}% confidence indicates ${confidence > 70 ? 'high' : confidence > 40 ? 'moderate' : 'low'} reliability.`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


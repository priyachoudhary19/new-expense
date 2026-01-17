const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Loan = require('../models/Loan');
const RecurringDeposit = require('../models/RecurringDeposit');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/auth');

// Google Drive setup (requires OAuth2 credentials)
const getDriveService = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth });
};

// Export all data to JSON
router.get('/json', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const loans = await Loan.find({ user: req.user._id });
    const recurringDeposits = await RecurringDeposit.find({ user: req.user._id });

    // Get loan-related expenses
    const loanExpenses = expenses.filter(e => e.loanId || e.isLoanPayment);

    // Get prediction data
    let prediction = null;
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
        
        const monthExpenses = expenses.filter(e => {
          const expDate = new Date(e.date);
          return expDate >= month && expDate < nextMonth;
        });
        
        const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const byCategory = monthExpenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {});
        
        months.push({
          month: month.toISOString().split('T')[0],
          monthName: month.toLocaleString('default', { month: 'long', year: 'numeric' }),
          total,
          count: monthExpenses.length,
          byCategory,
          average: monthExpenses.length > 0 ? total / monthExpenses.length : 0
        });
      }
      
      if (months.length >= 2) {
        const weights = [0.5, 0.3, 0.2];
        const weightedAverage = months.reduce((sum, month, idx) => {
          return sum + (month.total * weights[idx]);
        }, 0);
        const trend = (months[months.length - 1].total - months[0].total) / months.length;
        const predictedTotal = weightedAverage + (trend * 0.5);
        
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
        
        const nextMonth = new Date(currentYear, currentMonth + 1, 1);
        prediction = {
          month: nextMonth.toISOString().split('T')[0],
          monthName: nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
          predictedTotal: Math.round(predictedTotal * 100) / 100,
          predictedByCategory
        };
      }
    } catch (predError) {
      console.error('Error generating prediction for export:', predError);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      expenses: expenses.map(e => e.toObject()),
      loans: loans.map(l => ({
        ...l.toObject(),
        amountRemaining: l.amountRemaining
      })),
      recurringDeposits: recurringDeposits.map(r => r.toObject()),
      loanExpenses: loanExpenses.map(e => e.toObject()),
      prediction: prediction
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export to CSV
router.get('/csv', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    
    let csv = 'Date,Title,Amount,Category,Payment Method,Description,Is Loan Payment,Loan ID\n';
    expenses.forEach(exp => {
      csv += `${exp.date.toISOString().split('T')[0]},${exp.title},${exp.amount},${exp.category},${exp.paymentMethod},"${exp.description || ''}",${exp.isLoanPayment || false},${exp.loanId || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup to Google Drive
router.post('/backup/drive', protect, async (req, res) => {
  try {
    if (!process.env.GOOGLE_CREDENTIALS_PATH) {
      return res.status(400).json({ 
        error: 'Google Drive credentials not configured. Please set GOOGLE_CREDENTIALS_PATH in .env file' 
      });
    }

    // Get all data
    const expenses = await Expense.find({ user: req.user._id });
    const loans = await Loan.find({ user: req.user._id });
    const recurringDeposits = await RecurringDeposit.find({ user: req.user._id });

    // Get loan-related expenses
    const loanExpenses = expenses.filter(e => e.loanId || e.isLoanPayment);

    // Get prediction data (simplified version)
    let prediction = null;
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
        
        const monthExpenses = expenses.filter(e => {
          const expDate = new Date(e.date);
          return expDate >= month && expDate < nextMonth;
        });
        
        const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        months.push({ total });
      }
      
      if (months.length >= 2) {
        const weights = [0.5, 0.3, 0.2];
        const weightedAverage = months.reduce((sum, month, idx) => {
          return sum + (month.total * weights[idx]);
        }, 0);
        const trend = (months[months.length - 1].total - months[0].total) / months.length;
        const predictedTotal = weightedAverage + (trend * 0.5);
        
        const nextMonth = new Date(currentYear, currentMonth + 1, 1);
        prediction = {
          month: nextMonth.toISOString().split('T')[0],
          monthName: nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
          predictedTotal: Math.round(predictedTotal * 100) / 100
        };
      }
    } catch (predError) {
      console.error('Error generating prediction for backup:', predError);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      expenses: expenses.map(e => e.toObject()),
      loans: loans.map(l => ({
        ...l.toObject(),
        amountRemaining: l.amountRemaining
      })),
      recurringDeposits: recurringDeposits.map(r => r.toObject()),
      loanExpenses: loanExpenses.map(e => e.toObject()),
      prediction: prediction
    };

    // Create temporary file
    const fileName = `expense-backup-${Date.now()}.json`;
    const filePath = path.join(__dirname, '../temp', fileName);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

    // Upload to Google Drive
    const drive = getDriveService();
    const fileMetadata = {
      name: fileName,
    };
    const media = {
      mimeType: 'application/json',
      body: fs.createReadStream(filePath),
    };

    const uploadedFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
    });

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.json({
      message: 'Backup uploaded to Google Drive successfully',
      fileId: uploadedFile.data.id,
      fileName: fileName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download backup file
router.get('/backup/download', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    const loans = await Loan.find({ user: req.user._id });
    const recurringDeposits = await RecurringDeposit.find({ user: req.user._id });

    // Get loan-related expenses
    const loanExpenses = expenses.filter(e => e.loanId || e.isLoanPayment);

    // Get prediction data (simplified version)
    let prediction = null;
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const months = [];
      for (let i = 2; i >= 0; i--) {
        const month = new Date(currentYear, currentMonth - i, 1);
        const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);
        
        const monthExpenses = expenses.filter(e => {
          const expDate = new Date(e.date);
          return expDate >= month && expDate < nextMonth;
        });
        
        const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        months.push({ total });
      }
      
      if (months.length >= 2) {
        const weights = [0.5, 0.3, 0.2];
        const weightedAverage = months.reduce((sum, month, idx) => {
          return sum + (month.total * weights[idx]);
        }, 0);
        const trend = (months[months.length - 1].total - months[0].total) / months.length;
        const predictedTotal = weightedAverage + (trend * 0.5);
        
        const nextMonth = new Date(currentYear, currentMonth + 1, 1);
        prediction = {
          month: nextMonth.toISOString().split('T')[0],
          monthName: nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
          predictedTotal: Math.round(predictedTotal * 100) / 100
        };
      }
    } catch (predError) {
      console.error('Error generating prediction for download:', predError);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      expenses: expenses.map(e => e.toObject()),
      loans: loans.map(l => ({
        ...l.toObject(),
        amountRemaining: l.amountRemaining
      })),
      recurringDeposits: recurringDeposits.map(r => r.toObject()),
      loanExpenses: loanExpenses.map(e => e.toObject()),
      prediction: prediction
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=expense-backup-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


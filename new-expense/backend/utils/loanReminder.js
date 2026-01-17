const cron = require('node-cron');
const Loan = require('../models/Loan');

// Run daily at 9 AM to check for loan reminders
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔔 Checking loan reminders...');
    
    const activeLoans = await Loan.find({ 
      status: 'Active',
      reminderEnabled: true 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const loan of activeLoans) {
      if (loan.expectedReturnDate) {
        const returnDate = new Date(loan.expectedReturnDate);
        returnDate.setHours(0, 0, 0, 0);

        // Check if return date is today or passed
        if (returnDate <= today) {
          const daysOverdue = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));
          
          // Send reminder (in production, you'd send email/SMS here)
          console.log(`⚠️ REMINDER: ${loan.friendName} owes ₹${loan.amountRemaining}. ${daysOverdue > 0 ? `Overdue by ${daysOverdue} days.` : 'Due today!'}`);
          
          // Update last reminder sent date
          loan.lastReminderSent = new Date();
          loan.updateStatus();
          await loan.save();
        }
      }
    }

    console.log(`✅ Checked ${activeLoans.length} active loans`);
  } catch (error) {
    console.error('❌ Error in loan reminder:', error);
  }
});

console.log('📅 Loan reminder cron job scheduled (runs daily at 9 AM)');

module.exports = {};






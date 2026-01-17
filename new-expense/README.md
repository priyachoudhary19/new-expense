# 💰 Expense Tracker - MERN Stack Application

A comprehensive expense tracking application built with MongoDB, Express, React, and Node.js. Track your daily, monthly, and yearly expenses, manage loans to friends, set up recurring deposits, analyze spending patterns, and backup your data to Google Drive.

## ✨ Features

1. **Daily Expenditure** - Track expenses by day with detailed categorization
2. **Monthly Expenses** - View monthly spending with category breakdowns and charts
3. **Yearly Expenses** - Analyze yearly spending trends with visualizations
4. **Loan Management** - Track loans given to friends, record returns, and monitor remaining amounts
5. **Spending Analysis** - Comprehensive analysis with charts and category-wise breakdowns
6. **Recurring Deposits** - Set up and manage recurring deposits (Daily, Weekly, Monthly, Yearly)
7. **Export & Backup** - Export data as JSON/CSV and backup to Google Drive
8. **Loan Reminders** - Automatic reminders for overdue loans (runs daily at 9 AM)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- MongoDB Compass (for database management)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd new-expense
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env` in the root directory
   - Update MongoDB connection string:
     ```
     MONGODB_URI=mongodb://localhost:27017/expense-tracker
     ```
   - For Google Drive backup (optional), set:
     ```
     GOOGLE_CREDENTIALS_PATH=./backend/config/credentials.json
     ```

5. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Open MongoDB Compass and connect to `mongodb://localhost:27017`

6. **Run the application**

   **Option 1: Run both backend and frontend separately**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   npm run client
   ```

   **Option 2: Run both together (requires concurrently)**
   ```bash
   npm run dev-all
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
new-expense/
├── backend/
│   ├── models/          # MongoDB models
│   │   ├── Expense.js
│   │   ├── Loan.js
│   │   └── RecurringDeposit.js
│   ├── routes/          # API routes
│   │   ├── expenseRoutes.js
│   │   ├── loanRoutes.js
│   │   ├── recurringRoutes.js
│   │   ├── analysisRoutes.js
│   │   └── exportRoutes.js
│   ├── utils/          # Utility functions
│   │   └── loanReminder.js
│   └── server.js       # Express server
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
└── package.json
```

## 🔌 API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/daily?date=YYYY-MM-DD` - Get daily expenses
- `GET /api/expenses/monthly?year=YYYY&month=MM` - Get monthly expenses
- `GET /api/expenses/yearly?year=YYYY` - Get yearly expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Loans
- `GET /api/loans` - Get all loans
- `GET /api/loans/active` - Get active loans
- `POST /api/loans` - Create loan
- `PUT /api/loans/:id` - Update loan
- `PATCH /api/loans/:id/return` - Record return amount
- `DELETE /api/loans/:id` - Delete loan

### Recurring Deposits
- `GET /api/recurring` - Get all recurring deposits
- `POST /api/recurring` - Create recurring deposit
- `PATCH /api/recurring/:id/deposit` - Record a deposit
- `PUT /api/recurring/:id` - Update recurring deposit
- `DELETE /api/recurring/:id` - Delete recurring deposit

### Analysis
- `GET /api/analysis/spending?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get spending analysis
- `GET /api/analysis/dashboard` - Get dashboard data

### Export
- `GET /api/export/json` - Export as JSON
- `GET /api/export/csv` - Export as CSV
- `GET /api/export/backup/download` - Download backup
- `POST /api/export/backup/drive` - Backup to Google Drive

## 🔧 Google Drive Backup Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Drive API
4. Create a Service Account
5. Download the JSON key file
6. Save it as `backend/config/credentials.json`
7. Update `.env` with the path to credentials file

## 📊 Features in Detail

### Expense Categories
- Food
- Transport
- Shopping
- Bills
- Entertainment
- Health
- Education
- Other

### Payment Methods
- Cash
- Card
- UPI
- Bank Transfer
- Other

### Loan Status
- Active - Loan is active and not fully returned
- Completed - Full amount returned
- Overdue - Expected return date has passed

### Recurring Deposit Frequencies
- Daily
- Weekly
- Monthly
- Yearly

## 🛠️ Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - node-cron (for loan reminders)
  - googleapis (for Google Drive integration)

- **Frontend:**
  - React
  - React Router
  - Axios
  - Recharts (for data visualization)
  - date-fns

## 📝 Notes

- Loan reminders run daily at 9 AM via cron job
- All dates are stored in UTC and displayed in local time
- The application uses MongoDB Compass for database management
- Export files are downloaded directly to your device
- Google Drive backup requires proper authentication setup

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Expense Tracking! 💰**






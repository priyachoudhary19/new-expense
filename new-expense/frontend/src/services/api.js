import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || "https://new-expense-7mor.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Expenses
export const getExpenses = () => api.get('/expenses');
export const getDailyExpenses = (date) => api.get('/expenses/daily', { params: { date } });
export const getMonthlyExpenses = (year, month) => api.get('/expenses/monthly', { params: { year, month } });
export const getYearlyExpenses = (year) => api.get('/expenses/yearly', { params: { year } });
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Loans
export const getLoans = () => api.get('/loans');
export const getActiveLoans = () => api.get('/loans/active');
export const getLoan = (id) => api.get(`/loans/${id}`);
export const createLoan = (data) => api.post('/loans', data);
export const updateLoan = (id, data) => api.put(`/loans/${id}`, data);
export const addLoanReturn = (id, amount) => api.patch(`/loans/${id}/return`, { amount });
export const addLoanPayment = (id, amount) => api.patch(`/loans/${id}/payment`, { amount });
export const deleteLoan = (id) => api.delete(`/loans/${id}`);

// Recurring Deposits
export const getRecurringDeposits = () => api.get('/recurring');
export const getActiveRecurringDeposits = () => api.get('/recurring/active');
export const createRecurringDeposit = (data) => api.post('/recurring', data);
export const updateRecurringDeposit = (id, data) => api.put(`/recurring/${id}`, data);
export const recordDeposit = (id) => api.patch(`/recurring/${id}/deposit`);
export const deleteRecurringDeposit = (id) => api.delete(`/recurring/${id}`);

// Analysis
export const getSpendingAnalysis = (startDate, endDate) => 
  api.get('/analysis/spending', { params: { startDate, endDate } });
export const getDashboardData = () => api.get('/analysis/dashboard');
export const getExpensePrediction = () => api.get('/analysis/prediction');

// Export
export const exportJSON = () => api.get('/export/json');
export const exportCSV = () => api.get('/export/csv');
export const backupToDrive = () => api.post('/export/backup/drive');
export const downloadBackup = () => api.get('/export/backup/download');

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');

export default api;


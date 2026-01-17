import React, { useState, useEffect } from 'react';
import { getMonthlyExpenses, createExpense, updateExpense, deleteExpense } from '../services/api';
import ExpenseModal from './ExpenseModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './Expenses.css';

const MonthlyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyExpenses(selectedYear, selectedMonth);
      setExpenses(response.data.expenses);
      setTotal(response.data.total);
      setByCategory(response.data.byCategory || {});
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  const handleSave = async (expenseData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense._id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense');
    }
  };

  const chartData = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📆 Monthly Expenses</h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Expense
          </button>
        </div>

        <div className="filter-group">
          <div className="form-group" style={{ marginRight: '1rem', flex: 1 }}>
            <label className="form-label">Month:</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Year:</label>
            <input
              type="number"
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min="2020"
              max="2100"
            />
          </div>
        </div>

        <div className="total-display">
          <span className="total-label">Total for {monthNames[selectedMonth - 1]} {selectedYear}:</span>
          <span className="total-amount">₹{total.toFixed(2)}</span>
        </div>

        {chartData.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No expenses for this month</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.title}</td>
                  <td>₹{expense.amount.toFixed(2)}</td>
                  <td><span className="category-badge">{expense.category}</span></td>
                  <td>{expense.paymentMethod}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(expense)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(expense._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default MonthlyExpenses;






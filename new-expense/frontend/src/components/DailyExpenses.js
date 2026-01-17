import React, { useState, useEffect } from 'react';
import { getDailyExpenses, createExpense, updateExpense, deleteExpense } from '../services/api';
import ExpenseModal from './ExpenseModal';
import './Expenses.css';

const DailyExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
  }, [selectedDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getDailyExpenses(selectedDate);
      setExpenses(response.data.expenses);
      setTotal(response.data.total);
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

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📅 Daily Expenses</h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Expense
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Select Date:</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="total-display">
          <span className="total-label">Total for {new Date(selectedDate).toLocaleDateString()}:</span>
          <span className="total-amount">₹{total.toFixed(2)}</span>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No expenses for this date</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.title}</td>
                  <td>₹{expense.amount.toFixed(2)}</td>
                  <td><span className="category-badge">{expense.category}</span></td>
                  <td>{expense.paymentMethod}</td>
                  <td>{expense.description || '-'}</td>
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

export default DailyExpenses;






import React, { useEffect, useMemo, useState } from 'react';
import { getExpenses } from '../services/api';
import './Expenses.css';

// Replacing Recurring page with All Expenses table view (serial number order)
const RecurringDeposits = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await getExpenses();
        setExpenses(res.data || []);
      } catch (e) {
        console.error('Error fetching expenses:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 All Expenses</h2>
        </div>

        <div className="total-display">
          <span className="total-label">Total expenses count:</span>
          <span className="total-amount">{expenses.length}</span>
        </div>

        <div className="total-display" style={{ marginTop: '1rem' }}>
          <span className="total-label">Total amount spent:</span>
          <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No expenses found</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense._id}>
                  <td>{index + 1}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.title}</td>
                  <td>₹{(expense.amount || 0).toFixed(2)}</td>
                  <td><span className="category-badge">{expense.category}</span></td>
                  <td>{expense.paymentMethod || '-'}</td>
                  <td>{expense.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecurringDeposits;


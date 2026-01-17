import React, { useState, useEffect } from 'react';
import { getSpendingAnalysis } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './SpendingAnalysis.css';

const SpendingAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

  useEffect(() => {
    fetchAnalysis();
  }, [startDate, endDate]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await getSpendingAnalysis(startDate, endDate);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  if (!analysis) {
    return <div className="card">No data available</div>;
  }

  const categoryData = Object.entries(analysis.byCategory || {}).map(([name, data]) => ({
    name,
    amount: data.total || data,
    count: data.count || 0
  }));

  const paymentMethodData = Object.entries(analysis.byPaymentMethod || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const dailyTrendData = Object.entries(analysis.dailyTrend || {}).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: parseFloat(amount.toFixed(2))
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <div className="card">
        <h2 className="card-title">📊 Spending Analysis</h2>
        
        <div className="filter-group">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date:</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">End Date:</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">₹{analysis.totalSpent.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Expense</div>
            <div className="stat-value">₹{analysis.averageExpense.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Max Expense</div>
            <div className="stat-value">₹{analysis.maxExpense.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{analysis.totalTransactions}</div>
          </div>
        </div>

        {dailyTrendData.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Daily Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#667eea" strokeWidth={2} name="Daily Spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Category-wise Spending</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="amount" fill="#667eea" name="Amount Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {paymentMethodData.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Payment Method Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryData.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Category Details</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Total Amount</th>
                  <th>Number of Transactions</th>
                  <th>Average per Transaction</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((cat) => (
                  <tr key={cat.name}>
                    <td><strong>{cat.name}</strong></td>
                    <td>₹{cat.amount.toFixed(2)}</td>
                    <td>{cat.count}</td>
                    <td>₹{cat.count > 0 ? (cat.amount / cat.count).toFixed(2) : '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingAnalysis;






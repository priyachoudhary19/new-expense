import React, { useState, useEffect } from 'react';
import { getExpensePrediction } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './SpendingAnalysis.css';

const ExpensePrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getExpensePrediction();
      setPrediction(response.data);
    } catch (err) {
      console.error('Error fetching prediction:', err);
      setError('Failed to load prediction. Make sure you have at least 3 months of expense data.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  if (loading) {
    return (
      <div className="card">
        <h2 className="card-title">🤖 AI Expense Prediction</h2>
        <div>Loading prediction...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="card-title">🤖 AI Expense Prediction</h2>
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={fetchPrediction} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="card">
        <h2 className="card-title">🤖 AI Expense Prediction</h2>
        <div>No prediction data available</div>
      </div>
    );
  }

  const { prediction: pred, historicalData, methodology } = prediction;

  // Prepare data for charts
  const historicalChartData = historicalData.map((month, idx) => ({
    month: month.monthName.split(' ')[0],
    total: month.total,
    count: month.count
  }));

  const categoryData = Object.entries(pred.predictedByCategory).map(([category, amount]) => ({
    name: category,
    value: Math.round(amount * 100) / 100
  }));

  const comparisonData = [
    ...historicalData.map((m, idx) => ({
      month: m.monthName.split(' ')[0],
      actual: m.total,
      type: 'Historical'
    })),
    {
      month: pred.monthName.split(' ')[0],
      actual: pred.predictedTotal,
      type: 'Predicted'
    }
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🤖 AI Expense Prediction</h2>
          <button className="btn btn-secondary" onClick={fetchPrediction}>
            Refresh
          </button>
        </div>

        <div className="prediction-summary">
          <div className="prediction-card primary">
            <div className="prediction-label">Predicted Total for {pred.monthName}</div>
            <div className="prediction-value">₹{pred.predictedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="prediction-confidence">
              Confidence: <strong>{pred.confidence}%</strong>
            </div>
          </div>
          <div className="prediction-card">
            <div className="prediction-label">Average Transaction</div>
            <div className="prediction-value">₹{pred.averageTransactionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="methodology-box" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h4>📊 Methodology</h4>
          <p><strong>{methodology.method}</strong></p>
          <p>{methodology.description}</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            {methodology.confidenceExplanation}
          </p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Historical vs Predicted Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="actual" fill="#8884d8" name="Amount (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Predicted Spending by Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <table className="table" style={{ marginTop: '0' }}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Predicted Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData
                    .sort((a, b) => b.value - a.value)
                    .map((item) => (
                      <tr key={item.name}>
                        <td><strong>{item.name}</strong></td>
                        <td>₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Last 3 Months History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={historicalChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="total" fill="#00C49F" name="Total Spending (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Monthly Breakdown</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total</th>
                <th>Transactions</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.map((month, idx) => (
                <tr key={idx}>
                  <td><strong>{month.monthName}</strong></td>
                  <td>₹{month.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{month.count}</td>
                  <td>₹{month.average.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
                <td>→ {pred.monthName} (Predicted)</td>
                <td>₹{pred.predictedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>-</td>
                <td>₹{pred.averageTransactionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensePrediction;


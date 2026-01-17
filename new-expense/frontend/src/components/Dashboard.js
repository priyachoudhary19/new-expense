import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardData();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <h1 className="page-title">📊 Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Expenses</div>
          <div className="stat-value">₹{data?.expenses?.today?.toFixed(2) || '0.00'}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value">₹{data?.expenses?.month?.toFixed(2) || '0.00'}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Yearly Expenses</div>
          <div className="stat-value">₹{data?.expenses?.year?.toFixed(2) || '0.00'}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Active Loans</div>
          <div className="stat-value">{data?.loans?.active || 0}</div>
          <div className="stat-sublabel">₹{data?.loans?.totalRemaining?.toFixed(2) || '0.00'} remaining</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Active Recurring Deposits</div>
          <div className="stat-value">{data?.recurringDeposits?.active || 0}</div>
          <div className="stat-sublabel">₹{data?.recurringDeposits?.totalDeposited?.toFixed(2) || '0.00'} total</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Quick Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Given (Loans):</span>
            <span className="summary-value">₹{data?.loans?.totalGiven?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Returned:</span>
            <span className="summary-value">₹{data?.loans?.totalReturned?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pending Amount:</span>
            <span className="summary-value pending">₹{data?.loans?.totalRemaining?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;






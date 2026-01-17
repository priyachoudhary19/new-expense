import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import DailyExpenses from './components/DailyExpenses';
import MonthlyExpenses from './components/MonthlyExpenses';
import YearlyExpenses from './components/YearlyExpenses';
import Loans from './components/Loans';
import RecurringDeposits from './components/RecurringDeposits';
import SpendingAnalysis from './components/SpendingAnalysis';
import ExpensePrediction from './components/ExpensePrediction';
import ExportBackup from './components/ExportBackup';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';

function Navigation() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext) || {};
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/daily', label: 'Daily', icon: '📅' },
    { path: '/monthly', label: 'Monthly', icon: '📆' },
    { path: '/yearly', label: 'Yearly', icon: '📈' },
    { path: '/loans', label: 'Loans', icon: '💰' },
    { path: '/recurring', label: 'All Expenses', icon: '📋' },
    { path: '/analysis', label: 'Analysis', icon: '📊' },
    { path: '/prediction', label: 'AI Prediction', icon: '🤖' },
    { path: '/export', label: 'Export', icon: '💾' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">💰 Expense Tracker</h1>
        <ul className="nav-menu">
          {navItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'nav-link active' : 'nav-link'}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            {user ? (
              <button className="btn btn-secondary" onClick={logout}>Logout ({user.name.split(' ')[0]})</button>
            ) : (
              <Link to="/login" className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}>
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="card">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/daily"
                element={
                  <PrivateRoute>
                    <DailyExpenses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/monthly"
                element={
                  <PrivateRoute>
                    <MonthlyExpenses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/yearly"
                element={
                  <PrivateRoute>
                    <YearlyExpenses />
                  </PrivateRoute>
                }
              />
              <Route
                path="/loans"
                element={
                  <PrivateRoute>
                    <Loans />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recurring"
                element={
                  <PrivateRoute>
                    <RecurringDeposits />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <PrivateRoute>
                    <SpendingAnalysis />
                  </PrivateRoute>
                }
              />
              <Route
                path="/prediction"
                element={
                  <PrivateRoute>
                    <ExpensePrediction />
                  </PrivateRoute>
                }
              />
              <Route
                path="/export"
                element={
                  <PrivateRoute>
                    <ExportBackup />
                  </PrivateRoute>
                }
              />
              
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


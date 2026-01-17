import React, { useState, useEffect } from 'react';
import { getLoans, createLoan, updateLoan, addLoanReturn, addLoanPayment, deleteLoan } from '../services/api';
import LoanModal from './LoanModal';
import ReturnModal from './ReturnModal';
import './Loans.css';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [filter, setFilter] = useState('all'); // all | active | completed
  const [typeFilter, setTypeFilter] = useState('all'); // all | given | taken

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await getLoans();
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLoan(null);
    setShowModal(true);
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setShowModal(true);
  };

  const handleReturn = (loan) => {
    setSelectedLoan(loan);
    setShowReturnModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoan(id);
        fetchLoans();
      } catch (error) {
        console.error('Error deleting loan:', error);
        alert('Error deleting loan');
      }
    }
  };

  const handleSave = async (loanData) => {
    try {
      if (editingLoan) {
        await updateLoan(editingLoan._id, loanData);
      } else {
        await createLoan(loanData);
      }
      setShowModal(false);
      fetchLoans();
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Error saving loan');
    }
  };

  const handleReturnSave = async (amount) => {
    try {
      if (selectedLoan.loanType === 'taken') {
        await addLoanPayment(selectedLoan._id, amount);
      } else {
        await addLoanReturn(selectedLoan._id, amount);
      }
      setShowReturnModal(false);
      setSelectedLoan(null);
      fetchLoans();
    } catch (error) {
      console.error('Error recording payment/return:', error);
      alert(`Error recording ${selectedLoan.loanType === 'taken' ? 'payment' : 'return'}`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Active: 'status-active',
      Completed: 'status-completed',
      Overdue: 'status-overdue'
    };
    return badges[status] || '';
  };

  const filteredLoans = loans.filter((loan) => {
    // Status filter
    if (filter === 'active' && loan.status !== 'Active' && loan.status !== 'Overdue') return false;
    if (filter === 'completed' && loan.status !== 'Completed') return false;
    
    // Type filter
    if (typeFilter === 'given' && loan.loanType !== 'given') return false;
    if (typeFilter === 'taken' && loan.loanType !== 'taken') return false;
    
    return true;
  });

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">💰 Loans Management</h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Loan
          </button>
        </div>
        <div className="filter-group" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${typeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </button>
            <button
              className={`btn ${typeFilter === 'given' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTypeFilter('given')}
            >
              Loans Given
            </button>
            <button
              className={`btn ${typeFilter === 'taken' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTypeFilter('taken')}
            >
              Loans Taken
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All Status
            </button>
            <button
              className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('active')}
            >
              Active/Overdue
            </button>
            <button
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : filteredLoans.length === 0 ? (
          <div className="empty-state">No loans recorded</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Interest %</th>
                <th>Total Due</th>
                <th>Paid/Returned</th>
                <th>Remaining</th>
                <th>Date</th>
                <th>Expected Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => (
                <tr key={loan._id}>
                  <td>
                    <span className={`status-badge ${loan.loanType === 'given' ? 'status-active' : 'status-overdue'}`}>
                      {loan.loanType === 'given' ? 'Given' : 'Taken'}
                    </span>
                  </td>
                  <td><strong>{loan.loanType === 'given' ? (loan.friendName || 'N/A') : (loan.lenderName || 'N/A')}</strong></td>
                  <td>₹{loan.amountGiven.toFixed(2)}</td>
                  <td>{(loan.interestRate ?? 0)}%</td>
                  <td>₹{(loan.totalDue ?? (loan.amountGiven)).toFixed(2)}</td>
                  <td>₹{loan.loanType === 'given' ? loan.amountReturned.toFixed(2) : (loan.amountPaid || 0).toFixed(2)}</td>
                  <td className={loan.amountRemaining > 0 ? 'remaining-amount' : ''}>
                    ₹{loan.amountRemaining.toFixed(2)}
                  </td>
                  <td>{new Date(loan.dateGiven).toLocaleDateString()}</td>
                  <td>
                    {loan.expectedReturnDate 
                      ? new Date(loan.expectedReturnDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {loan.amountRemaining > 0 && (
                        <button 
                          className="btn btn-success" 
                          onClick={() => handleReturn(loan)}
                          style={{ marginRight: '0.5rem' }}
                        >
                          {loan.loanType === 'given' ? 'Return' : 'Pay'}
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleEdit(loan)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(loan._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {loans.length > 0 && (
          <div className="loan-summary">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div className="summary-item">
                <span className="summary-label">Loans Given:</span>
                <span className="summary-value">
                  ₹{loans.filter(l => l.loanType === 'given').reduce((sum, loan) => sum + loan.amountGiven, 0).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Loans Taken:</span>
                <span className="summary-value">
                  ₹{loans.filter(l => l.loanType === 'taken').reduce((sum, loan) => sum + loan.amountGiven, 0).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Returned (Given):</span>
                <span className="summary-value">
                  ₹{loans.filter(l => l.loanType === 'given').reduce((sum, loan) => sum + loan.amountReturned, 0).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Paid (Taken):</span>
                <span className="summary-value">
                  ₹{loans.filter(l => l.loanType === 'taken').reduce((sum, loan) => sum + (loan.amountPaid || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Net Remaining:</span>
                <span className="summary-value pending">
                  ₹{(loans.filter(l => l.loanType === 'given').reduce((sum, loan) => sum + loan.amountRemaining, 0) - 
                     loans.filter(l => l.loanType === 'taken').reduce((sum, loan) => sum + loan.amountRemaining, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LoanModal
          loan={editingLoan}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {showReturnModal && selectedLoan && (
        <ReturnModal
          loan={selectedLoan}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedLoan(null);
          }}
          onSave={handleReturnSave}
        />
      )}
    </div>
  );
};

export default Loans;




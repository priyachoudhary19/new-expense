import React, { useState } from 'react';
import './Modal.css';

const ReturnModal = ({ loan, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const maxAmount = loan.amountRemaining;
  const isLoanTaken = loan.loanType === 'taken';

  const handleSubmit = (e) => {
    e.preventDefault();
    const returnAmount = parseFloat(amount);
    if (!amount || returnAmount < 1) {
      alert(`Please enter a valid ${isLoanTaken ? 'payment' : 'return'} amount (minimum ₹1)`);
      return;
    }
    if (returnAmount > maxAmount) {
      alert(`${isLoanTaken ? 'Payment' : 'Return'} amount cannot exceed remaining amount (₹${maxAmount.toFixed(2)})`);
      return;
    }
    onSave(returnAmount);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isLoanTaken ? 'Record Payment' : 'Record Return'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {isLoanTaken ? 'Lender' : 'Friend'}: {isLoanTaken ? (loan.lenderName || 'N/A') : (loan.friendName || 'N/A')}
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              {isLoanTaken ? 'Amount Owed' : 'Remaining Amount'}: ₹{maxAmount.toFixed(2)}
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              {isLoanTaken ? 'Payment' : 'Return'} Amount *
            </label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={maxAmount}
              step="0.01"
              required
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              {isLoanTaken ? 'Record Payment' : 'Record Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;





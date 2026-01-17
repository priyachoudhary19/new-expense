import React, { useState, useEffect } from 'react';
import './Modal.css';

const LoanModal = ({ loan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    loanType: 'given',
    friendName: '',
    lenderName: '',
    amountGiven: '',
    interestRate: 0,
    dateGiven: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    description: '',
    reminderEnabled: true
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        loanType: loan.loanType || 'given',
        friendName: loan.friendName || '',
        lenderName: loan.lenderName || '',
        amountGiven: loan.amountGiven || '',
        interestRate: loan.interestRate ?? 0,
        dateGiven: loan.dateGiven ? new Date(loan.dateGiven).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expectedReturnDate: loan.expectedReturnDate ? new Date(loan.expectedReturnDate).toISOString().split('T')[0] : '',
        description: loan.description || '',
        reminderEnabled: loan.reminderEnabled !== undefined ? loan.reminderEnabled : true
      });
    }
  }, [loan]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amountGiven) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.loanType === 'given' && !formData.friendName) {
      alert('Please enter friend name');
      return;
    }
    if (formData.loanType === 'taken' && !formData.lenderName) {
      alert('Please enter lender name (bank/entity)');
      return;
    }
    onSave({
      ...formData,
      amountGiven: parseFloat(formData.amountGiven),
      interestRate: parseFloat(formData.interestRate) || 0,
      dateGiven: new Date(formData.dateGiven),
      expectedReturnDate: formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : undefined
    });
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{loan ? 'Edit Loan' : 'Add Loan'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Loan Type *</label>
            <select
              name="loanType"
              className="form-select"
              value={formData.loanType}
              onChange={handleChange}
              required
            >
              <option value="given">Loan Given (to friend/family)</option>
              <option value="taken">Loan Taken (from bank/entity)</option>
            </select>
          </div>
          {formData.loanType === 'given' ? (
            <div className="form-group">
              <label className="form-label">Friend Name *</label>
              <input
                type="text"
                name="friendName"
                className="form-input"
                value={formData.friendName}
                onChange={handleChange}
                required
                placeholder="Name of person you lent to"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Lender Name *</label>
              <input
                type="text"
                name="lenderName"
                className="form-input"
                value={formData.lenderName}
                onChange={handleChange}
                required
                placeholder="Bank name or entity you borrowed from"
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">
              {formData.loanType === 'given' ? 'Amount Given' : 'Amount Borrowed'} *
            </label>
            <input
              type="number"
              name="amountGiven"
              className="form-input"
              value={formData.amountGiven}
              onChange={handleChange}
              min="1"
              step="0.01"
              required
            />
          </div>
        <div className="form-group">
          <label className="form-label">Interest Rate (%)</label>
          <select
            name="interestRate"
            className="form-select"
            value={formData.interestRate}
            onChange={handleChange}
          >
            {['0','1','2','3','4','5','6','7','7.5','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25'].map(rate => (
              <option key={rate} value={rate}>{rate}%</option>
            ))}
          </select>
        </div>
          <div className="form-group">
            <label className="form-label">
              {formData.loanType === 'given' ? 'Date Given' : 'Date Borrowed'} *
            </label>
            <input
              type="date"
              name="dateGiven"
              className="form-input"
              value={formData.dateGiven}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {formData.loanType === 'given' ? 'Expected Return Date' : 'Expected Repayment Date'}
            </label>
            <input
              type="date"
              name="expectedReturnDate"
              className="form-input"
              value={formData.expectedReturnDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={handleChange}
              />
              Enable Reminder
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {loan ? 'Update' : 'Add'} Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;




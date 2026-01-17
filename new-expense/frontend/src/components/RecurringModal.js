import React, { useState, useEffect } from 'react';
import './Modal.css';

const RecurringModal = ({ deposit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    frequency: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (deposit) {
      setFormData({
        title: deposit.title || '',
        amount: deposit.amount || '',
        frequency: deposit.frequency || 'Monthly',
        startDate: deposit.startDate ? new Date(deposit.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: deposit.endDate ? new Date(deposit.endDate).toISOString().split('T')[0] : '',
        description: deposit.description || '',
        isActive: deposit.isActive !== undefined ? deposit.isActive : true
      });
    }
  }, [deposit]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined
    });
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{deposit ? 'Edit Recurring Deposit' : 'Add Recurring Deposit'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input
              type="number"
              name="amount"
              className="form-input"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Frequency *</label>
            <select
              name="frequency"
              className="form-select"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="startDate"
              className="form-input"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date (Optional)</label>
            <input
              type="date"
              name="endDate"
              className="form-input"
              value={formData.endDate}
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
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {deposit ? 'Update' : 'Add'} Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringModal;






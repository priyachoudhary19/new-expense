import React, { useState } from 'react';
import { exportJSON, exportCSV, backupToDrive, downloadBackup } from '../services/api';
import './ExportBackup.css';

const ExportBackup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExportJSON = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await exportJSON();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('✅ JSON file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      setMessage('❌ Error exporting JSON file');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await exportCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('✅ CSV file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setMessage('❌ Error exporting CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupToDrive = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await backupToDrive();
      setMessage(`✅ ${response.data.message}`);
    } catch (error) {
      console.error('Error backing up to Drive:', error);
      const errorMsg = error.response?.data?.error || 'Error backing up to Google Drive';
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await downloadBackup();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('✅ Backup file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading backup:', error);
      setMessage('❌ Error downloading backup file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">💾 Export & Backup</h2>
        
        <div className="export-section">
          <h3 className="section-title">Export Data</h3>
          <p className="section-description">
            Export your expense data in different formats for analysis or backup purposes.
          </p>
          
          <div className="export-options">
            <div className="export-card">
              <div className="export-icon">📄</div>
              <h4>Export as JSON</h4>
              <p>Download all your data in JSON format (includes expenses, loans, and recurring deposits)</p>
              <button 
                className="btn btn-primary" 
                onClick={handleExportJSON}
                disabled={loading}
              >
                Download JSON
              </button>
            </div>

            <div className="export-card">
              <div className="export-icon">📊</div>
              <h4>Export as CSV</h4>
              <p>Download expenses in CSV format for spreadsheet applications</p>
              <button 
                className="btn btn-primary" 
                onClick={handleExportCSV}
                disabled={loading}
              >
                Download CSV
              </button>
            </div>

            <div className="export-card">
              <div className="export-icon">💾</div>
              <h4>Download Backup</h4>
              <p>Download a complete backup of all your data</p>
              <button 
                className="btn btn-primary" 
                onClick={handleDownloadBackup}
                disabled={loading}
              >
                Download Backup
              </button>
            </div>
          </div>
        </div>

        <div className="export-section" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Backup to Google Drive</h3>
          <p className="section-description">
            Automatically backup your data to Google Drive. Make sure you have configured Google Drive credentials in the backend.
          </p>
          
          <div className="export-card" style={{ maxWidth: '400px' }}>
            <div className="export-icon">☁️</div>
            <h4>Backup to Drive</h4>
            <p>Upload your expense data to Google Drive for cloud backup</p>
            <button 
              className="btn btn-success" 
              onClick={handleBackupToDrive}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Backup to Google Drive'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="info-box" style={{ marginTop: '2rem' }}>
          <h4>📝 Setup Instructions for Google Drive Backup:</h4>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Create a new project or select an existing one</li>
            <li>Enable Google Drive API</li>
            <li>Create credentials (Service Account)</li>
            <li>Download the JSON key file</li>
            <li>Save it as <code>backend/config/credentials.json</code></li>
            <li>Set <code>GOOGLE_CREDENTIALS_PATH</code> in your <code>.env</code> file</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExportBackup;






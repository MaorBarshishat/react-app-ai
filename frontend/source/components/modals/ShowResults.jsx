import React, { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import SuspiciousMaliciousLeadsTable from './SuspiciousMaliciousLeadsTable.jsx'
import '../../styles/ShowResults.css'; // Import your CSS for additional styling

const SuspiciousLeads = () => {
  const [isFullScreen, setIsFullScreen] = useState(false); // State to manage full-screen mode

  // Sample data for the table
  const leads = Array.from({ length: 197 }, (_, index) => {
    const email = `user${index + 1}@example.com`;
    const date = `12/${(index % 12) + 1}/24 ${Math.floor(Math.random() * 24)}:${String(
        Math.floor(Math.random() * 60)
    ).padStart(2, '0')}`;
    const from = Math.random() > 0.5 ? 'Login, Cart' : 'Checkout';
    const apps = Math.random() > 0.5 ? 'In Store Browsing' : 'Mobile App';

    return {
        asset: email,
        date: date,
        from: from,
        apps: apps,
    };
  });

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      document.documentElement.requestFullscreen(); // Request full-screen
    } else {
      document.exitFullscreen(); // Exit full-screen
    }
  };

  return (
    <div className={`suspicious-leads-container ${isFullScreen ? 'full-screen' : ''}`}>
      <div className="upload-section">
        <p>You may download the table above and confirm or reject leads, then upload the file</p>
        <Button variant="secondary">Upload CSV</Button>
      </div>
      <div className="related-info">
        <div>
          <h4>Related Data Domains</h4>
          <ul>
            <li>Login</li>
            <li>Store Browsing</li>
            <li>Cart Delivery</li>
          </ul>
        </div>
        <div>
          <h4>Abnormal Activities</h4>
          <ul>
            <li>Fraud Ring Activity</li>
            <li>Actions Using a Fake Identity</li>
            <li>Excessive Purchases</li>
          </ul>
        </div>
        <div>
          <h4>Data Sources</h4>
          <ul>
            <li>Incident Database</li>
            <li>API Transactions</li>
          </ul>
        </div>
      </div>
      <div className="action-buttons">
        <Button variant="primary">Gen Policy</Button>
        <Button variant="warning">Signals</Button>
        <Button variant="success">Investigate</Button>
      </div>
    </div>
  );
};

export default SuspiciousLeads;
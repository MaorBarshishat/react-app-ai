import React from 'react';
import '../../styles/Signals.css';

const Signals: React.FC = () => {
  return (
    <div className="signals-container">
      <div className="signals-header">
        <h1>Signal Intelligence</h1>
        <p>Monitor and analyze security signals across your organization</p>
      </div>
      
      <div className="signals-empty-state">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,10L12,15L17,10H7Z" />
          </svg>
        </div>
        <h2>No Signals Available</h2>
        <p>Signal monitoring capabilities will be available in a future update.</p>
        <button className="signals-action-button">Explore Documentation</button>
      </div>
    </div>
  );
};

export default Signals; 
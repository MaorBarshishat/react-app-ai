// LoadingIndicator.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap'; // Importing a Bootstrap spinner

const LoadingIndicator = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingIndicator;

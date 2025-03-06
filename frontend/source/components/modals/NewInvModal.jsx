import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import IncidentInvestigationForm from './IncidentInvestigationForm';
import '../../styles/NewInvModal.css'; // Import CSS for additional styling

const NewInvestigationModal = ({ show, onClose, onSave, investigationName, folderName, onChange }) => {
  
  const [formData, setFormData] = useState({
    dateRanges: [{ from: '', to: '' }],
    relatedAssets: '',
    domains: '',
    description: '',
  });
  
  const [title, setTitle] = useState("Create New Investigation");

  const filledInvestigationData = JSON.parse(localStorage.getItem('filledInvestigationData')) || {};

  useEffect(() => {
    if (filledInvestigationData[investigationName]) {
      setFormData(filledInvestigationData[investigationName]);
      setTitle("Change Investigation");
      return;
    } else if (investigationName !== '') {
      setTitle("Change Investigation");
    }
    setFormData({
      dateRanges: [{ from: '', to: '' }],
      relatedAssets: '',
      domains: '',
      description: '',
    });
  }, [investigationName]);

  const handleSave = () => {
    filledInvestigationData[investigationName] = formData;
    console.log(filledInvestigationData);
    localStorage.setItem('filledInvestigationData', JSON.stringify(filledInvestigationData));
    onSave(investigationName, folderName, formData);
    onClose();
    console.log(filledInvestigationData)
  };

  return (
    // Conditionally render based on the `show` prop
    show && (
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100%',
        width: '75%',
        backgroundColor: 'white',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.5)',
        overflowY: 'scroll',
        padding: '20px',
        zIndex: 1050,
        color: 'black', // Black text color
        border: '1px solid #ccc', // Optional border for style
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <Button variant="close" onClick={onClose} />
        </div>
        
        {/* Body */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            name="investigationName"
            value={investigationName}
            onChange={onChange}
            placeholder="Enter investigation name"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '16px' // Larger font for better readability
            }}
          />
        </div>
        
        <IncidentInvestigationForm 
          formData={formData} 
          onChange={(name, value) => setFormData(prevData => ({ ...prevData, [name]: value }))} 
        />

        {/* Footer */}
        <div style={{ textAlign: 'right' }}>
          <Button variant="secondary" onClick={onClose} style={{ marginRight: '10px' }}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    )
  );
};

export default NewInvestigationModal;
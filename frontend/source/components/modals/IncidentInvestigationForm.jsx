import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaPlus, FaMinus } from 'react-icons/fa';
import LoadingIndicator from './LoadingIndicator'; 
import ShowResults from './ShowResults';

const IncidentInvestigationForm = ({ formData, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(false);

  const handleSubmit = () => {
    // Log the values when submitted
    console.log({
      name: formData.name,
      dateRanges: formData.dateRanges,
      relatedAssets: formData.relatedAssets,
      domains: formData.domains,
      description: formData.description,
    });

    // Set loading state
    setLoading(true);

    // Simulate a network request
    setTimeout(() => {
      setLoading(false); // Reset loading state
      setResults(true); // Show results
    }, 2000); // Simulate a 2-second loading time
  };

  if (loading) {
    return <LoadingIndicator />; // Render loading indicator if loading
  } else if (results) {
    return <ShowResults />; // Render results if available
  }

  const addDateRange = () => {
    // Add a new empty date range to formData
    const newDateRanges = [...formData.dateRanges, { from: '', to: '' }];
    onChange('dateRanges', newDateRanges); // Update the date ranges in the parent
  };

  const removeDateRange = (index) => {
    // Remove the date range at the specified index
    const newDateRanges = formData.dateRanges.filter((_, i) => i !== index);
    onChange('dateRanges', newDateRanges); // Update the date ranges in the parent
  };

  const handleChangeDateRange = (index, name, value) => {
    // Update specific date range fields
    const newDateRanges = [...formData.dateRanges];
    newDateRanges[index][name] = value;
    onChange('dateRanges', newDateRanges); // Update the date ranges in the parent
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f7f7f7', borderRadius: '8px' }}>
      {/* Date Ranges Section */}
      <div>
        <label>Provide known dates in which the incident was active:</label>
        {formData.dateRanges.map((range, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              required 
              type="date" 
              value={range.from} 
              onChange={(e) => handleChangeDateRange(index, 'from', e.target.value)} 
            />
            <span>to</span>
            <input 
              required 
              type="date" 
              value={range.to} 
              onChange={(e) => handleChangeDateRange(index, 'to', e.target.value)} 
            />
            <Button 
              variant="danger" 
              onClick={() => removeDateRange(index)} 
              style={{ fontSize: "12px", border: 'none', color: 'black', backgroundColor: '#f7f7f7' }}
            >
              <FaMinus />
            </Button>
          </div>
        ))}
        <Button 
          variant="success" 
          onClick={addDateRange} 
          style={{ fontSize: "12px", border: 'none', color: 'black', backgroundColor: '#f7f7f7' }}
        ><FaPlus /> 
        </Button>
      </div>
      <br />
      
      {/* Related Assets Input */}
      <div>
        <label>Please provide a list of any related known assets if available:</label>
        <input 
          required 
          type="text" 
          value={formData.relatedAssets} 
          onChange={(e) => onChange('relatedAssets', e.target.value)} 
          placeholder="user@gmail.com;.."
        />
      </div>
      <br />
      
      {/* Domains Input */}
      <div>
        <label>Please provide domains that are involved with the incident:</label>
        <input 
          required 
          type="text" 
          value={formData.domains} 
          onChange={(e) => onChange('domains', e.target.value)} 
          placeholder="cart; gift card.."
        />
      </div>
      <br />
      
      {/* Description Textarea */}
      <div>
        <label>Please provide any currently available description of the incident:</label>
        <textarea 
          required 
          value={formData.description} 
          onChange={(e) => onChange('description', e.target.value)} 
          placeholder="Describe the incident" 
          style={{ width: '100%', height: '100px' }} 
        />
      </div>

      {/* Investigate Button */}
      <Button variant="primary" onClick={handleSubmit}>
        Investigate
      </Button>
    </div>
  );
};

export default IncidentInvestigationForm;
import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button 
        className="toggle-button"
        onClick={toggleSidebar}
      >
        ☰
      </button>
      {/* Your sidebar content */}
    </div>
  );
};

export default Sidebar; 
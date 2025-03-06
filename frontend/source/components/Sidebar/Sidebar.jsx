import React, { useState } from 'react';
import { FaSignal, FaSearch, FaGavel } from 'react-icons/fa';
import Policies from '../Sections/Policies';
import Investigations from './Investigations';
import '../../styles/Sidebar.css';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('Policies');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="sidebar-container">
      <div className="tab-navigation">
        <div 
          className={`tab-item ${activeTab === 'Policies' ? 'active' : ''}`} 
          onClick={() => handleTabClick('Policies')}
        >
          <FaGavel /> Policies
        </div>
        <div 
          className={`tab-item ${activeTab === 'Investigations' ? 'active' : ''}`} 
          onClick={() => handleTabClick('Investigations')}
        >
          <FaSearch /> Investigations
        </div>
        <div 
          className={`tab-item ${activeTab === 'Signals' ? 'active' : ''}`} 
          onClick={() => handleTabClick('Signals')}
        >
          <FaSignal /> Signals
        </div>
      </div>

      {activeTab === 'Policies' && <Policies />}
      {activeTab === 'Investigations' && <Investigations />}
    </div>
  );
};

export default Sidebar;
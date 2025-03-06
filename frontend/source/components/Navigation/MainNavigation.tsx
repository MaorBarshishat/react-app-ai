import React, { useContext } from 'react';
import { FaNetworkWired, FaSearch, FaSignal, FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';
import '../../styles/MainNavigation.css';

interface MainNavigationProps {
  activeTab: string;
  setActiveTab: (tab: 'policies' | 'investigations' | 'signals') => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ activeTab, setActiveTab }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  return (
    <nav className="main-navigation">
      <div className="logo">
        <span>Cyber</span>
        <span className="logo-highlight">AI</span>
      </div>
      
      <div className="nav-links">
        <button
          className={`nav-button ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          <FaNetworkWired />
          <span>Policies</span>
        </button>
        
        <button
          className={`nav-button ${activeTab === 'investigations' ? 'active' : ''}`}
          onClick={() => setActiveTab('investigations')}
        >
          <FaSearch />
          <span>Investigations</span>
        </button>
        
        <button
          className={`nav-button ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
        >
          <FaSignal />
          <span>Signals</span>
        </button>
      </div>
      
      <div className="right-controls">
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        
        <div className="user-profile">
          <div className="avatar">JD</div>
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">Security Analyst</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation; 
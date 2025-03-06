// App.jsx

import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import DnDFlow from './DnDFlow';
import Sidebar from './Sidebar/Sidebar';
import Investigations from './Sections/Investigations';
import Signals from './Sections/Signals';
import MainNavigation from './Navigation/MainNavigation';
import { DnDProvider } from './nodes/DnDContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/App.css';
import Policies from './Sections/Policies';

type TabType = 'policies' | 'investigations' | 'signals';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('policies');

  const renderContent = () => {
    switch (activeTab) {
      case 'policies':
        return (
          <ReactFlowProvider>
            <DnDProvider>
              <DnDFlow />
              <Sidebar />
            </DnDProvider>
          </ReactFlowProvider>
        );
      case 'investigations':
        return <Investigations />;
      case 'signals':
        return <Signals />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="content-container">{renderContent()}</div>
      </div>
    </ThemeProvider>
  );
};

export default App;
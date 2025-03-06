import React from 'react';
import { 
  FaBell, FaClock, FaServer, FaUserShield, FaFilter, 
  FaCheckCircle, FaTimesCircle, FaCode, FaEnvelope, 
  FaMobileAlt, FaLock, FaExclamationTriangle
} from 'react-icons/fa';
import { DnDProvider } from '../nodes/DnDContext';
import { policyNodes } from '../../data/policyNodes';
import '../../styles/Policies.css';

// Define node categories and their colors
const nodeCategories = {
  trigger: { name: 'Triggers', color: '#ff6b6b' },
  condition: { name: 'Conditions', color: '#4ecdc4' },
  action: { name: 'Actions', color: '#ffd166' },
  output: { name: 'Outputs', color: '#6a0572' }
};

// Map icon names to components
const iconMap: Record<string, React.ComponentType> = {
  FaBell,
  FaClock,
  FaServer,
  FaUserShield,
  FaFilter,
  FaCheckCircle, 
  FaTimesCircle,
  FaCode,
  FaEnvelope,
  FaMobileAlt,
  FaLock,
  FaExclamationTriangle
};

const Sidebar: React.FC = () => {
  // Create a direct onDragStart handler instead of using the context hook
  const onDragStart = (event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div className="policies-sidebar">
      <div className="policies-sidebar-header">
        <h2>Policy Nodes</h2>
      </div>
      
      <div className="policies-sidebar-content">
        {/* Render node categories */}
        {Object.entries(nodeCategories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="node-category">
            <div className="category-header" style={{ backgroundColor: category.color }}>
              <h3>{category.name}</h3>
            </div>
            
            <div className="category-items">
              {/* Filter nodes by category */}
              {policyNodes
                .filter(node => node.category === categoryKey)
                .map((node, index) => {
                  // Get the icon component from our map
                  const IconComponent = node.iconName ? iconMap[node.iconName] : null;
                  
                  return (
                    <div 
                      key={`${categoryKey}-${index}`}
                      className="sidebar-node"
                      draggable
                      onDragStart={(event) => onDragStart(event, node)}
                      style={{ borderColor: category.color }}
                    >
                      {IconComponent && <span className="node-icon"><IconComponent /></span>}
                      <span className="node-label">{node.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Keep only "policies" in tab-navigation */}
      <div className="sidebar-bottom">
        <div className="policies-tab active">Policies</div>
      </div>
    </div>
  );
};

export default Sidebar; 
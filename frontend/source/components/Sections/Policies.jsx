import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaDatabase, FaBrain, FaStar, FaRegBuilding, FaTag, FaMapMarked, FaExclamationCircle, FaCogs, FaPlayCircle, FaBug } from 'react-icons/fa';
import { useDnD } from '../nodes/DnDContext';
import '../../styles/Policies.css';
import { costumePolicies } from '../Sections/Investigations';

/**
 * @typedef {Object} SubPolicy
 * @property {string} label
 * @property {string} type
 */

/**
 * @typedef {Object} PolicyNode
 * @property {string} label
 * @property {string} color
 * @property {SubPolicy[]} subPoliciesNodes
 * @property {React.ReactNode} icon
 */
const Policies = () => {
  const [policiesNodes, setPoliciesNodes] = useState([
    { label: "DATA", color: "#1E90FF", subPoliciesNodes: ["Invest App", "Loans App", "API", "Splunk", "DL Users Data", "Auth-n"].map(label => ({ label, title: label ,type: "default" })), icon: <FaDatabase color="#1E90FF" /> },
    { label: "AI Models", color: "#8A2BE2", subPoliciesNodes: ["Abnormal Volume", "Sensitive Data", "Fraud Rings", "Abnormal Similarity", "Abnormal Seriality", "Distinct Values", "Scripting Detection"].map(label => ({ label, title: label ,type: "default" })), icon: <FaBrain color="#8A2BE2" /> },
    { label: "Reputations", color: "#FFD700", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaStar color="#FFD700" /> },
    { label: "Assets", color: "#228B22", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaRegBuilding color="#228B22" /> },
    { label: "Labels", color: "#FF4500", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaTag color="#FF4500" /> },
    { label: "Geo", color: "#00CED1", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaMapMarked color="#00CED1" /> },
    { label: "Incidents", color: "#DC143C", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaExclamationCircle color="#DC143C" /> },
    { label: "Operators", color: "#808080", subPoliciesNodes: [
      { label: "AND", type: "operator" , title: 'AND'},
      { label: "OR", type: "operator", title: 'OR' },
      { label: "{}", type: "default" , title: 'GROUP'},
      { label: "CONTAINS", type: "default" , title: 'CONTAINS'},
      { label: "THEN", type: "default" , title: 'THEN'},
      { label: "RELATED TO", type: "default" , title: 'RELATED TO'},
    ], icon: <FaCogs color="#808080" /> },
    { label: "Actions", color: "#4169E1", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaPlayCircle color="#4169E1" /> },
    { label: "Detected Anomalies", color: "#8B0000", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, title: label ,type: "default" })), icon: <FaBug color="#8B0000" /> },
    { label: "Custom Policies", color: "#FF8C00", subPoliciesNodes: costumePolicies, icon: <FaCog color="#FF8C00" /> }  // Unique option
  ]);

  console.log(costumePolicies);
  const [activeTool, setActiveTool] = useState(policiesNodes[0].label);
  const [type, label, color, setNode] = useDnD();
  const [widthPercentage, setWidthPercentage] = useState(28); // State for width in percentage
  const policiesContainerRef = useRef(null); // Ref for the policies container
  
  // State for dragging functionality
  const [position, setPosition] = useState({ x: 20 , y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const onDragStart = (event, nodeLabel, nodeType, color) => {
    if(typeof(nodeLabel) === 'object'){
      const temp = JSON.stringify(nodeLabel);
      nodeLabel = temp;
    }
    setNode(nodeType, nodeLabel, color);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  // Container dragging handlers
  const handleContainerMouseDown = (e) => {
    // Don't start dragging when clicking on interactive elements
    if (e.target.closest('.policy-tools-list, .policy-subtools, .resizer, .draggable-node, .tool-item')) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add global event listeners when dragging
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Existing resize functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newWidth = ((e.clientX-position.x) / window.innerWidth) * 100; // Calculate width as a percentage
      console.log(e.clientX , window.innerWidth, position.x, newWidth);
      if (newWidth > 10 && newWidth < 100) { // Set minimum and maximum width constraints
        setWidthPercentage(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const resizer = policiesContainerRef.current?.querySelector('.resizer');
    if (resizer) {

      resizer.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [policiesContainerRef, position.x]);
  return (
    <div>
      <div 
        className="policies-container" 
        ref={policiesContainerRef} 
        style={{ 
          width: `${widthPercentage}%`,
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleContainerMouseDown}
      >
        <div className="resizer" style={{ cursor: 'ew-resize', width: '10px', height: '100%', backgroundColor: 'transparent', position: 'absolute', right: '0' }}></div>
        <div className="policy-tools-list">
          {policiesNodes.map((tool) => (
            <div
              key={tool.label}
              className={`tool-item ${activeTool === tool.label ? "active-tool" : ""}`}
              onClick={() => setActiveTool(tool.label)}
              style={{ color: '#ffffff' }}
            >
              {tool.icon}<br />{tool.label}
            </div>
          ))}
        </div>

        <div className="policy-subtools">
          {policiesNodes.map((tool) => (
            activeTool === tool.label && (
              <div className="subtool-group" key={tool.label}>
                {tool.subPoliciesNodes.map((subTool) => (
                  <button
                    key={subTool.label}
                    className={`draggable-node ${tool.type}`}
                    style={{ justifyContent: 'center', border: `2px solid ${tool.color}`, backgroundColor: '#6c757d', color: '#ffffff' }}
                    onDragStart={(event) => onDragStart(event, subTool.label, subTool.type, tool.color)}
                    draggable
                  >
                  {subTool.title}  {console.log(subTool)}
                  </button>
                  
                ))}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default Policies;
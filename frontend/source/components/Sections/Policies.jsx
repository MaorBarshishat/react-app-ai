import React, { useState, useRef, useEffect } from 'react';
import { FaDatabase, FaBrain, FaStar, FaRegBuilding, FaTag, FaMapMarked, FaExclamationCircle, FaCogs, FaPlayCircle, FaBug } from 'react-icons/fa';
import { useDnD } from '../nodes/DnDContext';
import '../../styles/Policies.css';

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
  const policiesNodes = [
    { label: "DATA", color: "#1E90FF", subPoliciesNodes: ["Invest App", "Loans App", "API", "Splunk", "DL Users Data", "Auth-n"].map(label => ({ label, type: "default" })), icon: <FaDatabase color="#1E90FF" /> },
    { label: "AI Models", color: "#8A2BE2", subPoliciesNodes: ["Abnormal Volume", "Sensitive Data", "Fraud Rings", "Abnormal Similarity", "Abnormal Seriality", "Distinct Values", "Scripting Detection"].map(label => ({ label, type: "default" })), icon: <FaBrain color="#8A2BE2" /> },
    { label: "Reputations", color: "#FFD700", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaStar color="#FFD700" /> },
    { label: "Assets", color: "#228B22", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaRegBuilding color="#228B22" /> },
    { label: "Labels", color: "#FF4500", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaTag color="#FF4500" /> },
    { label: "Geo", color: "#00CED1", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaMapMarked color="#00CED1" /> },
    { label: "Incidents", color: "#DC143C", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaExclamationCircle color="#DC143C" /> },
    { label: "Operators", color: "#808080", subPoliciesNodes: [
      { label: "AND", type: "operator" },
      { label: "OR", type: "operator" },
      { label: "{}", type: "default" },
      { label: "CONTAINS", type: "default" },
      { label: "THEN", type: "default" },
      { label: "RELATED TO", type: "default" },
    ], icon: <FaCogs color="#808080" /> },
    { label: "Actions", color: "#4169E1", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaPlayCircle color="#4169E1" /> },
    { label: "Detected Anomalies", color: "#8B0000", subPoliciesNodes: ["New", "Open", "Save"].map(label => ({ label, type: "default" })), icon: <FaBug color="#8B0000" /> }
  ];

  const [activeTool, setActiveTool] = useState(policiesNodes[0].label);
  const [type, label, color, setNode] = useDnD();
  const [widthPercentage, setWidthPercentage] = useState(28); // State for width in percentage
  const policiesContainerRef = useRef(null); // Ref for the policies container

  const onDragStart = (event, nodeLabel, nodeType, color) => {
    setNode(nodeType, nodeLabel, color);
    event.dataTransfer.effectAllowed = 'move';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newWidth = (e.clientX / window.innerWidth) * 100; // Calculate width as a percentage
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
  }, [policiesContainerRef]);

  return (
    <div className="policies-container" ref={policiesContainerRef} style={{ width: `${widthPercentage}%` }}> {/* Set width using % */}
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
                  onDragStart={(event) => onDragStart(event, subTool.label, subTool.type, tool.color)} // Pass subtool.label and subtool.type
                  draggable
                >
                  {subTool.label} {/* Display the label of the subTool */}
                </button>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Policies;
import React, { useState } from 'react';
import { FaDatabase, FaBrain, FaStar, FaRegBuilding, FaTag, FaMapMarked, FaExclamationCircle, FaCogs, FaPlayCircle, FaBug } from 'react-icons/fa';
import { useDnD } from '../nodes/DnDContext';
import '../../styles/Policies.css';

const Policies = () => {
  const policiesNodes = [
    { type: "input", label: "DATA", color: "#1E90FF", subPoliciesNodes: ["Invest App", "Loans App", "API", "Splunk", "DL Users Data", "Auth-n"], icon: <FaDatabase color="#1E90FF" /> },
    { type: "output", label: "AI Models", color: "#8A2BE2", subPoliciesNodes: ["Abnormal Volume", "Sensitive Data", "Fraud Rings", "Abnormal Similarity", "Abnormal Seriality", "Distinct Values", "Scripting Detection"], icon: <FaBrain color="#8A2BE2" /> },
    { type: "text", label: "Reputations", color: "#FFD700", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaStar color="#FFD700" /> },
    { type: "text", label: "Assets", color: "#228B22", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaRegBuilding color="#228B22" /> },
    { type: "fourWay", label: "Labels", color: "#FF4500", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaTag color="#FF4500" /> },
    { type: "result", label: "Geo", color: "#00CED1", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaMapMarked color="#00CED1" /> },
    { type: "default", label: "Incidents", color: "#DC143C", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaExclamationCircle color="#DC143C" /> },
    { type: "operator", label: "Operators", color: "#808080", subPoliciesNodes: ["AND", "OR", "{}", "CONTAINS", "THEN", "RELATED TO"], icon: <FaCogs color="#808080" /> },
    { type: "default", label: "Actions", color: "#4169E1", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaPlayCircle color="#4169E1" /> },
    { type: "default", label: "Detected Anomalies", color: "#8B0000", subPoliciesNodes: ["New", "Open", "Save"], icon: <FaBug color="#8B0000" /> }
  ];

  const [activeTool, setActiveTool] = useState(policiesNodes[0].label);
  const [type, label, color, setNode] = useDnD();

  const onDragStart = (event, nodeLabel, nodeType, color) => {
    setNode(nodeType, nodeLabel, color);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="policies-container">
      <div className="policy-tools-list">
        {policiesNodes.map((tool) => (
          <div
            key={tool.label}
            className={`tool-item ${activeTool === tool.label ? "active-tool" : ""}`}
            onClick={() => setActiveTool(tool.label)}
            style={{ backgroundColor: '#495157', color: '#ffffff' }}
          >
            {tool.icon}<br />{tool.label}
          </div>
        ))}
      </div>

      <div className="policy-subtools">
        {policiesNodes.map((tool) => (
          activeTool === tool.label && (
            <div className="subtool-group" key={tool.label} style={{ backgroundColor: '#495157' }}>
              {tool.subPoliciesNodes.map((subTool) => (
                <button
                  key={subTool}
                  className={`draggable-node ${tool.type}`}
                  style={{ justifyContent: 'center', border: `2px solid ${tool.color}`, backgroundColor: '#6c757d', color: '#ffffff' }}
                  onDragStart={(event) => onDragStart(event, subTool, tool.type, tool.color)}
                  draggable
                >
                  {subTool}
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
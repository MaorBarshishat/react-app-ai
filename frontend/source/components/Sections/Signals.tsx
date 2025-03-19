import React, { useState, useEffect } from 'react';
import '../../styles/Signals.css';
import { FaEdit, FaSave, FaArrowLeft, FaChartLine, FaExclamationTriangle, FaGripVertical, FaPlus } from 'react-icons/fa';
import { costumePolicies } from './Investigations';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

interface PolicyPerformance {
  signalStrength: number;
  accuracy: number;
  precision: number;
  recall: number;
}

interface NodeType {
  label: string;
  title?: string;
  type: 'string' | 'stringInput' | 'timeInput' | 'operator';
  value?: string;
  operatorType?: string;
}

interface PolicyNode {
  id: string;
  label: string;
  title?: string;
  color: string;
  subPoliciesNodes: NodeType[];
  icon: React.ReactNode;
  description: string;
}

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Signals: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPolicy, setEditedPolicy] = useState<PolicyNode | null>(null);
  
  // Mock performance data
  const [performance, setPerformance] = useState<PolicyPerformance>({
    signalStrength: Math.floor(Math.random() * 10) + 1,
    accuracy: Number((0.85 + Math.random() * 0.14).toFixed(4)),
    precision: Number((0.82 + Math.random() * 0.17).toFixed(4)),
    recall: Number((0.78 + Math.random() * 0.21).toFixed(4))
  });

  // Replace single edit state with section-specific editing states
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingFunctionality, setIsEditingFunctionality] = useState(false);

  // When component mounts, load saved editing state
  useEffect(() => {
    // First load the selected policy
    const policyData = localStorage.getItem('selectedPolicy');
    if (policyData) {
      try {
        const policy = JSON.parse(policyData);
        setSelectedPolicy(policy);
        
        // Check if there was an editing session in progress
        const savedEditedPolicy = localStorage.getItem('editedPolicy');
        const wasEditing = localStorage.getItem('isEditingSignal') === 'true';
        
        if (savedEditedPolicy) {
          setEditedPolicy(JSON.parse(savedEditedPolicy));
        } else {
          setEditedPolicy(policy);
        }
        
        // Restore editing state if it was active
        if (wasEditing) {
          setIsEditing(true);
        }
      } catch (e) {
        console.error("Error parsing policy data:", e);
      }
    }
  }, []);

  // Add this function to save the current state any time it changes
  useEffect(() => {
    // Don't save if there's nothing to save
    if (!editedPolicy) return;
    
    // Save whether we're in edit mode
    localStorage.setItem('isEditingSignal', isEditing ? 'true' : 'false');
    
    // Always save the current policy state, even if not in edit mode
    localStorage.setItem('editedPolicy', JSON.stringify(editedPolicy));
    
    // If not in edit mode, also update the selected policy
    if (!isEditing) {
      localStorage.setItem('selectedPolicy', JSON.stringify(editedPolicy));
    }
    
  }, [editedPolicy, isEditing]);

  
  // Also, modify the handleBackToInvestigations function to ensure state is saved before navigation
  const handleBackToInvestigations = () => {
    // Save current state before navigating
    if (editedPolicy) {
      localStorage.setItem('editedPolicy', JSON.stringify(editedPolicy));
      localStorage.setItem('isEditingSignal', isEditing ? 'true' : 'false');
    }
    
    // Navigate back to investigations
    window.location.href = '/investigations';
  };

  // Inside the component, add this mock data for the charts
  const generateDailyData = () => {
    const dates: string[] = [];
    const occurrences: number[] = [];
    const users: number[] = [];
    
    // Generate last 10 days of data
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Random data
      occurrences.push(Math.floor(Math.random() * 20) + 5);
      users.push(Math.floor(Math.random() * 10) + 1);
    }
    
    return { dates, occurrences, users };
  };

  // In your component, before the return statement
  const chartData = generateDailyData();

  const [notification, setNotification] = useState<string | null>(null);
  // Add a new state for notification type
  const [notificationType, setNotificationType] = useState<'success' | 'error' >('success');
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const addPolicyToCustom = () => {
    if (selectedPolicy) {
      // Use the policy's title for sidebar display, fall back to label if no title
      const nodeTitle = selectedPolicy.title || selectedPolicy.label;
      
      // Create a combined string for the flow display by joining all node labels
      const combinedLabel = selectedPolicy.subPoliciesNodes
        .map(node => {
          // Format operators with brackets
          return node.type === 'operator' ? 
            `[${node.label}]` : 
            node.label;
        })
        .join(' ');
      
      // Create a single combined node for the custom policies
      const combinedNode = {
        id: selectedPolicy.id,
        title: nodeTitle,       // This is shown in the sidebar
        label: combinedLabel,   // This is shown in the flow
        type: 'combined',
        // Store original nodes for reference
        subPoliciesNodes: selectedPolicy.subPoliciesNodes,
        description: selectedPolicy.description
      };
      
      // Find if policy already exists by ID
      const existingIndex = costumePolicies.findIndex(
        existingPolicy => existingPolicy.id === selectedPolicy.id
      );
      
      if (existingIndex >= 0) {
        // Update existing policy
        costumePolicies[existingIndex] = combinedNode;
        setNotificationType('success');
        setNotification("Policy updated in Custom Policies!");
      } else {
        // Add new policy
        costumePolicies.push(combinedNode);
        setNotificationType('success');
        setNotification("Policy added to Custom Policies!");
      }
      
      // Show the notification
      setIsNotificationVisible(true);
      
      // Hide notification after 1 second
      setTimeout(() => {
        setIsNotificationVisible(false);
        setNotification('');
      }, 1000);      
    }
  };

  // Add this state for drag-and-drop functionality
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);

  // Add separate save handlers for each section
  const handleSaveDescription = () => {
    if (editedPolicy) {
      setSelectedPolicy({
        ...selectedPolicy!,
        description: editedPolicy.description
      });
      
      // Update custom policies if this policy exists there
      const existingIndex = costumePolicies.findIndex(
        policy => policy.id === editedPolicy.id
      );
      
      if (existingIndex >= 0) {
        costumePolicies[existingIndex] = {
          ...costumePolicies[existingIndex],
          description: editedPolicy.description
        };
      }
      
      // Show success notification
      setNotificationType('success');
      setNotification("Description updated!");
      setIsNotificationVisible(true);
      setTimeout(() => {
        setIsNotificationVisible(false);
        setNotification('');
      }, 1000);
    }
  };

  const handleSaveFunctionality = () => {
    if (editedPolicy) {
      setSelectedPolicy({
        ...selectedPolicy!,
        subPoliciesNodes: editedPolicy.subPoliciesNodes
      });
      
      // Update custom policies if this policy exists there
      const existingIndex = costumePolicies.findIndex(
        policy => policy.id === editedPolicy.id
      );
      
      if (existingIndex >= 0) {
        costumePolicies[existingIndex] = {
          ...costumePolicies[existingIndex],
          subPoliciesNodes: editedPolicy.subPoliciesNodes
        };
      }
      console.log(editedPolicy.subPoliciesNodes);
      console.log(costumePolicies);
      console.log(selectedPolicy)
      
      // Show success notification
      setNotificationType('success');
      setNotification("Functionality updated!");
      setIsNotificationVisible(true);
      setTimeout(() => {
        setIsNotificationVisible(false);
        setNotification('');
      }, 1000);
    }
  };

  if (!selectedPolicy) {
    return (
      <div className="signals-container">
        <div className="signals-empty-state">
          <div className="empty-icon">
            <FaExclamationTriangle size={64} />
          </div>
          <h2>No Policy Selected</h2>
          <p>No policy information is available to display.</p>
          <button className="signals-action-button" onClick={handleBackToInvestigations}>
            Return to Investigations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signals-container">
      <div className="signals-header">
        <div className="header-left">
          {/* <button className="back-button" onClick={handleBackToInvestigations}>
            <FaArrowLeft /> Back to Investigations
          </button> */}
          <h1>Signal Intelligence: {selectedPolicy.label}</h1>
        </div>
        <div className="header-right">
          <button className="add-custom-button" onClick={addPolicyToCustom}>
            Add to Custom Policies
          </button>
        </div>
        {/* Notification */}
        {notification && isNotificationVisible && (
          <Stack sx={{ position: 'fixed',
            top: '10%', // Adjust this value for desired vertical spacing
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300, // MUI Snackbar default zIndex is 1000
            maxWidth: '25%', margin: 'auto' }} spacing={2}>
            <Alert variant="filled" severity={notificationType}>{notification}</Alert>
          </Stack>
        )}
      </div>
      
      <div className="signal-detail-container">
        {/* Three sections in one row */}
        <div className="three-column-row">
          {/* Profile section - one-third width */}
          <div className="signal-section">
            <h2>PROFILE</h2>
            <div className="profile-details">
              <div className="profile-item">
                <span className="item-label">Created Date:</span>
                <span className="item-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="profile-item">
                <span className="item-label">Active Since:</span>
                <span className="item-value">{new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="profile-item">
                <span className="item-label">Regression Data:</span>
                <span className="item-value">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="profile-item">
                <span className="item-label">Triggered:</span>
                <span className="item-value">{Math.floor(Math.random() * 20) + 5} times</span>
              </div>
            </div>
          </div>
          
          {/* Description section - one-third width */}
          <div className="signal-section">
            <h2>DESCRIPTION</h2>
            {!isEditingDescription ? (
                <button className="section-edit-button" onClick={() => setIsEditingDescription(true)}>
                  <FaEdit />
                </button>
              ) : (
                <button className="section-save-button" onClick={() => {
                  setIsEditingDescription(false);
                  // Save description changes
                  handleSaveDescription();
                }}>
                  <FaSave />
                </button>
              )}

            <div className="section-header">
              <h3>Signal Details</h3>
            </div>
            {isEditingDescription ? (
              <textarea
                className="description-editor"
                value={editedPolicy?.description || ""}
                onChange={(e) => {
                  if (editedPolicy) {
                    setEditedPolicy({
                      ...editedPolicy,
                      description: e.target.value
                    });
                  }
                }}
              />
            ) : (
              <p>{selectedPolicy.description}</p>
            )}
          </div>

          {/* Performance section - one-third width */}
          <div className="signal-section">
            <h2>PERFORMANCE</h2>
            <div className="performance-metrics">
              <div className="metric-card">
                <div className="metric-value">{performance.signalStrength}/10</div>
                <div className="metric-label">Signal Strength</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{performance.accuracy}</div>
                <div className="metric-label">Accuracy</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{performance.precision}</div>
                <div className="metric-label">Precision</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{performance.recall}</div>
                <div className="metric-label">Recall</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Functionality section - full width */}
        <div className="signal-section full-width">
          <h2>FUNCTIONALITY</h2>
          {!isEditingFunctionality ? (
              <button className="section-edit-button" style={{marginLeft: '84%'}} onClick={() => setIsEditingFunctionality(true)}>
                <FaEdit />
              </button>
            ) : (
              <button className="section-save-button" style={{marginLeft: '84%'}} onClick={() => {
                setIsEditingFunctionality(false);
                // Save functionality changes
                handleSaveFunctionality();
              }}>
                <FaSave />
              </button>
            )}
          <div className="section-header">
            <h3>Signal Rules</h3>
          </div>
          <div className="functionality-content">
            {isEditingFunctionality ? (
              <div className="policy-nodes-editor">
                <div className="policy-title-editor">
                  <h3>Policy Title (Sidebar Display)</h3>
                  <input 
                    type="text" 
                    className="policy-title-input" 
                    value={editedPolicy?.title || editedPolicy?.label || ""} 
                    onChange={(e) => {
                      setEditedPolicy({
                        ...editedPolicy!,
                        title: e.target.value
                      });
                    }}
                    placeholder="Enter a title for the sidebar display"
                  />
                </div>
                
                <div className="policy-label-preview">
                  <h4>Combined Policy Label (Flow Display):</h4>
                  <div className="label-preview">
                    {editedPolicy?.subPoliciesNodes.map(node => node.label).join(' ')}
                  </div>
                </div>
                
                <h3>Policy Nodes</h3>
                <div className="node-preview-section">
                  <h4>Policy Preview</h4>
                  <div className="node-flow-preview">
                    {editedPolicy?.subPoliciesNodes.map((node, index) => (
                      <React.Fragment key={index}>
                        <div className={`node-flow-item node-type-${node.type}`}>
                          <span className="node-label">{node.label}</span>
                          {node.operatorType && <span className="node-operator">[{node.operatorType}]</span>}
                          {node.value && <span className="node-value">= {node.value}</span>}
                        </div>
                        {index < editedPolicy.subPoliciesNodes.length - 1 && (
                          <div className="node-connector">
                            <div className="connector-line"></div>
                            <div className="connector-arrow">→</div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="node-editor-list">
                  {editedPolicy?.subPoliciesNodes.map((node, index) => (
                    <div 
                      key={index} 
                      className="node-editor-item"
                      draggable
                      onDragStart={() => setDraggedNodeIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault(); // Allow drop
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedNodeIndex !== null && draggedNodeIndex !== index) {
                          // Reorder nodes
                          const updatedNodes = [...editedPolicy.subPoliciesNodes];
                          const draggedNode = updatedNodes[draggedNodeIndex];
                          // Remove dragged node
                          updatedNodes.splice(draggedNodeIndex, 1);
                          // Insert at new position
                          updatedNodes.splice(index, 0, draggedNode);
                          setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                          setDraggedNodeIndex(null);
                        }
                      }}
                    >
                      <div className="drag-handle">
                        <FaGripVertical />
                      </div>
                      
                      <div className="node-input-group">
                        <label>Title (Sidebar):</label>
                        <input 
                          type="text" 
                          value={node.title || node.label} 
                          onChange={(e) => {
                            const updatedNodes = [...editedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {...node, title: e.target.value};
                            setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        />
                      </div>
                      
                      <div className="node-input-group">
                        <label>Label (Flow):</label>
                        <input 
                          type="text" 
                          value={node.label} 
                          onChange={(e) => {
                            const updatedNodes = [...editedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {...node, label: e.target.value};
                            setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        />
                      </div>
                      
                      <select 
                        value={node.type} 
                        onChange={(e) => {
                          const updatedNodes = [...editedPolicy.subPoliciesNodes];
                          updatedNodes[index] = {
                            ...node, 
                            type: e.target.value as 'string' | 'stringInput' | 'timeInput' | 'operator',
                            operatorType: e.target.value === 'operator' ? 'and' : undefined
                          };
                          setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                        }}
                      >
                        <option value="string">String Value</option>
                        <option value="stringInput">String Input</option>
                        <option value="timeInput">Time Input</option>
                        <option value="operator">Operator</option>
                      </select>
                      
                      {/* Show operator dropdown if node type is operator */}
                      {node.type === 'operator' && (
                        <select 
                          value={node.operatorType || 'and'} 
                          onChange={(e) => {
                            const updatedNodes = [...editedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {...node, operatorType: e.target.value};
                            setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        >
                          <option value="and">AND</option>
                          <option value="or">OR</option>
                          <option value="xor">XOR</option>
                          <option value="lt">&lt; (Less Than)</option>
                          <option value="gt">&gt; (Greater Than)</option>
                          <option value="eq">== (Equals)</option>
                          <option value="seq">=== (Strict Equals)</option>
                        </select>
                      )}
                      
                      {/* Show appropriate input based on node type */}
                      {node.type === 'stringInput' && (
                        <input 
                          type="text" 
                          placeholder="String value" 
                          value={node.value || ''} 
                          onChange={(e) => {
                            const updatedNodes = [...editedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {...node, value: e.target.value};
                            setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        />
                      )}
                      
                      {node.type === 'timeInput' && (
                        <input 
                          type="time" 
                          value={node.value || ''} 
                          onChange={(e) => {
                            const updatedNodes = [...editedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {...node, value: e.target.value};
                            setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        />
                      )}
                      
                      <button onClick={() => {
                        const updatedNodes = editedPolicy.subPoliciesNodes.filter((_, i) => i !== index);
                        setEditedPolicy({...editedPolicy, subPoliciesNodes: updatedNodes});
                      }}>Remove</button>
                    </div>
                  ))}
                  
                  {/* Add Node button */}
                  <button 
                    className="add-node-button"
                    onClick={() => {
                      setEditedPolicy({
                        ...editedPolicy!, 
                        subPoliciesNodes: [
                          ...editedPolicy!.subPoliciesNodes, 
                          { label: "New Node", type: "string" }
                        ]
                      });
                    }}
                  >
                    <FaPlus /> Add New Node
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="nodes-list">
                  <h3>Applied Nodes:</h3>
                  <div className="node-flow-preview">
                    {selectedPolicy.subPoliciesNodes.map((node, index) => (
                      <React.Fragment key={index}>
                        <div className={`node-flow-item node-type-${node.type}`}>
                          <span className="node-label">{node.label}</span>
                          {node.operatorType && <span className="node-operator">[{node.operatorType}]</span>}
                          {node.value && <span className="node-value">= {node.value}</span>}
                        </div>
                        {index < selectedPolicy.subPoliciesNodes.length - 1 && (
                          <div className="node-connector">
                            <div className="connector-line"></div>
                            <div className="connector-arrow">→</div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="functionality-description">
                  <p>This policy monitors and detects abnormal patterns based on the configured nodes.</p>
                  <p>When triggered, it will generate alerts according to the defined thresholds and parameters.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="signal-section full-width">
          <h2>SIGNAL ANALYTICS</h2>
          <div className="charts-container">
            <div className="chart-wrapper">
              <h3>Daily Signal Occurrences</h3>
              <Line 
                data={{
                  labels: chartData.dates,
                  datasets: [
                    {
                      label: 'Occurrences',
                      data: chartData.occurrences,
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#fff'
                      }
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#aaa'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#aaa'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="chart-wrapper">
              <h3>Affected Users</h3>
              <Bar
                data={{
                  labels: chartData.dates,
                  datasets: [
                    {
                      label: 'Users Affected',
                      data: chartData.users,
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#fff'
                      }
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#aaa'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#aaa'
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signals; 
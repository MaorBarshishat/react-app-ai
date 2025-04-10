import React, { useState, useEffect, useRef } from 'react';
import '../../styles/Signals.css';
import { FaEdit, FaSave, FaArrowLeft, FaChartLine, FaExclamationTriangle, FaGripVertical, FaPlus, 
  FaFolder, FaFolderOpen, FaFile, FaEllipsisH, FaTrash, FaPencilAlt, FaChevronRight, FaChevronDown, FaTimes, FaCalendarAlt, FaClock, FaBell, FaCodeBranch } from 'react-icons/fa';
import { costumePolicies } from './Investigations';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';

// Import types from common module or define here
interface NodeType {
  label: string;
  title?: string;
  type: 'string' | 'stringInput' | 'timeInput' | 'operator';
  value?: string;
  timeFormat?: 'specific' | 'duration';
  operatorType?: string;
  leftParam?: OperatorParam;
  rightParam?: OperatorParam;
  enabled?: boolean;
  connectionOperator?: 'and' | 'or' | null; // Add this new property to represent the connection to the next node
}

interface SubPolicy {
  label: NodeType[];
  type: string;
  id?: string;
  subPoliciesNodes?: NodeType[];
  description?: string;
  sourceInvestigationId?: string;
}

interface PolicyNode {
  id: string;
  label: string;
  title?: string;
  color: string;
  subPoliciesNodes: NodeType[];
  icon: React.ReactNode;
  description: string;
  sourceInvestigationId?: string;
  profile?: {
    createdDate: string;
    activeSince: string;
    lastUpdated: string;
    severity: string;
    status: string;
    triggered: number;
    notes?: string;
  };
}

// Define folder structure interfaces matching Investigations.tsx
interface InvestigationFolder {
  id: string;
  name: string;
  type: 'folder';
  children: (InvestigationFolder | InvestigationFile)[];
  isOpen?: boolean;
}

interface InvestigationFile {
  id: string;
  name: string;
  type: 'file';
  status: 'open' | 'closed' | 'in-progress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  dateCreated: string;
  dates: (string | {startDate: string, endDate: string})[];
  assets: string[];
  domains: string[];
  description: string;
  assignedTo: string;
}

type InvestigationItem = InvestigationFolder | InvestigationFile;

interface PolicyPerformance {
  signalStrength: number;
  accuracy: number;
  precision: number;
  recall: number;
}

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Add this interface to describe the operator node's parameter types
interface OperatorParam {
  type: 'string' | 'input';
  value: string;
}


interface MainNavigationProps {
  activeTab: string;
  setActiveTab: (tab: 'policies' | 'investigations' | 'signals') => void;
}


// Add this helper function to convert operator types to symbols
const getOperatorSymbol = (operatorType?: string): string => {
  switch (operatorType?.toLowerCase()) {
    case 'and': return '&&';
    case 'or': return '||';
    case 'xor': return '⊕';
    case 'not': return '!';
    case 'eq': return '==';
    case 'neq': return '!=';
    case 'gt': return '>';
    case 'gte': return '≥';
    case 'lt': return '<';
    case 'lte': return '≤';
    case 'contains': return '∋';
    case 'startswith': return '^=';
    case 'endswith': return '$=';
    case 'matches': return '≈';
    default: return operatorType || '';
  }
};

// Add this function near the other utility functions
const generateRelevantOperators = (description: string): NodeType[] => {
  const operators: NodeType[] = [];
  
  // Common security patterns
  const ipCheck: NodeType = {
    type: 'operator',
    label: 'IP Check',
    operatorType: 'matches',
    leftParam: { type: 'string', value: 'source.ip' },
    rightParam: { type: 'string', value: '^192\\.168\\.' },
    connectionOperator: 'and'  // Explicitly set this
  };
  
  const timeCheck: NodeType = {
    type: 'operator',
    label: 'Time Check',
    operatorType: 'gt',
    leftParam: { type: 'string', value: 'event.timestamp' },
    rightParam: { type: 'string', value: 'timeThreshold' },
    connectionOperator: 'and'
  };
  
  const frequencyCheck: NodeType = {
    type: 'operator',
    label: 'Frequency Check',
    operatorType: 'gt',
    leftParam: { type: 'string', value: 'activity.frequency' },
    rightParam: { type: 'string', value: '5' },
    connectionOperator: 'or'
  };
  
  // Add basic checks for all signals
  operators.push(timeCheck);
  
  // Gift card or payment fraud specific operators
  if (description.toLowerCase().includes('gift card') || 
      description.toLowerCase().includes('payment') || 
      description.toLowerCase().includes('fraud')) {
    
    operators.push({
      type: 'operator',
      label: 'Transaction Check',
      operatorType: 'gt',
      leftParam: { type: 'string', value: 'transaction.amount' },
      rightParam: { type: 'string', value: '500' },
      connectionOperator: 'or'
    });
    
    operators.push({
      type: 'operator',
      label: 'Card Check',
      operatorType: 'contains',
      leftParam: { type: 'string', value: 'transaction.method' },
      rightParam: { type: 'string', value: 'gift_card' },
      connectionOperator: 'and'
    });
    
    operators.push({
      type: 'operator',
      label: 'Multiple Cards',
      operatorType: 'gt',
      leftParam: { type: 'string', value: 'user.unique_cards_used' },
      rightParam: { type: 'string', value: '3' },
      connectionOperator: 'and'
    });
  }
  
  // Account takeover specific operators
  if (description.toLowerCase().includes('account') || 
      description.toLowerCase().includes('ato') ||
      description.toLowerCase().includes('takeover')) {
    
    operators.push({
      type: 'operator',
      label: 'Location Change',
      operatorType: 'neq',
      leftParam: { type: 'string', value: 'login.location' },
      rightParam: { type: 'string', value: 'user.usual_location' },
      connectionOperator: 'or'
    });
    
    operators.push({
      type: 'operator',
      label: 'Device Check',
      operatorType: 'neq',
      leftParam: { type: 'string', value: 'login.device_id' },
      rightParam: { type: 'string', value: 'user.known_devices' },
      connectionOperator: 'and'
    });
    
    operators.push({
      type: 'operator',
      label: 'Password Change',
      operatorType: 'eq',
      leftParam: { type: 'string', value: 'account.password_changed' },
      rightParam: { type: 'string', value: 'true' },
      connectionOperator: 'or'
    });
  }
  
  // Attack or security breach specific operators
  if (description.toLowerCase().includes('attack') || 
      description.toLowerCase().includes('breach') ||
      description.toLowerCase().includes('security')) {
    
    operators.push(ipCheck);
    
    operators.push({
      type: 'operator',
      label: 'Auth Failures',
      operatorType: 'gt',
      leftParam: { type: 'string', value: 'auth.failed_attempts' },
      rightParam: { type: 'string', value: '5' },
      connectionOperator: 'or'
    });
    
    operators.push({
      type: 'operator',
      label: 'Admin Access',
      operatorType: 'eq',
      leftParam: { type: 'string', value: 'access.admin_functions' },
      rightParam: { type: 'string', value: 'true' },
      connectionOperator: 'and'
    });
  }
  
  // Add frequency check for most signal types
  operators.push(frequencyCheck);
  
  return operators;
};

const Signals: React.FC<MainNavigationProps> = ({ activeTab, setActiveTab }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPolicy, setEditedPolicy] = useState<PolicyNode | null>(null);
  
  // Sidebar states - similar to Investigations
  const [folderData, setFolderData] = useState<InvestigationFolder[]>([]);
  const [selectedItem, setSelectedItem] = useState<InvestigationItem | null>(null);
  const [showFolderMenu, setShowFolderMenu] = useState<{show: boolean, folderId?: string}>({show: false});
  const [showFileMenu, setShowFileMenu] = useState<{show: boolean, fileId?: string}>({show: false});
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(25); // Width percentage

  // For sidebar resizing
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  
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

  // Add these new states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  // Add this state for drag and drop functionality
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);

  // Add this state near the other useState declarations
  const [isCanceling, setIsCanceling] = useState(false);

  // Replace the single originalPolicy state with separate states for each section
  // const [originalPolicy, setOriginalPolicy] = useState<PolicyNode | null>(null);
  const [originalDescPolicy, setOriginalDescPolicy] = useState<PolicyNode | null>(null);
  const [originalFuncPolicy, setOriginalFuncPolicy] = useState<PolicyNode | null>(null);

  // Load folder data from localStorage
  useEffect(() => {
    const initializeFolderData = () => {
      const currentDate = new Date().toISOString().split('T')[0];
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthDate = lastMonth.toISOString().split('T')[0];
      
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const twoMonthsAgoDate = twoMonthsAgo.toISOString().split('T')[0];

      const newFolderData: InvestigationFolder[] = [
        {
          id: 'folder-1',
          name: 'Commerce Abuse Investigations',
          type: 'folder',
          isOpen: true,
          children: [
            {
              id: 'file-1',
              name: 'Gift Card Abuse',
              type: 'file',
              status: 'in-progress',
              severity: 'high',
              dateCreated: lastMonthDate,
              dates: [{ startDate: lastMonthDate, endDate: currentDate }],
              assets: ['user_123@example.com', 'user_456@example.com'],
              domains: ['payment.example.com', 'giftcards.example.com'],
              description: 'Investigation into the fraudulent use of gift cards across multiple accounts.',
              assignedTo: 'Sarah Johnson'
            },
            {
              id: 'file-2',
              name: 'Gift Cards Fake Wallets',
              type: 'file',
              status: 'open',
              severity: 'critical',
              dateCreated: lastMonthDate,
              dates: [{ startDate: lastMonthDate, endDate: currentDate }],
              assets: ['wallet_4352', 'wallet_8766', 'wallet_9023'],
              domains: ['wallet.example.com', 'accounts.example.com'],
              description: 'Investigation into creation of fake wallet accounts for gift card laundering.',
              assignedTo: 'Michael Chen'
            },
            {
              id: 'file-3',
              name: 'Return Policy Abuse',
              type: 'file',
              status: 'in-progress',
              severity: 'medium',
              dateCreated: twoMonthsAgoDate,
              dates: [{ startDate: twoMonthsAgoDate, endDate: currentDate }],
              assets: ['order_8723', 'order_9821', 'user_789@example.com'],
              domains: ['returns.example.com', 'orders.example.com'],
              description: 'Investigation into systematic abuse of return policies by coordinated user groups.',
              assignedTo: 'Jennifer Smith'
            },
            {
              id: 'file-4',
              name: 'Denied Assets July',
              type: 'file',
              status: 'closed',
              severity: 'medium',
              dateCreated: '2023-07-15',
              dates: [{ startDate: '2023-07-01', endDate: '2023-07-31' }],
              assets: ['asset_6542', 'asset_7823', 'asset_9012'],
              domains: ['assets.example.com', 'resources.example.com'],
              description: 'Review of denied asset transfers during July with suspicious patterns.',
              assignedTo: 'Robert Taylor'
            }
          ]
        },
        {
          id: 'folder-2',
          name: 'Trust and Identity Investigations',
          type: 'folder',
          isOpen: true,
          children: [
            {
              id: 'file-5',
              name: 'Mass. ATO May 24',
              type: 'file',
              status: 'in-progress',
              severity: 'critical',
              dateCreated: '2023-05-24',
              dates: [{ startDate: '2023-05-24', endDate: '2023-06-15' }],
              assets: ['accounts_dept', 'login_systems', 'user_auth_db'],
              domains: ['login.example.com', 'accounts.example.com'],
              description: 'Investigation into mass account takeover attempts detected on May 24.',
              assignedTo: 'David Wilson'
            },
            {
              id: 'file-6',
              name: 'Distributed AOF',
              type: 'file',
              status: 'open',
              severity: 'high',
              dateCreated: lastMonthDate,
              dates: [{ startDate: lastMonthDate, endDate: currentDate }],
              assets: ['auth_system', 'client_api', 'verification_service'],
              domains: ['api.example.com', 'auth.example.com'],
              description: 'Analysis of distributed account opening fraud campaign from multiple IPs.',
              assignedTo: 'Lisa Rodriguez'
            },
            {
              id: 'file-7',
              name: 'Attack from Malaysia',
              type: 'file',
              status: 'in-progress',
              severity: 'high',
              dateCreated: twoMonthsAgoDate,
              dates: [{ startDate: twoMonthsAgoDate, endDate: currentDate }],
              assets: ['frontend_servers', 'backend_api', 'user_credentials'],
              domains: ['api.example.com', 'app.example.com'],
              description: 'Investigation into coordinated attack attempts originating from Malaysian IPs.',
              assignedTo: 'Kevin Park'
            }
          ]
        }
      ];

      setFolderData(newFolderData);
      localStorage.setItem('investigationFolderData', JSON.stringify(newFolderData));
    };

    // Only initialize if there's no data
    const savedFolderData = localStorage.getItem('investigationFolderData');
    if (!savedFolderData || JSON.parse(savedFolderData).length === 0) {
      initializeFolderData();
    } else {
      setFolderData(JSON.parse(savedFolderData));
    }
  }, []);

  // Load selected policy
  useEffect(() => {
    const policyData = localStorage.getItem('selectedPolicy');
    if (policyData) {
      try {
        const policy = JSON.parse(policyData);
        setSelectedPolicy(policy);
        
        const savedEditedPolicy = localStorage.getItem('editedPolicy');
        const wasEditing = localStorage.getItem('isEditingSignal') === 'true';
        
        if (savedEditedPolicy) {
          setEditedPolicy(JSON.parse(savedEditedPolicy));
        } else {
          setEditedPolicy(policy);
        }
        
        if (wasEditing) {
          setIsEditing(true);
        }
      } catch (e) {
        console.error("Error parsing policy data:", e);
      }
    }
  }, []);

  // Setup listeners for folder data changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'investigationFolderData') {
        try {
          setFolderData(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing folder data:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save edited policy state
  useEffect(() => {
    if (!editedPolicy) return;
    
    localStorage.setItem('isEditingSignal', isEditing ? 'true' : 'false');
    localStorage.setItem('editedPolicy', JSON.stringify(editedPolicy));
    
    if (!isEditing) {
      localStorage.setItem('selectedPolicy', JSON.stringify(editedPolicy));
    }
  }, [editedPolicy, isEditing]);

  // Handle sidebar resizing
  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 15 && newWidth <= 85) {
      setSidebarWidth(newWidth);
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

  // Toggle folder open/closed
  const toggleFolder = (folderId: string) => {
    setFolderData(prevData => 
      prevData.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, isOpen: !folder.isOpen };
        }
        return folder;
      })
    );
    
    // Also update localStorage for synchronization
    const updatedData = folderData.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, isOpen: !folder.isOpen };
      }
      return folder;
    });
    localStorage.setItem('investigationFolderData', JSON.stringify(updatedData));
  };

  // Handle folder actions (ellipsis menu)
  const handleFolderActions = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    
    // Close any other open menus
    setShowFileMenu({ show: false });
    
    // Toggle menu for this folder
    setShowFolderMenu({
      show: !showFolderMenu.show || showFolderMenu.folderId !== folderId,
      folderId
    });
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: rect.top - rect.height,
      left: rect.left
    });
    
    setOverlayVisible(true);
  };

  // Handle file actions
  const handleFileActions = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close other menus
    setShowFolderMenu({ show: false });
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setShowFileMenu({
      show: !showFileMenu.show || showFileMenu.fileId !== fileId,
      fileId
    });
    
    // Position menu relative to the button
    setMenuPosition({
      top: rect.top - rect.height,
      left: rect.left
    });
    
    setOverlayVisible(true);
  };

  // Add this state for tracking which investigation folders are expanded
  const [expandedInvestigations, setExpandedInvestigations] = useState<Set<string>>(new Set());

  // Update handleSelectItem to match folder toggle behavior instead of just selecting
  const handleSelectItem = (item: InvestigationItem) => {
    if (item.type === 'file') {
      // For investigation items, toggle their expanded state like folders
      setExpandedInvestigations(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else if (item.type === 'folder') {
      // For regular folders, use the existing toggleFolder function
      toggleFolder(item.id);
    }
    
    // Still set as selected item regardless
    setSelectedItem(item);
  };

  // Modify the renderFolderStructure function to handle expandable investigations
  const renderFolderStructure = (items: (InvestigationFolder | InvestigationFile)[], level = 0) => {
    return items.map(item => {
      if (item.type === 'folder') {
        const folder = item as InvestigationFolder;
        return (
          <div key={folder.id} style={{ marginLeft: `${level * 20}px` }}>
            <div 
              className={`folder-item ${selectedItem?.id === folder.id ? 'selected' : ''}`}
              onClick={() => toggleFolder(folder.id)}
            >
              <div className="folder-content">
                <span className="folder-icon">
                  {folder.isOpen ? <FaFolderOpen /> : <FaFolder />}
                </span>
                <span className="folder-name">{folder.name}</span>
              </div>
              
              <button 
                className="action-button"
                onClick={(e) => handleFolderActions(e, folder.id)}
                title="More actions"
              >
                <FaEllipsisH />
              </button>
            </div>
            
            {folder.isOpen && folder.children && folder.children.length > 0 && (
              <div className="folder-children">
                {renderFolderStructure(folder.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        // Render investigation files as expandable folders
        const file = item as InvestigationFile;
        const isExpanded = expandedInvestigations.has(file.id);
        
        return (
          <div key={file.id} style={{ marginLeft: `${level * 20}px` }}>
            <div 
              className={`folder-item investigation-folder ${selectedItem?.id === file.id ? 'selected' : ''}`}
              onClick={() => handleSelectItem(file)}
            >
              <div className="folder-content">
                <span className="expand-icon">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
                <ContentPasteSearchIcon className="investigation-icon" />
                <span className="folder-name">{file.name}</span>
              </div>
              
              <button 
                className="action-button"
                onClick={(e) => handleFileActions(e, file.id)}
              >
                <FaEllipsisH />
              </button>
            </div>
            
            {isExpanded && (
              <div className="folder-children investigation-children">
                {renderSignalsForInvestigation(file, level + 1)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  // Add this state to track saved signals for each investigation
  const [savedSignals, setSavedSignals] = useState<{[investigationId: string]: any[]}>({});

  // Add a useEffect to load saved signals from localStorage on component mount
  useEffect(() => {
    const savedSignalsData = localStorage.getItem('savedSignals');
    if (savedSignalsData) {
      try {
        setSavedSignals(JSON.parse(savedSignalsData));
      } catch (e) {
        console.error('Error loading saved signals:', e);
      }
    }
  }, []);

  // Update the applySignal function to properly handle connection operators

  const applySignal = () => {
    if (selectedPolicy) {
      const nodeTitle = selectedPolicy.title || selectedPolicy.label;
      
      // Use the existing sourceInvestigationId or get it from selectedItem
      let sourceInvestigationId = selectedPolicy.sourceInvestigationId;
      
      // If no sourceInvestigationId exists but we have a selected investigation file, use that
      if (!sourceInvestigationId && selectedItem && selectedItem.type === 'file') {
        sourceInvestigationId = selectedItem.id;
        
        // Add more relevant operators based on the investigation description
        if (selectedItem.description) {
          const relevantOperators = generateRelevantOperators(selectedItem.description);
          
          // Find the last subtitle in the current policy
          const lastSubtitleIndex = [...selectedPolicy.subPoliciesNodes].reverse()
            .findIndex(node => node.type === 'string');
          
          // If there's a subtitle, add the operators after the last one
          if (lastSubtitleIndex !== -1) {
            const actualIndex = selectedPolicy.subPoliciesNodes.length - 1 - lastSubtitleIndex;
            
            // Add a new subtitle for these automatically generated operators
            const updatedNodes = [...selectedPolicy.subPoliciesNodes];
            
            // Add a "Signal Conditions" subtitle
            updatedNodes.push({
              type: 'string',
              label: 'Signal Conditions',
              enabled: true
            });
            
            // Add all the relevant operators
            updatedNodes.push(...relevantOperators);
            // Update the selectedPolicy with these new nodes
            setSelectedPolicy({
              ...selectedPolicy,
              subPoliciesNodes: updatedNodes,
              sourceInvestigationId: selectedItem.id
            });
          }
        }
      }
      
      if (!sourceInvestigationId) {
        console.error("Cannot save signal: No source investigation ID found");
        setNotificationType('error');
        setNotification("Please select an investigation first");
        setIsNotificationVisible(true);
        
        setTimeout(() => {
          setIsNotificationVisible(false);
          setNotification('');
        }, 3000);
        return;
      }
      
      // Expand folders in path to show where the signal belongs
      expandFoldersInPath(sourceInvestigationId);
      
      // Process nodes to properly set connectionOperators
      const processedNodes = [...selectedPolicy.subPoliciesNodes].map((node, index, array) => {
        // Clone the node
        const processedNode = { ...node };
        
        // Determine if this node should have a connectionOperator
        
        // Case 1: It's a subtitle - no connection operator needed
        if (node.type === 'string') {
          processedNode.connectionOperator = null;
          return processedNode;
        }
        
        // Case 2: It's the last node in the array - no connection operator needed
        if (index === array.length - 1) {
          processedNode.connectionOperator = null;
          return processedNode;
        }
        
        // Case 3: Next node is a subtitle - no connection operator needed
        if (array[index + 1] && array[index + 1].type === 'string') {
          processedNode.connectionOperator = null;
          return processedNode;
        }
        
        // Case 4: This node is disabled - no connection operator needed
        if (node.enabled === false) {
          processedNode.connectionOperator = null;
          return processedNode;
        }
        
        // Case 5: Next node is disabled - no connection operator needed
        if (array[index + 1] && array[index + 1].enabled === false) {
          processedNode.connectionOperator = null;
          return processedNode;
        }
        
        // All other cases: Use the existing connection operator or default to 'and'
        processedNode.connectionOperator = node.connectionOperator || 'and';
        return processedNode;
      });
      
      // Make sure we're preserving all node properties including correctly processed connectionOperators
      const combinedNode = {
        id: selectedPolicy.id,
        title: nodeTitle,
        label: processedNodes.map(node => ({
          ...node,
          enabled: node.enabled === false ? false : true, // Ensure enabled is a boolean
        })),
        type: 'combined',
        description: selectedPolicy.description,
        sourceInvestigationId
      };
      
      // Add to custom policies
      const existingIndex = costumePolicies.findIndex(
        existingPolicy => existingPolicy.id === selectedPolicy.id
      );
      
      if (existingIndex >= 0) {
        costumePolicies[existingIndex] = {
          ...costumePolicies[existingIndex],
          description: selectedPolicy.description,
          label: combinedNode.label,
        };
        setNotificationType('success');
        setNotification("Policy updated in Custom Policies!");
        console.log("Updated policy nodes:", combinedNode.label);
      } else {
        // Convert the combinedNode to match the expected SubPolicy type
        const convertedNode = {
          id: combinedNode.id,
          label: combinedNode.label,
          title: combinedNode.title,
          type: combinedNode.type,
          description: combinedNode.description,
          sourceInvestigationId: combinedNode.sourceInvestigationId
        };
        console.log("New policy nodes:", combinedNode.label);
        costumePolicies.push(convertedNode);
        setNotificationType('success');
        setNotification("Policy added to Custom Policies!");
      }
      
      // Save the signal under its source investigation folder with proper connection operators
      setSavedSignals(prev => {
        const investigationSignals = [...(prev[sourceInvestigationId] || [])];
        
        // Create a copy of selectedPolicy with processed nodes
        const updatedPolicy = {
          ...selectedPolicy,
          subPoliciesNodes: processedNodes
        };
        
        // Check if signal already exists
        const signalIndex = investigationSignals.findIndex(s => s.id === selectedPolicy.id);
        
        if (signalIndex >= 0) {
          // Update existing signal
          investigationSignals[signalIndex] = updatedPolicy;
        } else {
          // Add new signal
          investigationSignals.push(updatedPolicy);
        }
        
        const updatedSignals = {
          ...prev,
          [sourceInvestigationId]: investigationSignals
        };
        
        // Save to localStorage
        localStorage.setItem('savedSignals', JSON.stringify(updatedSignals));
        
        return updatedSignals;
      });
      
      // After saving, show notification
      setNotificationType('success');
      setNotification("Signal saved and path expanded in sidebar!");
      setIsNotificationVisible(true);
      
      setTimeout(() => {
        setIsNotificationVisible(false);
        setNotification('');
      }, 3000);
    }
  };

  // Update the renderSignalsForInvestigation function to add more relevant operators when creating new signals
  const renderSignalsForInvestigation = (investigation: InvestigationFile, level: number) => {
    // Get saved signals for this investigation
    const investigationSignals = savedSignals[investigation.id] || [];
    
    if (investigationSignals.length > 0) {
      return (
        <div className="investigation-signals-container">
          <div className="investigation-signals-list">
            {investigationSignals.map((signal) => (
              <div 
                key={signal.id}
                className="investigation-signal-item"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Load the clicked signal into the main content area
                  setSelectedPolicy(signal);
                  
                  // If we have an edited version, update that too
                  setEditedPolicy(signal);
                  
                  // Reset editing states
                  setIsEditing(false);
                  setIsEditingDescription(false);
                  setIsEditingFunctionality(false);
                  
                  // Save to localStorage
                  localStorage.setItem('selectedPolicy', JSON.stringify(signal));
                }}
              >
                <FaChartLine className="investigation-signal-icon" />
                <span className="investigation-signal-name">{signal.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // If no signals yet, show a placeholder
    return (
      <div className="investigation-signals-container">
        <div 
          className="empty-signals"
          style={{ padding: '5px 10px', opacity: 0.7 }}
        >
          No policies available
        </div>
      </div>
    );
  };

  // Generate chart data
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

  const chartData = generateDailyData();

  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);

  const handleSaveDescription = () => {
    if (editedPolicy) {
      setSelectedPolicy({
        ...selectedPolicy!,
        description: editedPolicy.description
      });
      
      const existingIndex = costumePolicies.findIndex(
        policy => policy.id === editedPolicy.id
      );
      
      if (existingIndex >= 0) {
        costumePolicies[existingIndex] = {
          ...costumePolicies[existingIndex],
          description: editedPolicy.description
        };
      }
      
      setNotificationType('success');
      setNotification("Description updated!");
      setIsNotificationVisible(true);
      setTimeout(() => {
        setIsNotificationVisible(false);
        setNotification('');
      }, 1000);
    }
  };

  // Then update the handleSaveFunctionality function
  const handleSaveFunctionality = () => {
    // Skip save if we're canceling
    if (isCanceling) {
      setIsCanceling(false);
      return;
    }
    
    // Existing save functionality
    if (selectedPolicy && editedPolicy) {
      setSelectedPolicy({
        ...editedPolicy
      });
      // Save to localStorage if needed
      localStorage.setItem('selectedPolicy', JSON.stringify(editedPolicy));
    }
  };

  const handleBackToInvestigations = () => {
    if (editedPolicy) {
      localStorage.setItem('editedPolicy', JSON.stringify(editedPolicy));
      localStorage.setItem('isEditingSignal', isEditing ? 'true' : 'false');
    }
    setActiveTab('investigations');
  };

  // Find and delete an item from the folder structure
  const deleteItem = (itemId: string) => {
    if (window.confirm(`Are you sure you want to delete?`)) {
      // Remove the item from the folder structure
      setFolderData(prev => {
        // Function to recursively delete from folder structure
        const removeItem = (items: (InvestigationFolder | InvestigationFile)[]): (InvestigationFolder | InvestigationFile)[] => {
          return items.filter(item => {
            // Skip this item if it's the one to delete
            if (item.id === itemId) return false;
            
            // If it's a folder, check its children
            if (item.type === 'folder') {
              (item as InvestigationFolder).children = removeItem((item as InvestigationFolder).children);
            }
            return true;
          });
        };
        
        // First check top level
        const newData = prev.filter(folder => {
          if (folder.id === itemId) return false;
          (folder as InvestigationFolder).children = removeItem((folder as InvestigationFolder).children);
          return true;
        });
        
        // Update localStorage for synchronization
        localStorage.setItem('investigationFolderData', JSON.stringify(newData));
        
        return newData;
      });
      
      // Clear selection if the deleted item was selected
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }
    }
    
    // Close menus
    setShowFolderMenu({ show: false });
    setShowFileMenu({ show: false });
    setOverlayVisible(false);
  };

  // Helper function to find a file by ID
  const findFileById = (fileId: string): InvestigationFile | null => {
    // Function to search recursively through the folder structure
    const searchInFolders = (items: (InvestigationFolder | InvestigationFile)[]): InvestigationFile | null => {
      for (const item of items) {
        if (item.type === 'file' && item.id === fileId) {
          return item as InvestigationFile;
        }
        if (item.type === 'folder') {
          const found = searchInFolders((item as InvestigationFolder).children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInFolders(folderData);
  };

  // Helper function to find a folder by ID
  const findFolderById = (folderId: string): InvestigationFolder | null => {
    // Function to search recursively through the folder structure
    const searchInFolders = (folders: InvestigationFolder[]): InvestigationFolder | null => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder;
        }
        
        // Search in subfolders
        const subfolders = folder.children.filter(child => child.type === 'folder') as InvestigationFolder[];
        if (subfolders.length > 0) {
          const found = searchInFolders(subfolders);
          if (found) return found;
        }
      }
      return null;
    };
    
    return searchInFolders(folderData);
  };

  // Function to rename an item
  const renameItem = (itemId: string, newName: string) => {
    setFolderData(prevFolders => {
      // Function to recursively update the name
      const updateItemName = (items: (InvestigationFolder | InvestigationFile)[]): (InvestigationFolder | InvestigationFile)[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, name: newName };
          }
          if (item.type === 'folder') {
            return {
              ...item,
              children: updateItemName((item as InvestigationFolder).children)
            };
          }
          return item;
        });
      };

      const updatedFolders = updateItemName(prevFolders) as InvestigationFolder[];
      
      // Update localStorage for synchronization
      localStorage.setItem('investigationFolderData', JSON.stringify(updatedFolders));
      
      return updatedFolders;
    });
  };

  // Handle new folder creation
  const handleNewFolder = (parentId: string | null) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName || folderName.trim() === '') return;
    
    const newFolderId = `folder-${Date.now()}`;
    const newFolder: InvestigationFolder = {
      id: newFolderId,
      name: folderName.trim(),
      type: 'folder',
      children: [],
      isOpen: false
    };
    
    if (parentId === null) {
      // Add as a root folder
      setFolderData(prevFolders => {
        const updatedFolders = [...prevFolders, newFolder];
        localStorage.setItem('investigationFolderData', JSON.stringify(updatedFolders));
        return updatedFolders;
      });
    } else {
      // Add as a child folder using updateFolderTreeWithNewItem helper
      setFolderData(prevFolders => {
        const updatedFolders = updateFolderTreeWithNewItem(prevFolders, parentId, newFolder);
        localStorage.setItem('investigationFolderData', JSON.stringify(updatedFolders));
        return updatedFolders;
      });
    }
    
    setShowFolderMenu({ show: false });
    setOverlayVisible(false);
  };

  // Handle new investigation creation
  const handleNewInvestigation = (parentId: string | null) => {
    const fileName = prompt('Enter investigation name:');
    if (!fileName || fileName.trim() === '') return;
    
    const newFileId = `file-${Date.now()}`;
    const newFile: InvestigationFile = {
      id: newFileId,
      name: fileName.trim(),
      type: 'file',
      status: 'open',
      severity: 'medium',
      dateCreated: new Date().toISOString().split('T')[0],
      dates: [],
      assets: [],
      domains: [],
      description: '',
      assignedTo: ''
    };
    
    if (parentId === null) {
      // Add to the first root folder
      if (folderData.length > 0) {
        setFolderData(prevFolders => {
          const firstFolder = prevFolders[0];
          const updatedFolders = [
            {
              ...firstFolder,
              isOpen: true,
              children: [...firstFolder.children, newFile]
            },
            ...prevFolders.slice(1)
          ];
          localStorage.setItem('investigationFolderData', JSON.stringify(updatedFolders));
          return updatedFolders;
        });
      }
    } else {
      // Add to specified folder
      setFolderData(prevFolders => {
        const updatedFolders = updateFolderTreeWithNewItem(prevFolders, parentId, newFile);
        localStorage.setItem('investigationFolderData', JSON.stringify(updatedFolders));
        return updatedFolders;
      });
    }
    
    setShowFolderMenu({ show: false });
    setOverlayVisible(false);
  };

  // Helper function to update folder tree with new item
  const updateFolderTreeWithNewItem = (
    folders: InvestigationFolder[], 
    parentId: string, 
    newItem: InvestigationFolder | InvestigationFile
  ): InvestigationFolder[] => {
    return folders.map(folder => {
      if (folder.id === parentId) {
        // Add item to this folder
        return {
          ...folder,
          isOpen: true, // Open the folder when adding an item
          children: [
            ...folder.children.filter(child => child.type === 'folder'),
            newItem,
            ...folder.children.filter(child => child.type === 'file')
          ]
        };
      } else if (folder.children.length > 0) {
        // Look in children folders
        return {
          ...folder,
          children: [
            ...updateFolderTreeWithNewItem(
              folder.children.filter(child => child.type === 'folder') as InvestigationFolder[], 
              parentId, 
              newItem
            ),
            ...folder.children.filter(child => child.type === 'file')
          ]
        };
      }
      return folder;
    });
  };

  // Add this handler function
  const handleSaveProfile = () => {
    if (editedProfile && selectedPolicy) {
      // Ensure all required fields are included and non-optional
      setSelectedPolicy({
        ...selectedPolicy,
        id: selectedPolicy.id, // Explicitly provide the id
        label: selectedPolicy.label, // Explicitly provide the label
        color: selectedPolicy.color, // Explicitly provide the color
        subPoliciesNodes: selectedPolicy.subPoliciesNodes,
        icon: selectedPolicy.icon,
        description: selectedPolicy.description,
        profile: editedProfile
      });
    }
  };

  // And in useEffect where you initialize other edited values:
  useEffect(() => {
    if (selectedPolicy) {
      setEditedPolicy({
        ...selectedPolicy,
        subPoliciesNodes: selectedPolicy.subPoliciesNodes.map(node => ({
          ...node,
          enabled: node.enabled !== false // Default to true if undefined
        }))
      });
      // Other initializations...
    }
  }, [selectedPolicy]);

  useEffect(() => {
    // Add custom wrappers to select elements
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (select.parentNode) {
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
      }
    });
  }, []);

  // Add this new dedicated cancel handler function
  const handleCancelFunctionality = () => {
    console.log("originalFuncPolicy", originalFuncPolicy);
    if (originalFuncPolicy) {
      // Reset to the pristine original policy
      setEditedPolicy(JSON.parse(JSON.stringify(originalFuncPolicy)));

      setSelectedPolicy({
        ...originalFuncPolicy
      });
      // Save to localStorage if needed
      localStorage.setItem('selectedPolicy', JSON.stringify(originalFuncPolicy));

      // Exit edit mode
      setIsEditingFunctionality(false);
    }
  };

  // When entering edit mode, store the original policy
  const handleEditFunctionality = () => {
    // Deep clone the current policy as our pristine copy
    setOriginalFuncPolicy(JSON.parse(JSON.stringify(selectedPolicy)));
    setIsEditingFunctionality(true);
  };

  // Do the same for description editing
  const handleEditDescription = () => {
    setOriginalDescPolicy(JSON.parse(JSON.stringify(selectedPolicy)));
    setIsEditingDescription(true);
  };

  // Description cancel handler
  const handleCancelDescription = () => {
    if (originalDescPolicy) {
      setEditedPolicy(JSON.parse(JSON.stringify(originalDescPolicy)));
    }
    setIsEditingDescription(false);
  };

  // Add this function to find the path to an investigation
  const getPathToInvestigation = (folders: InvestigationFolder[], investigationId: string): string[] => {
    const pathParts: string[] = [];
    
    const findPath = (folders: InvestigationFolder[], currentPath: string[] = []): boolean => {
      for (const folder of folders) {
        const newPath = [...currentPath, folder.name];
        
        // Check if the investigation is in this folder
        const foundInvestigation = folder.children.find(
          child => child.type === 'file' && child.id === investigationId
        );
        
        if (foundInvestigation) {
          pathParts.push(...newPath, foundInvestigation.name);
          return true;
        }
        
        // Look in subfolders
        if (folder.children.some(child => child.type === 'folder')) {
          const subfolders = folder.children.filter(
            child => child.type === 'folder'
          ) as InvestigationFolder[];
          
          if (findPath(subfolders, newPath)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    findPath(folders);
    return pathParts;
  };

  // Add this function to expand all folders in the path
  const expandFoldersInPath = (investigationId: string) => {
    const pathParts = getPathToInvestigation(folderData, investigationId);
    
    if (pathParts.length === 0) return;
    
    // Create a copy of the folder data to modify
    const updatedFolderData = [...folderData];
    
    // Recursive function to find and open folders in the path
    const openFoldersInPath = (
      folders: InvestigationFolder[], 
      targetPath: string[], 
      currentDepth: number = 0
    ): boolean => {
      if (currentDepth >= targetPath.length - 1) return true; // Last item is the investigation
      
      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        
        if (folder.name === targetPath[currentDepth]) {
          // This folder is in our path, open it
          folders[i] = { ...folder, isOpen: true };
          
          // Process subfolders if needed
          const subfolders = folder.children.filter(
            child => child.type === 'folder'
          ) as InvestigationFolder[];
          
          if (subfolders.length > 0) {
            openFoldersInPath(subfolders, targetPath, currentDepth + 1);
          }
          
          return true;
        }
      }
      
      return false;
    };
    
    openFoldersInPath(updatedFolderData, pathParts);
    
    // Update the folder data state
    setFolderData(updatedFolderData);
    
    // Also find and select the investigation
    const findInvestigation = (folders: InvestigationFolder[]): InvestigationFile | null => {
      for (const folder of folders) {
        // Check direct children
        const foundInvestigation = folder.children.find(
          child => child.type === 'file' && child.id === investigationId
        );
        
        if (foundInvestigation) {
          return foundInvestigation as InvestigationFile;
        }
        
        // Check subfolders
        const subfolders = folder.children.filter(
          child => child.type === 'folder'
        ) as InvestigationFolder[];
        
        if (subfolders.length > 0) {
          const result = findInvestigation(subfolders);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const investigation = findInvestigation(updatedFolderData);
    if (investigation) {
      setSelectedItem(investigation);
    }
    
    // Save updated folder data to localStorage
    localStorage.setItem('investigationFolderData', JSON.stringify(updatedFolderData));
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
    <>
      <div className="signals-container">
        <div className="signals-header">
          <div className="header-left">
            <h1>{selectedPolicy ? selectedPolicy.label : 'Signal Details'}</h1>
            <button className="add-custom-button" onClick={applySignal}>
                Apply signal
            </button>
          </div>
          
          {/* Add the signal path display here */}
          {selectedPolicy && selectedPolicy.sourceInvestigationId && (
            <div className="signal-path">
              {getPathToInvestigation(folderData, selectedPolicy.sourceInvestigationId)
                .map((part, index, array) => (
                  <React.Fragment key={index}>
                    <span className="path-part">{part}</span>
                    {index < array.length - 1 && <span className="path-separator">/</span>}
                  </React.Fragment>
                ))}
            </div>
          )}
          
          {/* Notification */}
          {notification && isNotificationVisible && (
            <Stack sx={{ position: 'fixed',
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              maxWidth: '25%', margin: 'auto' }} spacing={2}>
              <Alert variant="filled" severity={notificationType}>{notification}</Alert>
            </Stack>
          )}
        </div>
        
        <div className="signal-detail-container">
          {/* Add folder sidebar */}
          <div className="folder-sidebar" ref={sidebarRef} style={{ width: `${sidebarWidth}%`, position: 'relative' }}>
            <div 
              className="resizer" 
              onMouseDown={handleMouseDown} 
              style={{ 
                position: 'absolute', 
                right: 0, 
                top: 0, 
                bottom: 0, 
                width: '5px', 
                cursor: 'ew-resize', 
                backgroundColor: 'transparent' 
              }} 
            />
            <div className="folder-header">
              <h3>Investigation Files</h3>
            </div>
            <div className="folder-list">
              {renderFolderStructure(folderData)}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="signal-content" style={{ width: `${100 - sidebarWidth}%` }}>
          {/* Three sections in one row */}
          <div className="three-column-row">
            {/* Profile section - one-third width */}
            <div className="signal-section profile-section">
              <h2>PROFILE</h2>
              
              <div className="profile-display">
                <div className="profile-row">
                  <div className="profile-grid-item">
                    <div className="profile-icon"><FaCalendarAlt /></div>
                    <div className="profile-content">
                      <span className="profile-label">Created Date</span><br></br>
                      <span className="profile-value">{new Date().toLocaleDateString()}</span>
                </div>
                </div>
                  
                <div className="profile-grid-item">
                  <div className="profile-icon"><FaClock /></div>
                  <div className="profile-content">
                    <span className="profile-label">Active Since</span><br></br>
                    <span className="profile-value">{new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
                </div>
              </div>
              
              <div className="profile-row">
                <div className="profile-grid-item">
                  <div className="profile-icon"><FaChartLine /></div>
                  <div className="profile-content">
                    <span className="profile-label">Regression Data</span> <br></br>
                    <span className="profile-value">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="profile-grid-item">
                  <div className="profile-icon"><FaBell /></div>
                  <div className="profile-content">
                    <span className="profile-label">Triggered</span><br></br>
                    <span className="profile-value highlight">{Math.floor(Math.random() * 20) + 5} times</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description section - one-third width */}
          <div className="signal-section">
            <h2>DESCRIPTION</h2>
            {!isEditingDescription ? (
                <button className="section-edit-button" onClick={handleEditDescription}>
                  <FaEdit />
                </button>
              ) : (
                <div className="section-button-group">
                  <button className="section-save-button" onClick={() => {
                    setIsEditingDescription(false);
                    handleSaveDescription();
                  }}>
                    <FaSave />
                  </button>
                  <button className="section-cancel-button" onClick={handleCancelDescription}>
                    <FaTimes />
                  </button>
                </div>
              )}

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
              <button className="section-edit-button" onClick={handleEditFunctionality}>
                <FaEdit />
              </button>
            ) : (
              <div className="section-button-group">
                <button className="section-save-button" onClick={() => {
                  handleSaveFunctionality();
                  setIsEditingFunctionality(false);
                }}>
                  <FaSave />
                </button>
                <button className="section-cancel-button" onClick={handleCancelFunctionality}>
                  <FaTimes />
                </button>
              </div>
            )}
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
                
                <h3>Policy Nodes</h3>
                <div className="node-preview-section">
                  <h4>Flow Preview</h4>
                  <div className="single-node-preview">
                    <div className="single-node-header">
                      <div className="node-icon"><FaCodeBranch /></div>
                      <div className="node-title">{selectedPolicy.label || "Policy Preview"}</div>
                        </div>
                    <div className="single-node-body">
                      <div className="policy-flow">
                        {selectedPolicy.subPoliciesNodes.map((node, index) => (
                          <React.Fragment key={index}>
                            {node.type === 'operator' && node.operatorType === 'newline' ? (
                              <span className="flow-newline"></span>
                            ) : (
                              <span className={`flow-element ${node.enabled === false ? 'flow-disabled' : ''}`}>
                                {node.type === 'string' && (
                                  <span className="flow-text">{node.label}</span>
                                )}
                                
                                {node.type === 'stringInput' && (
                                  <>
                                    <span className="flow-text">{node.label}</span>
                                    <span className="flow-value">"{node.value || ''}"</span>
                                  </>
                                )}
                                
                                {node.type === 'timeInput' && (
                                  <>
                                    <span className="flow-text">{node.label}</span>
                                    <span className="flow-value">{node.value || ''}</span>
                                  </>
                                )}
                                
                                {node.type === 'operator' && node.operatorType !== 'newline' && (
                                  <span className="flow-expr">
                                    <span className="flow-param">{node.leftParam?.value || ''}</span>
                                    <span className="flow-operator">{getOperatorSymbol(node.operatorType)}</span>
                                    <span className="flow-param">{node.rightParam?.value || ''}</span>
                                  </span>
                                )}
                                
                                {index < selectedPolicy.subPoliciesNodes.length - 1 && 
                                !(node.type === 'operator' && node.operatorType === 'newline') && 
                                !(selectedPolicy.subPoliciesNodes[index+1].type === 'operator' && 
                                  selectedPolicy.subPoliciesNodes[index+1].operatorType === 'newline') && 
                                node.type !== 'string' && // Don't show connector after subtitle
                                selectedPolicy.subPoliciesNodes[index+1].type !== 'string' && // Don't show connector before subtitle
                                node.enabled !== false && selectedPolicy.subPoliciesNodes[index+1].enabled !== false && (
                                  <>
                                    <span className="flow-connector"></span>
                                    <span className={`flow-connection-operator ${node.connectionOperator === 'or' ? 'or' : ''}`}>
                                      {node.connectionOperator?.toUpperCase() || 'AND'}
                                    </span>
                                  </>
                                )}
                              </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                  </div>
                </div>
                
                <div className="node-editor-list">
                  {selectedPolicy.subPoliciesNodes.map((node, index) => (
                    <React.Fragment key={index}>
                      {/* Render the node editor item as before */}
                      <div 
                        style={{ marginLeft: node.type === "string" ? "0px" : "100px" }}
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
                            const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                            const draggedNode = updatedNodes[draggedNodeIndex];
                            // Remove dragged node
                            updatedNodes.splice(draggedNodeIndex, 1);
                            // Insert at new position
                            updatedNodes.splice(index, 0, draggedNode);
                            setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                            setDraggedNodeIndex(null);
                          }
                        }}
                      >
                        <div className="node-item-header">
                          <div className="node-type-badge">{node.type === 'string' ? 'Subtitle' : node.type}</div>
                          <div className="node-toggle-switch">
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={node.enabled !== false}
                                onChange={(e) => {
                                  const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                  const isChecked = e.target.checked;

                                  // If this is a subtitle node (type string), toggle all nodes until the next subtitle
                                  if (node.type === 'string') {
                                    let foundThisNode = false;
                                    let foundNextSubtitle = false;
                                    
                                    updatedNodes.forEach((n, i) => {
                                      // Mark when we find this node
                                      if (i === index) {
                                        foundThisNode = true;
                                        n.enabled = isChecked;
                                        return;
                                      }
                                      
                                      // If we already found this subtitle and haven't found the next one yet
                                      if (foundThisNode && !foundNextSubtitle) {
                                        // If we find another subtitle, stop updating
                                        if (n.type === 'string') {
                                          foundNextSubtitle = true;
                                          return;
                                        }
                                        // Update all nodes that belong to this subtitle
                                        n.enabled = isChecked;
                                      }
                                    });
                                  } else {
                                    // For non-subtitle nodes, first check if parent subtitle is enabled
                                    // Find the parent subtitle
                                    let parentSubtitleEnabled = true;
                                    for (let i = index - 1; i >= 0; i--) {
                                      if (updatedNodes[i].type === 'string') {
                                        // Found parent subtitle
                                        parentSubtitleEnabled = updatedNodes[i].enabled !== false;
                                        break;
                                      }
                                    }
                                    
                                    // Only allow enabling if parent subtitle is enabled
                                    if (!parentSubtitleEnabled && isChecked) {
                                      // Show a notification that parent subtitle must be enabled first
                                      setNotificationType('error');
                                      setNotification("Cannot enable node while parent subtitle is disabled");
                                      setIsNotificationVisible(true);
                                      
                                      setTimeout(() => {
                                        setIsNotificationVisible(false);
                                        setNotification('');
                                      }, 3000);
                                      return; // Prevent the change
                                    }
                                    
                                    // Just update this single node if it's not a subtitle
                                    updatedNodes[index] = {...node, enabled: isChecked};
                                  }
                                  
                                  setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                }}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="node-item-content">
                        <div className="drag-handle">
                          <FaGripVertical />
                        </div>
                        
                          {/* Node-specific fields */}
                          {node.type === 'string' && (
                            <div className="node-field">
                          <input 
                          readOnly
                            type="text" 
                                value={node.label} 
                                placeholder="Text to display"
                            onChange={(e) => {
                                  const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                  updatedNodes[index] = {...node, label: e.target.value};
                                  setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                            }}
                            />
                        </div>
                          )} 
                          
                          {/* String Input fields */}
                          {node.type === 'stringInput' && (
                            <>
                          <div className="node-field">
                          <input 
                            type="text" 
                            value={node.label} 
                                  placeholder="Label"
                            onChange={(e) => {
                                    const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                              updatedNodes[index] = {...node, label: e.target.value};
                                    setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                          }} />
                        </div>

                              <div className="node-field">
                                <input 
                                  type="text" 
                                  value={node.value || ''} 
                                  placeholder="Default value"
                                  onChange={(e) => {
                                    const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                    updatedNodes[index] = {...node, value: e.target.value};
                                    setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                  }}
                                />
                              </div>
                            </>
                          )}
                          
                          {/* Time Input fields */}
                          {node.type === 'timeInput' && (
                            
                            <>
                              <div className="node-field">
                                <input 
                                  type="text" 
                                  value={node.label} 
                                  onChange={(e) => {
                                    const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                    updatedNodes[index] = {...node, label: e.target.value};
                                    setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                  }}
                                />
                              </div>
                              <div className="node-field">
                        <select 
                                  value={node.timeFormat || 'specific'} 
                          onChange={(e) => {
                                    const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {
                              ...node, 
                                      timeFormat: e.target.value as 'specific' | 'duration',
                                      value: '' // Reset value when format changes
                                    };
                                    setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                  }}
                                >
                                  <option value="specific">Specific</option>
                                  <option value="duration">Duration</option>
                        </select>
                              </div>
                              <div className="node-field">
                                {node.timeFormat === 'duration' ? (
                                  <input 
                                    type="text" 
                                    value={node.value || ''} 
                                    placeholder="e.g. 30ms"
                                    onChange={(e) => {
                                      const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                      updatedNodes[index] = {...node, value: e.target.value};
                                      setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                    }}
                                  />
                                ) : (
                                  <input 
                                    type="time" 
                                    value={node.value || ''} 
                                    onChange={(e) => {
                                      const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                      updatedNodes[index] = {...node, value: e.target.value};
                                      setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                    }}
                                  />
                                )}
                              </div>
                            </>
                          )}
                          
                          {/* Operator fields */}
                        {node.type === 'operator' && (
                            <>
                              {node.operatorType !== 'newline' ? (
                                <>
                                  <div className="operator-params">
                                    <div className="node-field">
                                      
                          <input 
                            type="text" 
                                      value={node.leftParam?.value || ''} 
                                      placeholder="Left param"
                                      readOnly
                          onChange={(e) => {
                                        const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                        updatedNodes[index] = {
                                          ...node, 
                                          leftParam: {
                                            ...(node.leftParam || { type: 'string' }),
                                            value: e.target.value
                                          }
                                        };
                                        setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                      }}
                                    />
                                  </div>
                                  
                                  <div className="operator-symbol">
                                    <select 
                                      value={node.operatorType || 'and'} 
                                      onChange={(e) => {
                                        const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                        updatedNodes[index] = {...node, operatorType: e.target.value};
                                        setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                      }}
                                      className="symbol-only-select"
                                    >
                                      <option value="and">&&</option>
                                      <option value="or">||</option>
                                      <option value="xor">⊕</option>
                                      <option value="not">!</option>
                                      <option value="eq">==</option>
                                      <option value="neq">!=</option>
                                      <option value="gt">{'>'}</option>
                                      <option value="gte">≥</option>
                                      <option value="lt">{'<'}</option>
                                      <option value="lte">≤</option>
                                      <option value="contains">∋</option>
                                      <option value="startswith">^=</option>
                                      <option value="endswith">$=</option>
                                      <option value="matches">≈</option>
                                      <option value="newline">↵</option>
                                    </select>
                                  </div>
                                  
                                  <div className="node-field">

                          <input 
                                      type="text" 
                                      value={node.rightParam?.value || ''} 
                                      placeholder="Right param"
                          onChange={(e) => {
                                        const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                        updatedNodes[index] = {
                                          ...node, 
                                          rightParam: {
                                            ...(node.rightParam || { type: 'string' }),
                                            value: e.target.value
                                          }
                                        };
                                        setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                      }}
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="operator-symbol">
                                <select 
                                  value={node.operatorType || 'and'} 
                                  onChange={(e) => {
                                    const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                    updatedNodes[index] = {...node, operatorType: e.target.value};
                                    setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                  }}
                                  className="symbol-only-select"
                                >
                                  <option value="and">&&</option>
                                  <option value="or">||</option>
                                  <option value="xor">⊕</option>
                                  <option value="not">!</option>
                                  <option value="eq">==</option>
                                  <option value="neq">!=</option>
                                  <option value="gt">{'>'}</option>
                                  <option value="gte">≥</option>
                                  <option value="lt">{'<'}</option>
                                  <option value="lte">≤</option>
                                  <option value="contains">∋</option>
                                  <option value="startswith">^=</option>
                                  <option value="endswith">$=</option>
                                  <option value="matches">≈</option>
                                  <option value="newline">↵</option>
                                </select>
                              </div>
                            )}
                          </>
                        )}
                        
                      </div>
                    </div>
                    
                    {/* Add operator selector badge after each node except for subtitles and the last node */}
                    {index < selectedPolicy.subPoliciesNodes.length - 1 && 
                     node.type !== 'string' && // Not a subtitle
                     selectedPolicy.subPoliciesNodes[index + 1].type !== 'string' && // Next node is not a subtitle
                     selectedPolicy.subPoliciesNodes[index + 1].enabled !== false && // Next node is enabled
                     node.enabled !== false && // Current node is enabled
                     (() => {
                       // Find if we're still in the same subtitle section as the next node
                       const currentSubtitleIndex = [...selectedPolicy.subPoliciesNodes].slice(0, index + 1)
                         .reverse()
                         .findIndex(n => n.type === 'string');
                       
                       const nextSubtitleIndex = selectedPolicy.subPoliciesNodes
                         .slice(index + 1)
                         .findIndex(n => n.type === 'string');
                       
                       // Only show if in same subtitle section
                       const inSameSubtitleSection = 
                         (nextSubtitleIndex === -1 || nextSubtitleIndex > 0); // Next subtitle not immediately after
                       
                       return inSameSubtitleSection;
                     })() && (
                      <div className="node-operator-selector">
                        <button 
                          className={`operator-selector-badge ${node.connectionOperator === 'or' ? 'or' : ''}`}
                          onClick={() => {
                            const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {
                              ...node,
                              connectionOperator: node.connectionOperator === 'or' ? 'and' : 'or'
                            };
                            setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        >
                          {node.connectionOperator === 'or' ? 'OR' : 'AND'}
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="nodes-list">
                <h4>Signal preview:</h4>
                <div className="node-flow-preview">
                  <h6>{selectedPolicy.label}</h6>
                  {selectedPolicy.subPoliciesNodes.reduce((acc: JSX.Element[], node, index, arr) => {
                    // Check if this is a subtitle (string type node)
                    if (node.type === 'string' && node.enabled !== false) {
                      // Add the subtitle
                      acc.push(
                        <div key={`subtitle-${index}`} className="node-subtitle">
                          <span className="node-label subtitle-label">{node.label}</span>
                        </div>
                      );
                      
                      // Find all nodes until the next subtitle or end
                      let nextSubtitleIndex = arr.findIndex((n, i) => 
                        i > index && n.type === 'string' && n.enabled !== false
                      );
                      if (nextSubtitleIndex === -1) nextSubtitleIndex = arr.length;
                      
                      // Add the children nodes with indentation
                      for (let i = index + 1; i < nextSubtitleIndex; i++) {
                        const childNode = arr[i];
                        if (childNode.enabled === false) continue;
                        
                        acc.push(
                          <div key={`child-${i}`} className="node-flow-item node-child-item">
                            {childNode.type === 'stringInput' && (
                              <div className="node-content">
                                <span className="node-label">{childNode.label}</span>
                                <span className="node-value">"{childNode.value || ''}"</span>
                              </div>
                            )}
                            {childNode.type === 'timeInput' && (
                              <div className="node-content">
                                <span className="node-label">{childNode.label}</span>
                                <span className="node-value">{childNode.value || ''}</span>
                              </div>
                            )}
                            {childNode.type === 'operator' && childNode.operatorType !== 'newline' && (
                              <div className="operator-container">
                                <span className="operator-param A-param">{childNode.leftParam?.value || ''}</span>
                                <span className="operator-symbol">{getOperatorSymbol(childNode.operatorType)}</span>
                                <span className="operator-param B-param">{childNode.rightParam?.value || ''}</span>
                              </div>
                            )}
                          </div>
                        );
                        
                        // Add operator badge if this isn't the last node in this subtitle section
                        const isLastNodeInSubtitle = i === nextSubtitleIndex - 1;
                        if (!isLastNodeInSubtitle && arr[i+1]?.enabled !== false) {
                          acc.push(
                            <div key={`operator-${i}`} className="node-connection-operator">
                              <span className="operator-badge">
                                {childNode.connectionOperator?.toUpperCase() || 'AND'}
                              </span>
                            </div>
                          );
                        }
                      }
                    }
                    return acc;
                  }, [])}
                </div>
              </div>
              {/* <div className="functionality-description">
                <p>This policy monitors and detects abnormal patterns based on the configured nodes.</p>
                <p>When triggered, it will generate alerts according to the defined thresholds and parameters.</p>
              </div> */}
            </>
          )}
        </div>
      </div>

      {/* Charts section */}
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

    {/* Folder menu */}
    {showFolderMenu.show && (
      <div 
        className="action-menu"
        style={{ 
          position: 'absolute',
          top: `${menuPosition.top}px`, 
          left: `${menuPosition.left}px`,
          padding: '0.6rem',
          borderRadius: '0.4rem',
          boxShadow: '0 0.15rem 0.75rem rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (showFolderMenu.folderId) {
              const folder = findFolderById(showFolderMenu.folderId);
              if (folder) {
                const newName = prompt("Enter new folder name:", folder.name);
                if (newName && newName.trim() !== "" && newName !== folder.name) {
                  renameItem(showFolderMenu.folderId, newName.trim());
                }
              }
            }
            
            setShowFolderMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaPencilAlt /> Rename
        </button>
        <button 
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (showFolderMenu.folderId) {
              handleNewFolder(showFolderMenu.folderId);
            }
            
            setShowFolderMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaFolder /> New Folder
        </button>
        <button 
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (showFolderMenu.folderId) {
              handleNewInvestigation(showFolderMenu.folderId);
            }
            
            setShowFolderMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaFile /> New Investigation
        </button>
        <button 
          className="menu-item delete-action"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (showFolderMenu.folderId) {
              deleteItem(showFolderMenu.folderId);
            }
            
            setShowFolderMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaTrash /> Delete
        </button>
      </div>
    )}
    
    {/* File action menu */}
    {showFileMenu.show && (
      <div 
        className="action-menu"
        style={{ 
          position: 'absolute',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          padding: '0.6rem',
          borderRadius: '0.4rem',
          boxShadow: '0 0.15rem 0.75rem rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (showFileMenu.fileId) {
              const file = findFileById(showFileMenu.fileId);
              if (file) {
                const newName = prompt("Enter new file name:", file.name);
                if (newName && newName.trim() !== "" && newName !== file.name) {
                  renameItem(showFileMenu.fileId, newName.trim());
                }
              }
            }
            
            setShowFileMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaPencilAlt /> Rename
        </button>
        <button 
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // In Signals component, we don't have an edit mode for files yet,
            // so we just close the menu
            setShowFileMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaEdit /> View
        </button>
        <button 
          className="menu-item delete-action"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (showFileMenu.fileId) {
              deleteItem(showFileMenu.fileId);
            }
            
            setShowFileMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <FaTrash /> Delete
        </button>
      </div>
    )}

    {/* Overlay for closing menus */}
    {overlayVisible && (
      <div 
        className="menu-overlay" 
        onClick={() => {
          setShowFolderMenu({ show: false });
          setShowFileMenu({ show: false });
          setOverlayVisible(false);
        }}
      />
    )}
  </div>
  <style>{`
    /* Additional styles for select dropdowns */
    .operator-symbol {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border-radius: 4px;
      padding: 0;
      margin: 0 4px;
      flex: 0 0 auto;
    }
    
    .operator-params {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 4px;
    }
    
    .operator-symbol select {
      background-color: #1e2229;
      color: #f0f0f0;
      border: 1px solid #3a3f4a;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.9rem;
      cursor: pointer;
      min-width: 50px;
      text-align-last: center;
      height: calc(100% - 2px);
    }
    
    .node-field .operator-symbol {
      height: 100%;
    }
    
    .symbol-only-select {
      font-size: 0.85rem !important;
      padding: 2px 4px !important;
      width: auto !important;
      background-color: #1e2229 !important;
      color: #f0f0f0 !important;
      border: 1px solid #3a3f4a !important;
      border-radius: 4px !important;
      min-width: 40px !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    .symbol-only-select:hover {
      background-color: #2a2f3a !important;
      border-color: #4a5060 !important;
    }
    
    .symbol-only-select option {
      text-align: center;
      font-weight: bold;
      background-color: #1e2229;
      color: #f0f0f0;
      padding: 4px;
    }
    
    /* Make the dropdown menu match the dark theme */
    .symbol-only-select option:hover {
      background-color: #2a2f3a;
    }
    
    /* Operator styles in display mode */
    .operator-container .operator-symbol {
      background: #1e2229;
      color: #f0f0f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: bold;
      margin: 0 8px;
    }

    .node-subtitle {
      margin-top: 16px;
      margin-bottom: 8px;
      font-weight: bold;
      font-size: 1.05em;
      color: #e0e0e0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 4px;
    }

    .subtitle-label {
      margin-left: 10px;
    }

    .node-child-item {
      margin-left: 26px;
      margin-bottom: 8px;
      display: flex;
      align-content: center;  
      align-items: center;
      padding: 5px 0;
    }

    .node-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .node-value {
      color: #64B5F6;
      font-family: monospace;
    }

    .operator-container {
      display: flex;
      min-width: 60%;
      align-items: center;
      gap: 8px;
    }
    .operator-param.A-param {
  
      min-width: 40%; /* Increase width for left parameter */
      display: inline-block;
      color: #AED581; 
      text-overflow: ellipsis;
      margin-left: 10px;
      overflow: hidden;
    }
    .operator-param.B-param {
      min-width: 10%; /* Also set a min-width for right parameter for consistency */
      display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
    }


    .node-subtitle {
      margin-top: 16px;
      margin-bottom: 12px;
      font-weight: bold;
      font-size: 1.05em;
      color: #e0e0e0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 6px;
    }

    .section-nodes {
      margin-left: 15px;
    }


    /* Improved styling for edit mode with subtitle hierarchy */
    .node-editor-item[data-is-subtitle="true"] {
      background-color: #2a2f3a;
      border-left: 3px solid #64B5F6;
      margin-bottom: 12px;
    }

    .node-editor-item[data-is-subtitle="true"] + .node-editor-item:not([data-is-subtitle="true"]) {
      margin-left: 25px;
      border-left: 1px solid #3a3f4a;
      padding-left: 10px;
    }

    /* Add these scrollbar styles to the style section at the end of the file */

    .node-flow-preview {
      max-height: 400px;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 10px; /* Add padding to prevent content from hitting scrollbar */
    }

    /* Customize scrollbar for node-flow-preview */
    .node-flow-preview::-webkit-scrollbar {
      width: 8px;  /* Width of the scrollbar */
    }

    .node-flow-preview::-webkit-scrollbar-track {
      background: #1a1d24;  /* Dark background color for the track */
      border-radius: 4px;
    }

    .node-flow-preview::-webkit-scrollbar-thumb {
      background: #3a3f4a;  /* Color of the scrollbar handle */
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .node-flow-preview::-webkit-scrollbar-thumb:hover {
      background: #4a5060;  /* Lighter color when hovering */
    }

    /* Make sure these same styles are applied to signals-container for consistency */
    .signals-container::-webkit-scrollbar {
      width: 8px;
    }

    .signals-container::-webkit-scrollbar-track {
      background: #1a1d24;
      border-radius: 4px;
    }

    .signals-container::-webkit-scrollbar-thumb {
      background: #3a3f4a;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    .signals-container::-webkit-scrollbar-thumb:hover {
      background: #4a5060;
    }

    .section-button-group {
      display: flex;
      gap: 8px;
    }

    .section-cancel-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.5rem;
      color: #e53935; /* Red color for cancel */
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .section-cancel-button:hover {
      opacity: 1;
    }
  `}</style>
</>
);
};

export default Signals; 
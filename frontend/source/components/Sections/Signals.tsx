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
}

interface SubPolicy {
  label: string;
  type: string;
  id?: string;
  subPoliciesNodes?: NodeType[];
  description?: string; // Added description property
}

interface PolicyNode {
  id: string;
  label: string;
  title?: string;
  color: string;
  subPoliciesNodes: NodeType[];
  icon: React.ReactNode;
  description: string;
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

  // Add this function to render signals for an investigation
  const renderSignalsForInvestigation = (investigation: InvestigationFile, level: number) => {
    // If there's a selected policy, show it as a child of the selected investigation
    if (selectedPolicy && selectedItem?.id === investigation.id) {
      return (
        <div 
          key={selectedPolicy.id}
          className="signal-item"
          style={{ marginLeft: `${level * 20}px` }}
          onClick={(e) => {
            e.stopPropagation();
            // You can add logic here to handle signal selection
          }}
        >
          <div className="signal-content">
            <FaChartLine className="signal-icon" />
            <span className="signal-name">{selectedPolicy.label}</span>
          </div>
        </div>
      );
    }
    
    // If no signals yet, show a placeholder
    return (
      <div 
        className="empty-signals"
        style={{ marginLeft: `${level * 20}px`, padding: '5px 10px', opacity: 0.7 }}
      >
        No signals available
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

  const applySignal = () => {
    if (selectedPolicy) {
      const nodeTitle = selectedPolicy.title || selectedPolicy.label;
      
      const combinedLabel = selectedPolicy.subPoliciesNodes
        .map(node => node.type === 'operator' ? `[${node.label}]` : node.label)
        .join(' ');
      
      const combinedNode = {
        id: selectedPolicy.id,
        title: nodeTitle,
        label: selectedPolicy.subPoliciesNodes,
        type: 'combined',
        description: selectedPolicy.description
      };
      
      const existingIndex = costumePolicies.findIndex(
        existingPolicy => existingPolicy.id === selectedPolicy.id
      );
      
      if (existingIndex >= 0) {
        costumePolicies[existingIndex] = {
          ...costumePolicies[existingIndex],
          description: selectedPolicy.description
        };
        setNotificationType('success');
        setNotification("Policy updated in Custom Policies!");
      } else {
        costumePolicies.push(combinedNode);
        setNotificationType('success');
        setNotification("Policy added to Custom Policies!");
      }
      
      setIsNotificationVisible(true);
      
      setTimeout(() => {
        setIsNotificationVisible(false);
        setNotification('');
      }, 1000);      
    }
  };

  // Add this state for tracking the dragging
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);

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

  const handleSaveFunctionality = () => {
    if (editedPolicy) {
      console.log(editedPolicy);
      setSelectedPolicy({
        ...selectedPolicy!,
        subPoliciesNodes: editedPolicy.subPoliciesNodes.map(node => ({
          ...node,
          enabled: node.enabled !== false // Ensure enabled is explicitly set (default to true)
        }))
      });
      setIsEditingFunctionality(false);
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
          <h1>Signal: {selectedPolicy.label}</h1>
        </div>
        <div className="header-right">
          <button className="add-custom-button" onClick={applySignal}>
              Apply signal
          </button>
        </div>
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
                <button className="section-edit-button" onClick={() => setIsEditingDescription(true)}>
                  <FaEdit />
                </button>
              ) : (
                <button className="section-save-button" onClick={() => {
                  setIsEditingDescription(false);
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
              <button className="section-edit-button" onClick={() => setIsEditingFunctionality(true)}>
                <FaEdit />
              </button>
            ) : (
              <button className="section-save-button" onClick={() => {
                setIsEditingFunctionality(false);
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
                                  selectedPolicy.subPoliciesNodes[index+1].operatorType === 'newline') && (
                                  <span className="flow-connector"></span>
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
                        <div className="node-type-badge">{node.type}</div>
                        <div className="node-toggle-switch">
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={node.enabled !== false}
                              onChange={(e) => {
                                const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                updatedNodes[index] = {...node, enabled: e.target.checked};
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
                      
                        {/* Node Type Selector */}
                        <div className="node-field">
                          <select 
                            value={node.type} 
                            onChange={(e) => {
                              const type = e.target.value as 'string' | 'stringInput' | 'timeInput' | 'operator';
                              let updatedNode: NodeType = { ...node, type };
                              
                              // Initialize appropriate values based on node type
                              if (type === 'operator') {
                                updatedNode = {
                                  ...updatedNode,
                                  operatorType: 'and',
                                  leftParam: { type: 'string', value: 'Value A' },
                                  rightParam: { type: 'string', value: 'Value B' },
                                };
                              } else if (type === 'timeInput') {
                                updatedNode = {
                                  ...updatedNode,
                                  timeFormat: 'specific',
                                  value: ''
                                };
                              }
                              
                              const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                              updatedNodes[index] = updatedNode;
                              setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                            }}
                          >
                            <option value="string">String</option>
                            <option value="stringInput">Input</option>
                            <option value="timeInput">Time</option>
                            <option value="operator">Operator</option>
                          </select>
                        </div>
                        
                        {/* Node-specific fields */}
                        {node.type === 'string' && (
                          <div className="node-field">
                        <input 
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
                          }}
                        />
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
                                placeholder="Label"
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
                            <div className="node-field">
                        <select 
                          value={node.operatorType || 'and'} 
                          onChange={(e) => {
                                  const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                            updatedNodes[index] = {...node, operatorType: e.target.value};
                                  setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                }}
                              >
                                <option value="and">AND (&&)</option>
                                <option value="or">OR (||)</option>
                                <option value="xor">XOR (⊕)</option>
                                <option value="not">NOT (!)</option>
                                <option value="eq">Equals (==)</option>
                                <option value="neq">Not Equals (!=)</option>
                                <option value="gt">Greater Than ({'>'})</option>
                                <option value="gte">Greater Than or Equal (≥)</option>
                                <option value="lt">Less Than ({'<'})</option>
                                <option value="lte">Less Than or Equal (≤)</option>
                                <option value="contains">Contains (∋)</option>
                                <option value="startswith">Starts With (^=)</option>
                                <option value="endswith">Ends With ($=)</option>
                                <option value="matches">Matches (≈)</option>
                                <option value="newline">New Line</option>
                        </select>
                            </div>
                            
                            {node.operatorType !== 'newline' && (
                              <>
                                <div className="operator-params">
                                  <div className="node-field">
                                    <select 
                                      value={node.leftParam?.type || 'string'} 
                                      onChange={(e) => {
                                        const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                        updatedNodes[index] = {
                                          ...node, 
                                          leftParam: {
                                            type: e.target.value as 'string' | 'input',
                                            value: node.leftParam?.value || ''
                                          }
                                        };
                                        setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                      }}
                                    >
                                      <option value="string">Text</option>
                                      <option value="input">Input</option>
                                    </select>
                        <input 
                          type="text" 
                                      value={node.leftParam?.value || ''} 
                                      placeholder="Left param"
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
                                  
                                  <div className="operator-symbol">{getOperatorSymbol(node.operatorType)}</div>
                                  
                                  <div className="node-field">
                                    <select 
                                      value={node.rightParam?.type || 'string'} 
                                      onChange={(e) => {
                                        const updatedNodes = [...selectedPolicy.subPoliciesNodes];
                                        updatedNodes[index] = {
                                          ...node, 
                                          rightParam: {
                                            type: e.target.value as 'string' | 'input',
                                            value: node.rightParam?.value || ''
                                          }
                                        };
                                        setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                                      }}
                                    >
                                      <option value="string">Text</option>
                                      <option value="input">Input</option>
                                    </select>
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
                            )}
                          </>
                        )}
                        
                        <button 
                          className="remove-node-button"
                          onClick={() => {
                            const updatedNodes = selectedPolicy.subPoliciesNodes.filter((_, i) => i !== index);
                            setSelectedPolicy({...selectedPolicy, subPoliciesNodes: updatedNodes});
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Node button */}
                  <button 
                    className="add-node-button"
                    onClick={() => {
                      setSelectedPolicy({
                        ...selectedPolicy!, 
                        subPoliciesNodes: [
                          ...selectedPolicy!.subPoliciesNodes, 
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
                        {node.type === 'operator' && node.operatorType === 'newline' ? (
                          <div className="node-flow-break"></div>
                        ) :  node.enabled === true ? (
                          <div className={`node-flow-item node-type-${node.type} `}>
                            {node.type === 'string' && (
                          <span className="node-label">{node.label}</span>
                            )}
                            {node.type === 'stringInput' && (
                              <div>
                                <span className="node-label">{node.label}</span>
                                <input type="text" value={node.value || ''} readOnly />
                        </div>
                            )}
                            {node.type === 'timeInput' && (
                              <div>
                                <span className="node-label">{node.label}</span>
                                <input 
                                  type={node.timeFormat === 'duration' ? 'text' : 'time'} 
                                  value={node.value || ''} 
                                  readOnly 
                                />
                              </div>
                            )}
                            {node.type === 'operator' && node.operatorType !== 'newline' && (
                              <div className="operator-container">
                                {node.leftParam?.type === 'string' ? (
                                  <span className="operator-param">{node.leftParam.value}</span>
                                ) : (
                                  <input type="text" value={node.leftParam?.value || ''} readOnly className="operator-param" />
                                )}
                                
                                <span className="operator-symbol">{getOperatorSymbol(node.operatorType)}</span>
                                
                                {node.rightParam?.type === 'string' ? (
                                  <span className="operator-param">{node.rightParam.value}</span>
                                ) : (
                                  <input type="text" value={node.rightParam?.value || ''} readOnly className="operator-param" />
                                )}
                              </div>
                            )}
                          </div>
                        ) : (<div />)}
                        {index < selectedPolicy.subPoliciesNodes.length - 1 && 
                         !(node.type === 'operator' && node.operatorType === 'newline') &&
                         !(selectedPolicy.subPoliciesNodes[index+1].type === 'operator' && 
                           selectedPolicy.subPoliciesNodes[index+1].operatorType === 'newline') && (
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
  );
};

export default Signals; 

<style>{`
  /* Additional styles for select dropdowns */
  
  /* Improve default select element */
  select {
    background-color: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 8px 12px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
    cursor: pointer;
    width: 100%;
    font-size: 14px;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }
  
  /* Style option elements */
  option {
    background-color: #333 !important;
    color: white !important;
    padding: 12px !important;
    font-size: 14px !important;
    white-space: pre !important;
  }
  
  /* WebKit/Blink browsers */
  select::-webkit-scrollbar {
    width: 10px;
    background-color: #333;
  }
  
  select::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 5px;
  }
  
  select::-webkit-scrollbar-thumb:hover {
    background-color: #777;
  }
  
  /* Additional wrapper to create a customized appearance */
  .custom-select-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }
  
  .custom-select-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 30px;
    background-color: #444;
    pointer-events: none;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  
  /* General fallback styling */
  select option, 
  select optgroup {
    background-color: #333;
    color: white;
  }
  
  /* Make inputs match select styling */
  input[type="text"], 
  input[type="time"] {
    background-color: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 8px 12px;
    width: 100%;
    font-size: 14px;
    box-sizing: border-box;
  }
  
  input[type="text"]:focus, 
  input[type="time"]:focus {
    outline: none;
    border-color: #777;
    box-shadow: 0 0 0 2px rgba(120, 120, 120, 0.25);
  }
  
  /* Special styling for operator containers */
  .operator-container {
    display: flex;
    align-items: center;
    background-color: #2a2a2a;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 10px;
  }
  
  .operator-symbol {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #444;
    color: #eee;
    border-radius: 4px;
    padding: 6px 10px;
    margin: 0 10px;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .operator-param {
    flex: 1;
    padding: 8px 12px;
    background-color: #333;
    border-radius: 4px;
    color: #eee;
    border: 1px solid #444;
  }
`}</style>

<!-- Add this script to customize select elements -->
<script dangerouslySetInnerHTML={{
  __html: `
    // Add custom wrappers to select elements
    document.addEventListener('DOMContentLoaded', function() {
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
      });
    });
  `
}} /> 
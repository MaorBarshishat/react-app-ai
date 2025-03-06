import {
  FaBell, FaClock, FaServer, FaUserShield, FaFilter, 
  FaCheckCircle, FaTimesCircle, FaCode, FaEnvelope, 
  FaMobileAlt, FaLock, FaExclamationTriangle
} from 'react-icons/fa';

// Node definitions with types, categories, and properties
export const policyNodes = [
  // Trigger Nodes
  {
    id: 'alert-trigger',
    label: 'Alert Trigger',
    description: 'Triggers when a specific alert is fired',
    category: 'trigger',
    type: 'triggerNode',
    nodeType: 'customTrigger',
    iconName: 'FaBell',
    params: {
      alertType: {
        type: 'select',
        options: ['Security', 'System', 'Network', 'Custom'],
        default: 'Security'
      },
      severity: {
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
      }
    }
  },
  {
    id: 'scheduled-trigger',
    label: 'Schedule',
    description: 'Triggers on a scheduled time interval',
    category: 'trigger',
    type: 'triggerNode',
    nodeType: 'customTrigger',
    iconName: 'FaClock',
    params: {
      interval: {
        type: 'select',
        options: ['Minutes', 'Hourly', 'Daily', 'Weekly', 'Monthly'],
        default: 'Daily'
      },
      time: {
        type: 'time',
        default: '12:00'
      }
    }
  },
  {
    id: 'asset-event',
    label: 'Asset Event',
    description: 'Triggers when an asset event occurs',
    category: 'trigger',
    type: 'triggerNode',
    nodeType: 'customTrigger',
    iconName: 'FaServer',
    params: {
      eventType: {
        type: 'select',
        options: ['Created', 'Modified', 'Deleted', 'Status Change'],
        default: 'Status Change'
      }
    }
  },
  
  // Condition Nodes
  {
    id: 'user-condition',
    label: 'User Check',
    description: 'Check user property or permission',
    category: 'condition',
    type: 'conditionNode',
    nodeType: 'customCondition',
    iconName: 'FaUserShield',
    params: {
      condition: {
        type: 'select',
        options: ['Role', 'Department', 'Access Level', 'Tenure'],
        default: 'Role'
      }
    }
  },
  {
    id: 'data-filter',
    label: 'Data Filter',
    description: 'Filter data based on criteria',
    category: 'condition',
    type: 'conditionNode',
    nodeType: 'customCondition',
    iconName: 'FaFilter',
    params: {
      field: {
        type: 'text',
        default: 'source_ip'
      },
      operator: {
        type: 'select',
        options: ['equals', 'contains', 'starts with', 'ends with', 'regex'],
        default: 'equals'
      }
    }
  },
  {
    id: 'validation',
    label: 'Validation',
    description: 'Validate inputs against specific rules',
    category: 'condition',
    type: 'conditionNode',
    nodeType: 'customCondition',
    iconName: 'FaCheckCircle',
    params: {
      validationType: {
        type: 'select',
        options: ['Schema', 'Range', 'Format', 'Custom'],
        default: 'Format'
      }
    }
  },
  
  // Action Nodes
  {
    id: 'block-access',
    label: 'Block Access',
    description: 'Block access to a resource',
    category: 'action',
    type: 'actionNode',
    nodeType: 'customAction',
    iconName: 'FaTimesCircle',
    params: {
      resource: {
        type: 'text',
        default: 'asset-id'
      },
      duration: {
        type: 'select',
        options: ['1 hour', '24 hours', '7 days', 'Indefinite'],
        default: '24 hours'
      }
    }
  },
  {
    id: 'run-script',
    label: 'Run Script',
    description: 'Execute a custom script',
    category: 'action',
    type: 'actionNode',
    nodeType: 'customAction',
    iconName: 'FaCode',
    params: {
      scriptType: {
        type: 'select',
        options: ['PowerShell', 'Python', 'Bash', 'JavaScript'],
        default: 'PowerShell'
      },
      timeout: {
        type: 'number',
        default: 60
      }
    }
  },
  
  // Output Nodes
  {
    id: 'email-notification',
    label: 'Email Notification',
    description: 'Send an email notification',
    category: 'output',
    type: 'outputNode',
    nodeType: 'customOutput',
    iconName: 'FaEnvelope',
    params: {
      recipients: {
        type: 'text',
        default: 'admin@example.com'
      },
      template: {
        type: 'select',
        options: ['Alert', 'Report', 'Summary', 'Custom'],
        default: 'Alert'
      }
    }
  },
  {
    id: 'sms-notification',
    label: 'SMS Notification',
    description: 'Send an SMS notification',
    category: 'output',
    type: 'outputNode',
    nodeType: 'customOutput',
    iconName: 'FaMobileAlt',
    params: {
      priority: {
        type: 'select',
        options: ['Low', 'Normal', 'High', 'Critical'],
        default: 'Normal'
      }
    }
  },
  {
    id: 'security-report',
    label: 'Security Report',
    description: 'Generate a security report',
    category: 'output',
    type: 'outputNode',
    nodeType: 'customOutput',
    iconName: 'FaLock',
    params: {
      format: {
        type: 'select',
        options: ['PDF', 'HTML', 'CSV', 'JSON'],
        default: 'PDF'
      },
      includeDetails: {
        type: 'boolean',
        default: true
      }
    }
  },
  {
    id: 'incident-creation',
    label: 'Create Incident',
    description: 'Create a new security incident',
    category: 'output',
    type: 'outputNode',
    nodeType: 'customOutput',
    iconName: 'FaExclamationTriangle',
    params: {
      severity: {
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
      },
      assignTo: {
        type: 'text',
        default: 'security-team'
      }
    }
  }
]; 
import React, { useState, useContext, useRef, useEffect } from 'react';
  // Add this to the imports at the top

import {  FaFolder, FaHistory, FaFolderOpen, FaPlus, FaDownload, FaTrash, FaEllipsisH, FaCalendarAlt, FaEnvelope, FaGlobe, FaPencilAlt, FaSave, FaTimes, FaSearch, FaChevronDown, FaChevronUp, FaEdit, FaArrowLeft, FaChevronRight, FaArrowRight, FaCalendarDay, FaCheck, FaBug, FaSync, FaCreditCard, FaLock, FaDatabase, FaShieldAlt, FaExchangeAlt } from 'react-icons/fa';
import { ThemeContext } from '../../context/ThemeContext';
import '../../styles/Investigations.css';
import { format } from 'date-fns';
import CustomDateRangePicker from '../DateRangePicker/DateRangePicker';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';

interface DateRange {
  startDate: string;
  endDate: string;
}

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
  dates: (string | DateRange)[];
  assets: string[]; // Reverted from trashMails back to assets
  domains: string[];
  description: string;
  assignedTo: string;
}

type InvestigationItem = InvestigationFolder | InvestigationFile;

// Add new interfaces for investigation results
interface SuspiciousLead {
  id: string;
  asset: string;
  type: string;
  fromDate: string;
  toDate: string;
  activeApps: string[];
  supportiveData: string;
  showUserJourney?: boolean;
}

interface UserJourneyEvent {
  time: string;
  timeDiff: string;
  action: string;
  additionalInfo: string;
}

// Define NodeType interface
interface NodeType {
  label: string;
  title?: string;
  type: 'string' | 'stringInput' | 'timeInput' | 'operator';
  value?: string;
  enabled: boolean;
  operatorType?: string;
}

// Define PolicyNode type
interface SubPolicy {
  label?: NodeType[];
  type: string;
  id?: string; // Add this property
  description?: string; // Add this property for Signals component
}

export const costumePolicies:SubPolicy[] = [];

interface MainNavigationProps {
  activeTab: string;
  setActiveTab: (tab: 'policies' | 'investigations' | 'signals') => void;
}

// Define the PolicyNode interface to fix TypeScript errors
interface PolicyNode {
  id: string;
  label: string;
  color: string;
  subPoliciesNodes?: SubPolicy[];
  icon?: React.ReactNode;
  description?: string;
}

const Investigations: React.FC<MainNavigationProps> = ({ activeTab, setActiveTab }) => {

  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  // Move ALL state variables to the top of the component
  const [folderData, setFolderData] = useState<InvestigationFolder[]>([
    {
      id: 'folder-001',
      name: 'Commerce Abuse Investigations',
      type: 'folder',
      children: [
        {
          id: 'file-001',
          name: 'Gift Card Abuse',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-07-15',
          dates: [{ startDate: '2023-07-15', endDate: '2023-08-20' }],
          assets: ['user123@example.com', 'account456@domain.com'],
          domains: ['payment.example.com', 'giftcards.example.com'],
          description: 'Investigation into the fraudulent use of gift cards across multiple accounts.',
          assignedTo: 'Sarah Johnson'
        },
        {
          id: 'file-002',
          name: 'Gift Cards Fake Wallets',
          type: 'file',
          status: 'open',
          severity: 'critical',
          dateCreated: '2023-08-03',
          dates: [{ startDate: '2023-08-03', endDate: '2023-08-22' }],
          assets: ['wallet_4352', 'wallet_8766', 'wallet_9023'],
          domains: ['wallet.example.com', 'accounts.example.com'],
          description: 'Investigation into creation of fake wallet accounts for gift card laundering.',
          assignedTo: 'Michael Chen'
        },
        {
          id: 'file-003',
          name: 'Return Policy Abuse',
          type: 'file',
          status: 'in-progress',
          severity: 'medium',
          dateCreated: '2023-06-28',
          dates: [{ startDate: '2023-06-28', endDate: '2023-08-21' }],
          assets: ['order_8723', 'order_9821', 'user_789@example.com'],
          domains: ['returns.example.com', 'orders.example.com'],
          description: 'Investigation into systematic abuse of return policies by coordinated user groups.',
          assignedTo: 'Jennifer Smith'
        },
        {
          id: 'file-004',
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
        },
        {
          id: 'file-005',
          name: 'Gift Card Promotion Exploitation',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-08-10',
          dates: [{ startDate: '2023-08-10', endDate: '2023-08-25' }],
          assets: ['promo_system', 'discount_codes_db'],
          domains: ['promotions.example.com', 'marketing.example.com'],
          description: 'Investigation into exploitation of gift card promotion codes.',
          assignedTo: 'Thomas Lee'
        },
        {
          id: 'file-006',
          name: 'Multiple Account Checkout Fraud',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-08-05',
          dates: [{ startDate: '2023-08-05', endDate: '2023-08-22' }],
          assets: ['checkout_system', 'payment_gateway'],
          domains: ['checkout.example.com', 'payments.example.com'],
          description: 'Analysis of checkout fraud pattern using multiple accounts.',
          assignedTo: 'Amanda Peterson'
        },
        {
          id: 'file-014',
          name: 'Coupon Stacking Fraud',
          type: 'file',
          status: 'open',
          severity: 'medium',
          dateCreated: '2023-08-14',
          dates: [{ startDate: '2023-08-14', endDate: '2023-08-28' }],
          assets: ['coupon_system', 'promotion_engine'],
          domains: ['coupons.example.com', 'checkout.example.com'],
          description: 'Investigation into fraudulent stacking of coupons for excessive discounts.',
          assignedTo: 'Michelle Thompson'
        },
        {
          id: 'file-015',
          name: 'Digital Product Reselling Ring',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-08-08',
          dates: [{ startDate: '2023-08-08', endDate: '2023-08-25' }],
          assets: ['digital_products', 'license_system'],
          domains: ['downloads.example.com', 'licensing.example.com'],
          description: 'Investigation into unauthorized reselling of digital products and license keys.',
          assignedTo: 'James Wilson'
        }
      ],
      isOpen: false
    },
    {
      id: 'folder-002',
      name: 'Trust and Identity Investigations',
      type: 'folder',
      children: [
        {
          id: 'file-007',
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
          id: 'file-008',
          name: 'Distributed AOF',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-07-18',
          dates: [{ startDate: '2023-07-18', endDate: '2023-08-22' }],
          assets: ['auth_system', 'client_api', 'verification_service'],
          domains: ['api.example.com', 'auth.example.com'],
          description: 'Analysis of distributed account opening fraud campaign from multiple IPs.',
          assignedTo: 'Lisa Rodriguez'
        },
        {
          id: 'file-009',
          name: 'Attack from Malaysia',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-06-30',
          dates: [{ startDate: '2023-06-30', endDate: '2023-08-15' }],
          assets: ['frontend_servers', 'backend_api', 'user_credentials'],
          domains: ['api.example.com', 'app.example.com'],
          description: 'Investigation into coordinated attack attempts originating from Malaysian IPs.',
          assignedTo: 'Kevin Park'
        },
        {
          id: 'file-010',
          name: 'Credential Stuffing August',
          type: 'file',
          status: 'open',
          severity: 'critical',
          dateCreated: '2023-08-02',
          dates: [{ startDate: '2023-08-02', endDate: '2023-08-20' }],
          assets: ['login_portal', 'password_reset_system'],
          domains: ['login.example.com', 'accounts.example.com'],
          description: 'Investigation into credential stuffing attacks targeting multiple user accounts.',
          assignedTo: 'Emma Watson'
        },
        {
          id: 'file-011',
          name: 'Identity Verification Bypass',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-08-12',
          dates: [{ startDate: '2023-08-12', endDate: '2023-08-25' }],
          assets: ['id_verification_system', 'kyc_database'],
          domains: ['verification.example.com', 'kyc.example.com'],
          description: 'Analysis of attempts to bypass identity verification systems.',
          assignedTo: 'Carlos Rodriguez'
        },
        {
          id: 'file-016',
          name: 'OAuth Token Harvesting',
          type: 'file',
          status: 'open',
          severity: 'critical',
          dateCreated: '2023-08-15',
          dates: [{ startDate: '2023-08-15', endDate: '2023-08-29' }],
          assets: ['oauth_server', 'token_service'],
          domains: ['auth.example.com', 'api.example.com'],
          description: 'Investigation into harvesting and misuse of OAuth tokens for unauthorized access.',
          assignedTo: 'Priya Sharma'
        },
        {
          id: 'file-017',
          name: 'SSO Provider Compromise',
          type: 'file',
          status: 'in-progress',
          severity: 'critical',
          dateCreated: '2023-08-01',
          dates: [{ startDate: '2023-08-01', endDate: '2023-08-24' }],
          assets: ['sso_service', 'identity_provider'],
          domains: ['sso.example.com', 'idp.example.com'],
          description: 'Critical investigation into potential compromise of SSO provider infrastructure.',
          assignedTo: 'Alex Johnson'
        }
      ],
      isOpen: false
    },
    {
      id: 'folder-003',
      name: 'Payment Fraud Investigations',
      type: 'folder',
      children: [
        {
          id: 'file-012',
          name: 'Credit Card Testing Ring',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-07-28',
          dates: [{ startDate: '2023-07-28', endDate: '2023-08-25' }],
          assets: ['payment_processing', 'card_validation_api'],
          domains: ['payments.example.com', 'checkout.example.com'],
          description: 'Investigation into a coordinated credit card testing operation.',
          assignedTo: 'Nicole Barnes'
        },
        {
          id: 'file-013',
          name: 'Subscription Payment Exploitation',
          type: 'file',
          status: 'open',
          severity: 'medium',
          dateCreated: '2023-08-09',
          dates: [{ startDate: '2023-08-09', endDate: '2023-08-24' }],
          assets: ['subscription_system', 'recurring_billing'],
          domains: ['subscriptions.example.com', 'billing.example.com'],
          description: 'Analysis of exploitation in subscription payment systems.',
          assignedTo: 'Mark Johnson'
        },
        {
          id: 'file-018',
          name: 'Payment API Manipulation',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-08-16',
          dates: [{ startDate: '2023-08-16', endDate: '2023-08-30' }],
          assets: ['payment_api', 'transaction_processor'],
          domains: ['api.payments.example.com', 'transactions.example.com'],
          description: 'Investigation into manipulation of payment API requests to alter transaction values.',
          assignedTo: 'Derek Chen'
        },
        {
          id: 'file-019',
          name: 'Chargeback Fraud Ring',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-08-11',
          dates: [{ startDate: '2023-08-11', endDate: '2023-08-26' }],
          assets: ['payment_gateway', 'order_system'],
          domains: ['orders.example.com', 'payments.example.com'],
          description: 'Analysis of coordinated chargeback fraud from related customer accounts.',
          assignedTo: 'Jessica Martinez'
        }
      ],
      isOpen: false
    },
    {
      id: 'folder-004',
      name: 'Data Breach Investigations',
      type: 'folder',
      children: [
        {
          id: 'file-020',
          name: 'Customer Database Exfiltration',
          type: 'file',
          status: 'in-progress',
          severity: 'critical',
          dateCreated: '2023-08-05',
          dates: [{ startDate: '2023-08-05', endDate: '2023-08-25' }],
          assets: ['customer_database', 'data_warehouse'],
          domains: ['db.example.com', 'warehouse.example.com'],
          description: 'Critical investigation into exfiltration of customer PII from primary database.',
          assignedTo: 'Ryan Thompson'
        },
        {
          id: 'file-021',
          name: 'API Key Exposure Incident',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-08-14',
          dates: [{ startDate: '2023-08-14', endDate: '2023-08-28' }],
          assets: ['api_gateway', 'key_management_system'],
          domains: ['api.example.com', 'keys.example.com'],
          description: 'Investigation into exposure of production API keys in public repositories.',
          assignedTo: 'Laura Kim'
        },
        {
          id: 'file-022',
          name: 'S3 Bucket Misconfiguration',
          type: 'file',
          status: 'closed',
          severity: 'high',
          dateCreated: '2023-07-20',
          dates: [{ startDate: '2023-07-20', endDate: '2023-08-10' }],
          assets: ['storage_buckets', 'cloud_assets'],
          domains: ['storage.example.com', 'cloud.example.com'],
          description: 'Investigation into public access misconfiguration of cloud storage buckets containing sensitive data.',
          assignedTo: 'Chris Morgan'
        }
      ],
      isOpen: false
    },
    {
      id: 'folder-005',
      name: 'Insider Threat Investigations',
      type: 'folder',
      children: [
        {
          id: 'file-023',
          name: 'Unusual Admin Activity',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-08-17',
          dates: [{ startDate: '2023-08-17', endDate: '2023-08-31' }],
          assets: ['admin_console', 'user_management_system'],
          domains: ['admin.example.com', 'users.example.com'],
          description: 'Investigation into unusual administrative actions during non-business hours.',
          assignedTo: 'Michael Scott'
        },
        {
          id: 'file-024',
          name: 'Suspicious Data Access Patterns',
          type: 'file',
          status: 'in-progress',
          severity: 'medium',
          dateCreated: '2023-08-13',
          dates: [{ startDate: '2023-08-13', endDate: '2023-08-27' }],
          assets: ['sales_database', 'crm_system'],
          domains: ['crm.example.com', 'sales.example.com'],
          description: 'Analysis of unusual data access patterns by employee accounts across multiple systems.',
          assignedTo: 'Katherine Lee'
        },
        {
          id: 'file-025',
          name: 'Unauthorized System Configuration',
          type: 'file',
          status: 'open',
          severity: 'high',
          dateCreated: '2023-08-18',
          dates: [{ startDate: '2023-08-18', endDate: '2023-09-01' }],
          assets: ['network_infrastructure', 'system_config_files'],
          domains: ['systems.example.com', 'network.example.com'],
          description: 'Investigation into unauthorized changes to system configurations by internal users.',
          assignedTo: 'Brandon Martinez'
        }
      ],
      isOpen: false
    },
    {
      id: 'folder-006',
      name: 'Network Security Investigations',
      type: 'folder',
      children: [
        {
          id: 'file-026',
          name: 'DDoS Attack Patterns',
          type: 'file',
          status: 'in-progress',
          severity: 'high',
          dateCreated: '2023-08-12',
          dates: [{ startDate: '2023-08-12', endDate: '2023-08-26' }],
          assets: ['frontend_servers', 'load_balancers'],
          domains: ['main.example.com', 'www.example.com'],
          description: 'Analysis of distributed denial of service attack patterns against primary service endpoints.',
          assignedTo: 'Jason Kim'
        },
        {
          id: 'file-027',
          name: 'DNS Hijacking Attempt',
          type: 'file',
          status: 'open',
          severity: 'critical',
          dateCreated: '2023-08-19',
          dates: [{ startDate: '2023-08-19', endDate: '2023-09-02' }],
          assets: ['dns_servers', 'domain_registry'],
          domains: ['dns.example.com', 'registrar.example.com'],
          description: 'Critical investigation into attempted DNS redirection attacks against corporate domains.',
          assignedTo: 'Susan Miller'
        }
      ],
      isOpen: false
    }
  ]);
  
  const [selectedItem, setSelectedItem] = useState<InvestigationItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvestigationFile | null>(null);
  const [showNewItemMenu, setShowNewItemMenu] = useState<{show: boolean, parentId?: string}>({show: false});
  const [showFolderMenu, setShowFolderMenu] = useState<{show: boolean, folderId?: string}>({show: false});
  const [showFileMenu, setShowFileMenu] = useState<{show: boolean, fileId?: string}>({show: false});
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Form state for editing investigation
  const [formData, setFormData] = useState<Partial<InvestigationFile>>({
    name: '',
    status: 'open',
    severity: 'medium',
    dateCreated: new Date().toISOString().split('T')[0],
    dates: [],
    assets: [], // Reverted from trashMails
    domains: [],
    description: '',
    assignedTo: ''
  });
  
  // Current inputs for arrays
  const [currentDate, setCurrentDate] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [currentAsset, setCurrentAsset] = useState<string>(''); // Reverted from currentTrashMail
  const [currentDomain, setCurrentDomain] = useState<string>('');
  
  // Form input for date type selection
  const [dateInputType, setDateInputType] = useState<'specific' | 'range'>('specific');

  // For investigation results
  const [showResults, setShowResults] = useState(false);
  const [suspiciousLeads, setSuspiciousLeads] = useState<SuspiciousLead[]>([
    {
        id: 'lead-001',
        asset: 'john.doe@company.com',
        type: 'Login Anomaly',
        fromDate: '2023-09-12',
        toDate: '2023-09-15',
        activeApps: ['Chrome', 'Outlook', 'FileZilla'],
        supportiveData: 'Multiple failed login attempts from unusual geographic locations',
        showUserJourney: false
    },
    {
        id: 'lead-002',
        asset: 'alice.smith@company.com',
        type: 'Data Exfiltration',
        fromDate: '2023-09-17',
        toDate: '2023-09-18',
        activeApps: ['FileZilla', 'PowerShell', 'CMD'],
        supportiveData: 'Large file transfers outside business hours',
        showUserJourney: false
    },
    {
        id: 'lead-003',
        asset: 'robert.johnson@company.com',
        type: 'Privilege Escalation',
        fromDate: '2023-09-11',
        toDate: '2023-09-11',
        activeApps: ['Admin Console', 'Remote Desktop'],
        supportiveData: 'Unauthorized access attempts detected',
        showUserJourney: false
    },
    {
        id: 'lead-004',
        asset: 'emily.wilson@company.com',
        type: 'Malware Infection',
        fromDate: '2023-09-13',
        toDate: '2023-09-20',
        activeApps: ['Task Manager'],
        supportiveData: 'Suspicious process execution flagged',
        showUserJourney: false
    },
    {
        id: 'lead-005',
        asset: 'michael.brown@company.com',
        type: 'DDoS Attack',
        fromDate: '2023-09-19',
        toDate: '2023-09-19',
        activeApps: ['Web Server'],
        supportiveData: 'Unusual traffic patterns detected',
        showUserJourney: false
    },
    {
        id: 'lead-006',
        asset: 'sarah.jones@corp.net',
        type: 'Credential Theft',
        fromDate: '2023-09-15',
        toDate: '2023-09-15',
        activeApps: ['Security Dashboard'],
        supportiveData: 'Multiple credential reuse attempts observed',
        showUserJourney: false
    },
    {
        id: 'lead-007',
        asset: 'david.miller@corp.net',
        type: 'File Integrity Violation',
        fromDate: '2023-09-22',
        toDate: '2023-09-23',
        activeApps: ['Integrity Monitor'],
        supportiveData: 'Suspicious file modifications recorded',
        showUserJourney: false
    },
    {
        id: 'lead-008',
        asset: 'jennifer.taylor@corp.net',
        type: 'Network Scanning',
        fromDate: '2023-09-24',
        toDate: '2023-09-24',
        activeApps: ['Network Analyser'],
        supportiveData: 'Unauthorized network scanning detected',
        showUserJourney: false
    },
    {
        id: 'lead-009',
        asset: 'admin@enterprise.org',
        type: 'Unauthorized Access',
        fromDate: '2023-09-25',
        toDate: '2023-09-26',
        activeApps: ['Admin Interface'],
        supportiveData: 'Access logs show invalid credentials',
        showUserJourney: false
    },
    {
        id: 'lead-010',
        asset: 'print.admin@enterprise.org',
        type: 'Printing Anomaly',
        fromDate: '2023-09-27',
        toDate: '2023-09-27',
        activeApps: ['Print Service'],
        supportiveData: 'Suspicious large volume of print jobs initiated',
        showUserJourney: false
    },
    {
        id: 'lead-011',
        asset: 'james.williams@enterprise.org',
        type: 'Email Phishing Attempt',
        fromDate: '2023-09-18',
        toDate: '2023-09-18',
        activeApps: ['Email Client'],
        supportiveData: 'Detected phishing emails with suspicious links',
        showUserJourney: false
    },
    {
        id: 'lead-012',
        asset: 'lisa.davis@enterprise.org',
        type: 'Unauthorized File Access',
        fromDate: '2023-09-29',
        toDate: '2023-09-30',
        activeApps: ['FileZilla'],
        supportiveData: 'Multiple unauthorized access attempts to sensitive files',
        showUserJourney: false
    },
    {
        id: 'lead-013',
        asset: 'backup.admin@tech.io',
        type: 'Suspicious Backup Activity',
        fromDate: '2023-09-20',
        toDate: '2023-09-22',
        activeApps: ['Backup Software'],
        supportiveData: 'Excessive backup frequency observed',
        showUserJourney: false
    },
    {
        id: 'lead-014',
        asset: 'vpn.user@tech.io',
        type: 'VPN Abuse Detected',
        fromDate: '2023-09-21',
        toDate: '2023-09-21',
        activeApps: ['VPN Client'],
        supportiveData: 'Unusual VPN connections from multiple locations',
        showUserJourney: false
    },
    {
        id: 'lead-015',
        asset: 'thomas.anderson@tech.io',
        type: 'Malicious Device Connection',
        fromDate: '2023-09-23',
        toDate: '2023-09-23',
        activeApps: ['Device Manager'],
        supportiveData: 'Malicious devices detected on the network',
        showUserJourney: false
    },
    {
        id: 'lead-016',
        asset: 'network.admin@tech.io',
        type: 'Unauthorized Network Change',
        fromDate: '2023-09-26',
        toDate: '2023-09-26',
        activeApps: ['Switch Management'],
        supportiveData: 'Unauthorized configuration changes detected',
        showUserJourney: false
    },
    {
        id: 'lead-017',
        asset: 'email.admin@security.net',
        type: 'Spam Detection',
        fromDate: '2023-09-28',
        toDate: '2023-09-29',
        activeApps: ['Email Filter'],
        supportiveData: 'High volume of spam emails originating from internal accounts',
        showUserJourney: false
    },
    {
        id: 'lead-018',
        asset: 'docs.manager@security.net',
        type: 'Sensitive Data Leak',
        fromDate: '2023-09-30',
        toDate: '2023-09-30',
        activeApps: ['Document Manager'],
        supportiveData: 'Confidential documents found in public access',
        showUserJourney: false
    },
    {
        id: 'lead-019',
        asset: 'oliver.harris@security.net',
        type: 'Suspicious Activity from Legit Account',
        fromDate: '2023-09-24',
        toDate: '2023-09-24',
        activeApps: ['User Activity Monitor'],
        supportiveData: 'Unusual actions performed from a legitimate user account',
        showUserJourney: false
    },
    {
        id: 'lead-020',
        asset: 'server.admin@security.net',
        type: 'Potential Ransomware Attack',
        fromDate: '2023-09-26',
        toDate: '2023-09-27',
        activeApps: ['Ransomware Detector'],
        supportiveData: 'Files encrypted and ransom note found on server',
        showUserJourney: false
    },
    {
        id: 'lead-021',
        asset: 'file.admin@internal.corp',
        type: 'Unauthorized File Modification',
        fromDate: '2023-09-28',
        toDate: '2023-09-29',
        activeApps: ['File Integrity Monitor'],
        supportiveData: 'Critical files modified without proper permissions',
        showUserJourney: false
    },
    {
        id: 'lead-022',
        asset: 'db.admin@internal.corp',
        type: 'SQL Injection Attempt',
        fromDate: '2023-09-19',
        toDate: '2023-09-19',
        activeApps: ['SQL Monitor'],
        supportiveData: 'Malicious SQL queries attempted against the database',
        showUserJourney: false
    },
    {
        id: 'lead-023',
        asset: 'sophia.martinez@internal.corp',
        type: 'Phishing Email Campaign',
        fromDate: '2023-09-18',
        toDate: '2023-09-18',
        activeApps: ['Email Client'],
        supportiveData: 'Multiple users reported phishing emails',
        showUserJourney: false
    },
    {
        id: 'lead-024',
        asset: 'print.user@internal.corp',
        type: 'Unauthorized Printing Activity',
        fromDate: '2023-09-22',
        toDate: '2023-09-22',
        activeApps: ['Printer Management'],
        supportiveData: 'Large volume of printing from unauthorized users',
        showUserJourney: false
    },
    {
        id: 'lead-025',
        asset: 'security@global.com',
        type: 'Rogue Device Detected',
        fromDate: '2023-09-13',
        toDate: '2023-09-13',
        activeApps: ['Network Monitor'],
        supportiveData: 'A rogue device connected to the network',
        showUserJourney: false
    },
    {
        id: 'lead-026',
        asset: 'ryan.thompson@global.com',
        type: 'Malicious Software Detection',
        fromDate: '2023-09-15',
        toDate: '2023-09-16',
        activeApps: ['Antivirus'],
        supportiveData: 'Malicious software was detected and quarantined',
        showUserJourney: false
    },
    {
        id: 'lead-027',
        asset: 'file.sharing@global.com',
        type: 'File Sharing Violation',
        fromDate: '2023-09-20',
        toDate: '2023-09-20',
        activeApps: ['File Sharing Service'],
        supportiveData: 'Unapproved file sharing detected',
        showUserJourney: false
    },
    {
        id: 'lead-028',
        asset: 'vpn.admin@global.com',
        type: 'Multiple VPN Logins',
        fromDate: '2023-09-21',
        toDate: '2023-09-21',
        activeApps: ['VPN Client'],
        supportiveData: 'Multiple concurrent logins from the same account',
        showUserJourney: false
    },
    {
        id: 'lead-029',
        asset: 'api.developer@example.com',
        type: 'Unauthorized API Access',
        fromDate: '2023-09-14',
        toDate: '2023-09-14',
        activeApps: ['API Monitor'],
        supportiveData: 'Unauthorized access attempts to APIs observed',
        showUserJourney: false
    },
    {
        id: 'lead-030',
        asset: 'db.user@example.com',
        type: 'Database Latency Detected',
        fromDate: '2023-09-16',
        toDate: '2023-09-17',
        activeApps: ['Database Performance Monitor'],
        supportiveData: 'Unusual delay in database queries detected',
        showUserJourney: false
    },
    {
        id: 'lead-031',
        asset: 'security.camera@example.com',
        type: 'Camera Tampering Detected',
        fromDate: '2023-09-23',
        toDate: '2023-09-24',
        activeApps: ['Surveillance System'],
        supportiveData: 'Security cameras were turned off during operational hours',
        showUserJourney: false
    },
    {
        id: 'lead-032',
        asset: 'emma.clark@example.com',
        type: 'Suspicious Remote Access',
        fromDate: '2023-09-26',
        toDate: '2023-09-26',
        activeApps: ['Remote Access Tool'],
        supportiveData: 'Remote access initiated from an unrecognized location',
        showUserJourney: false
    },
    {
        id: 'lead-033',
        asset: 'dns.admin@corp.net',
        type: 'DNS Spoofing Attempt',
        fromDate: '2023-09-21',
        toDate: '2023-09-23',
        activeApps: ['DNS Monitor'],
        supportiveData: 'Suspicious DNS queries made to unauthorized domains',
        showUserJourney: false
    },
    {
        id: 'lead-034',
        asset: 'network.sensor@corp.net',
        type: 'Suspicious Network Traffic',
        fromDate: '2023-09-18',
        toDate: '2023-09-19',
        activeApps: ['Traffic Analyser'],
        supportiveData: 'High volume of outbound traffic detected',
        showUserJourney: false
    },
    {
        id: 'lead-035',
        asset: 'mail.server@corp.net',
        type: 'Malicious Attachment Detected',
        fromDate: '2023-09-24',
        toDate: '2023-09-24',
        activeApps: ['Email Security Gateway'],
        supportiveData: 'Email with malicious attachment blocked',
        showUserJourney: false
    },
    {
        id: 'lead-036',
        asset: 'web.admin@enterprise.org',
        type: 'XSS Attack Detected',
        fromDate: '2023-09-25',
        toDate: '2023-09-25',
        activeApps: ['Web Application Firewall'],
        supportiveData: 'Cross-Site Scripting attempt detected and blocked',
        showUserJourney: false
    },
    {
        id: 'lead-037',
        asset: 'file.access@enterprise.org',
        type: 'Sensitive File Access Attempt',
        fromDate: '2023-09-29',
        toDate: '2023-09-30',
        activeApps: ['File System Monitor'],
        supportiveData: 'Unauthorized access to classified documents detected',
        showUserJourney: false
    },
    {
        id: 'lead-038',
        asset: 'physical.security@enterprise.org',
        type: 'Physical Security Breach',
        fromDate: '2023-09-19',
        toDate: '2023-09-19',
        activeApps: ['Access Control System'],
        supportiveData: 'Unauthorized entry detected at secured premises',
        showUserJourney: false
    },
    {
        id: 'lead-039',
        asset: 'db.monitor@tech.io',
        type: 'Suspicious Database Query',
        fromDate: '2023-09-20',
        toDate: '2023-09-20',
        activeApps: ['Database Activity Monitor'],
        supportiveData: 'Extensive read operations detected on sensitive tables',
        showUserJourney: false
    },
    {
        id: 'lead-040',
        asset: 'backup.device@tech.io',
        type: 'Backup Failure Detected',
        fromDate: '2023-09-22',
        toDate: '2023-09-22',
        activeApps: ['Backup Solution'],
        supportiveData: 'Backup process failed due to unauthorized changes',
        showUserJourney: false
    },
    {
        id: 'lead-041',
        asset: 'web.developer@tech.io',
        type: 'Unauthorized API Access Attempt',
        fromDate: '2023-09-26',
        toDate: '2023-09-27',
        activeApps: ['API Gateway'],
        supportiveData: 'Multiple unauthorized API access attempts logged',
        showUserJourney: false
    },
    {
        id: 'lead-042',
        asset: 'iot.security@security.net',
        type: 'IoT Device Compromise',
        fromDate: '2023-09-27',
        toDate: '2023-09-27',
        activeApps: ['IoT Security'],
        supportiveData: 'IoT device reported abnormal behavior',
        showUserJourney: false
    },
    {
        id: 'lead-043',
        asset: 'cloud.admin@security.net',
        type: 'Data Leakage Detected',
        fromDate: '2023-09-18',
        toDate: '2023-09-19',
        activeApps: ['Cloud Security'],
        supportiveData: 'Sensitive data uploaded to public storage',
        showUserJourney: false
    },
    {
        id: 'lead-044',
        asset: 'file.rights@security.net',
        type: 'Access Rights Abuse',
        fromDate: '2023-09-20',
        toDate: '2023-09-21',
        activeApps: ['File Access Audit'],
        supportiveData: 'Unauthorized file access rights granted to the user',
        showUserJourney: false
    },
    {
        id: 'lead-045',
        asset: 'web.security@internal.corp',
        type: 'SQL Injection Attack',
        fromDate: '2023-09-22',
        toDate: '2023-09-22',
        activeApps: ['Web Application Firewall'],
        supportiveData: 'Abnormal SQL queries detected and blocked',
        showUserJourney: false
    },
    {
        id: 'lead-046',
        asset: 'api.gateway@internal.corp',
        type: 'API Rate Limiting Violation',
        fromDate: '2023-09-23',
        toDate: '2023-09-23',
        activeApps: ['API Management'],
        supportiveData: 'Excessive API requests exceeding allowed limits',
        showUserJourney: false
    },
    {
        id: 'lead-047',
        asset: 'nathan.parker@internal.corp',
        type: 'Malicious Script Execution',
        fromDate: '2023-09-24',
        toDate: '2023-09-24',
        activeApps: ['Endpoint Protection'],
        supportiveData: 'Malicious scripts were detected and quarantined',
        showUserJourney: false
    },
    {
        id: 'lead-048',
        asset: 'authentication@global.com',
        type: 'Multiple Failed Logins',
        fromDate: '2023-09-25',
        toDate: '2023-09-25',
        activeApps: ['Authentication System'],
        supportiveData: 'Many failed login attempts from a single IP address',
        showUserJourney: false
    },
    {
        id: 'lead-049',
        asset: 'remote.access@global.com',
        type: 'Unusual Remote Login',
        fromDate: '2023-09-26',
        toDate: '2023-09-26',
        activeApps: ['Remote Desktop'],
        supportiveData: 'Remote login detected from an unauthorized location',
        showUserJourney: false
    },
    {
        id: 'lead-050',
        asset: 'network.device@global.com',
        type: 'Unusual Device Behavior',
        fromDate: '2023-09-27',
        toDate: '2023-09-27',
        activeApps: ['Network Management'],
        supportiveData: 'Device exhibiting unusual network behavior',
        showUserJourney: false
    },
    {
        id: 'lead-051',
        asset: 'cloud.storage@example.com',
        type: 'Data Tampering',
        fromDate: '2023-09-28',
        toDate: '2023-09-28',
        activeApps: ['Data Integrity Monitor'],
        supportiveData: 'Modification of sensitive data files detected',
        showUserJourney: false
    },
    {
        id: 'lead-052',
        asset: 'file.monitoring@example.com',
        type: 'Excessive File Access',
        fromDate: '2023-09-29',
        toDate: '2023-09-29',
        activeApps: ['File Monitoring System'],
        supportiveData: 'Abnormal number of access requests to sensitive files',
        showUserJourney: false
    },
    {
        id: 'lead-053',
        asset: 'internal.website@example.com',
        type: 'Cross-Site Scripting (XSS) Attack',
        fromDate: '2023-09-30',
        toDate: '2023-09-30',
        activeApps: ['Web Security'],
        supportiveData: 'XSS attack vector detected on internal site',
        showUserJourney: false
    },
    {
        id: 'lead-054',
        asset: 'file.server@example.com',
        type: 'Unauthorized Data Access',
        fromDate: '2023-09-11',
        toDate: '2023-09-11',
        activeApps: ['File Audit'],
        supportiveData: 'Unauthorized access to sensitive data files detected',
        showUserJourney: false
    }
  ]);
  
  // Generate random user journey events
  const generateRandomJourneyEvents = (numEvents: number = 8): UserJourneyEvent[] => {
    const actions = [
      'Login', 
      'File Access', 
      'Application Launch', 
      'Database Query', 
      'File Download', 
      'Email Sent', 
      'Password Change', 
      'Admin Access',
      'File Upload', 
      'Remote Connection', 
      'Firewall Setting Change', 
      'USB Device Connected',
      'VPN Connected', 
      'Shared Folder Access', 
      'System Configuration Change', 
      'Software Installation',
      'User Logout', 
      'System Reboot', 
      'Configuration Backup', 
      'Credential Retrieval',
      'Email Received', 
      'File Deletion', 
      'Data Export', 
      'Network Scan', 
      'Malware Scan Started',
      'Backup Restoration', 
      'Password Reset', 
      'Account Lockout', 
      'Application Termination', 
      'System Update'
  ];
  
  const apps = [
      'Chrome', 
      'FileZilla', 
      'Outlook', 
      'PowerShell', 
      'CMD', 
      'SQL Server', 
      'Word', 
      'Excel', 
      'Admin Console', 
      'Registry Editor', 
      'VPN Client',
      'Remote Desktop', 
      'Event Viewer', 
      'Task Manager', 
      'Wireshark', 
      'PuTTY',
      'Notepad', 
      'Adobe Reader', 
      'Visual Studio Code', 
      'Slack', 
      'Zoom', 
      'Jira', 
      'Trello', 
      'Git Bash', 
      'Discord', 
      'Microsoft Teams', 
      'SharePoint', 
      'Box'
  ];
  
  const locations = [
      'New York', 
      'London', 
      'Tokyo', 
      'Singapore', 
      'Frankfurt', 
      'Sydney',
      'Mumbai', 
      'Paris', 
      'Moscow', 
      'Beijing', 
      'Toronto', 
      'Sao Paulo',
      'Los Angeles', 
      'Berlin', 
      'Istanbul', 
      'Dubai', 
      'Mexico City', 
      'Buenos Aires', 
      'Kuala Lumpur', 
      'Bangkok', 
      'Rome', 
      'Stockholm', 
      'Seoul',
      'Cairo', 
      'Helsinki', 
      'Amsterdam', 
      'Brussels', 
      'Vienna'
  ];
  
  const ipAddresses = [
      '192.168.1.25', 
      '10.0.0.15', 
      '172.16.254.1', 
      '192.168.0.1', 
      '192.168.0.254',
      '198.51.100.1', 
      '203.0.113.1', 
      '8.8.8.8',
      '198.51.100.54', 
      '203.0.113.222', 
      '198.51.100.17', 
      '203.0.113.75',
      '192.168.1.50', 
      '10.1.1.25',
      '172.20.10.1',
      '172.31.255.255',
      '192.168.100.10',
      '10.10.10.10',
      '192.0.2.123',
      '203.0.113.03',
      '192.168.8.1',
      '172.18.0.1',
      // Add more IP addresses as needed
  ];
    
    // Generate base time
    const baseTime = new Date();
    baseTime.setHours(Math.floor(Math.random() * 24));
    baseTime.setMinutes(Math.floor(Math.random() * 60));
    baseTime.setSeconds(Math.floor(Math.random() * 60));
    
    const events: UserJourneyEvent[] = [];
    
    for (let i = 0; i < numEvents; i++) {
      // Add some time for each event
      baseTime.setMinutes(baseTime.getMinutes() + Math.floor(Math.random() * 15) + 1);
      
      const time = baseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      // Determine time diff (from previous event)
      const timeDiff = i === 0 ? 'Start' : `${Math.floor(Math.random() * 15) + 1} min`;
      
      // Generate meaningful additional info based on action
      let additionalInfo = '';
      switch (action) {
        case 'Login':
          additionalInfo = `From IP ${ipAddresses[Math.floor(Math.random() * ipAddresses.length)]} (${locations[Math.floor(Math.random() * locations.length)]})`;
          break;
        case 'File Access':
          additionalInfo = `Accessed file "confidential_${Math.floor(Math.random() * 100)}.pdf"`;
          break;
        case 'Application Launch':
          additionalInfo = `Launched ${apps[Math.floor(Math.random() * apps.length)]}`;
          break;
        case 'Database Query':
          additionalInfo = `SELECT * FROM users WHERE admin=1; (Duration: ${Math.floor(Math.random() * 1000)}ms)`;
          break;
        case 'File Download':
          additionalInfo = `Downloaded "data_export_${Math.floor(Math.random() * 1000)}.csv" (${Math.floor(Math.random() * 100) + 1}MB)`;
          break;
        case 'Email Sent':
          additionalInfo = `To: external${Math.floor(Math.random() * 10)}@example.com, Subject: "Project Update"`;
          break;
        default:
          additionalInfo = `Using ${apps[Math.floor(Math.random() * apps.length)]} from ${locations[Math.floor(Math.random() * locations.length)]}`;
      }
      
      events.push({
        time,
        timeDiff,
        action,
        additionalInfo
      });
    }
    
    return events;
  };

  // Toggle user journey on row click
  const toggleUserJourney = (leadId: string) => {
    setSuspiciousLeads(leads => 
      leads.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, showUserJourney: !lead.showUserJourney };
        }
        return lead;
      })
    );
  };

  // Generate random user journey events
  const [userJourneyEvents, setUserJourneyEvents] = useState<UserJourneyEvent[]>(
    generateRandomJourneyEvents(12)
  );

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
  };

  // Select an item to display details
  const handleSelectItem = (item: InvestigationItem) => {
    setSelectedItem(item);
    setEditingItem(null);
    setShowResults(false);
  };

  // Start editing an investigation
  const startEditing = (file: InvestigationFile) => {
    setEditingItem(file);
    setFormData({
      ...file
    });
    setShowFileMenu({ show: false });
    setOverlayVisible(false);
  };

  // Save edited investigation
  const saveInvestigation = () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }
    
    const updatedData = { ...formData } as InvestigationFile;
    
    const updateFolderData = (
      folders: InvestigationFolder[], 
      itemId: string, 
      newData: InvestigationFile
    ): InvestigationFolder[] => {
      return folders.map(folder => {
        const updatedChildren = folder.children.map(child => {
          if (child.id === itemId && child.type === 'file') {
            return { ...newData };
          } else if (child.type === 'folder') {
            return {
              ...child,
              children: updateFolderData([child as InvestigationFolder], itemId, newData)[0].children
            };
          }
          return child;
        });
        
        return {
          ...folder,
          children: updatedChildren
        };
      });
    };
    
    if (editingItem) {
      setFolderData(updateFolderData(folderData, editingItem.id, updatedData));
      setSelectedItem(updatedData);
    }
    
    setEditingItem(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
  };

  // Handle folder actions (ellipsis menu)
  const handleFolderActions = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    console.log('Folder action clicked:', folderId);
    
    // Close any other open menus
    setShowFileMenu({ show: false });
    setShowNewItemMenu({ show: false });
    
    // Toggle menu for this folder
    setShowFolderMenu({
      show: !showFolderMenu.show || showFolderMenu.folderId !== folderId,
      folderId
    });
    
    // Use a class-based approach for positioning instead of fixed coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parentRect = (e.currentTarget.closest('.folder-sidebar') as HTMLElement)?.getBoundingClientRect();
    console.log(rect.top, rect.left);
    if (parentRect) {
      // Calculate position relative to parent container
    setMenuPosition({
        top: rect.top - rect.height ,
        left: rect.left
      });
    } else {
      // Fallback if parent not found
      setMenuPosition({
        top: rect.top - rect.height ,
        left: rect.left
      });
    }
    console.log(menuPosition);
    setOverlayVisible(true);
  };

  // Handle file actions (ellipsis menu)
  const handleFileActions = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('File action clicked:', fileId);
    
    // Close other menus
    setShowFolderMenu({ show: false });
    setShowNewItemMenu({ show: false });
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    console.log(!showFileMenu.show || showFileMenu.fileId !== fileId);
    setShowFileMenu({
      show: !showFileMenu.show || showFileMenu.fileId !== fileId,
      fileId
    });
    
    console.log('Menu position:', { top: rect.top, left: rect.left });
    // Position menu relative to the button
    setMenuPosition({
      top: rect.top - rect.height ,
      left: rect.left
    });
    
    setOverlayVisible(true);
  };

 

  // Add these helper functions at the top of the component, after the state declarations

  // Helper function to find and update folders recursively
  const updateFolderStructure = (
    folders: InvestigationFolder[],
    targetId: string,
    updater: (folder: InvestigationFolder) => InvestigationFolder
  ): InvestigationFolder[] => {
    return folders.map(folder => {
      if (folder.id === targetId) {
        return updater(folder);
      }
      if (folder.children) {
        return {
          ...folder,
          children: folder.children.map(child => {
            if (child.type === 'folder') {
              return updateFolderStructure([child as InvestigationFolder], targetId, updater)[0];
            }
            return child;
          })
        };
      }
      return folder;
    });
  };

  // Update the handleAddItem function
  const handleAddItem = (itemType: 'folder' | 'file') => {
    if (itemType === 'folder') {
      const newFolder: InvestigationFolder = {
        id: `folder-${Date.now()}`,
        name: 'New Folder',
        type: 'folder',
        children: [],
        isOpen: false
      };
      setFolderData(prev => [...prev, newFolder]);
      setRenamingFolder(newFolder.id);
      setNewFolderName('New Folder');
    } else {
      const newFile: InvestigationFile = {
        id: `inv-${Date.now()}`,
        name: 'New Investigation',
        type: 'file',
        status: 'open',
        severity: 'medium',
        dateCreated: new Date().toISOString().split('T')[0],
        dates: [],
        assets: [], // Changed from trashMails
        domains: [],
        description: '',
        assignedTo: ''
      };
      
      // Add to Active Investigations folder if it exists
      const activeFolder = folderData.find(f => f.name === 'Active Investigations');
      if (activeFolder) {
        setFolderData(prev => 
          prev.map(folder => 
            folder.id === activeFolder.id 
              ? { ...folder, children: [...folder.children, newFile], isOpen: false }
              : folder
          )
        );
      } else {
        setFolderData(prev => [...prev, newFile] as InvestigationFolder[]);
      }
        setSelectedItem(newFile);
      startEditing(newFile);
      }
    setShowNewItemMenu({ show: false });
    setOverlayVisible(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle adding a specific date
  const addSpecificDate = () => {
    if (!currentDate) return;
    
    setFormData({
      ...formData,
      dates: [...(formData.dates || []), currentDate]
    });
    setCurrentDate('');
  };

  // Handle adding a date range
  const addDateRange = () => {
    if (!dateRangeStart || !dateRangeEnd) return;
    
    setFormData({
      ...formData,
      dates: [...(formData.dates || []), { startDate: dateRangeStart, endDate: dateRangeEnd }]
    });
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  // Handle removing a date
  const removeDate = (index: number) => {
    const updatedDates = [...(formData.dates || [])];
    updatedDates.splice(index, 1);
    setFormData({
      ...formData,
      dates: updatedDates
    });
  };

  // Handle adding an asset
  const addAsset = () => {
    if (!currentAsset) return;
    
    setFormData({
      ...formData,
      assets: [...(formData.assets || []), currentAsset]
    });
    setCurrentAsset('');
  };

  // Handle removing an asset
  const removeAsset = (index: number) => {
    setFormData({
      ...formData,
      assets: (formData.assets || []).filter((_, i) => i !== index)
    });
  };

  // Handle adding a domain
  const addDomain = () => {
    if (!currentDomain) return;
    
    setFormData({
      ...formData,
      domains: [...(formData.domains || []), currentDomain]
    });
    setCurrentDomain('');
  };

  // Handle removing a domain
  const removeDomain = (index: number) => {
    const updatedDomains = [...(formData.domains || [])];
    updatedDomains.splice(index, 1);
    setFormData({
      ...formData,
      domains: updatedDomains
    });
  };

  // Add these new state variables for rename functionality
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  // Effect to handle clicks outside menus
  useEffect(() => {
    const handleClickOutside = () => {
      if (showFolderMenu.show && showFileMenu.show && showNewItemMenu.show) {
        setShowFolderMenu({ show: false });
        setShowFileMenu({ show: false });
        setShowNewItemMenu({ show: false });
        setOverlayVisible(false);
      }
    };
    
    if (showFolderMenu.show || showFileMenu.show || showNewItemMenu.show) {
      document.addEventListener('mousedown', handleClickOutside);
      setOverlayVisible(true);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFolderMenu.show, showFileMenu.show, showNewItemMenu.show]);
  
  // Ensure this function is defined only once in your component
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
                
                {renamingFolder === folder.id ? (
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onBlur={finishRenaming}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRenaming();
                      if (e.key === 'Escape') cancelRenaming();
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="rename-input"
                  />
                ) : (
                  <span className="folder-name">{folder.name}</span>
                )}
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
        const file = item as InvestigationFile;
        return (
          <div 
            key={file.id}
            className={`file-item ${selectedItem?.id === file.id ? 'selected' : ''}`}
            onClick={() => handleSelectItem(file)}
          >
            <div className="file-content">
              <ContentPasteSearchIcon className="file-icon" />
              <span className="file-name">{file.name}</span>
            <button 
                className="action-icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFileActions(e, file.id);
                }}
            >
              <FaEllipsisH />
            </button>
            </div>
          </div>
        );
      }
    });
  };

  // Function to add a sub-item to a folder
  const handleAddSubItem = (e: React.MouseEvent, parentId: string, itemType: 'folder' | 'file') => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`Adding ${itemType} to folder ${parentId}`); // Debugging
    
    const newItem = itemType === 'folder' 
      ? {
          id: `folder-${Date.now()}`,
          name: 'New Folder',
          type: 'folder' as const,
          children: [],
          isOpen: false
        }
      : {
          id: `inv-${Date.now()}`,
          name: 'New Investigation',
          type: 'file' as const,
          status: 'open' as const,
          severity: 'medium' as const,
          dateCreated: new Date().toISOString().split('T')[0],
          dates: [],
          assets: [], // Changed from trashMails
          domains: [],
          description: '',
          assignedTo: ''
        };
    
    // Find the folder and add the new item to it
    setFolderData(prev => {
      return prev.map(folder => {
        if (folder.id === parentId) {
          console.log('Found target folder, adding item'); // Debugging
          return {
            ...folder,
            isOpen: false,
            children: folder.children.filter(child => child.type === 'folder').concat(
              [newItem] as any
            ).concat(
              folder.children.filter(child => child.type === 'file') as any
            )
          };
        }
        // Handle nested folders
        if (folder.children && folder.children.length > 0) {
          return {
            ...folder,
            children: folder.children.map(child => {
              if (child.type === 'folder' && child.id === parentId) {
                console.log('Found target subfolder, adding item'); // Debugging
                return {
                  ...child,
                  isOpen: false,
                  children: [...(child as InvestigationFolder).children, newItem]
                };
              }
              return child;
            })
          };
        }
        return folder;
      });
    });

    // Additional actions after adding
    if (itemType === 'folder') {
      setRenamingFolder(newItem.id);
      setNewFolderName('New Folder');
    } else {
      setSelectedItem(newItem);
      startEditing(newItem as InvestigationFile);
    }

    // Close menus
    setShowFolderMenu({ show: false });
    setOverlayVisible(false);
  };

  // Updated deleteItem function
  const deleteItem = (itemId: string) => {
    console.log(`Deleting item ${itemId}`); // Debugging
    
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
              item.children = removeItem(item.children);
            }
            return true;
          });
        };
        
        // First check top level
        const newData = prev.filter(folder => {
          if (folder.id === itemId) return false;
          folder.children = removeItem(folder.children);
          return true;
        });
        
        return newData;
      });
      
      // Clear selection if the deleted item was selected
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setShowResults(false);
      }
    }
    
    // Close menus
    setShowFolderMenu({ show: false });
    setShowFileMenu({ show: false });
    setOverlayVisible(false);
  };

  // Function to select an item
  const selectItem = (item: InvestigationItem) => {
    setSelectedItem(item);
    setShowResults(false);
  };

  // Fix for the selectFile reference error
  const selectFile = (file: InvestigationFile) => {
    selectItem(file);
  };

  // Update the viewInvestigationResults function to display the results
  const renderInvestigationResults = () => {
    // Add this check at the beginning of the function
    if (!selectedItem) {
      return <div>No investigation selected</div>;
    }
    
    // Calculate statistics for the summary
    const totalLeads = suspiciousLeads.length;
    const highRiskLeads = suspiciousLeads.filter(lead => lead.type === 'Data Exfiltration' || lead.type === 'Unauthorized Access').length;
    const uniqueAssets = new Set(suspiciousLeads.map(lead => lead.asset)).size;
    
    // Sample data for the new sections
    const relatedDomains = [
      { name: "login.example.com", riskLevel: "high", description: "User authentication portal" },
      { name: "store.example.com", riskLevel: "medium", description: "Product browsing service" },
      { name: "cart.example.com", riskLevel: "high", description: "Shopping cart services" },
      { name: "delivery.example.com", riskLevel: "low", description: "Shipping & delivery tracking" }
    ];
    
    const abnormalActivities = [
      { activity: "Fraud ring activity", time: "2023-06-12 14:23", source: "Fraud Detection System", severity: "high" },
      { activity: "Missing activities between 10:00-12:00", time: "2023-06-12 10:15", source: "User Journey Analysis", severity: "medium" },
      { activity: "Abnormal login pattern", time: "2023-06-11 23:47", source: "Auth System", severity: "high" }
    ];
    
    const dataSources = [
      { name: "Identity Database", reliability: "high", updated: "Real-time", coverage: "99%" },
      { name: "API Transactions", reliability: "high", updated: "1 min delay", coverage: "98%" },
      { name: "Customer Records", reliability: "medium", updated: "15 min delay", coverage: "95%" },
      { name: "Payment Gateway Logs", reliability: "high", updated: "5 min delay", coverage: "97%" }
    ];
    
    // Add the risk factors
    const riskFactors = [
      "Multiple failed login attempts",
      "Access from unusual geolocation",
      "Activity outside normal business hours",
      "Abnormal data transfer patterns"
    ];

    // Get risk label function
    const getRiskLabel = (score: number): string => {
      if (score >= 80) return "Critical";
      if (score >= 60) return "High";
      if (score >= 40) return "Medium";
      return "Low";
    };

    // Inside renderInvestigationResults, add this with your other constants
    const riskScore = 78; // Example risk score, adjust as needed

    return (
      <div className="investigation-results">
        <div className="results-header">
          <h2 className="results-title">Investigation Results</h2>
          <button className="corner-return-button" onClick={() => setShowResults(false)}>
            <FaArrowRight />
          </button>
        </div>

        <div className="leads-container">
          <div className="leads-header">
            <h3>Suspicious Activities Detected</h3>
            
            <div className="stats-summary">
              <div className="stat-card">
                <span className="stat-value">{totalLeads}</span>
                <span className="stat-label">Total Alerts</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{highRiskLeads}</span>
                <span className="stat-label">High Risk Events</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{uniqueAssets}</span>
                <span className="stat-label">Affected Assets</span>
              </div>
              <div className="stat-card timeframe">
                <span className="stat-value">Last 7 days</span>
                <span className="stat-label">Time Frame</span>
              </div>
            </div>
          </div>
          
          <div className="table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '5%' }}></th> {/* Toggle column */}
                  <th style={{ width: '20%' }}>Asset</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th style={{ width: '30%' }}>Active Apps</th>
                  <th style={{ width: '50%' }}>Supportive Data</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousLeads.map((lead, index) => (
                  <React.Fragment key={lead.id}>
                    <tr 
                      className={lead.showUserJourney ? 'expanded' : ''} 
                      onClick={() => toggleUserJourney(lead.id)}
                    >
                      <td className="row-number">{index + 1}</td>
                      <td className="toggle-cell">
                        {lead.showUserJourney ? <FaChevronDown /> : <FaChevronRight />}
                      </td>
                      <td>{lead.asset}</td>
                      <td>
                        <span className="lead-type">{lead.type}</span>
                      </td>
                      <td>{lead.fromDate}</td>
                      <td>{lead.toDate}</td>
                      <td>
                        <div className="apps-list">
                          {lead.activeApps.map((app, index) => (
                            <span key={index} className="app-badge">{app}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="supportive-data">
                          {lead.supportiveData}
                        </div>
                      </td>
                    </tr>
                    {lead.showUserJourney && (
                      <tr className="journey-row">
                        <td colSpan={8}>
                          <div className="user-journey">
                            <h4>User Journey Timeline</h4>
                            <table className="journey-table">
                              <thead>
                                <tr>
                                  <th>Time</th>
                                  <th>Time Diff</th>
                                  <th>Action</th>
                                  <th>Details</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getJourneyEventsForLead(lead.id).map((event, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                    <td>{event.time}</td>
                                    <td>{event.timeDiff}</td>
                                    <td>{event.action}</td>
                                    <td>{event.additionalInfo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-actions">
            <button className="export-csv-button" onClick={() => exportToCSV()}>
              <FaDownload /> Export CSV
            </button>
          </div>
          
          {/* New sections */}
          <div className="additional-data-section">
            <div className="related-domains-section">
              <h3 className="section-title">RELATED DATA DOMAINS</h3>
              <div className="domains-grid">
                {relatedDomains.map((domain, index) => (
                  <div key={index} className={`domain-card risk-${domain.riskLevel}`}>
                    <div className="domain-name">{domain.name}</div>
                    <div className="domain-description">{domain.description}</div>
                    <div className={`risk-badge ${domain.riskLevel}`}>
                      {domain.riskLevel.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="abnormal-activities-section">
              <h3 className="section-title">ABNORMAL ACTIVITIES</h3>
              <table className="activities-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Time</th>
                    <th>Source</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {abnormalActivities.map((activity, index) => (
                    <tr key={index} className={`severity-${activity.severity}-bg`}>
                      <td>{activity.activity}</td>
                      <td>{activity.time}</td>
                      <td>{activity.source}</td>
                      <td>
                        <span className={`severity-badge ${activity.severity}`}>
                          {activity.severity.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="data-sources-section">
              <h3 className="section-title">DATA SOURCES</h3>
              <div className="data-sources-grid">
                {dataSources.map((source, index) => (
                  <div key={index} className="source-card">
                    <div className="source-name">{source.name}</div>
                    <div className="source-details">
                      <div className="detail">
                        <span className="label">Reliability:</span>
                        <span className={`value ${source.reliability}`}>{source.reliability}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Updated:</span>
                        <span className="value">{source.updated}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Coverage:</span>
                        <span className="value">{source.coverage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Signals button */}
        <button className="apply-policy-button" onClick={generatePolicies}>
          Generate Signals
        </button>

        {/* Generated Signals Section */}
        {generatedPolicies.length > 0 && (
          <div className="generated-policies">
            <h3>Generated Signals</h3>
            <p className="policies-description">
              These signals have been automatically generated based on the selected investigation details.
              They can be sent to the Signals tab to implement monitoring and alerting.
            </p>
            
            <div className="policies-list">
              {generatedPolicies.map((policy, index) => (
                <div key={index} className="policy-item" style={{ borderLeft: `4px solid ${policy.color}` }}>
                  <div className="policy-header">
                    <div className="policy-icon">{policy.icon}</div>
                    <h4>{policy.label}</h4>
                  </div>
                  
                  <p className="policy-description">{policy.description}</p>
                  
                  <div className="policy-details">
                    <h5>Monitoring Rules:</h5>
                    <ul>
                      {policy.subPoliciesNodes?.map((subPolicy, idx) => (
                        <li key={idx} className="policy-rule">
                          {typeof subPolicy.label === 'string' 
                            ? subPolicy.label 
                            : Array.isArray(subPolicy.label) 
                              ? subPolicy.label[0]?.label 
                              : 'Monitor activity'}
                          {subPolicy.description && (
                            <div className="rule-description">{subPolicy.description}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="policy-actions">
                    <button className="send-to-signals" onClick={() => navigateToSignals(policy)}>
                      Implement in Signals <FaArrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add the CSV export function
  const exportToCSV = () => {
    try {
      // Create CSV header
      let csvContent = "Asset,Type,From Date,To Date,Active Apps,Supportive Data\n";
      
      // Add data rows
      suspiciousLeads.forEach(lead => {
        const activeApps = lead.activeApps.join(", ");
        // Escape any commas in the data to prevent CSV formatting issues
        const row = [
          `"${lead.asset}"`,
          `"${lead.type}"`,
          `"${lead.fromDate}"`,
          `"${lead.toDate}"`,
          `"${activeApps}"`,
          `"${lead.supportiveData}"`
        ].join(",");
        csvContent += row + "\n";
      });
      
      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `investigation_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  // Function to start renaming a folder
  const startRenaming = (e: React.MouseEvent, folder: InvestigationFolder) => {
    e.stopPropagation();
    setRenamingFolder(folder.id);
    setNewFolderName(folder.name);
    setShowFolderMenu({ show: false });
    setOverlayVisible(false);
  };

  // Function to cancel renaming
  const cancelRenaming = () => {
    setRenamingFolder(null);
    setNewFolderName('');
  };

  // Function to finish renaming
  const finishRenaming = () => {
    if (!renamingFolder || !newFolderName.trim()) {
      cancelRenaming();
      return;
    }

    setFolderData(prev => {
      return prev.map(folder => {
        if (folder.id === renamingFolder) {
          return { ...folder, name: newFolderName.trim() };
        }
        if (folder.children && folder.children.length > 0) {
          return {
            ...folder,
            children: folder.children.map(child => {
              if (child.type === 'folder' && child.id === renamingFolder) {
                return { ...child, name: newFolderName.trim() };
              }
              return child;
            })
          };
        }
        return folder;
      });
    });

    cancelRenaming();
  };

  // Function to generate random apps (this was missing)
  const generateRandomApps = (): string[] => {
    const apps = ['Chrome', 'Firefox', 'Outlook', 'Word', 'Excel', 'PowerShell', 'CMD', 'FileZilla', 'Notepad', 'VSCode'];
    const numApps = Math.floor(Math.random() * 3) + 1;
    const selectedApps: string[] = [];
    for (let i = 0; i < numApps; i++) {
      const randomApp = apps[Math.floor(Math.random() * apps.length)];
      if (!selectedApps.includes(randomApp)) {
        selectedApps.push(randomApp);
      }
    }
    return selectedApps;
  };

  // Function to generate supportive data (this was missing)
  const generateSupportiveData = (type: string) => {
    const supportiveDataMap: { [key: string]: string[] } = {
      'Login Anomaly': [
        'Multiple failed login attempts detected',
        'Login from unusual location',
        'Login outside business hours'
      ],
      'Data Exfiltration': [
        'Large file transfer detected',
        'Unusual data access patterns',
        'Multiple downloads in short period'
      ],
      'Privilege Escalation': [
        'Unauthorized privilege elevation attempt',
        'Suspicious admin access',
        'Multiple permission changes'
      ],
      // Add more types as needed
    };

    const defaultData = [
      'Suspicious activity detected',
      'Unusual behavior observed',
      'Security alert triggered'
    ];

    const possibleData = supportiveDataMap[type] || defaultData;
    return possibleData[Math.floor(Math.random() * possibleData.length)];
  };

  // Add this function before the return statement
  const renderItemDetails = () => {
    // Show results page when showResults is true
    if (showResults && selectedItem && selectedItem.type === 'file') {
      return renderInvestigationResults();
    }
    
    if (editingItem) {
      // Edit form
      return (
        <div className="edit-investigation-form">
          <div className="form-header">
            <h2>Edit Investigation</h2>
            <div className="form-actions">
              <button className="action-button" onClick={saveInvestigation}>
                <FaSave /> Save
              </button>
              <button className="action-button danger" onClick={cancelEditing}>
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
          
          {/* Form content */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select 
                id="status" 
                name="status" 
                value={formData.status || 'open'} 
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="severity">Severity</label>
              <select 
                id="severity" 
                name="severity" 
                value={formData.severity || 'medium'} 
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="assignedTo">Assigned To</label>
              <input 
                type="text" 
                id="assignedTo" 
                name="assignedTo" 
                value={formData.assignedTo || ''} 
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
          
          {/* Dates section */}
          <div className="form-section date-form-section">
            <h3 className="form-section-title">Dates</h3>
            <div className="form-section-content">
            <div className="date-type-selector">
               
                <button 
                  className={`date-type-btn ${dateInputType === 'range' ? 'active' : ''}`}
                  onClick={() => {
                    // Reset date selection when switching modes using proper Date objects
                    setTempDateSelection({
                      startDate: new Date(),
                      endDate: new Date()
                    });
                    setDateInputType('range');
                    setShowDatePicker(prev => dateInputType !== 'range' || !prev);
                  }}
                >
                  <FaCalendarAlt /> Date Range
                </button>
                
                {/* Remove the Show Calendar button entirely */}
                {/* <button 
                className="date-picker-toggle-btn"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <FaCalendarAlt /> {showDatePicker ? 'Hide Calendar' : 'Show Calendar'}
                </button> */}
                </div>
                
              {showDatePicker && (
                <div className="date-calendar-container">
                  <div className="date-picker-content">
                    <CustomDateRangePicker
                      onChange={handleCalendarDateChange}
                      initialStartDate={tempDateSelection.startDate}
                      initialEndDate={tempDateSelection.endDate}
                      singleDateMode={dateInputType === 'specific'}
                    />
                  </div>
                  
                  <div className="calendar-actions">
                    <button 
                      type="button" 
                      className="add-date-btn"
                      onClick={addDateFromCalendar}
                    >
                      <FaPlus /> Add {dateInputType === 'specific' ? 'Date' : 'Range'}
                    </button>
                    <button 
                      type="button" 
                      className="done-btn"
                      onClick={() => setShowDatePicker(false)}
                    >
                      <FaCheck /> Done
                    </button>
                  </div>
                </div>
              )}
            
                {formData.dates && formData.dates.length > 0 ? (
                  <div className="chips-container">
                {formData.dates.map((date, index) => (
                      <div key={index} className="form-chip">
                    {typeof date === 'string' ? (
                          <div>
                            <FaCalendarDay className="date-chip-icon" />&nbsp;
                      <span>{date}</span>
                          </div>
                    ) : (
                          <div >
                            <FaCalendarAlt className="date-chip-icon" />
                            <span>{date.startDate} <FaArrowRight className="date-arrow" /> {date.endDate}</span>
                          </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeDate(index)}
                          className="remove-date-btn"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
                ) : (
                  <div className="no-dates-message">
                    No dates added yet. {!showDatePicker && "Click 'Show Calendar' to add dates."}
                  </div>
            )}
            </div>
          </div>
          
          {/* Assets section */}
          <div className="form-section">
            <h3 className="form-section-title">Assets</h3>
            <div className="form-section-content">
              <div className="input-group">
                <input 
                  type="text" 
                  value={currentAsset}
                  onChange={(e) => setCurrentAsset(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAsset()}
                  placeholder="Enter email address"
                  className="form-control"
                />
              </div>
              
              {formData.assets && formData.assets.length > 0 ? (
                <div className="chips-container">
                  {formData.assets.map((email, index) => (
                    <div key={index} className="form-chip">
                      <FaEnvelope className="chip-icon" />
                      <span>{email}</span>
                      <button 
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="remove-chip-btn"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items-message">
                  No Assets added yet.
                </div>
              )}
            </div>
          </div>
          
          {/* Domains section */}
          <div className="form-section">
            <h3>Domains</h3>
            <div className="form-input-with-chips">
                <input 
                  type="text" 
                placeholder="Add domain and press Enter (e.g., example.com)"
                  value={currentDomain} 
                  onChange={(e) => setCurrentDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentDomain.trim()) {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      domains: [...(formData.domains || []), currentDomain.trim()]
                    });
                    setCurrentDomain('');
                  }
                }}
                  className="form-control"
                />
              <div className="chips-container">
              {formData.domains?.map((domain, index) => (
                  <div key={index} className="form-chip"><FaGlobe/>{domain}
                    <button 
                      onClick={() => setFormData({
                        ...formData,
                        domains: formData.domains?.filter((_, i) => i !== index)
                      })}
                      className="chip-remove"
                    >
                      ×
                    </button>
                </div>
              ))}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Description</h3>
            <textarea 
              name="description" 
              value={formData.description || ''} 
              onChange={handleInputChange}
              className="form-control description-field"
              rows={5}
            ></textarea>
          </div>
        </div>
      );
    } else if (!selectedItem) {
      return (
        <div className="no-selection">
          <p>Select an investigation to view details</p>
        </div>
      );
    } else if (selectedItem.type === 'folder') {
      return (
        <div className="folder-details">
          <h2>{selectedItem.name}</h2>
          <p>{selectedItem.children.length} items</p>
        </div>
      );
    } else {
      // View investigation details
      const file = selectedItem as InvestigationFile;
      return (
        <div className="file-details">
          <div className="file-details-header">
            <h2>{file.name}</h2>
            <div className="file-actions">
              <button className="action-button" onClick={() => startEditing(file)}>
                <FaEdit /> Edit
              </button>
              <button className="action-button" onClick={() => setShowResults(true)}>
                <FaSearch /> Investigate
              </button>
            </div>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`status-badge ${file.status}`}>{file.status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Severity</span>
              <span className={`severity-badge ${file.severity}`}>{file.severity}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span>{file.dateCreated}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <span>{file.assignedTo}</span>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Dates</h3>
            <div className="details-chips">
              {file.dates && file.dates.length > 0 ? (
                file.dates.map((date, index) => (
                  <div key={index} className="detail-chip">
                    {typeof date === 'string' ? 
                      date : 
                      `${date.startDate} - ${date.endDate}`
                    }
                    </div>
                ))
              ) : (
                <span className="no-data">No dates specified</span>
              )}
                </div>
              </div>
          
          <div className="details-section">
            <h3>Assets</h3>
            <div className="details-chips">
              {file.assets && file.assets.length > 0 ? (
                file.assets.map((email, index) => (
                  <div key={index} className="detail-chip">
                    {email}
                </div>
                ))
              ) : (
                <span className="no-data">No Assets specified</span>
              )}
                </div>
              </div>
          
          <div className="details-section">
            <h3>Domains</h3>
            <div className="details-chips">
              {file.domains && file.domains.length > 0 ? (
                file.domains.map((domain, index) => (
                  <div key={index} className="detail-chip">
                    {domain}
                  </div>
                ))
              ) : (
                <span className="no-data">No domains specified</span>
              )}
            </div>
          </div>
          
          <div className="description-card">
            <h3>Description</h3>
            <p>{file.description}</p>
          </div>
        </div>
      );
    }
  };


  const [sidebarWidth, setSidebarWidth] = useState(25); // Initialize width as a percentage
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialWidth = sidebarRef.current ? sidebarRef.current.clientWidth / window.innerWidth * 100 : 25;
    setSidebarWidth(initialWidth);
  }, []);

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 15 && newWidth <= 85) { // Constraints for sidebar width
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


  // Add this utility function to fix TypeScript errors
  const updateArrayState = <T,>(current: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) => {
    setter([...current, value]);
  };

  // For issue #4 & #5: Add multi-domain, assets, and date range functionality to form
  // In the handleInputChange function, add this logic:
  const handleDomainInput = (value: string) => {
    setFormData(prev => ({
      ...prev,
      domains: value.split(';').map(d => d.trim()).filter(d => d)
    }));
  };

  const handleAssetInput = (value: string) => {
    setFormData(prev => ({
      ...prev,
      assets: value.split(';').map(t => t.trim()).filter(t => t)
    }));
  };

  // Add a helper function to get journey events for a specific lead
  const getJourneyEventsForLead = (leadId: string) => {
    // In a real app, you would filter the events based on the lead ID
    // For now, just return sample data for demonstration
    return [
      {
        time: "09:32:15",
        timeDiff: "Start",
        action: "User Login",
        additionalInfo: "Login from IP 192.168.1.105 (New York, USA)"
      },
      {
        time: "09:45:22",
        timeDiff: "+13m",
        action: "Accessed HR Database",
        additionalInfo: "Queried employee salary information"
      },
      {
        time: "10:01:38",
        timeDiff: "+16m",
        action: "File Download",
        additionalInfo: "Downloaded employeeSalaries.xlsx (2.3MB)"
      },
      {
        time: "10:06:45",
        timeDiff: "+5m",
        action: "Email Sent",
        additionalInfo: "To: external@competitor.com, Subject: 'Requested Information'"
      }
    ];
  };

  // Add a loading state to track when investigation is in progress
  const [isInvestigating, setIsInvestigating] = useState(false);

  // Modify the function that handles investigation button click
  const handleInvestigateClick = () => {
    setIsInvestigating(true);
    
    // Simulate investigation process with a 2-second delay
    setTimeout(() => {
      setIsInvestigating(false);
      setShowResults(true);
    }, 2000);
  };

  // Add these states to your component
  const [dateType, setDateType] = useState('range'); // 'specific' or 'range'
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
  });
  // Add this state to control the date picker visibility (hide by default)
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Function to handle date range selection
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Replace the renderDateSelector function with this enhanced version
  const renderDateSelector = () => {
    return (
      <div className="date-selector-container">
        <div className="date-selector-header">
          <h3>Time Frame</h3>
          <div className="date-type-toggle">
        <button 
              className={`toggle-btn ${dateType === 'specific' ? 'active' : ''}`}
              onClick={() => setDateType('specific')}
        >
              Specific Date
        </button>
            <button 
              className={`toggle-btn ${dateType === 'range' ? 'active' : ''}`}
              onClick={() => setDateType('range')}
            >
              Date Range
            </button>
          </div>
        </div>
        
        {showDatePicker && (
          <div className="date-picker-dropdown">
            <CustomDateRangePicker
              onChange={handleDateRangeChange}
              initialStartDate={dateRange.startDate}
              initialEndDate={dateRange.endDate}
            />
            <div className="date-picker-actions">
              <button 
                className="date-apply-btn"
                onClick={() => setShowDatePicker(false)}
              >
                Apply
              </button>
              <button 
                className="date-cancel-btn"
                onClick={() => setShowDatePicker(false)}
              >
                Cancel
              </button>
                        </div>
                              </div>
        )}
        
        <div className="date-display" onClick={() => setShowDatePicker(!showDatePicker)}>
          {dateType === 'specific' ? (
            <div className="selected-date">
              <FaCalendarAlt />
              <span>{format(dateRange.startDate, 'MMM dd, yyyy')}</span>
                            </div>
          ) : (
            <div className="selected-date-range">
              <div className="date-range-item">
                <span className="date-label">From</span>
                <span className="date-value">{format(dateRange.startDate, 'MMM dd, yyyy')}</span>
                          </div>
              <div className="date-separator"></div>
              <div className="date-range-item">
                <span className="date-label">To</span>
                <span className="date-value">{format(dateRange.endDate, 'MMM dd, yyyy')}</span>
              </div>
            </div>
          )}
          </div>
      </div>
    );
  };

  // Update the selected date display in the results section
  const renderSelectedDateCards = () => {
    return (
      <div className="selected-date-cards">
        <h3 className="section-title">INVESTIGATION TIMEFRAME</h3>
        <div className="timeframe-cards">
          {dateType === 'specific' ? (
            <div className="timeframe-card specific-date">
              <div className="timeframe-icon">
                <FaCalendarAlt />
              </div>
              <div className="timeframe-details">
                <span className="timeframe-label">Specific Date</span>
                <span className="timeframe-value">{format(dateRange.startDate, 'MMMM dd, yyyy')}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="timeframe-card start-date">
                <div className="timeframe-icon">
                  <FaCalendarAlt />
                </div>
                <div className="timeframe-details">
                  <span className="timeframe-label">Start Date</span>
                  <span className="timeframe-value">{format(dateRange.startDate, 'MMMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="timeframe-card end-date">
                <div className="timeframe-icon">
                  <FaCalendarAlt />
                </div>
                <div className="timeframe-details">
                  <span className="timeframe-label">End Date</span>
                  <span className="timeframe-value">{format(dateRange.endDate, 'MMMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="timeframe-card duration">
                <div className="timeframe-icon">
                  <FaHistory />
                </div>
                <div className="timeframe-details">
                  <span className="timeframe-label">Duration</span>
                  <span className="timeframe-value">
                    {Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Add state for temporary date selection
  const [tempDateSelection, setTempDateSelection] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
  });

  // Handle date change from calendar
  const handleCalendarDateChange = (range) => {
    setTempDateSelection(range);
  };

  // Function to add the date from calendar to form data
  const addDateFromCalendar = () => {
    if (dateInputType === 'specific') {
      // Format date for display
      const formattedDate = format(tempDateSelection.startDate, 'yyyy-MM-dd');
      if (!formData.dates) {
        setFormData({
          ...formData,
          dates: [formattedDate]
        });
      } else if (!formData.dates.includes(formattedDate)) {
        setFormData({
          ...formData,
          dates: [...formData.dates, formattedDate]
        });
      }
    } else {
      // Adding a date range
      const startFormatted = format(tempDateSelection.startDate, 'yyyy-MM-dd');
      const endFormatted = format(tempDateSelection.endDate, 'yyyy-MM-dd');
      
      // Check if this exact range already exists
      const rangeExists = formData.dates?.some(date => {
        if (typeof date === 'object' && date.startDate && date.endDate) {
          return date.startDate === startFormatted && date.endDate === endFormatted;
        }
        return false;
      });
      
      if (!rangeExists) {
        setFormData({
          ...formData,
          dates: [
            ...(formData.dates || []), 
            { 
              startDate: startFormatted, 
              endDate: endFormatted 
            }
          ]
        });
      }
    }
    
    // Reset the date selection after adding
    setTempDateSelection({
      startDate: new Date(),
      endDate: new Date()
    });
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

  // Update the New Folder/File menu that appears when clicking the plus button
  const renderNewItemMenu = (parentId: string | undefined) => {
    return (
      <div className="new-item-menu">
        <button 
          className="menu-item create-folder-btn"
          onClick={(e) => {
    e.stopPropagation();
            handleNewFolder(parentId || null);
            setShowNewItemMenu({ show: false });
          }}
        >
          <FaFolder /> New Folder
        </button>
        <button 
          className="menu-item create-file-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleNewFile(parentId || null);
            setShowNewItemMenu({ show: false });
          }}
        >
          <ContentPasteSearchIcon /> New Investigation
        </button>
      </div>
    );
  };

  // Improved function to handle creating a new folder
  const handleNewFolder = (parentId: string | null) => {
    console.log('Creating new folder with parentId:', parentId);
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
    console.log('New folder:', newFolder);
    if (parentId === null) {
      // Add as a root folder
      setFolderData(prevFolders => [...prevFolders, newFolder]);
    } else {
      // Add as a child folder
      setFolderData(prevFolders => updateFolderTreeWithNewItem(prevFolders, parentId, newFolder));
    }
  };

  // Helper function to update the folder tree with a new item (folder or file)
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
          isOpen: false, // Open the folder when adding an item
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
          children: folder.children.map(child => {
            if (child.type === 'folder' && child.id === parentId) {
              console.log('Found target subfolder, adding item'); // Debugging
              return {
                ...child,
                isOpen: false,
                children: [...(child as InvestigationFolder).children, newItem]
              };
            }
            return child;
          })
        };
      }
      return folder;
    });
  };

  // Add the handleNewFile function
  const handleNewFile = (parentId: string | null) => {
    // Get user input for the new file
    const fileName = prompt('Enter investigation name:');
    if (!fileName || fileName.trim() === '') return;
    
    // Create a new file ID
    const newFileId = `file-${Date.now()}`;
    
    // Create a new investigation file
    const newFile: InvestigationFile = {
      id: newFileId,
      name: fileName.trim(),
      type: 'file',
      status: 'open',
      severity: 'medium',
      dateCreated: new Date().toISOString().split('T')[0],
      dates: [],
      assets: [], // Changed from trashMails
      domains: [],
      description: '',
      assignedTo: ''
    };
    
    if (parentId === null) {
      // Add to top-level folders - find first folder to add it to
      if (folderData.length > 0) {
        setFolderData(prevFolders => {
          const firstFolder = prevFolders[0];
          return [
            {
              ...firstFolder,
              isOpen: false,
              children: [...firstFolder.children, newFile]
            },
            ...prevFolders.slice(1)
          ];
        });
      }
    } else {
      // Add to specified folder
      setFolderData(prevFolders => {
        return updateFolderTreeWithNewItem(prevFolders, parentId, newFile);
      });
    }
  };

  // Add this helper function to update a file in the folder structure
  const updateFileInFolderStructure = (
    folders: InvestigationFolder[],
    fileId: string,
    updatedFile: InvestigationFile
  ): InvestigationFolder[] => {
    return folders.map(folder => {
      // Check if the file is directly in this folder
      const fileIndex = folder.children.findIndex(child => 
        child.type === 'file' && child.id === fileId
      );
      
      if (fileIndex !== -1) {
        // File found, update it
        const updatedChildren = [...folder.children];
        updatedChildren[fileIndex] = updatedFile;
        return { ...folder, children: updatedChildren };
      }
      
      // Check in subfolders
      if (folder.children.some(child => child.type === 'folder')) {
        return {
          ...folder,
          children: [
            ...folder.children.filter(child => child.type === 'file'),
            ...updateFileInFolderStructure(
              folder.children.filter(child => child.type === 'folder') as InvestigationFolder[],
              fileId,
              updatedFile
            )
          ]
        };
      }
      
      return folder;
    });
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

  // Helper function to update a folder name
  const updateFolderName = (
    folders: InvestigationFolder[],
    folderId: string,
    newName: string
  ): InvestigationFolder[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, name: newName };
      }
      
      // Check in subfolders
      if (folder.children.some(child => child.type === 'folder')) {
        return {
          ...folder,
          children: [
            ...folder.children.filter(child => child.type === 'file'),
            ...updateFolderName(
              folder.children.filter(child => child.type === 'folder') as InvestigationFolder[],
              folderId,
              newName
            )
          ]
        };
      }
      
      return folder;
    });
  };

  // Function to rename an item
  const renameItem = (itemId: string, newName: string) => {
    setFolderData(prevFolders => {
      // Still use your existing updateItemName function
      const updateItemName = (items: (InvestigationFolder | InvestigationFile)[]): (InvestigationFolder | InvestigationFile)[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, name: newName };
          }
          if (item.type === 'folder') {
            return {
              ...item,
              children: updateItemName(item.children)
            };
          }
          return item;
        });
      };

      // Cast the result to ensure it's typed correctly for the top level
      return updateItemName(prevFolders) as InvestigationFolder[];
    });
  };

  // Fix the handleEllipsis function for file menu
  const handleEllipsis = (e: React.MouseEvent, item: InvestigationItem) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Ellipsis clicked for:", item.id); // Debug
    
    // Set menu position relative to the clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      top: rect.top,
      left: rect.left
        });
    
    // Show the appropriate menu based on item type
    if (item.type === 'folder') {
      setShowFolderMenu({ show: true, folderId: item.id });
      setShowFileMenu({ show: false });
    } else {
      setShowFileMenu({ show: true, fileId: item.id });
      setShowFolderMenu({ show: false });
    }
    
    setOverlayVisible(true);
  };

  // Fix the renderFileItem function to properly attach the ellipsis handler
  const renderFileItem = (file: InvestigationFile) => {
  return (
      <div 
        key={file.id}
        className={`file-item ${selectedItem?.id === file.id ? 'selected' : ''}`}
        onClick={() => selectFile(file)}
      >
        <div className="file-content">
          <ContentPasteSearchIcon className="file-icon" />
          <span className="file-name">{file.name}</span>
        </div>
        <button 
          className="action-button"
          onClick={(e) => handleEllipsis(e, file)}
        >
          <FaEllipsisH />
        </button>
      </div>
    );
  };

  // Function to handle creating a new investigation
  const handleNewInvestigation = (parentId: string | null) => {
    const fileName = prompt('Enter investigation name:');
    if (!fileName || fileName.trim() === '') return;
    
    console.log('Creating new investigation with parentId:', parentId);

    const newFileId = `file-${Date.now()}`;
    const newFile: InvestigationFile = {
      id: newFileId,
      name: fileName.trim(),
      type: 'file',
      status: 'open',
      severity: 'medium',
      dateCreated: new Date().toISOString().split('T')[0],
      dates: [],
      assets: [], // Changed from trashMails
      domains: [],
      description: '',
      assignedTo: ''
    };

    console.log('New investigation file:', newFile);

    if (parentId === null) {
      // Add to the first root folder
      if (folderData.length > 0) {
        setFolderData(prevFolders => {
          const firstFolder = prevFolders[0];
          return [
            {
              ...firstFolder,
              isOpen: false,
              children: [...firstFolder.children, newFile]
            },
            ...prevFolders.slice(1)
          ];
        });
      } else {
        // Create a new root folder if none exists
        const newFolder: InvestigationFolder = {
          id: `folder-${Date.now()}`,
          name: 'Investigations',
          type: 'folder',
          children: [newFile],
          isOpen: false
        };
        setFolderData([newFolder]);
      }
    } else {
      // Add to specified folder
      setFolderData(prevFolders => updateFolderTreeWithNewItem(prevFolders, parentId, newFile));
    }
    
    // Optionally select the new file
    setSelectedItem(newFile);
  };

  // File action menu
  {showFileMenu.show && (
    <div 
      className="action-menu"
      style={{ 
        top: `${menuPosition.top}px`, 
        left: `${menuPosition.left}px`,
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        position: 'absolute'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="menu-item"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Rename file button clicked');
          
          if (showFileMenu.fileId) {
            const file = findFileById(showFileMenu.fileId);
            if (file) {
              const newName = prompt("Enter new file name:", file.name);
              if (newName && newName.trim() !== "") {
                renameItem(showFileMenu.fileId, newName.trim());
                
                // If this file is currently selected, update the selected item too
                if (selectedItem && selectedItem.id === showFileMenu.fileId) {
                  setSelectedItem({
                    ...selectedItem,
                    name: newName.trim()
                  });
                }
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
          console.log('Edit file button clicked');
          
          if (showFileMenu.fileId) {
            const file = findFileById(showFileMenu.fileId);
            if (file) {
              startEditing(file);
            }
          }
          
          setShowFileMenu({ show: false });
          setOverlayVisible(false);
        }}
      >
        <FaEdit /> Edit
      </button>
      <button 
        className="menu-item delete-action"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Delete file button clicked');
          
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

  // Add this effect to load saved data when component mounts
  useEffect(() => {
    // Load saved investigation data from localStorage
    const loadSavedData = () => {
      try {
        const savedFolderData = localStorage.getItem('investigationFolderData');
        const savedSelectedItemId = localStorage.getItem('investigationSelectedItemId');
        
        if (savedFolderData) {
          const parsedData = JSON.parse(savedFolderData);
          setFolderData(parsedData);
          console.log('Loaded saved folder data');
        }
        
        if (savedSelectedItemId && savedFolderData) {
          // Find item directly without setTimeout
          const parsedData = JSON.parse(savedFolderData);
          const findItemById = (id: string, items: (InvestigationFolder | InvestigationFile)[]): InvestigationItem | null => {
            for (const item of items) {
              if (item.id === id) return item;
              if (item.type === 'folder') {
                const foundInChildren = findItemById(id, (item as InvestigationFolder).children);
                if (foundInChildren) return foundInChildren;
              }
            }
            return null;
          };
          
          const foundItem = findItemById(savedSelectedItemId, parsedData);
          if (foundItem) {
            setSelectedItem(foundItem);
            console.log('Restored selected item');
          }
        }
      } catch (error) {
        console.error('Error loading saved investigation data:', error);
      }
    };
    
    loadSavedData();
  }, []);

  // Add this effect to save data when it changes
  useEffect(() => {
    // Save folder data to localStorage whenever it changes
    if (folderData.length > 0) {
      localStorage.setItem('investigationFolderData', JSON.stringify(folderData));
      console.log('Saved folder data to localStorage');
    }
  }, [folderData]);

  // Add this effect to save selected item when it changes
  useEffect(() => {
    // Save selected item ID to localStorage whenever it changes
    if (selectedItem) {
      localStorage.setItem('investigationSelectedItemId', selectedItem.id);
      console.log('Saved selected item ID:', selectedItem.id);
    }
  }, [selectedItem]);

  // Add a function to manually save state (can be called when navigating away)
  const saveInvestigationsState = () => {
    localStorage.setItem('investigationFolderData', JSON.stringify(folderData));
    if (selectedItem) {
      localStorage.setItem('investigationSelectedItemId', selectedItem.id);
    }
    console.log('Manually saved investigation state');
  };

  // Add this to clean up when component unmounts
  useEffect(() => {
    const saveFunction = () => {
      // Save state one last time when component unmounts
      localStorage.setItem('investigationFolderData', JSON.stringify(folderData));
      if (selectedItem) {
        localStorage.setItem('investigationSelectedItemId', selectedItem.id);
      }
    };
    
    return saveFunction;
  }, [folderData, selectedItem]); // These dependencies are correct

  // 1. Fix the file item's ellipsis click handler - find this function:
  const handleFileContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get position from the clicked element
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Set absolute pixel positions instead of percentages
    setMenuPosition({
      top: rect.top,
      left: rect.left
    });
    
    setShowFileMenu({ show: true, fileId });
    setOverlayVisible(true);
  };

  // Fix the type of newItemMenuStyle state
  const [newItemMenuStyle, setNewItemMenuStyle] = useState<React.CSSProperties>({
  });

  const newRootButton = document.getElementById('new-root-button.ID');

  // Also fix the type in the useEffect
  useEffect(() => {
    if (showNewItemMenu.show && newRootButton) {
      const rect = newRootButton.getBoundingClientRect();
      console.log(rect.top, rect.left);
      setNewItemMenuStyle({
        position: 'absolute',
        top: `${rect.top - rect.height }px`,
        left: `${rect.left}px`,
        padding: '8px',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      });
    }
  }, [showNewItemMenu.show, newRootButton]);

  
  // 4. Make sure the file item component uses the handler correctly (in the render function)
  <div className="file-item-actions">
    <button 
      className="context-menu-trigger" 
      onClick={(e) => {
        // Make sure we're passing a valid file ID from the current context
        const fileId = currentFile?.id || '';
        handleFileContextMenu(e, fileId);
      }}
    >
      <FaEllipsisH />
    </button>
  </div>

  // 5. Update the action menu positions to use the dynamically calculated positions:
  {showFileMenu.show && (
    <div 
      className="action-menu"
      style={{ 
        position: 'absolute',
        top: `${menuPosition.top}px`, // Use pixels instead of percentages
        left: `${menuPosition.left}px`, // Use pixels instead of percentages
        padding: '0.6rem',
        borderRadius: '0.4rem',
        boxShadow: '0 0.15rem 0.75rem rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Menu contents */}
    </div>
  )}

  // Do the same for the other menus (folder menu and new item menu)

  // New state to hold generated policies
  const [generatedPolicies, setGeneratedPolicies] = useState<PolicyNode[]>([]);
  
  // Function to generate policies from investigations
  const generatePolicies = () => {
    // Check if we have a selected investigation
    if (!selectedItem || selectedItem.type !== 'file') {
      alert('Please select an investigation first to generate relevant policies');
      return;
    }

    const investigation = selectedItem as InvestigationFile;
    let policies: PolicyNode[] = [];

    // Create tailored policies based on the investigation type
    if (investigation.name.includes('Gift Card') || investigation.description.includes('gift card')) {
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: 'Gift Card Abuse Detection',
      color: '#8B0000',
      subPoliciesNodes: [
          { 
            label: [
              { label: 'Gift Card Abuse Thresholds:', type: 'string', enabled: true },
              { 
                label: 'redemption frequency >', type: 'operator', 
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'redemption frequency' },
                rightParam: { type: 'input', value: '5 per day' }
              },
              { 
                label: 'distinct IPs >', type: 'operator', 
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'distinct IPs' },
                rightParam: { type: 'input', value: '3' }
              },
              { label: 'Velocity Patterns:', type: 'string', enabled: true },
              { 
                label: 'time between redemptions', type: 'timeInput',
                timeFormat: 'duration',
                enabled: true,
                value: '10m'
              },
              { 
                label: 'suspicious pattern score >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'suspicious pattern score' },
                rightParam: { type: 'input', value: '0.75' }
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-1`,
            description: 'Tracks unusual redemption patterns across user accounts'
          }
      ],
      icon: <FaBug color="#8B0000" />,
        description: 'Comprehensive policy to detect and prevent gift card abuse patterns through multi-factor analysis of redemption data, transaction volumes, and user behavior.'
      });
      
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: 'Wallet Creation Anomaly Detection',
        color: '#800080',
        subPoliciesNodes: [
          { 
            label: [
              { label: 'Wallet Creation Parameters:', type: 'string', enabled: true },
              { 
                label: 'new wallets per hour >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'new wallets per hour' },
                rightParam: { type: 'input', value: '15' }
              },
              { 
                label: 'monitoring window', type: 'timeInput',
                timeFormat: 'duration',
                enabled: true,
                value: '4h' 
              },
              { label: 'Connection Analysis:', type: 'string', enabled: true },
              { 
                label: 'wallet cluster size >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'wallet cluster size' },
                rightParam: { type: 'input', value: '3' }
              },
              { 
                label: 'transfer velocity', type: 'stringInput',
                enabled: true,
                value: 'HIGH'
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-2`,
            description: 'Detects unusual wallet creation patterns and suspicious transfer networks'
          }
        ],
        icon: <FaSync color="#800080" />,
        description: 'Policy designed to identify fake wallet creation and suspicious transfer patterns that indicate potential money laundering or fraud rings.'
      });
    }
    
    else if (investigation.name.includes('ATO') || investigation.description.includes('account takeover')) {
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: 'Account Takeover Prevention',
        color: '#004D99',
        subPoliciesNodes: [
          { 
            label: [
              { label: 'Login Anomaly Detection:', type: 'string', enabled: true },
              { 
                label: 'geo-distance between logins >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'geo-distance between logins' },
                rightParam: { type: 'input', value: '500km' }
              },
              { 
                label: 'time between logins <', type: 'operator',
                operatorType: 'lt',
                enabled: true,
                leftParam: { type: 'string', value: 'time between logins' },
                rightParam: { type: 'input', value: '2h' }
              },
              { label: 'Credential Manipulation:', type: 'string', enabled: true },
              { 
                label: 'password resets in window >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'password resets in window' },
                rightParam: { type: 'input', value: '2' }
              },
              { 
                label: 'observation window', type: 'timeInput',
                timeFormat: 'duration',
                enabled: true,
                value: '48h'
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-3`,
            description: 'Monitors impossible travel scenarios and suspicious account modifications'
          }
        ],
        icon: <FaLock color="#004D99" />,
        description: 'Advanced policy for detecting and preventing account takeover attempts through analysis of login patterns, credential usage, and account modifications.'
      });
    }
    
    else if (investigation.name.includes('Data') || investigation.description.includes('data breach') || investigation.description.includes('exfiltration')) {
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: 'Data Exfiltration Detection',
        color: '#CC5500',
        subPoliciesNodes: [
          { 
            label: [
              { label: 'Data Transfer Monitoring:', type: 'string', enabled: true },
              { 
                label: 'outbound data volume >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'outbound data volume' },
                rightParam: { type: 'input', value: '50MB' }
              },
              { 
                label: 'external uploads frequency >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'external uploads frequency' },
                rightParam: { type: 'input', value: '10' }
              },
              { label: 'Sensitive Data Access:', type: 'string', enabled: true },
              { 
                label: 'sensitive files accessed >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'sensitive files accessed' },
                rightParam: { type: 'input', value: '15' }
              },
              { 
                label: 'detection window', type: 'timeInput',
                timeFormat: 'duration',
                enabled: true,
                value: '12h'
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-4`,
            description: 'Identifies unusual data transfer patterns and sensitive information access'
          }
        ],
        icon: <FaDatabase color="#CC5500" />,
        description: 'Comprehensive data loss prevention policy that monitors for potential exfiltration through analysis of data transfers, file access patterns, and API usage.'
      });
    }
    
    else if (investigation.name.includes('Payment') || investigation.description.includes('payment') || investigation.description.includes('credit card')) {
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: 'Payment Fraud Detection',
        color: '#006400',
        subPoliciesNodes: [
          { 
            label: [
              { label: 'Transaction Velocity Rules:', type: 'string', enabled: true },
              { 
                label: 'transactions per minute >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'transactions per minute' },
                rightParam: { type: 'input', value: '3' }
              },
              { 
                label: 'monitoring duration', type: 'timeInput',
                timeFormat: 'duration',
                enabled: true,
                value: '15m'
              },
              { label: 'Card Testing Indicators:', type: 'string', enabled: true },
              { 
                label: 'low-value transactions count >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'low-value transactions count' },
                rightParam: { type: 'input', value: '5' }
              },
              { 
                label: 'distinct cards used >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'distinct cards used' },
                rightParam: { type: 'input', value: '2' }
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-5`,
            description: 'Detects card testing patterns and abnormal transaction velocities'
          }
        ],
        icon: <FaCreditCard color="#006400" />,
        description: 'Advanced fraud detection policy for payment systems, analyzing transaction patterns, card testing behavior, and post-purchase dispute trends.'
      });
    }
    
    else if (investigation.name.includes('Return') || investigation.description.includes('return policy')) {
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: 'Return Policy Abuse Detection',
        color: '#B8860B',
        subPoliciesNodes: [
          { 
            label: [
              { label: 'Return Pattern Analysis:', type: 'string', enabled: true },
              { 
                label: 'return frequency >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'return frequency' },
                rightParam: { type: 'input', value: '4 per month' }
              },
              { 
                label: 'time between purchase and return <', type: 'operator',
                operatorType: 'lt',
                enabled: true,
                leftParam: { type: 'string', value: 'time between purchase and return' },
                rightParam: { type: 'input', value: '48h' }
              },
              { label: 'Account Linking:', type: 'string', enabled: true },
              { 
                label: 'accounts with shared attributes >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'accounts with shared attributes' },
                rightParam: { type: 'input', value: '3' }
              },
              { 
                label: 'risk scoring threshold', type: 'stringInput',
                enabled: true,
                value: 'MEDIUM'
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-6`,
            description: 'Identifies coordinated return abuse across multiple accounts with linked attributes'
          }
        ],
        icon: <FaExchangeAlt color="#B8860B" />,
        description: 'Policy to detect systematic return policy abuse by monitoring return patterns, purchase behavior, and account relationships.'
      });
    }
    
    // Default generic policies if none of the specific categories match
    if (policies.length === 0) {
      // Create default policy based on investigation name and details
      policies.push({
        id: `policy-${Date.now()}-${Math.random()}`,
        label: `Policy for ${investigation.name}`,
        color: '#483D8B',
        subPoliciesNodes: [
          { 
            label: [
              { label: 'Anomaly Detection Parameters:', type: 'string', enabled: true },
              { 
                label: 'anomaly score >', type: 'operator',
                operatorType: 'gt',
                enabled: true,
                leftParam: { type: 'string', value: 'anomaly score' },
                rightParam: { type: 'input', value: '0.7' }
              },
              { 
                label: 'detection sensitivity', type: 'stringInput',
                enabled: true,
                value: 'HIGH'
              },
              { label: 'Monitoring Configuration:', type: 'string', enabled: true },
              { 
                label: 'scan interval', type: 'timeInput',
                timeFormat: 'duration',
                enabled: true,
                value: '4h'
              },
              { 
                label: 'alerting threshold >=', type: 'operator',
                operatorType: 'gte',
                enabled: true,
                leftParam: { type: 'string', value: 'alerting threshold' },
                rightParam: { type: 'input', value: investigation.severity === 'critical' ? '0.85' : '0.75' }
              }
            ],
            type: 'default',
            id: `sub-${Date.now()}-7`,
            description: 'Configurable anomaly detection system with adaptive thresholds'
          }
        ],
        icon: <FaShieldAlt color="#483D8B" />,
        description: `Custom policy created from investigation "${investigation.name}" to monitor relevant assets and detect similar security incidents in the future.`
      });
    }

    // Set the policies state and scroll to show the results
    setGeneratedPolicies(policies);
    
    setTimeout(() => {
      const generatedPoliciesElement = document.querySelector('.generated-policies');
      if (generatedPoliciesElement) {
        generatedPoliciesElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 100);
  };

  // Modify the navigateToSignals function to include source investigation ID
  const navigateToSignals = (policy: PolicyNode) => {
    console.log('Original policy:', policy);
    
    // Get the current investigation ID
    const sourceInvestigationId = selectedItem && selectedItem.type === 'file' 
      ? selectedItem.id 
      : null;
      
    if (!sourceInvestigationId) {
      alert('Please select an investigation first');
      return;
    }
    
    // Create a completely new policy object with only enabled nodes
    const formattedPolicy = {
      ...policy,
      sourceInvestigationId, // Add the source investigation ID
      // Replace the entire subPoliciesNodes array with a filtered version
      subPoliciesNodes: [] // Will be populated with only enabled nodes
    };
    
    // Extract only enabled NodeType items from the nested structure
    if (policy.subPoliciesNodes && policy.subPoliciesNodes.length > 0) {
      policy.subPoliciesNodes.forEach(subPolicy => {
        if (Array.isArray(subPolicy.label)) {
          // Only keep nodes that don't have enabled: false
          const enabledNodes = subPolicy.label.filter(node => node.enabled !== false);
          
          // Only add to the formatted policy if we have enabled nodes
          if (enabledNodes.length > 0) {
            formattedPolicy.subPoliciesNodes = [
              ...formattedPolicy.subPoliciesNodes,
              ...enabledNodes
            ];
          }
        }
      });
    }
    
    console.log('Formatted policy for Signals:', formattedPolicy);
    
    // Store the filtered policy object in localStorage
    localStorage.setItem('selectedPolicy', JSON.stringify(formattedPolicy));
    
    // Navigate to signals tab
    setActiveTab('signals');
  };

  // Add this useEffect to reset generated signals when switching investigations
  useEffect(() => {
    // Reset generated signals when user selects a different investigation
    if (selectedItem && selectedItem.type === 'file') {
      setGeneratedPolicies([]);
    }
  }, [selectedItem?.id]); // Only depends on the selected item ID changing

  return (
    <div className="investigations-container">
      {/* Overlay for closing menus */}
      {overlayVisible && (
        <div 
          className="menu-overlay" 
          onClick={(e) => {
            // Only close menus if clicking directly on the overlay (not on menus or buttons)
            if (e.target === e.currentTarget) {
            setShowFolderMenu({ show: false });
            setShowFileMenu({ show: false });
            setShowNewItemMenu({ show: false });
            setOverlayVisible(false);
            }
          }}
        />
      )}
      
      {/* Folder action menu */}
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
              console.log('Rename folder button clicked'); 

              if (showFolderMenu.folderId) {
                const newName = prompt("Enter new folder name:");
                if (newName && newName.trim() !== "") {
                  renameItem(showFolderMenu.folderId, newName.trim());
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
              console.log('Create new folder button clicked:', showFolderMenu.folderId);

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
              console.log('Create new investigation button clicked');
              
              if (showFolderMenu.folderId) {
                handleNewInvestigation(showFolderMenu.folderId);
              }
              setShowFolderMenu({ show: false });
              setOverlayVisible(false);
            }}
          >
            <ContentPasteSearchIcon /> New Investigation
          </button>
          <button 
            className="menu-item delete-action"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Delete folder button clicked');

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
      
      {/* File action menu - Add this inside the return statement */}
      {showFileMenu.show && (
        <div 
          className="action-menu"
          style={{ 
            position: 'absolute',
            top: `${menuPosition.top}px`, // Use pixels instead of percentages
            left: `${menuPosition.left}px`, // Use pixels instead of percentages
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
              console.log('Rename file button clicked');
              
              if (showFileMenu.fileId) {
                const file = findFileById(showFileMenu.fileId);
            if (file) {
                  const newName = prompt("Enter new file name:", file.name);
                  if (newName && newName.trim() !== "") {
                    renameItem(showFileMenu.fileId, newName.trim());
                    
                    // If this file is currently selected, update the selected item too
                    if (selectedItem && selectedItem.id === showFileMenu.fileId) {
                      setSelectedItem({
                        ...selectedItem,
                        name: newName.trim()
                      });
                    }
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
              console.log('Edit file button clicked');
              
              if (showFileMenu.fileId) {
                const file = findFileById(showFileMenu.fileId);
            if (file) {
                  startEditing(file);
            }
              }
              
              setShowFileMenu({ show: false });
              setOverlayVisible(false);
            }}
          >
            <FaEdit /> Edit
          </button>
          <button 
            className="menu-item delete-action"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Delete file button clicked');
              
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

      {/* New item menu */}
      {showNewItemMenu.show && (
      <div
        className="action-menu new-item-menu"
        style={newItemMenuStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNewFolder(null);
            setShowNewItemMenu({ show: false });
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
            handleNewInvestigation(null);
            setShowNewItemMenu({ show: false });
            setOverlayVisible(false);
          }}
        >
          <ContentPasteSearchIcon /> New Investigation
        </button>
      </div>
    )}
      
      <div className="investigations-header">
        <h1>Investigations</h1>
        <p>Track and manage security incident investigations</p>
      </div>
      
      <div className="investigation-content">
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
            <button 
              id="new-root-button.ID"
              className="new-root-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewItemMenu({ 
                  show: true, 
                });
                setOverlayVisible(true);
              }}
            >
              <FaPlus />
            </button>
          </div>
          <div className="folder-list">
            {renderFolderStructure(folderData)}
          </div>
        </div>
        
        <div className="details-panel" style={{ width: `${100 - sidebarWidth}%` }}>
          {renderItemDetails()}
        </div>
      </div>

      {/* Add inline styles to fix the CSS issues */}
      <style>{`
        .folder-list {
          overflow-x: hidden;
          width: 100%;
        }
        
        .folder-item, .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          margin: 2px 0;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
        }
        
        .file-item {
          height: 32px; /* Reduced height for file items */
        }
        
        .folder-content, .file-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .action-button {
          background: transparent !important;
          border: none;
          cursor: pointer;
          margin-left: auto;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        
        .action-button:hover {
          transform: scale(1.2);
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          margin: 4px 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s;
          background: transparent;
        }
        
        .menu-item:hover {
          transform: scale(1.05);
          background: rgba(0, 0, 0, 0.05);
        }
        
        .delete-action {
          color: #d9534f;
        }
      `}</style>
      <style>{`
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 900;
          background-color: transparent;
        }
        
        .action-menu {
          position: absolute;
          z-index: 1000 !important;
          background-color: ${darkMode ? '#2a2a2a' : 'white'};
          border: 1px solid ${darkMode ? '#444' : '#ddd'};
        }
        
        .menu-item {
          position: relative;
          z-index: 1001 !important;
          cursor: pointer !important;
          pointer-events: auto !important;
        }
      `}</style>
      <style>{`
        .generated-policies {
          margin-top: 30px;
          padding: 20px;
          background-color: ${darkMode ? '#2a2a2a' : '#f9f9f9'};
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .policies-description {
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: ${darkMode ? '#ccc' : '#666'};
        }
        
        .policies-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .policy-item {
          width: 100%;
          padding: 16px;
          background-color: ${darkMode ? '#333' : 'white'};
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 16px;
        }
        
        .policy-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .policy-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: rgba(0,0,0,0.05);
        }
        
        .policy-description {
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 16px;
          color: ${darkMode ? '#ddd' : '#555'};
        }
        
        .policy-details h5 {
          margin-bottom: 8px;
          font-weight: 600;
        }
        
        .policy-rule {
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        
        .rule-description {
          font-size: 0.8rem;
          color: ${darkMode ? '#aaa' : '#777'};
          margin-top: 2px;
          margin-left: 8px;
          font-style: italic;
        }
        
        .policy-actions {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        
        .send-to-signals {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: ${darkMode ? '#444' : '#f0f0f0'};
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .send-to-signals:hover {
          background-color: ${darkMode ? '#555' : '#e0e0e0'};
        }
      `}</style>
    </div>
  );
};

export default Investigations; 
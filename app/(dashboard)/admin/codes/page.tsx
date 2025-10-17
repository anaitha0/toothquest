'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaTooth,
  FaUsers,
  FaQuestionCircle,
  FaChartBar,
  FaExclamationTriangle,
  FaCog,
  FaClipboardList,
  FaKey,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUserCheck,
  FaPlus,
  FaCopy,
  FaDownload,
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaCheck,
  FaUser,
  FaClock,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaBan
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaUserShield } from 'react-icons/fa6';

// Type definitions
type CodeStatus = 'unused' | 'used' | 'expired';

interface AccessCode {
  id: number;
  code: string;
  package: string;
  status: CodeStatus;
  created_at: string;
  used_by?: {
    id: number;
    full_name: string;
    email: string;
    university: string;
    year: number;
  } | null;
  used_date?: string;
}

interface GenerateCodesResponse {
  message: string;
  codes: AccessCode[];
}

interface CodeStats {
  total: number;
  unused: number;
  used: number;
  expired: number;
  active_users: number;
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('toothquest-token');
  return {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json',
  };
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('toothquest-token');
      localStorage.removeItem('toothquest-user');
      window.location.href = '/login';
      return;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

const SUBSCRIPTION_PLANS = [
  { name: '1st Year Package', price: 1200, prefix: 'TQ1' },
  { name: '2nd Year Package', price: 1800, prefix: 'TQ2' },
  { name: '3rd Year Package', price: 2000, prefix: 'TQ3' },
  { name: '4th Year Package', price: 2200, prefix: 'TQ4' },
  { name: '5th Year Package', price: 2500, prefix: 'TQ5' },
  { name: 'Complete Package', price: 4500, prefix: 'TQC' }
];

export default function AdminCodesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | CodeStatus>('all');
  const [filterPackage, setFilterPackage] = useState<'all' | string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCodes, setTotalCodes] = useState(0);
  const [stats, setStats] = useState<CodeStats>({
    total: 0,
    unused: 0,
    used: 0,
    expired: 0,
    active_users: 0
  });
  const codesPerPage = 20;
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [currentCode, setCurrentCode] = useState<AccessCode | null>(null);
  
  // Generate modal states
  const [selectedPackage, setSelectedPackage] = useState('');
  const [numberOfCodes, setNumberOfCodes] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = localStorage.getItem('toothquest-token');
        const userStr = localStorage.getItem('toothquest-user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.is_admin) {
          toast.error('Access denied. Admin privileges required.');
          router.push('/');
          return;
        }

        setCurrentUser(user);
        await Promise.all([
          loadAccessCodes(),
          loadStats()
        ]);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Failed to load access codes');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const loadAccessCodes = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: codesPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPackage !== 'all') params.append('package', filterPackage);

      const data = await apiCall(`/auth/access-codes/?${params.toString()}`);
      setCodes(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / codesPerPage));
      setTotalCodes(data.count || data.length);
    } catch (error) {
      console.error('Error loading access codes:', error);
      toast.error('Failed to load access codes');
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from the codes data
      const allCodesData = await apiCall('/auth/access-codes/?page_size=1000');
      const allCodes = allCodesData.results || allCodesData;
      
      const newStats: CodeStats = {
        total: allCodes.length,
        unused: allCodes.filter((c: AccessCode) => c.status === 'unused').length,
        used: allCodes.filter((c: AccessCode) => c.status === 'used').length,
        expired: allCodes.filter((c: AccessCode) => c.status === 'expired').length,
        active_users: allCodes.filter((c: AccessCode) => c.status === 'used').length
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Reload codes when filters change
  useEffect(() => {
    if (!isLoading) {
      setCurrentPage(1);
      loadAccessCodes(1);
    }
  }, [searchTerm, filterStatus, filterPackage]);

  // Reload codes when page changes
  useEffect(() => {
    if (!isLoading && currentPage > 1) {
      loadAccessCodes(currentPage);
    }
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  const handleViewCode = (code: AccessCode) => {
    setCurrentCode(code);
    setShowCodeModal(true);
  };

  const generateCodes = async () => {
    if (!selectedPackage || numberOfCodes < 1) {
      toast.error('Please select a package and specify number of codes');
      return;
    }

    if (numberOfCodes > 100) {
      toast.error('Maximum 100 codes can be generated at once');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response: GenerateCodesResponse = await apiCall('/admin/generate-codes/', {
        method: 'POST',
        body: JSON.stringify({
          package: selectedPackage,
          count: numberOfCodes
        }),
      });

      toast.success(response.message);
      setShowGenerateModal(false);
      setSelectedPackage('');
      setNumberOfCodes(1);
      
      // Reload data
      await Promise.all([
        loadAccessCodes(currentPage),
        loadStats()
      ]);
      
      // Auto-download the codes
      downloadCodesPDF(response.codes);
    } catch (error) {
      console.error('Error generating codes:', error);
      toast.error(`Failed to generate codes: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCodesPDF = (codesToDownload: AccessCode[]) => {
    try {
      // Create comprehensive downloadable content
      const header = `ToothQuest Access Codes - Generated on ${new Date().toLocaleDateString()}\n`;
      const separator = '='.repeat(60) + '\n';
      
      const content = header + separator + codesToDownload.map(code => 
        `Code: ${code.code}\nPackage: ${code.package}\nGenerated: ${formatDate(code.created_at)}\nStatus: ${code.status}\n${'-'.repeat(30)}`
      ).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toothquest-access-codes-${selectedPackage.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Codes downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download codes');
    }
  };

  const downloadAllCodes = async () => {
    try {
      setIsLoading(true);
      // Get all codes without pagination
      const data = await apiCall('/auth/access-codes/?page_size=10000');
      const allCodes = data.results || data;
      
      if (allCodes.length === 0) {
        toast.info('No codes available for download');
        return;
      }
      
      downloadCodesPDF(allCodes);
    } catch (error) {
      console.error('Error downloading all codes:', error);
      toast.error('Failed to download codes');
    } finally {
      setIsLoading(false);
    }
  };

  const expireCode = async (codeId: number) => {
    if (!window.confirm('Are you sure you want to expire this access code? This action cannot be undone.')) {
      return;
    }

    try {
      await apiCall(`/auth/access-codes/${codeId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'expired' }),
      });
      
      toast.success('Access code expired successfully');
      await Promise.all([
        loadAccessCodes(currentPage),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error expiring code:', error);
      toast.error('Failed to expire access code');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: CodeStatus) => {
    switch (status) {
      case 'unused': return 'bg-yellow-100 text-yellow-800';
      case 'used': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: CodeStatus) => {
    switch (status) {
      case 'unused': return <FaClock className="h-4 w-4" />;
      case 'used': return <FaCheckCircle className="h-4 w-4" />;
      case 'expired': return <FaBan className="h-4 w-4" />;
      default: return <FaExclamationCircle className="h-4 w-4" />;
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#002F5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading access codes...</p>
        </div>
      </div>
    );
  }

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-[#002F5A] text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition-colors"
        >
          {sidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>

        <div className="px-4">
          <div className="flex items-center mb-10 justify-center">
            {!sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <img 
                  src="/images/ui/logo.png" 
                  alt="ToothQuest Logo" 
                  className="w-32 h-auto object-contain"
                />
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <img 
                  src="/images/ui/logo.png" 
                  alt="ToothQuest Logo" 
                  className="w-12 h-auto object-contain"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {[
              { icon: <FaChartBar size={20} />, name: 'Dashboard', id: 'dashboard', path: '/admin/dashboard' },
              { icon: <FaUsers size={20} />, name: 'Users', id: 'users', path: '/admin/users' },
              { icon: <FaQuestionCircle size={20} />, name: 'Questions', id: 'questions', path: '/admin/questions' },
              { icon: <FaExclamationTriangle size={20} />, name: 'Reported Questions', id: 'reports', path: '/admin/reports' },
              { icon: <FaKey size={20} />, name: 'Access Codes', id: 'codes', path: '/admin/codes' },
              { icon: <FaUserShield size={20} />, name: 'Admin Management', id: 'admin-management', path: '/admin/admins' },
              { icon: <FaClipboardList size={20} />, name: 'Statistics', id: 'statistics', path: '/admin/statistics' },
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/admin/settings' },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === 'codes' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'codes' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'codes' ? 'text-white' : 'text-gray-600'}`}>
                    {item.name}
                  </span>
                )}
                
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-10">
                    <div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}
              </Link>
            ))}

            <button 
              onClick={handleLogout}
              className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative hover:bg-red-50`}
            >
              <div className="text-red-500">
                <FaSignOutAlt size={20} />
              </div>
              
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm font-medium text-red-600">
                  Logout
                </span>
              )}
              
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-10">
                  <div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">
                    Logout
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(currentDate);

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <FaKey className="mr-3 text-[#002F5A]" /> Access Codes Management
              </h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-[#002F5A] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Generate Codes
              </button>
              <button
                onClick={downloadAllCodes}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                disabled={stats.total === 0}
              >
                <FaDownload className="mr-2" /> Download All ({stats.total})
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-blue-50 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Codes</p>
                  <h3 className="text-3xl font-bold text-blue-600">
                    {stats.total.toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaKey className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unused</p>
                  <h3 className="text-3xl font-bold text-yellow-600">
                    {stats.unused.toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Used</p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {stats.used.toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaUserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <h3 className="text-3xl font-bold text-purple-600">
                    {stats.active_users.toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaUser className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black placeholder-blue-400"
                  placeholder="Search codes, users, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | CodeStatus)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                >
                  <option value="all">All Status ({stats.total})</option>
                  <option value="unused">Unused ({stats.unused})</option>
                  <option value="used">Used ({stats.used})</option>
                  <option value="expired">Expired ({stats.expired})</option>
                </select>
                
                <select
                  value={filterPackage}
                  onChange={(e) => setFilterPackage(e.target.value)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                >
                  <option value="all">All Packages</option>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <option key={plan.name} value={plan.name}>{plan.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Codes Table */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {codes.length === 0 ? (
              <div className="text-center py-12">
                <FaKey className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No access codes found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' || filterPackage !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Start by generating some access codes for your students.'
                  }
                </p>
                {(!searchTerm && filterStatus === 'all' && filterPackage === 'all') && (
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className="mt-4 bg-[#002F5A] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
                  >
                    <FaPlus className="mr-2" /> Generate Your First Codes
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {codes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="font-mono text-sm font-semibold text-gray-900">{code.code}</span>
                              <button
                                onClick={() => copyCode(code.code)}
                                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy code"
                              >
                                <FaCopy size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{code.package}</span>
                            <div className="text-xs text-gray-500">
                              {SUBSCRIPTION_PLANS.find(p => p.name === code.package)?.price.toLocaleString()} DA
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(code.status)}`}>
                              {getStatusIcon(code.status)}
                              <span className="ml-1">{code.status.charAt(0).toUpperCase() + code.status.slice(1)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(code.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {code.status === 'used' && code.used_by ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{code.used_by.full_name}</div>
                                <div className="text-sm text-gray-500">{code.used_by.email}</div>
                                <div className="text-xs text-gray-400">
                                  {code.used_by.university} - Year {code.used_by.year}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewCode(code)}
                                className="text-[#002F5A] hover:text-blue-700 flex items-center"
                                title="View details"
                              >
                                <FaEye className="mr-1" />
                              </button>
                              
                              <button
                                onClick={() => copyCode(code.code)}
                                className="text-gray-500 hover:text-gray-700 flex items-center"
                                title="Copy code"
                              >
                                <FaCopy />
                              </button>
                              
                              {code.status === 'unused' && (
                                <button
                                  onClick={() => expireCode(code.id)}
                                  className="text-red-500 hover:text-red-700 flex items-center"
                                  title="Expire code"
                                >
                                  <FaBan />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * codesPerPage) + 1} to {Math.min(currentPage * codesPerPage, totalCodes)} 
                      of {totalCodes} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        <FaChevronLeft />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg transition-colors ${
                              currentPage === page 
                                ? 'bg-[#002F5A] text-white border-[#002F5A]' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>

      {/* Generate Codes Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-[#002F5A] p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Generate Access Codes</h2>
              <button 
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Package *
                  </label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                    disabled={isGenerating}
                  >
                    <option value="">Choose a package...</option>
                    {SUBSCRIPTION_PLANS.map(plan => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name} - {plan.price.toLocaleString()} DA
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Codes *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numberOfCodes}
                    onChange={(e) => setNumberOfCodes(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                    placeholder="Enter number of codes to generate"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum: 100 codes per generation</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Security Features:</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>• Codes use random 6-character combinations</div>
                    <div>• Each code is verified for uniqueness</div>
                    <div>• Package prefix for easy identification</div>
                    <div>• Impossible to guess or predict</div>
                  </div>
                </div>
                
                {selectedPackage && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Generation Preview:</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Package:</span> {selectedPackage}</div>
                      <div><span className="font-medium">Codes to generate:</span> {numberOfCodes.toLocaleString()}</div>
                      <div><span className="font-medium">Price per code:</span> {SUBSCRIPTION_PLANS.find(p => p.name === selectedPackage)?.price.toLocaleString()} DA</div>
                      <div><span className="font-medium">Total value:</span> {((SUBSCRIPTION_PLANS.find(p => p.name === selectedPackage)?.price || 0) * numberOfCodes).toLocaleString()} DA</div>
                      <div><span className="font-medium">Code format:</span> {SUBSCRIPTION_PLANS.find(p => p.name === selectedPackage)?.prefix}-XXXXXX</div>
                    </div>
                  </div>
                )}
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Generated codes will be automatically downloaded as a text file. 
                    You can distribute these codes to students in your university for platform access.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={generateCodes}
                  disabled={isGenerating || !selectedPackage || numberOfCodes < 1}
                  className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Generating...
                    </span>
                  ) : (
                    <>
                      <FaPlus className="mr-1" /> Generate & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Code Details Modal */}
      {showCodeModal && currentCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-[#002F5A] p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Access Code Details</h2>
              <button onClick={() => setShowCodeModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Code Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Code:</span>
                      <div className="flex items-center">
                        <span className="font-mono text-lg font-bold text-[#002F5A]">{currentCode.code}</span>
                        <button
                          onClick={() => copyCode(currentCode.code)}
                          className="ml-2 text-[#002F5A] hover:text-blue-800"
                          title="Copy code"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Package:</span>
                      <span className="text-gray-900">{currentCode.package}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(currentCode.status)}`}>
                        {getStatusIcon(currentCode.status)}
                        <span className="ml-1">{currentCode.status.charAt(0).toUpperCase() + currentCode.status.slice(1)}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Generated:</span>
                      <span className="text-gray-900">{formatDate(currentCode.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="text-green-600 font-bold">
                        {SUBSCRIPTION_PLANS.find(p => p.name === currentCode.package)?.price.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Usage Information</h3>
                  {currentCode.status === 'used' && currentCode.used_by ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Used by:</span>
                        <span className="text-gray-900">{currentCode.used_by.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900">{currentCode.used_by.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">University:</span>
                        <span className="text-gray-900">{currentCode.used_by.university}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Year:</span>
                        <span className="text-gray-900">{currentCode.used_by.year}</span>
                      </div>
                      {currentCode.used_date && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Used on:</span>
                          <span className="text-gray-900">{formatDate(currentCode.used_date)}</span>
                        </div>
                      )}
                    </div>
                  ) : currentCode.status === 'expired' ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaBan className="text-red-600 mr-2" />
                        <span className="text-red-800 font-medium">Code expired</span>
                      </div>
                      <p className="text-red-700 text-sm mt-2">
                        This code has been expired and can no longer be used for registration.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaClock className="text-yellow-600 mr-2" />
                        <span className="text-yellow-800 font-medium">Code not used yet</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-2">
                        This code is available for student registration. Share it with students to give them access to the platform.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                >
                  Close
                </button>
                <button
                  onClick={() => copyCode(currentCode.code)}
                  className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaCopy className="mr-1" /> Copy Code
                </button>
                {currentCode.status === 'unused' && (
                  <button
                    onClick={() => {
                      setShowCodeModal(false);
                      expireCode(currentCode.id);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FaBan className="mr-1" /> Expire Code
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
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
  FaReceipt,
  FaCheck,
  FaTimes,
  FaComments,
  FaEdit,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaKey, FaUserShield } from 'react-icons/fa6';

// Type definitions
interface QuestionReport {
  id: number;
  question: {
    id: number;
    question_text: string;
    module: {
      id: number;
      name: string;
      year: number;
    };
    course: {
      id: number;
      name: string;
    };
    year: number;
    difficulty: string;
  };
  reported_by: {
    id: number;
    full_name: string;
    email: string;
    username: string;
  };
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  admin_response?: string;
  resolved_by?: {
    id: number;
    full_name: string;
    email: string;
  };
  resolved_at?: string;
  created_at: string;
}

interface Module {
  id: number;
  name: string;
  year: number;
  is_active: boolean;
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

export default function AdminReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State management
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredReports, setFilteredReports] = useState<QuestionReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All Modules');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const reportsPerPage = 10;

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [currentReport, setCurrentReport] = useState<QuestionReport | null>(null);
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          loadReports(),
          loadModules()
        ]);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Failed to load page data');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const loadReports = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: reportsPerPage.toString(),
        ordering: '-created_at',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterModule !== 'All Modules') {
        const selectedModule = modules.find(m => m.name === filterModule);
        if (selectedModule) {
          params.append('question__module', selectedModule.id.toString());
        }
      }

      const data = await apiCall(`/questions/reports/?${params.toString()}`);
      setReports(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / reportsPerPage));
      setTotalReports(data.count || data.length);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const loadModules = async () => {
    try {
      const data = await apiCall('/questions/modules/');
      setModules(data.results || data);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  // Reload reports when filters change
  useEffect(() => {
    if (!isLoading) {
      setCurrentPage(1);
      loadReports(1);
    }
  }, [searchTerm, filterModule, filterStatus]);

  // Reload reports when page changes
  useEffect(() => {
    if (!isLoading && currentPage > 1) {
      loadReports(currentPage);
    }
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  const handleViewQuestion = (questionId: number) => {
    // Navigate to question detail or edit page
    router.push(`/admin/questions?id=${questionId}`);
  };

  const handleResolveReport = (report: QuestionReport) => {
    setCurrentReport(report);
    setResolution('');
    setShowModal(true);
  };

  const submitResolution = async () => {
    if (!resolution.trim()) {
      toast.error('Please enter a resolution comment');
      return;
    }
    
    if (!currentReport) return;

    setIsSubmitting(true);
    try {
      await apiCall(`/questions/reports/${currentReport.id}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({
          admin_response: resolution.trim()
        }),
      });

      toast.success('Report has been resolved successfully');
      setShowModal(false);
      setCurrentReport(null);
      setResolution('');
      await loadReports(currentPage);
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error(`Failed to resolve report: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to dismiss this report?')) {
      return;
    }

    try {
      await apiCall(`/questions/reports/${reportId}/dismiss/`, {
        method: 'POST',
      });

      toast.success('Report has been dismissed');
      await loadReports(currentPage);
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast.error(`Failed to dismiss report: ${error}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        {/* Toggle button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-blue-500 text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition-colors"
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
                  item.id === 'reports' ? 'bg-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'reports' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'reports' ? 'text-white' : 'text-gray-600'}`}>
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

            {/* Logout */}
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

  // Create module filter options
  const moduleOptions = ['All Modules', ...modules.map(m => m.name)];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Reported Questions</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {reports.filter(r => r.status === 'pending').length} Pending
              </div>
              <Link 
                href="/admin/questions"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Back to Questions
              </Link>
            </div>
          </div>

          {/* Filters */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row items-stretch gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-blue-400"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex-shrink-0">
                <select
                  className="block w-full py-2 px-3 border-2 border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                >
                  {moduleOptions.map((module, index) => (
                    <option key={index} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-shrink-0 space-x-1">
                <button
                  className={`px-4 py-2 rounded-md ${
                    filterStatus === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    filterStatus === 'pending' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    filterStatus === 'resolved' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                  onClick={() => setFilterStatus('resolved')}
                >
                  Resolved
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${
                    filterStatus === 'dismissed' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } transition-colors`}
                  onClick={() => setFilterStatus('dismissed')}
                >
                  Dismissed
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Reports List */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {reports.length === 0 ? (
              <div className="p-8 text-center">
                <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">No reports found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm || filterModule !== 'All Modules' || filterStatus !== 'all'
                    ? 'Try changing your search or filter criteria'
                    : 'There are no reported questions at this time'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-normal">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {report.question.question_text.length > 80 
                              ? `${report.question.question_text.substring(0, 80)}...`
                              : report.question.question_text
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.question.module.name} • Year {report.question.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {report.reported_by.full_name || report.reported_by.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.reported_by.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(report.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {report.reason.length > 50 
                              ? `${report.reason.substring(0, 50)}...`
                              : report.reason
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewQuestion(report.question.id)}
                              className="text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"
                              title="View Question"
                            >
                              <FaEye />
                            </button>
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleResolveReport(report)}
                                  className="text-green-500 hover:text-green-700 p-1 rounded-md hover:bg-green-50"
                                  title="Resolve Report"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => dismissReport(report.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                                  title="Dismiss Report"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            {report.status === 'resolved' && (
                              <button
                                onClick={() => handleViewQuestion(report.question.id)}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50"
                                title="Edit Question"
                              >
                                <FaEdit />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * reportsPerPage) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * reportsPerPage, totalReports)}
                      </span>{' '}
                      of <span className="font-medium">{totalReports}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Summary Stats */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-yellow-500" /> Reports Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                <p className="text-2xl font-bold text-blue-600">{totalReports}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Dismissed</p>
                <p className="text-2xl font-bold text-gray-600">
                  {reports.filter(r => r.status === 'dismissed').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Resolution Modal */}
      {showModal && currentReport && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Resolve Report</h2>
              <button onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Reported Question</h3>
                <p className="text-gray-700 mb-4">{currentReport.question.question_text}</p>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Module:</span> {currentReport.question.module.name}
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {currentReport.question.year}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {currentReport.question.difficulty}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Report Details</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">{currentReport.reason}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Reported by:</span> {currentReport.reported_by.full_name || currentReport.reported_by.username}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(currentReport.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Comments *
                </label>
                <textarea
                  id="resolution"
                  rows={4}
                  className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-blue-400"
                  placeholder="Describe the actions taken to resolve this report..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex space-x-4 items-center">
                <button
                  onClick={() => handleViewQuestion(currentReport.question.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Question
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-md text-black hover:bg-blue-50 transition-colors bg-white"
                >
                  Cancel
                </button>
                
                <button
                  onClick={submitResolution}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Mark as Resolved
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaBan, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight,
  FaSignOutAlt,
  FaKey,
  FaUserShield,
  FaEye,
  FaTimes,
  FaSave,
  FaUnlock
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Type definitions
type UserStatus = 'active' | 'pending' | 'inactive' | 'blocked' | 'suspended';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  university: string;
  year?: number;
  role: string;
  status: UserStatus;
  subscription_plan: string;
  subscription_expiry?: string;
  avatar?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
  updated_at: string;
}

interface UserProgress {
  user: number;
  total_questions_attempted: number;
  correct_answers: number;
  accuracy_percentage: number;
  total_study_time?: string;
  created_at: string;
  updated_at: string;
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

const PLANS = [
  'All Plans',
  '1st Year Package',
  '2nd Year Package',
  '3rd Year Package',
  '4th Year Package',
  '5th Year Package',
  'Complete Package'
];

const YEARS = [
  'All Years',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year'
];

export default function UserManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('All Plans');
  const [filterYear, setFilterYear] = useState('All Years');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    year: 1,
    subscription_plan: '',
    phone: ''
  });

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
          loadUsers(),
          loadUserStatistics()
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

  const loadUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: usersPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterYear !== 'All Years') {
        const year = parseInt(filterYear.split(' ')[0]);
        params.append('year', year.toString());
      }
      if (filterPlan !== 'All Plans') {
        params.append('subscription_plan', filterPlan);
      }

      const data = await apiCall(`/users/?${params.toString()}`);
      setUsers(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / usersPerPage));
      setTotalUsers(data.count || data.length);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const loadUserStatistics = async () => {
    try {
      const data = await apiCall('/users/statistics/');
      setUserStats(data);
    } catch (error) {
      console.error('Error loading user statistics:', error);
    }
  };

  // Reload users when filters change
  useEffect(() => {
    if (!isLoading) {
      setCurrentPage(1);
      loadUsers(1);
    }
  }, [searchTerm, filterPlan, filterYear, filterStatus]);

  // Reload users when page changes
  useEffect(() => {
    if (!isLoading && currentPage > 1) {
      loadUsers(currentPage);
    }
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  // User action handlers
  const handleActivateUser = async (userId: number) => {
    try {
      await apiCall(`/users/${userId}/activate/`, {
        method: 'POST',
      });
      toast.success('User activated successfully');
      await loadUsers(currentPage);
      await loadUserStatistics();
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error(`Failed to activate user: ${error}`);
    }
  };

  const handleBlockUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        await apiCall(`/users/${userId}/block/`, {
          method: 'POST',
        });
        toast.success('User blocked successfully');
        await loadUsers(currentPage);
        await loadUserStatistics();
      } catch (error) {
        console.error('Error blocking user:', error);
        toast.error(`Failed to block user: ${error}`);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsProcessing(true);
    try {
      await apiCall(`/users/${userToDelete}/delete/`, {
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      await loadUsers(currentPage);
      await loadUserStatistics();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name || '',
      university: user.university || '',
      year: user.year || 1,
      subscription_plan: user.subscription_plan || '',
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      await apiCall(`/users/${selectedUser.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      await loadUsers(currentPage);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: UserStatus) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#002F5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
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
                  item.id === 'users' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'users' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'users' ? 'text-white' : 'text-gray-600'}`}>
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
                <FaUsers className="mr-3 text-[#002F5A]" /> User Management
              </h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <motion.div 
            className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {[
              { 
                label: 'Total Users', 
                value: userStats.total_users || 0, 
                color: 'text-blue-600', 
                bgColor: 'bg-blue-50',
                icon: <FaUsers className="h-6 w-6 text-blue-600" />
              },
              { 
                label: 'Active', 
                value: userStats.active_users || 0, 
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                icon: <FaCheck className="h-6 w-6 text-green-600" />
              },
              { 
                label: 'Pending', 
                value: userStats.pending_users || 0, 
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                icon: <FaChevronRight className="h-6 w-6 text-yellow-600" />
              },
              { 
                label: 'Blocked', 
                value: userStats.blocked_users || 0, 
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                icon: <FaBan className="h-6 w-6 text-red-600" />
              },
              { 
                label: 'This Month', 
                value: users.filter(u => new Date(u.created_at).getMonth() === new Date().getMonth()).length, 
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                icon: <FaUserPlus className="h-6 w-6 text-purple-600" />
              }
            ].map(({ label, value, color, bgColor, icon }) => (
              <div key={label} className={`${bgColor} rounded-xl shadow-sm p-6`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
                  </div>
                  <div className="p-3 bg-white rounded-full">
                    {icon}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              {/* Search Input */}
              <div className="flex-grow relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black placeholder-blue-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select 
                  className="border-2 border-blue-300 rounded-lg py-2 px-3 focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                >
                  {PLANS.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>

                <select 
                  className="border-2 border-blue-300 rounded-lg py-2 px-3 focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-black"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {/* Status Filters */}
                <div className="flex space-x-2">
                  {(['all', 'active', 'pending', 'blocked'] as const).map(status => (
                    <button
                      key={status}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        filterStatus === status 
                          ? 'bg-[#002F5A] text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setFilterStatus(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                            {user.full_name ? user.full_name.charAt(0) : user.username.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.full_name || user.username}</div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{user.university || 'Not specified'}</div>
                        <div className="text-gray-500 text-sm">
                          {user.year ? `Year ${user.year}` : 'Year not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{user.subscription_plan || 'No Plan'}</div>
                        {user.subscription_expiry && (
                          <div className="text-gray-500 text-sm">
                            Expires: {formatDate(user.subscription_expiry)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{formatDate(user.created_at)}</div>
                        {user.last_login && (
                          <div className="text-gray-500 text-sm">
                            Last: {formatDate(user.last_login)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-[#002F5A] hover:text-blue-700 p-1 rounded-md hover:bg-blue-50"
                            title="View User"
                          >
                            <FaEye />
                          </button>

                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-500 hover:text-green-700 p-1 rounded-md hover:bg-green-50"
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              className="text-green-500 hover:text-green-700 p-1 rounded-md hover:bg-green-50"
                              title="Activate User"
                            >
                              <FaCheck />
                            </button>
                          )}
                          
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleBlockUser(user.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                              title="Block User"
                            >
                              <FaBan />
                            </button>
                          )}

                          {user.status === 'blocked' && (
                            <button
                              onClick={() => handleActivateUser(user.id)}
                              className="text-[#002F5A] hover:text-blue-700 p-1 rounded-md hover:bg-blue-50"
                              title="Unblock User"
                            >
                              <FaUnlock />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteConfirm(user.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
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
                  Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} 
                  of {totalUsers} results
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
          </motion.div>
        </div>
      </main>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Full Name:</span>
                      <p className="text-gray-900">{selectedUser.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Username:</span>
                      <p className="text-gray-900">@{selectedUser.username}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedUser.status)}`}>
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Academic Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">University:</span>
                      <p className="text-gray-900">{selectedUser.university || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Year:</span>
                      <p className="text-gray-900">
                        {selectedUser.year ? `${selectedUser.year}${selectedUser.year === 1 ? 'st' : selectedUser.year === 2 ? 'nd' : selectedUser.year === 3 ? 'rd' : 'th'} Year` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Subscription Plan:</span>
                      <p className="text-gray-900">{selectedUser.subscription_plan || 'No active plan'}</p>
                    </div>
                    {selectedUser.subscription_expiry && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Plan Expires:</span>
                        <p className="text-gray-900">{formatDate(selectedUser.subscription_expiry)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account Created:</span>
                      <p className="text-gray-900">{formatDateTime(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                      <p className="text-gray-900">{formatDateTime(selectedUser.updated_at)}</p>
                    </div>
                    {selectedUser.last_login && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Last Login:</span>
                        <p className="text-gray-900">{formatDateTime(selectedUser.last_login)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-700">Role:</span>
                      <p className="text-gray-900">{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="px-6 py-3 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-green-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit User: {selectedUser.full_name || selectedUser.username}</h2>
              <button onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                    University
                  </label>
                  <input
                    type="text"
                    id="university"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]"
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      id="year"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    >
                      {[1, 2, 3, 4, 5].map(year => (
                        <option key={year} value={year}>
                          {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subscription_plan" className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Plan
                    </label>
                    <select
                      id="subscription_plan"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]"
                      value={formData.subscription_plan}
                      onChange={(e) => setFormData({...formData, subscription_plan: e.target.value})}
                    >
                      <option value="">No Plan</option>
                      {PLANS.slice(1).map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Email and username cannot be changed for security reasons.
                    Status changes should be done using the action buttons in the main table.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Confirm Deletion</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this user? This action cannot be undone and will remove all user data including quiz attempts and progress.
                </p>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <strong>Warning:</strong> This action is permanent and cannot be reversed. All associated data will be lost.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </span>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Delete User
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
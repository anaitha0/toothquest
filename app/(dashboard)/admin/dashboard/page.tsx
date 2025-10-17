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
  FaCalendarAlt,
  FaUserPlus,
  FaBell,
  FaFilter,
  FaSearch,
  FaSignOutAlt,
  FaClipboardList,
  FaReceipt,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaUserShield,
  FaEdit,
  FaEye,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FaKey } from 'react-icons/fa6';
import { toast } from 'react-toastify';

// Type definitions
interface DashboardStats {
  stats: {
    total_users: number;
    active_users: number;
    total_questions: number;
    reported_questions: number;
    pending_accounts: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    date: string;
    status: string;
    plan: string;
  }>;
  pending_receipts: Array<{
    id: number;
    user: string;
    email: string;
    date: string;
    amount: string;
    plan: string;
  }>;
  recent_reports: Array<{
    id: number;
    question: string;
    reported_by: string;
    date: string;
    reason: string;
  }>;
  recent_activity: Array<{
    id: number;
    action: string;
    user: string;
    date: string;
    details: string;
    type: string;
  }>;
}

interface StatisticsData {
  revenue_data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  user_registrations_data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  platform_stats: {
    total_users: number;
    active_users: number;
    total_questions: number;
    total_quiz_attempts: number;
    total_revenue: number;
    avg_user_score: number;
    subscription_renewal_rate: number;
  };
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

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);

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
        
        // Load dashboard data
        await Promise.all([
          loadDashboardStats(),
          loadStatisticsData()
        ]);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const loadDashboardStats = async () => {
    try {
      const data = await apiCall('/admin/dashboard/');
      setDashboardStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const loadStatisticsData = async () => {
    try {
      const data = await apiCall('/admin/statistics/');
      setStatisticsData(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Failed to load platform statistics');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      await apiCall(`/questions/reports/${reportId}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({
          admin_response: 'Resolved from dashboard'
        }),
      });
      toast.success('Report resolved successfully');
      await loadDashboardStats();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#002F5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin dashboard...</p>
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
                  item.id === 'dashboard' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'dashboard' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'dashboard' ? 'text-white' : 'text-gray-600'}`}>
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

  // Get admin stats for display
  const adminStats = [
    { 
      title: "Total Users", 
      value: dashboardStats?.stats.total_users?.toLocaleString() || "0", 
      icon: <FaUsers />,
      color: "bg-blue-400",
      change: `${dashboardStats?.stats.active_users || 0} active` 
    },
    { 
      title: "Total Questions", 
      value: dashboardStats?.stats.total_questions?.toLocaleString() || "0", 
      icon: <FaQuestionCircle />,
      color: "bg-teal-500",
      change: `${dashboardStats?.stats.reported_questions || 0} reported` 
    },
    { 
      title: "Pending Accounts", 
      value: dashboardStats?.stats.pending_accounts?.toString() || "0", 
      icon: <FaUserPlus />,
      color: "bg-orange-500",
      change: "Requires attention" 
    },
    { 
      title: "Revenue This Month", 
      value: `${statisticsData?.platform_stats.total_revenue?.toLocaleString() || 0} DA`, 
      icon: <FaChartBar />,
      color: "bg-green-500",
      change: `${statisticsData?.platform_stats.subscription_renewal_rate || 0}% renewal rate` 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#002F5A] w-64"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="relative">
                <button className="p-2 rounded-full text-gray-500 bg-white shadow-sm hover:bg-gray-50">
                  <FaBell className="h-5 w-5" />
                  {dashboardStats?.stats.reported_questions && dashboardStats.stats.reported_questions > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="relative bg-[#002F5A] rounded-xl p-6 mb-8 text-white overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="z-10">
                <h2 className="text-3xl font-bold">Welcome, {currentUser?.full_name || currentUser?.username}</h2>
                <p className="mt-1 text-blue-200">
                  You have {dashboardStats?.stats.pending_accounts || 0} pending accounts to review
                </p>
              </div>
              <div className="z-10">
                <div className="w-20 h-20 bg-white bg-opacity-10 rounded-full overflow-hidden flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(currentUser?.full_name || currentUser?.username)?.charAt(0) || 'A'}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[#002F5A] bg-opacity-50 transform skew-x-12"></div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, index) => (
              <motion.div 
                key={index} 
                className={`${stat.color} rounded-xl shadow-sm p-6 text-white relative overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                  <h4 className="text-3xl font-bold">{stat.value}</h4>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  {stat.change && (
                    <p className="text-xs mt-2 flex items-center text-white text-opacity-90">
                      <FaCheckCircle className="mr-1 h-3 w-3" /> {stat.change}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div 
              className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
                <div className="flex items-center space-x-4">
                  <select className="text-sm border border-gray-300 rounded-lg px-2 py-1 text-gray-600">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>All time</option>
                  </select>
                </div>
              </div>
              
              {/* Revenue Chart */}
              <div className="h-64 w-full relative bg-gray-50 rounded-lg p-4">
                <div className="flex items-end justify-around h-full">
                  {statisticsData?.revenue_data?.labels?.map((month, index) => {
                    const revenue = statisticsData.revenue_data.datasets[0]?.data[index] || 0;
                    const maxRevenue = Math.max(...(statisticsData.revenue_data.datasets[0]?.data || [1]));
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-[#002F5A] rounded-t-md w-12 transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${(revenue / maxRevenue) * 180}px` }}
                        ></div>
                        <div className="text-xs font-medium mt-2 text-gray-600">{month}</div>
                        <div className="text-xs text-gray-500">{revenue} DA</div>
                      </div>
                    );
                  }) || []}
                </div>
              </div>
            </motion.div>

            {/* Pending Receipts */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Pending Receipts</h3>
                  <Link href="/admin/receipts" className="text-blue-600 text-sm">
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardStats?.pending_receipts?.map((receipt) => (
                    <div key={receipt.id} className="p-4 border border-gray-100 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{receipt.user}</h3>
                          <p className="text-sm text-gray-500">{receipt.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Plan:</span> {receipt.plan}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Amount:</span> {receipt.amount}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Date:</span> {receipt.date}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors">
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <FaReceipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No pending receipts</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Users and Reported Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <motion.div 
              className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Users</h3>
                <Link 
                  href="/admin/users"
                  className="text-blue-600 text-sm"
                >
                  View all
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 rounded-lg">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardStats?.recent_users?.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.date}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.plan}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-800">
                            <FaEye className="inline" />
                          </Link>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No recent users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Reported Questions and Recent Activity */}
            <div className="space-y-6">
              {/* Reported Questions */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Reported Questions</h3>
                  <Link href="/admin/reports" className="text-blue-600 text-sm">
                    View all ({dashboardStats?.stats.reported_questions || 0})
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {dashboardStats?.recent_reports?.slice(0, 2).map((report) => (
                    <div key={report.id} className="p-4 border border-gray-100 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{report.question}</h3>
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">
                          <span className="font-medium">Reported by:</span> {report.reported_by}
                        </p>
                        <p className="text-gray-500">{report.date}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Reason:</span> {report.reason}
                      </p>
                      <div className="mt-3 flex justify-end space-x-2">
                        <Link 
                          href={`/admin/reports/${report.id}`}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handleResolveReport(report.id)}
                          className="px-3 py-1 bg-[#002F5A] text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No reported questions</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    {dashboardStats?.recent_activity?.map((activity) => (
                      <div key={activity.id} className="relative pl-10">
                        <div className={`absolute left-2.5 -translate-x-1/2 w-5 h-5 rounded-full ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          'bg-[#002F5A]'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{activity.action}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">{activity.user}</span> • {activity.date}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <FaHistory className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/users"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <div className="text-center">
                  <FaUsers className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Manage Users</span>
                </div>
              </Link>

              <Link
                href="/admin/questions"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
              >
                <div className="text-center">
                  <FaQuestionCircle className="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-green-600">Add Questions</span>
                </div>
              </Link>

              <Link
                href="/admin/codes"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
              >
                <div className="text-center">
                  <FaKey className="mx-auto h-8 w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-purple-600">Generate Codes</span>
                </div>
              </Link>

              <Link
                href="/admin/reports"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
              >
                <div className="text-center">
                  <FaExclamationTriangle className="mx-auto h-8 w-8 text-gray-400 group-hover:text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-orange-600">Review Reports</span>
                  {dashboardStats?.stats.reported_questions && dashboardStats.stats.reported_questions > 0 && (
                    <span className="inline-block ml-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      {dashboardStats.stats.reported_questions}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </motion.div>

          {/* System Health Section */}
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <FaCheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Database</p>
                  <p className="text-sm text-green-600">Operational</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <FaCheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">API Services</p>
                  <p className="text-sm text-green-600">All systems online</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <FaClock className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Last Backup</p>
                  <p className="text-sm text-blue-600">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Platform Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statisticsData?.platform_stats.avg_user_score?.toFixed(1) || 0}%
                </div>
                <p className="text-sm text-gray-600">Average User Score</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {statisticsData?.platform_stats.total_quiz_attempts?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-gray-600">Total Quiz Attempts</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {statisticsData?.platform_stats.subscription_renewal_rate?.toFixed(1) || 0}%
                </div>
                <p className="text-sm text-gray-600">Renewal Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
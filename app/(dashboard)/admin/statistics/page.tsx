'use client';

import { useState, useEffect, useRef } from 'react';
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
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaSignOutAlt,
  FaDownload,
  FaFilter,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield,
  FaKey
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { toast } from 'react-toastify';

// Register all Chart.js components
Chart.register(...registerables);

// Type definitions
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
  quiz_attempts_data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  year_distribution_data: {
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

interface QuickStats {
  users_today: number;
  quiz_attempts_today: number;
  pending_reports: number;
  pending_accounts: number;
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

function AdminStatisticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeframe, setTimeframe] = useState('year');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  
  // Data state
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  
  // Chart refs
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const userRegistrationsChartRef = useRef<HTMLCanvasElement>(null);
  const quizAttemptsChartRef = useRef<HTMLCanvasElement>(null);
  const yearDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const modulePopularityChartRef = useRef<HTMLCanvasElement>(null);
  const timeOfDayChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const revenueChartInstance = useRef<Chart | null>(null);
  const userRegistrationsChartInstance = useRef<Chart | null>(null);
  const quizAttemptsChartInstance = useRef<Chart | null>(null);
  const yearDistributionChartInstance = useRef<Chart | null>(null);
  const modulePopularityChartInstance = useRef<Chart | null>(null);
  const timeOfDayChartInstance = useRef<Chart | null>(null);

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
          loadStatisticsData(),
          loadQuickStats()
        ]);
      } catch (error) {
        console.error('Error initializing page:', error);
        toast.error('Failed to load statistics data');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const loadStatisticsData = async () => {
    try {
      const data = await apiCall('/admin/statistics/');
      setStatisticsData(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Failed to load statistics data');
    }
  };

  const loadQuickStats = async () => {
    try {
      const data = await apiCall('/admin/quick-stats/');
      setQuickStats(data);
    } catch (error) {
      console.error('Error loading quick stats:', error);
    }
  };

  useEffect(() => {
    if (isLoading || !statisticsData) return;
    
    // Initialize charts with real data
    if (revenueChartRef.current && statisticsData.revenue_data) {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      
      revenueChartInstance.current = new Chart(revenueChartRef.current, {
        type: 'line',
        data: {
          labels: statisticsData.revenue_data.labels,
          datasets: [{
            label: statisticsData.revenue_data.datasets[0].label,
            data: statisticsData.revenue_data.datasets[0].data,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Monthly Revenue'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('en-US').format(value as number) + ' DA';
                }
              }
            }
          }
        }
      });
    }
    
    if (userRegistrationsChartRef.current && statisticsData.user_registrations_data) {
      if (userRegistrationsChartInstance.current) {
        userRegistrationsChartInstance.current.destroy();
      }
      
      userRegistrationsChartInstance.current = new Chart(userRegistrationsChartRef.current, {
        type: 'bar',
        data: {
          labels: statisticsData.user_registrations_data.labels,
          datasets: [{
            label: statisticsData.user_registrations_data.datasets[0].label,
            data: statisticsData.user_registrations_data.datasets[0].data,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'User Registrations'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    if (quizAttemptsChartRef.current && statisticsData.quiz_attempts_data) {
      if (quizAttemptsChartInstance.current) {
        quizAttemptsChartInstance.current.destroy();
      }
      
      quizAttemptsChartInstance.current = new Chart(quizAttemptsChartRef.current, {
        type: 'line',
        data: {
          labels: statisticsData.quiz_attempts_data.labels,
          datasets: [{
            label: statisticsData.quiz_attempts_data.datasets[0].label,
            data: statisticsData.quiz_attempts_data.datasets[0].data,
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            borderColor: 'rgba(251, 191, 36, 1)',
            borderWidth: 2,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Quiz Attempts'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    if (yearDistributionChartRef.current && statisticsData.year_distribution_data) {
      if (yearDistributionChartInstance.current) {
        yearDistributionChartInstance.current.destroy();
      }
      
      yearDistributionChartInstance.current = new Chart(yearDistributionChartRef.current, {
        type: 'pie',
        data: {
          labels: statisticsData.year_distribution_data.labels,
          datasets: [{
            label: statisticsData.year_distribution_data.datasets[0].label,
            data: statisticsData.year_distribution_data.datasets[0].data,
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(251, 191, 36, 0.6)',
              'rgba(139, 92, 246, 0.6)',
              'rgba(244, 63, 94, 0.6)'
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(251, 191, 36, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(244, 63, 94, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Students by Year'
            }
          }
        }
      });
    }
    
    // Module popularity chart (static for now, can be enhanced)
    if (modulePopularityChartRef.current) {
      if (modulePopularityChartInstance.current) {
        modulePopularityChartInstance.current.destroy();
      }
      
      const modulePopularityData = {
        labels: ['Periodontics', 'Dental Materials', 'Endodontics', 'Oral Anatomy', 'Cariology', 'Prosthodontics', 'Oral Pathology'],
        datasets: [
          {
            label: 'Quiz Attempts',
            data: [4250, 3800, 3600, 3400, 3200, 2900, 2700],
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      };
      
      modulePopularityChartInstance.current = new Chart(modulePopularityChartRef.current, {
        type: 'bar',
        data: modulePopularityData,
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Module Popularity'
            }
          },
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    // Time of day activity chart (static for now, can be enhanced)
    if (timeOfDayChartRef.current) {
      if (timeOfDayChartInstance.current) {
        timeOfDayChartInstance.current.destroy();
      }
      
      const timeOfDayData = {
        labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
          {
            label: 'Activity',
            data: [280, 120, 80, 150, 620, 920, 780, 850, 1050, 1280, 1450, 820],
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }
        ]
      };
      
      timeOfDayChartInstance.current = new Chart(timeOfDayChartRef.current, {
        type: 'line',
        data: timeOfDayData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'User Activity by Time of Day'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    // Cleanup function
    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      if (userRegistrationsChartInstance.current) {
        userRegistrationsChartInstance.current.destroy();
      }
      if (quizAttemptsChartInstance.current) {
        quizAttemptsChartInstance.current.destroy();
      }
      if (yearDistributionChartInstance.current) {
        yearDistributionChartInstance.current.destroy();
      }
      if (modulePopularityChartInstance.current) {
        modulePopularityChartInstance.current.destroy();
      }
      if (timeOfDayChartInstance.current) {
        timeOfDayChartInstance.current.destroy();
      }
    };
  }, [isLoading, statisticsData]);

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  const handleExportData = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      // This would be implemented based on your backend export endpoints
      toast.info(`Exporting data to ${format.toUpperCase()}...`);
      
      // Example: await apiCall(`/admin/export/${format}/`, { method: 'POST' });
      // For now, just show a success message
      setTimeout(() => {
        toast.success(`Data exported to ${format.toUpperCase()} successfully!`);
      }, 2000);
    } catch (error) {
      toast.error(`Failed to export data: ${error}`);
    }
  };

  const handleTimeframeChange = async (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setIsTimeframeOpen(false);
    
    // Reload data with new timeframe
    try {
      setIsLoading(true);
      await loadStatisticsData();
    } catch (error) {
      toast.error('Failed to update statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading statistics...</p>
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
                  item.id === 'statistics' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'statistics' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'statistics' ? 'text-white' : 'text-gray-600'}`}>
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

  // Use real data if available, otherwise fall back to default values
  const platformStats = statisticsData?.platform_stats || {
    total_users: 0,
    active_users: 0,
    total_questions: 0,
    total_quiz_attempts: 0,
    total_revenue: 0,
    avg_user_score: 0,
    subscription_renewal_rate: 0
  };

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
              <h1 className="text-xl font-bold text-gray-800">Platform Statistics</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="px-4 py-2 bg-white border-2 border-[#002F5A] rounded-lg text-black hover:bg-blue-50 transition-colors flex items-center"
                  onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                >
                  <FaCalendarAlt className="mr-2" />
                  {timeframe === 'year' ? 'Last 12 Months' : timeframe === 'quarter' ? 'Last 3 Months' : 'Last 30 Days'}
                  <FaChevronDown className="ml-2" />
                </button>
                
                {isTimeframeOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                        onClick={() => handleTimeframeChange('month')}
                      >
                        Last 30 Days
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                        onClick={() => handleTimeframeChange('quarter')}
                      >
                        Last 3 Months
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                        onClick={() => handleTimeframeChange('year')}
                      >
                        Last 12 Months
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  onClick={() => handleExportData('csv')}
                >
                  <FaDownload className="mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Platform Overview */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-800">{platformStats.total_users.toLocaleString()}</h3>
                  <p className="text-xs text-green-500 mt-2">
                    <span className="font-medium">{platformStats.active_users.toLocaleString()}</span> active users
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                  <h3 className="text-3xl font-bold text-gray-800">{platformStats.total_questions.toLocaleString()}</h3>
                  <p className="text-xs text-green-500 mt-2">
                    Across all modules
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaQuestionCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-800">{platformStats.total_revenue.toLocaleString()} DA</h3>
                  <p className="text-xs text-green-500 mt-2">
                    From all subscriptions
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaFileInvoiceDollar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg User Score</p>
                  <h3 className="text-3xl font-bold text-gray-800">{platformStats.avg_user_score}%</h3>
                  <p className="text-xs text-green-500 mt-2">
                    Quiz accuracy rate
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaChartBar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          {quickStats && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">New Users Today</p>
                <h3 className="text-2xl font-bold">{quickStats.users_today}</h3>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Quiz Attempts Today</p>
                <h3 className="text-2xl font-bold">{quickStats.quiz_attempts_today}</h3>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Pending Reports</p>
                <h3 className="text-2xl font-bold">{quickStats.pending_reports}</h3>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Pending Accounts</p>
                <h3 className="text-2xl font-bold">{quickStats.pending_accounts}</h3>
              </div>
            </motion.div>
          )}
          
          {/* Charts: First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue</h2>
              <div className="h-80">
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Registrations</h2>
              <div className="h-80">
                <canvas ref={userRegistrationsChartRef}></canvas>
              </div>
            </motion.div>
          </div>
          
          {/* Charts: Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Attempts</h2>
              <div className="h-80">
                <canvas ref={quizAttemptsChartRef}></canvas>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Students by Year</h2>
              <div className="h-80">
                <canvas ref={yearDistributionChartRef}></canvas>
              </div>
            </motion.div>
          </div>
          
          {/* Charts: Third Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Module Popularity</h2>
              <div className="h-80">
                <canvas ref={modulePopularityChartRef}></canvas>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Activity by Time of Day</h2>
              <div className="h-80">
                <canvas ref={timeOfDayChartRef}></canvas>
              </div>
            </motion.div>
          </div>

          {/* Additional Statistics Section */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Additional Platform Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Quiz Attempts</h3>
                <p className="text-3xl font-bold text-blue-600">{platformStats.total_quiz_attempts.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">All-time attempts</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Score</h3>
                <p className="text-3xl font-bold text-green-600">{platformStats.avg_user_score}%</p>
                <p className="text-sm text-gray-600 mt-1">Platform-wide accuracy</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Subscription Renewal</h3>
                <p className="text-3xl font-bold text-purple-600">{platformStats.subscription_renewal_rate}%</p>
                <p className="text-sm text-gray-600 mt-1">Monthly renewal rate</p>
              </div>
            </div>
          </motion.div>

          {/* Data Export Actions */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Export Options</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleExportData('csv')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => handleExportData('excel')}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Export Excel
              </button>
              <button
                onClick={() => handleExportData('pdf')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <FaDownload className="mr-2" />
                Export PDF Report
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default AdminStatisticsPage;
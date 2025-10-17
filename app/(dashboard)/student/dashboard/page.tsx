'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaChartLine,
  FaCalendarAlt,
  FaTooth,
  FaGraduationCap,
  FaBookOpen,
  FaHistory,
  FaPlay,
  FaClock,
  FaUser,
  FaBell,
  FaSearch,
  FaCheckCircle,
  FaHome,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaTrophy,
  FaFire,
  FaThLarge,
  FaSpinner
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API Service
class DashboardAPI {
  private static getHeaders() {
    const token = localStorage.getItem('toothquest-token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Token ${token}` : '',
    };
  }

  static async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/students/dashboard/stats/`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  }

  static async getUpcomingEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/students/calendar/events/?limit=5`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  static async getRecentQuizzes() {
    try {
      const response = await fetch(`${API_BASE_URL}/students/quiz-sessions/?limit=3&status=completed&ordering=-completed_at`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching recent quizzes:', error);
      return [];
    }
  }

  static async getRecommendedQuizzes() {
    try {
      const response = await fetch(`${API_BASE_URL}/students/quizzes/recommended/?limit=2`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching recommended quizzes:', error);
      return [];
    }
  }

  static async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/students/profile/`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async getStudyStreak() {
    try {
      const response = await fetch(`${API_BASE_URL}/students/study-streak/`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching study streak:', error);
      return { current_streak: 0, longest_streak: 0 };
    }
  }
}

// Types
interface DashboardStats {
  total_quizzes_completed: number;
  average_score: number;
  total_questions_answered: number;
  total_study_hours: number;
  recent_quizzes: any[];
  upcoming_events: any[];
  performance_trend: Array<{
    date: string;
    day: string;
    score: number;
    count: number;
  }>;
}

interface Event {
  id: number;
  title: string;
  event_type: string;
  event_date: string;
  priority: string;
  location: string;
}

interface QuizSession {
  id: number;
  quiz: {
    title: string;
    module_name: string;
    questions_count: number;
  };
  score: number;
  percentage_score: number;
  completed_at: string;
  total_questions: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  module_name: string;
  difficulty: string;
  questions_count: number;
}

interface UserProfile {
  full_name: string;
  username: string;
  avatar?: string;
  university?: string;
  year?: number;
}

// Chart colors
const CHART_COLORS = {
  primary: '#00BBB9',
  secondary: '#34D399',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent, CHART_COLORS.danger];

const StudentDashboard = () => {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizSession[]>([]);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState<Quiz[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [studyStreak, setStudyStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        const [stats, events, quizzes, recommended, profile, streak] = await Promise.all([
          DashboardAPI.getDashboardStats(),
          DashboardAPI.getUpcomingEvents(),
          DashboardAPI.getRecentQuizzes(),
          DashboardAPI.getRecommendedQuizzes(),
          DashboardAPI.getUserProfile(),
          DashboardAPI.getStudyStreak()
        ]);

        if (stats) setDashboardStats(stats);
        setUpcomingEvents(events);
        setRecentQuizzes(quizzes);
        setRecommendedQuizzes(recommended);
        if (profile) setUserProfile(profile);
        setStudyStreak(streak);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    router.push('/login');
  };

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-[#00BBB9] text-white p-1.5 rounded-full shadow-md hover:bg-[#009A98] transition-colors"
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
              { icon: <FaHome size={20} />, name: 'Dashboard', id: 'dashboard', path: '/student/dashboard' },
              { icon: <FaBookOpen size={20} />, name: 'Quizzes', id: 'quizzes', path: '/student/quiz' },
              { icon: <FaCalendarAlt size={20} />, name: 'Calendar', id: 'calendar', path: '/student/calendar' },
              { icon: <FaUser size={20} />, name: 'Profile', id: 'profile', path: '/student/profile' },
              { icon: <FaHistory size={20} />, name: 'Quiz History', id: 'history', path: '/student/playlists' },
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/student/settings' },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === 'dashboard' ? 'bg-[#00BBB9]' : 'hover:bg-gray-50'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(currentDate);

  // Stats cards data
  const statsData = [
    { 
      title: "Quizzes Completed", 
      value: dashboardStats?.total_quizzes_completed || 0, 
      icon: <FaBookOpen />,
      color: "bg-green-500",
      change: "+8 this week" 
    },
    { 
      title: "Average Score", 
      value: `${dashboardStats?.average_score || 0}%`, 
      icon: <FaChartLine />,
      color: "bg-[#00BBB9]" 
    },
    { 
      title: "Questions Answered", 
      value: dashboardStats?.total_questions_answered || 0, 
      icon: <FaHistory />,
      color: "bg-purple-500",
      change: "+155 this month" 
    },
    { 
      title: "Study Hours", 
      value: `${dashboardStats?.total_study_hours || 0} hrs`, 
      icon: <FaClock />,
      color: "bg-orange-400",
      change: "+12 hrs this week" 
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
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="relative">
                <button className="p-2 rounded-full text-gray-500 bg-white shadow-sm hover:bg-gray-50">
                  <FaBell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              <Link 
                href="/student/quiz" 
                className="flex items-center px-4 py-2 bg-[#00BBB9] text-white rounded-full hover:bg-[#009A98]"
              >
                <FaPlay className="mr-2 h-3 w-3" /> Start Quiz
              </Link>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="relative bg-gradient-to-r from-[#00BBB9] to-[#009A98] rounded-xl p-6 mb-8 text-white overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="z-10">
                <h2 className="text-3xl font-bold">
                  Welcome, {userProfile?.full_name || userProfile?.username || 'Student'}
                </h2>
                <p className="mt-1 text-teal-200">
                  You have {upcomingEvents.length} upcoming events this month
                </p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center">
                    <FaFire className="mr-2 text-orange-300" />
                    <span className="text-sm">
                      {studyStreak.current_streak} day streak
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaTrophy className="mr-2 text-yellow-300" />
                    <span className="text-sm">
                      Best: {studyStreak.longest_streak} days
                    </span>
                  </div>
                </div>
              </div>
              <div className="z-10">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full overflow-hidden flex items-center justify-center">
                  <img 
                    src={userProfile?.avatar || "/images/ui/avatar-male.avif"} 
                    alt="User profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent transform skew-x-12"></div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl shadow-sm p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform`}>
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
                <div className="absolute right-0 top-0 h-full w-20 bg-white bg-opacity-10 transform skew-x-12"></div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Performance Trend</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FaChartLine />
                  <span>Last 7 days</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardStats?.performance_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ r: 6, fill: CHART_COLORS.primary }}
                    activeDot={{ r: 8, fill: CHART_COLORS.secondary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quiz Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Quiz Performance</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FaThLarge />
                  <span>By difficulty</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { difficulty: 'Easy', completed: 15, average: 88 },
                  { difficulty: 'Medium', completed: 12, average: 76 },
                  { difficulty: 'Hard', completed: 8, average: 65 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="difficulty" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="completed" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Calendar Section */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Upcoming Events</h3>
                  <Link href="/student/calendar" className="text-[#00BBB9] text-sm hover:underline">View All</Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No upcoming events</p>
                    </div>
                  ) : (
                    upcomingEvents.slice(0, 3).map(event => {
                      const eventDate = new Date(event.event_date);
                      const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
                      
                      return (
                        <div key={event.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className={`p-2 rounded-lg mr-3 ${
                              event.event_type === 'exam' ? 'bg-red-100 text-red-600' :
                              event.event_type === 'quiz' ? 'bg-orange-100 text-orange-600' :
                              event.event_type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                              'bg-teal-100 text-teal-600'
                            }`}>
                              <FaCalendarAlt className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{event.title}</h4>
                              <div className="flex flex-col text-sm mt-1">
                                <p className="text-gray-600">
                                  {eventDate.toLocaleDateString('en-US', { 
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-gray-500">{event.location}</p>
                                <div className="flex items-center mt-1">
                                  <FaClock className="mr-1 text-gray-600 h-3 w-3" />
                                  <span className={`text-xs font-medium ${
                                    daysUntil <= 1 ? 'text-red-600' : 
                                    daysUntil <= 3 ? 'text-orange-600' : 'text-[#00BBB9]'
                                  }`}>
                                    {daysUntil <= 0 ? 'Today' : 
                                     daysUntil === 1 ? 'Tomorrow' : 
                                     `${daysUntil} days`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <Link 
                  href="/student/calendar" 
                  className="block text-center py-2 mt-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:text-[#00BBB9] hover:border-[#00BBB9] transition-colors"
                >
                  + Add Event
                </Link>
              </div>
            </div>

            {/* Recent Quizzes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Quizzes</h3>
                <Link 
                  href="/student/playlists"
                  className="text-[#00BBB9] text-sm hover:underline"
                >
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No recent quizzes</p>
                  </div>
                ) : (
                  recentQuizzes.map(session => (
                    <div key={session.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700">{session.quiz.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.completed_at).toLocaleDateString()} • {session.total_questions} questions
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                          session.percentage_score >= 90 ? 'bg-green-100 text-green-800' : 
                          session.percentage_score >= 80 ? 'bg-blue-100 text-blue-800' : 
                          session.percentage_score >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(session.percentage_score)}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            session.percentage_score >= 90 ? 'bg-green-500' : 
                            session.percentage_score >= 80 ? 'bg-[#00BBB9]' : 
                            session.percentage_score >= 70 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${session.percentage_score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-6">
                <Link 
                  href="/student/quiz"
                  className="block w-full py-2 px-4 bg-[#00BBB9] hover:bg-[#009A98] text-white rounded-lg text-center transition-colors"
                >
                  Start New Quiz
                </Link>
              </div>
            </div>

            {/* Recommended Quizzes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Recommended</h3>
                <Link 
                  href="/student/quiz"
                  className="text-[#00BBB9] text-sm hover:underline"
                >
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {recommendedQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <FaThLarge className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">No recommendations yet</p>
                    <Link
                      href="/student/quiz"
                      className="text-sm px-4 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#009A98] transition-colors"
                    >
                      Browse Quizzes
                    </Link>
                  </div>
                ) : (
                  recommendedQuizzes.map(quiz => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">{quiz.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          quiz.difficulty === 'easy' 
                            ? 'bg-green-100 text-green-800' 
                            : quiz.difficulty === 'medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{quiz.questions_count} questions</span>
                          <span>{quiz.module_name}</span>
                        </div>
                        <Link 
                          href={`/student/quiz/${quiz.id}`}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Start
                        </Link>
                      </div>
                    </div>
                  ))
                )}
                
                {recommendedQuizzes.length > 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-full bg-blue-100 mb-3">
                      <FaBookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Explore More</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-4">Discover quizzes tailored to your progress</p>
                    <Link
                      href="/student/quiz"
                      className="text-sm px-4 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#009A98] transition-colors"
                    >
                      Browse Library
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Study Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Module Performance</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FaGraduationCap />
                  <span>This semester</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { module: 'Dental Anatomy', score: 88, progress: 85, color: 'bg-green-500' },
                  { module: 'Oral Pathology', score: 76, progress: 70, color: 'bg-[#00BBB9]' },
                  { module: 'Periodontics', score: 82, progress: 60, color: 'bg-purple-500' },
                  { module: 'Endodontics', score: 69, progress: 45, color: 'bg-orange-500' },
                ].map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${module.color} mr-3`}></div>
                      <div>
                        <p className="font-medium text-gray-700">{module.module}</p>
                        <p className="text-sm text-gray-500">{module.progress}% complete</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{module.score}%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full ${module.color}`}
                          style={{ width: `${module.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Overall GPA</span>
                  <span className="font-bold text-[#00BBB9]">3.4</span>
                </div>
              </div>
            </div>

            {/* Study Goals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Study Goals</h3>
                <Link 
                  href="/student/settings"
                  className="text-[#00BBB9] text-sm hover:underline"
                >
                  Settings
                </Link>
              </div>
              
              <div className="space-y-6">
                {/* Daily Goal */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Daily Study Goal</span>
                    <span className="text-sm text-gray-600">1.5 / 2.0 hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#00BBB9] to-[#009A98] h-2 rounded-full transition-all duration-300"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">75% complete</p>
                </div>

                {/* Weekly Goal */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Quiz Goal</span>
                    <span className="text-sm text-gray-600">3 / 5 quizzes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">60% complete</p>
                </div>

                {/* Monthly Achievement */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaTrophy className="text-yellow-600 mr-2" />
                      <div>
                        <p className="font-medium text-gray-800">March Challenge</p>
                        <p className="text-sm text-gray-600">Complete 20 quizzes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-600">15/20</p>
                      <p className="text-xs text-gray-500">5 days left</p>
                    </div>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-1 mt-3">
                    <div 
                      className="bg-yellow-500 h-1 rounded-full"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {[
                      { icon: <FaFire className="text-orange-500" />, text: "7-day study streak", date: "Today" },
                      { icon: <FaTrophy className="text-yellow-500" />, text: "Scored 90%+ on hard quiz", date: "2 days ago" },
                      { icon: <FaThLarge className="text-purple-500" />, text: "Completed 10 quizzes", date: "1 week ago" }
                    ].map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <div className="mr-3">{achievement.icon}</div>
                          <span className="text-sm text-gray-700">{achievement.text}</span>
                        </div>
                        <span className="text-xs text-gray-500">{achievement.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
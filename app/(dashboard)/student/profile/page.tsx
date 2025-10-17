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
  FaEdit,
  FaCamera,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUniversity,
  FaMedal,
  FaTrophy,
  FaStar,
  FaAward,
  FaSignOutAlt
} from 'react-icons/fa';

// Profile data
const studentProfile = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex.johnson@dentalschool.edu',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1998-03-15',
  address: '123 University Ave, City, State 12345',
  university: 'Dental School University',
  year: '3rd Year',
  gpa: '3.8',
  studentId: 'DS2022001',
  joinDate: '2022-09-01',
  bio: 'Passionate dental student with a focus on oral surgery and patient care. Dedicated to excellence in dental education and committed to making a positive impact in oral healthcare.',
  avatar: '/images/ui/avatar-male.avif'
};

// Achievement data
const achievements = [
  { id: 1, title: 'Quiz Master', description: 'Completed 50+ quizzes', icon: <FaTrophy />, color: 'bg-yellow-500', earned: true },
  { id: 2, title: 'Perfect Score', description: 'Achieved 100% on 5 quizzes', icon: <FaStar />, color: 'bg-purple-500', earned: true },
  { id: 3, title: 'Study Streak', description: '30-day study streak', icon: <FaMedal />, color: 'bg-green-500', earned: true },
  { id: 4, title: 'High Achiever', description: 'Maintain 90%+ average', icon: <FaAward />, color: 'bg-[#00BBB9]', earned: false },
  { id: 5, title: 'Knowledge Seeker', description: 'Answer 2000+ questions', icon: <FaBookOpen />, color: 'bg-teal-500', earned: false },
  { id: 6, title: 'Time Master', description: '100+ study hours', icon: <FaClock />, color: 'bg-orange-500', earned: true }
];

// Activity data
const recentActivity = [
  { id: 1, type: 'quiz', title: 'Completed Oral Pathology Quiz', score: 85, date: '2 hours ago' },
  { id: 2, type: 'achievement', title: 'Earned "Quiz Master" badge', date: '1 day ago' },
  { id: 3, type: 'quiz', title: 'Completed Dental Anatomy Quiz', score: 92, date: '2 days ago' },
  { id: 4, type: 'study', title: 'Studied for 3 hours', date: '3 days ago' },
  { id: 5, type: 'quiz', title: 'Completed Endodontics Quiz', score: 78, date: '4 days ago' }
];

// Study preferences
const studyPreferences = {
  preferredTime: 'Morning',
  studyGoal: '2 hours/day',
  favoriteSubjects: ['Oral Surgery', 'Periodontics', 'Endodontics'],
  difficultyLevel: 'Advanced',
  reminderFrequency: 'Daily'
};

const StudentProfile = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(studentProfile);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    // Handle save logic here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Enhanced Sidebar Component (same as dashboard)
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-[#00BBB9] text-white p-1.5 rounded-full shadow-md hover:bg-[#00BBB9] transition-colors"
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
                  item.id === 'profile' ? 'bg-[#00BBB9]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'profile' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'profile' ? 'text-white' : 'text-gray-600'}`}>
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
              <h1 className="text-xl font-bold text-gray-800">Profile</h1>
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
              <button 
                onClick={() => setEditMode(!editMode)}
                className="flex items-center px-4 py-2 bg-[#00BBB9] text-white rounded-full hover:bg-blue-700"
              >
                <FaEdit className="mr-2 h-3 w-3" /> {editMode ? 'Save' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="relative bg-[#00BBB9] rounded-xl p-6 mb-8 text-white overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div className="relative">
                  <div className="w-24 h-24 bg-white bg-opacity-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img 
                      src={profileData.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {editMode && (
                    <button className="absolute bottom-0 right-0 p-1 bg-[#00BBB9] rounded-full text-white hover:bg-blue-700">
                      <FaCamera size={12} />
                    </button>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-3xl font-bold">{profileData.name}</h2>
                  <p className="text-blue-200">{profileData.university} • {profileData.year}</p>
                  <p className="text-blue-200 text-sm">Student ID: {profileData.studentId}</p>
                </div>
              </div>
              <div className="z-10 text-right">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{profileData.gpa}</div>
                  <div className="text-blue-200 text-sm">Current GPA</div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[#00BBB9] bg-opacity-50 transform skew-x-12"></div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Personal Information */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaEnvelope className="inline mr-2 text-gray-400" />
                      Email Address
                    </label>
                    {editMode ? (
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaPhone className="inline mr-2 text-gray-400" />
                      Phone Number
                    </label>
                    {editMode ? (
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaBirthdayCake className="inline mr-2 text-gray-400" />
                      Date of Birth
                    </label>
                    {editMode ? (
                      <input 
                        type="date" 
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                        {new Date(profileData.dateOfBirth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaUniversity className="inline mr-2 text-gray-400" />
                      University
                    </label>
                    {editMode ? (
                      <input 
                        type="text" 
                        value={profileData.university}
                        onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profileData.university}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaGraduationCap className="inline mr-2 text-gray-400" />
                      Academic Year
                    </label>
                    {editMode ? (
                      <select 
                        value={profileData.year}
                        onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Graduate</option>
                      </select>
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profileData.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaMapMarkerAlt className="inline mr-2 text-gray-400" />
                      Address
                    </label>
                    {editMode ? (
                      <textarea 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profileData.address}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  About Me
                </label>
                {editMode ? (
                  <textarea 
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profileData.bio}</p>
                )}
              </div>

              {editMode && (
                <div className="mt-6 flex space-x-4">
                  <button 
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-[#00BBB9] text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Study Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Study Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Preferred Study Time</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-700 font-medium">{studyPreferences.preferredTime}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Daily Study Goal</label>
                  <div className="mt-1 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700 font-medium">{studyPreferences.studyGoal}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                  <div className="mt-1 p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">{studyPreferences.difficultyLevel}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Favorite Subjects</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {studyPreferences.favoriteSubjects.map((subject, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Achievements */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Achievements</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                  <div key={achievement.id} className={`p-4 rounded-lg text-center ${
                    achievement.earned ? achievement.color : 'bg-gray-200'
                  } ${achievement.earned ? 'text-white' : 'text-gray-500'}`}>
                    <div className={`text-2xl mb-2 ${achievement.earned ? 'opacity-100' : 'opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <h4 className={`font-medium text-sm ${achievement.earned ? 'text-white' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs mt-1 ${achievement.earned ? 'text-white opacity-90' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'quiz' ? <FaBookOpen size={12} /> :
                       activity.type === 'achievement' ? <FaTrophy size={12} /> :
                       <FaClock size={12} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      {activity.score && (
                        <p className="text-xs text-gray-600">Score: {activity.score}%</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/activity"
                className="block text-center py-2 mt-4 text-blue-600 text-sm hover:bg-blue-50 rounded-lg"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
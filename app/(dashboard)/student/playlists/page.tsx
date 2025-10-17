'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
FaTooth,
FaHistory,
FaPlay,
FaSearch,
FaChartBar,
FaFilter,
FaEllipsisH,
FaStar,
FaRegStar,
FaTrash,
FaSignOutAlt,
FaTimes,
FaSpinner,
FaHome,
FaChevronLeft,
FaChevronRight,
FaCalendarAlt,
FaCheckCircle,
FaBookOpen,
FaUser,
FaCog
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Dummy quiz history data
const initialQuizHistory = [
{
id: 1001,
title: 'Dental Materials Quiz',
date: '2025-03-27T14:30:00',
score: 85,
questionsCount: 30,
timeSpent: 1845, // in seconds
modules: ['Dental Materials'],
favorite: true,
recent: true
},
{
id: 1002,
title: 'Periodontics Basics',
date: '2025-03-25T10:15:00',
score: 78,
questionsCount: 25,
timeSpent: 1530,
modules: ['Periodontics'],
favorite: false,
recent: true
},
{
id: 1003,
title: 'Endodontics Practice',
date: '2025-03-23T16:45:00',
score: 92,
questionsCount: 20,
timeSpent: 1250,
modules: ['Endodontics'],
favorite: true,
recent: true
},
{
id: 1004,
title: 'Oral Surgery Review',
date: '2025-03-20T09:30:00',
score: 73,
questionsCount: 40,
timeSpent: 2450,
modules: ['Oral Surgery'],
favorite: false,
recent: false
},
{
id: 1005,
title: 'Dental Anatomy Comprehensive',
date: '2025-03-18T11:00:00',
score: 88,
questionsCount: 35,
timeSpent: 2100,
modules: ['Dental Anatomy'],
favorite: true,
recent: false
},
{
id: 1006,
title: 'Orthodontics Quiz',
date: '2025-03-15T15:20:00',
score: 81,
questionsCount: 30,
timeSpent: 1780,
modules: ['Orthodontics'],
favorite: false,
recent: false
},
{
id: 1007,
title: 'Prosthodontics Fundamentals',
date: '2025-03-12T13:45:00',
score: 76,
questionsCount: 25,
timeSpent: 1620,
modules: ['Prosthodontics'],
favorite: false,
recent: false
},
{
id: 1008,
title: 'Oral Pathology Review',
date: '2025-03-10T10:30:00',
score: 79,
questionsCount: 30,
timeSpent: 1850,
modules: ['Oral Pathology'],
favorite: false,
recent: false
}
];

const modules = [
'All Modules',
'Dental Materials',
'Periodontics',
'Endodontics',
'Oral Surgery',
'Dental Anatomy',
'Orthodontics',
'Prosthodontics',
'Oral Pathology'
];

// Helper function to normalize quiz data
const normalizeQuizData = (quiz: { modules: any; favorite: any; recent: any; score: any; questionsCount: any; timeSpent: any; }) => ({
...quiz,
modules: quiz.modules && Array.isArray(quiz.modules) ? quiz.modules : ['General'],
favorite: Boolean(quiz.favorite),
recent: Boolean(quiz.recent),
score: Number(quiz.score) || 0,
questionsCount: Number(quiz.questionsCount) || 0,
timeSpent: Number(quiz.timeSpent) || 0
});

export default function PlaylistsPage() {
const router = useRouter();
const [isLoading, setIsLoading] = useState(true);
const [quizHistory, setQuizHistory] = useState(initialQuizHistory);
const [filteredHistory, setFilteredHistory] = useState(initialQuizHistory);
const [searchTerm, setSearchTerm] = useState('');
const [filterModule, setFilterModule] = useState('All Modules');
const [filterType, setFilterType] = useState<'all' | 'recent' | 'favorites'>('all');
const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

useEffect(() => {
// Check if user is logged in
const token = localStorage.getItem('toothquest-token');

if (!token) {
router.push('/login');
return;
}

// Check local storage for quiz history
const storedHistory = localStorage.getItem('toothquest-quiz-history');
if (storedHistory) {
try {
const parsedHistory = JSON.parse(storedHistory);
// Normalize the data to ensure all required properties exist
const normalizedHistory = parsedHistory.map(normalizeQuizData);
// Combine with initial history for demo purposes
const combinedHistory = [...initialQuizHistory, ...normalizedHistory];
setQuizHistory(combinedHistory);
} catch (error) {
console.error('Error parsing quiz history:', error);
// Fallback to initial history if parsing fails
setQuizHistory(initialQuizHistory);
}
} else {
setQuizHistory(initialQuizHistory);
}

// Simulate loading data
setTimeout(() => {
setIsLoading(false);
}, 1000);
}, [router]);

useEffect(() => {
// Apply filters
let filtered = [...quizHistory];

// Search filter
if (searchTerm) {
filtered = filtered.filter(quiz => 
quiz.title && quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
);
}

// Module filter
if (filterModule !== 'All Modules') {
filtered = filtered.filter(quiz => 
quiz.modules && Array.isArray(quiz.modules) && quiz.modules.includes(filterModule)
);
}

// Type filter
if (filterType === 'recent') {
filtered = filtered.filter(quiz => quiz.recent);
} else if (filterType === 'favorites') {
filtered = filtered.filter(quiz => quiz.favorite);
}

// Apply sorting
filtered.sort((a, b) => {
if (sortBy === 'date') {
const dateA = new Date(a.date || 0).getTime();
const dateB = new Date(b.date || 0).getTime();
return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
} else if (sortBy === 'score') {
const scoreA = Number(a.score) || 0;
const scoreB = Number(b.score) || 0;
return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
} else {
const titleA = a.title || '';
const titleB = b.title || '';
return sortDirection === 'desc'
? titleB.localeCompare(titleA)
: titleA.localeCompare(titleB);
}
});

setFilteredHistory(filtered);
}, [quizHistory, searchTerm, filterModule, filterType, sortBy, sortDirection]);

// Add animations for list items
const itemVariants = {
hidden: { opacity: 0, y: 20 },
visible: (i: number) => ({
opacity: 1,
y: 0,
transition: {
delay: i * 0.05,
duration: 0.3
}
})
};

const handleToggleFavorite = (quizId: number) => {
const updatedHistory = quizHistory.map(quiz => 
quiz.id === quizId
? { ...quiz, favorite: !quiz.favorite }
: quiz
);

setQuizHistory(updatedHistory);

// In a real app, this would update the backend
const quiz = updatedHistory.find(q => q.id === quizId);
if (quiz) {
toast.success(`Quiz ${quiz.favorite ? 'added to' : 'removed from'} favorites`);
}
};

const handleRetakeQuiz = (quizId: number) => {
// In a real app, this would set up a new quiz with the same parameters
// For now, we'll just navigate to the quiz page
router.push(`/student/quiz/${quizId}`);
};

const handleDeleteQuiz = (quizId: number) => {
setQuizToDelete(quizId);
setIsDeleteModalOpen(true);
};

const confirmDeleteQuiz = () => {
if (quizToDelete) {
const updatedHistory = quizHistory.filter(quiz => quiz.id !== quizToDelete);
setQuizHistory(updatedHistory);

// Update local storage in a real app
toast.success('Quiz removed from history');

setIsDeleteModalOpen(false);
setQuizToDelete(null);
}
};

const formatTime = (seconds: number) => {
const numSeconds = Number(seconds) || 0;
const minutes = Math.floor(numSeconds / 60);
const remainingSeconds = numSeconds % 60;
return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (dateString: string) => {
if (!dateString) return 'Unknown Date';
try {
const date = new Date(dateString);
return date.toLocaleDateString('en-US', {
year: 'numeric',
month: 'short',
day: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
} catch (error) {
return 'Invalid Date';
}
};

const getScoreColorClass = (score: number) => {
const numScore = Number(score) || 0;
if (numScore >= 90) return 'text-green-600';
if (numScore >= 80) return 'text-blue-500';
if (numScore >= 70) return 'text-yellow-600';
if (numScore >= 60) return 'text-orange-500';
return 'text-red-500';
};

const getScoreBgClass = (score: number) => {
const numScore = Number(score) || 0;
if (numScore >= 90) return 'bg-green-100 text-green-800';
if (numScore >= 80) return 'bg-blue-100 text-blue-800'; 
if (numScore >= 70) return 'bg-yellow-100 text-yellow-800';
if (numScore >= 60) return 'bg-orange-100 text-orange-800';
return 'bg-red-100 text-red-800';
};

const handleSortChange = (newSortBy: 'date' | 'score' | 'title') => {
if (sortBy === newSortBy) {
// Toggle direction if same sort field
setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
} else {
// Set new sort field and default to descending
setSortBy(newSortBy);
setSortDirection('desc');
}
};

const handleLogout = () => {
localStorage.removeItem('toothquest-token');
router.push('/login');
};

// Enhanced Sidebar Component
const EnhancedSidebar = () => {
return (
<div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
{/* Toggle button */}
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
          item.id === 'history' ? 'bg-[#00BBB9]' : 'hover:bg-gray-50'
        }`}
      >
        <div className={`${item.id === 'history' ? 'text-white' : 'text-gray-500'}`}>
          {item.icon}
        </div>
        
        {!sidebarCollapsed && (
          <span className={`ml-3 text-sm font-medium ${item.id === 'history' ? 'text-white' : 'text-gray-600'}`}>
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

if (isLoading) {
return (
<div className="flex items-center justify-center min-h-screen bg-gray-50">
<div className="text-center">
<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
<p className="mt-4 text-gray-600 font-medium">Loading quiz history...</p>
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

return (
<div className="flex h-screen bg-gray-50 overflow-hidden">
{/* Enhanced Sidebar */}
<EnhancedSidebar />

{/* Main Content */}
<main className="flex-1 p-6 overflow-y-auto">
<div className="max-w-7xl mx-auto">
{/* Welcome Banner */}
<div className="relative bg-[#00BBB9] rounded-xl p-6 mb-8 text-white overflow-hidden animate-fadeIn">
  <div className="absolute top-0 right-0 w-full h-full">
    <svg className="absolute right-0 inset-y-0 h-full w-1/3 text-blue-500 transform translate-x-1/4" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
      <polygon points="50,0 100,0 50,100 0,100" opacity="0.1" />
    </svg>
    <svg className="absolute right-0 inset-y-0 h-full w-1/3 text-blue-400 transform translate-x-1/3" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
      <polygon points="50,0 100,0 50,100 0,100" opacity="0.1" />
    </svg>
  </div>
  <div className="flex items-center justify-between relative z-10">
    <div>
      <h1 className="text-3xl font-bold">Quiz History</h1>
      <p className="mt-1 text-blue-100">{formattedDate}</p>
    </div>
  </div>
</div>

{/* Header */}
<div className="flex items-center justify-between mb-8">
  <div className="font-bold text-gray-800 text-xl">
    Your Quizzes
  </div>
  <div className="flex items-center space-x-4">
    <div className="relative group">
      <input 
        type="text" 
        placeholder="Search..." 
        className="pl-10 pr-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm transition-all duration-300 group-hover:shadow-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <FaSearch className="absolute left-3 top-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
    </div>
    <Link 
      href="/student/quiz" 
      className="flex items-center px-5 py-2.5 bg-[#00BBB9] text-white rounded-full hover:bg-[#00BBB9] transition-all duration-300 transform hover:scale-105 shadow-md"
    >
      <FaPlay className="mr-2 h-3 w-3" /> Start Quiz
    </Link>
  </div>
</div>

{/* Filters Section */}
<div className="bg-white rounded-xl shadow-md p-6 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-lg">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
      <FaFilter className="mr-2 text-blue-500" /> Filter Quizzes
    </h3>
  </div>
  <div className="flex flex-col md:flex-row items-stretch gap-4">
    <div className="flex-shrink-0 relative group">
      <select
        className="appearance-none block text-gray-400 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md"
        value={filterModule}
        onChange={(e) => setFilterModule(e.target.value)}
      >
        {modules.map((module, index) => (
          <option key={index} value={module}>
            {module}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
        <svg className="fill-current h-4 w-4 group-hover:text-blue-500 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
    
    <div className="flex flex-wrap flex-grow gap-2">
      <button
        className={`px-5 py-3 rounded-lg transition-all duration-300 transform flex-1 ${
          filterType === 'all' 
            ? 'bg-[#00BBB9] text-white shadow-md hover:shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setFilterType('all')}
      >
        All Quizzes
      </button>
      <button
        className={`px-5 py-3 rounded-lg transition-all duration-300 transform flex-1 ${
          filterType === 'recent' 
            ? 'bg-purple-600 text-white shadow-md hover:shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setFilterType('recent')}
      >
        Recent
      </button>
      <button
        className={`px-5 py-3 rounded-lg transition-all duration-300 transform flex-1 ${
          filterType === 'favorites' 
            ? 'bg-yellow-500 text-white shadow-md hover:shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setFilterType('favorites')}
      >
        <span className="flex items-center justify-center">
          <FaStar className="mr-1.5" /> Favorites
        </span>
      </button>
    </div>
  </div>
</div>

{/* Quiz History Table */}
<div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-lg">
  {filteredHistory.length === 0 ? (
    <div className="p-12 text-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaHistory className="h-12 w-12 text-blue-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-3">No quiz history found</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        {searchTerm || filterModule !== 'All Modules' || filterType !== 'all'
          ? 'Try changing your search or filter criteria to find more quizzes.'
          : 'Complete some quizzes to build your personal history and track your performance.'}
      </p>
      <Link 
        href="/student/quiz"
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        Take a New Quiz
      </Link>
    </div>
  ) : (
    <div>
      {/* Table Header */}
      <div className="border-b">
        <div className="grid grid-cols-12 py-4 px-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl font-medium text-gray-700">
          <div className="col-span-5 flex items-center cursor-pointer group" onClick={() => handleSortChange('title')}>
            <span className="group-hover:text-blue-600 transition-colors duration-200">Quiz Title</span>
            {sortBy === 'title' && (
              <span className="ml-1 group-hover:text-blue-600 transition-colors duration-200">
                {sortDirection === 'desc' ? '▼' : '▲'}
              </span>
            )}
          </div>
          <div className="col-span-2 flex items-center cursor-pointer group" onClick={() => handleSortChange('date')}>
            <span className="group-hover:text-blue-600 transition-colors duration-200">Date</span>
            {sortBy === 'date' && (
              <span className="ml-1 group-hover:text-blue-600 transition-colors duration-200">
                {sortDirection === 'desc' ? '▼' : '▲'}
              </span>
            )}
          </div>
          <div className="col-span-1 text-center cursor-pointer group" onClick={() => handleSortChange('score')}>
            <span className="group-hover:text-blue-600 transition-colors duration-200">Score</span>
            {sortBy === 'score' && (
              <span className="ml-1 group-hover:text-blue-600 transition-colors duration-200">
                {sortDirection === 'desc' ? '▼' : '▲'}
              </span>
            )}
          </div>
          <div className="col-span-2 text-center">Time</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
      </div>
      
      {/* Table Body */}
      <div>
        {filteredHistory.map((quiz, index) => (
          <div 
            key={quiz.id} 
            className={`grid grid-cols-12 py-5 px-6 border-b hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            style={{animationDelay: `${index * 0.05}s`}}
          >
            <div className="col-span-5 flex items-center">
              <div className="flex-shrink-0">
                {quiz.favorite ? (
                  <FaStar className="text-yellow-400 h-5 w-5 transform transition-transform duration-300 hover:scale-125" />
                ) : (
                  <FaRegStar className="text-gray-300 h-5 w-5 transform transition-transform duration-300 hover:scale-125 hover:text-yellow-400" />
                )}
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-gray-800 text-md">{quiz.title || 'Untitled Quiz'}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {quiz.modules && Array.isArray(quiz.modules) ? quiz.modules.join(', ') : 'General'}
                  </span>
                  <span className="ml-2">{quiz.questionsCount || 0} questions</span>
                </p>
              </div>
            </div>
            <div className="col-span-2 flex items-center text-sm text-gray-500">
              {formatDate(quiz.date)}
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <span className={`w-14 text-center px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${getScoreBgClass(quiz.score)}`}>
                {quiz.score || 0}%
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <span className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {formatTime(quiz.timeSpent)}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-center space-x-2">
              <button 
                onClick={() => handleRetakeQuiz(quiz.id)}
                className="p-2 bg-[#00BBB9] text-white rounded-lg hover:bg-[#00BBB9] transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                title="Retake Quiz"
              >
                <FaPlay size={14} />
              </button>
              <button 
                onClick={() => handleToggleFavorite(quiz.id)}
                className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md ${
                  quiz.favorite 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={quiz.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                {quiz.favorite ? <FaStar size={14} /> : <FaRegStar size={14} />}
              </button>
              <button 
                onClick={() => handleDeleteQuiz(quiz.id)}
                className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                title="Remove from History"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

{/* Stats Section */}
{filteredHistory.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-blue-500 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-opacity-50 rounded-full">
            <FaHistory />
          </div>
        </div>
        <h4 className="text-3xl font-bold">{filteredHistory.length}</h4>
        <p className="text-sm opacity-90">Total Quizzes</p>
      </div>
      <div className="absolute right-0 top-0 h-full w-20 bg-blue-400 bg-opacity-50 transform skew-x-12"></div>
    </div>
    
    <div className="bg-teal-500 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-opacity-50 rounded-full">
            <FaChartBar />
          </div>
        </div>
        <h4 className="text-3xl font-bold">
          {filteredHistory.length > 0 
            ? Math.round(filteredHistory.reduce((acc, quiz) => acc + (Number(quiz.score) || 0), 0) / filteredHistory.length)
            : 0}%
        </h4>
        <p className="text-sm opacity-90">Average Score</p>
      </div>
      <div className="absolute right-0 top-0 h-full w-20 bg-teal-400 bg-opacity-50 transform skew-x-12"></div>
    </div>
    
    <div className="bg-purple-500 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-opacity-50 rounded-full">
            <FaCheckCircle />
          </div>
        </div>
        <h4 className="text-3xl font-bold">
          {filteredHistory.reduce((acc, quiz) => acc + (Number(quiz.questionsCount) || 0), 0)}
        </h4>
        <p className="text-sm opacity-90">Questions Answered</p>
        <p className="text-xs mt-2 flex items-center text-white text-opacity-90">
          <FaCheckCircle className="mr-1 h-3 w-3" /> +{Math.round(filteredHistory.reduce((acc, quiz) => acc + (Number(quiz.questionsCount) || 0), 0) * 0.12)} this month
        </p>
      </div>
      <div className="absolute right-0 top-0 h-full w-20 bg-purple-400 bg-opacity-50 transform skew-x-12"></div>
    </div>
    
    <div className="bg-orange-400 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-opacity-50 rounded-full">
            <FaPlay />
          </div>
        </div>
        <h4 className="text-3xl font-bold">
          {Math.round(filteredHistory.reduce((acc, quiz) => acc + (Number(quiz.timeSpent) || 0), 0) / 3600)}h
        </h4>
        <p className="text-sm opacity-90">Total Time Spent</p>
        <p className="text-xs mt-2 flex items-center text-white text-opacity-90">
          <FaCheckCircle className="mr-1 h-3 w-3" /> +{Math.round(filteredHistory.reduce((acc, quiz) => acc + (Number(quiz.timeSpent) || 0), 0) / 3600 * 0.2)}h this week
        </p>
      </div>
      <div className="absolute right-0 top-0 h-full w-20 bg-orange-300 bg-opacity-50 transform skew-x-12"></div>
    </div>
  </div>
)}
</div>
</main>

{/* Delete Confirmation Modal */}
{isDeleteModalOpen && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
<div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
    <h2 className="text-xl font-bold flex items-center">
      <FaTrash className="mr-2" /> Confirm Deletion
    </h2>
    <button 
      onClick={() => setIsDeleteModalOpen(false)}
      className="text-white p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200">
      <FaTimes />
    </button>
  </div>
  
  <div className="p-6">
    <div className="mb-6">
      <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
        <FaTrash className="h-6 w-6 text-red-500" />
      </div>
      <p className="text-gray-600 text-center">
        Are you sure you want to remove this quiz from your history? This action cannot be undone.
      </p>
    </div>
    
    <div className="flex justify-end space-x-3">
      <button
        onClick={() => setIsDeleteModalOpen(false)}
        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
      >
        Cancel
      </button>
      <button
        onClick={confirmDeleteQuiz}
        className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Delete
      </button>
    </div>
  </div>
</div>
</div>
)}

{/* Add animations to your CSS */}
<style jsx>{`
@keyframes fadeIn {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes scaleIn {
from { transform: scale(0.95); opacity: 0; }
to { transform: scale(1); opacity: 1; }
}

.animate-fadeIn {
animation: fadeIn 0.3s ease-out forwards;
}

.animate-scaleIn {
animation: scaleIn 0.3s ease-out forwards;
}
`}</style>
</div>
);
}
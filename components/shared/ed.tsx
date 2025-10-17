'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBookOpen, 
  FaChartLine, 
  FaHistory, 
  FaCalendarAlt, 
  FaTooth, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlay,
  FaClock
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Countdown from 'react-countdown';

// Dummy data
const upcomingExams = [
  { id: 1, title: 'Oral Pathology', date: new Date(2025, 3, 15), countdown: Date.now() + 7 * 24 * 60 * 60 * 1000 },
  { id: 2, title: 'Dental Anatomy', date: new Date(2025, 3, 22), countdown: Date.now() + 14 * 24 * 60 * 60 * 1000 },
  { id: 3, title: 'Periodontics', date: new Date(2025, 4, 5), countdown: Date.now() + 21 * 24 * 60 * 60 * 1000 },
];

const recentQuizzes = [
  { id: 101, title: 'Dental Materials', date: '25 Mar 2025', score: 85, questionsCount: 30 },
  { id: 102, title: 'Endodontics Basics', date: '22 Mar 2025', score: 78, questionsCount: 25 },
  { id: 103, title: 'Oral Surgery', date: '20 Mar 2025', score: 92, questionsCount: 20 },
];

const recommendedQuizzes = [
  { id: 201, title: 'Prosthodontics', description: 'Test your knowledge on dental prosthetics and restorations', difficulty: 'Medium', questionsCount: 40 },
  { id: 202, title: 'Orthodontics', description: 'Practice questions on teeth alignment and jaw correction', difficulty: 'Hard', questionsCount: 35 },
  { id: 203, title: 'Dental Radiology', description: 'Questions on dental X-rays interpretation and techniques', difficulty: 'Easy', questionsCount: 25 },
];

// Stats for the student
const studentStats = {
  quizzesCompleted: 42,
  averageScore: 81,
  totalQuestionsAnswered: 1250,
  studyTimeHours: 68,
  weakestSubject: 'Periodontics',
  strongestSubject: 'Dental Anatomy'
};

export default function StudentDashboard() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(3);

  useEffect(() => {
    // Check if user is logged in and is a student
    const token = localStorage.getItem('toothquest-token');
    const user = localStorage.getItem('toothquest-user');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'student') {
        router.push('/login');
        return;
      }
      
      setUsername(userData.name || 'Student');
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
      return;
    }
    
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [router]);

  const countdownRenderer = ({ 
    days, 
    hours, 
    minutes, 
    seconds, 
    completed 
  }: { 
    days: number; 
    hours: number; 
    minutes: number; 
    seconds: number; 
    completed: boolean; 
  }) => {
    if (completed) {
      return <span className="text-red-500">Exam time!</span>;
    } else {
      return (
        <span className="text-oxford font-semibold">
          {days}d {hours}h {minutes}m {seconds}s
        </span>
      );
    }
  };
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-light-blue">
        <FaTooth className="text-turquoise animate-tooth-bounce h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold text-oxford">Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="bg-light-blue min-h-screen">
      <nav className="bg-oxford text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FaTooth className="h-8 w-8 text-turquoise" />
                <span className="ml-2 text-xl font-bold font-bw-mitga">
                  ToothQuest<span className="text-turquoise">.</span>
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-oxford-light focus:outline-none focus:ring-2 focus:ring-turquoise">
                  <span className="sr-only">Notifications</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </div>
              
              <div className="flex items-center ml-4">
                <img
                  className="h-9 w-9 rounded-full border-2 border-turquoise"
                  src="https://randomuser.me/api/portraits/men/1.jpg"
                  alt="User avatar"
                />
                <div className="ml-2">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-gray-300">Year {year} Student</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('toothquest-token');
                  localStorage.removeItem('toothquest-user');
                  router.push('/login');
                }}
                className="ml-4 px-3 py-1 text-sm bg-transparent hover:bg-oxford-light border border-gray-600 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold text-oxford mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {username}!
          </motion.h1>
          <p className="text-gray-600">Here's an overview of your study progress and upcoming exams.</p>
        </div>
        
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="dashboard-card primary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Quizzes Completed</p>
                <h3 className="text-3xl font-bold text-oxford mt-1">{studentStats.quizzesCompleted}</h3>
              </div>
              <div className="p-3 bg-turquoise bg-opacity-10 rounded-full">
                <FaBookOpen className="h-6 w-6 text-turquoise" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                <span className="text-green-500 flex items-center">
                  <FaCheckCircle className="mr-1" /> +8 this week
                </span>
              </p>
            </div>
          </div>
          
          <div className="dashboard-card secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Score</p>
                <h3 className="text-3xl font-bold text-oxford mt-1">{studentStats.averageScore}%</h3>
              </div>
              <div className="p-3 bg-oxford bg-opacity-10 rounded-full">
                <FaChartLine className="h-6 w-6 text-oxford" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-oxford h-2 rounded-full" 
                  style={{ width: `${studentStats.averageScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card accent">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Questions Answered</p>
                <h3 className="text-3xl font-bold text-oxford mt-1">{studentStats.totalQuestionsAnswered}</h3>
              </div>
              <div className="p-3 bg-turquoise-light bg-opacity-10 rounded-full">
                <FaHistory className="h-6 w-6 text-turquoise-light" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                <span className="text-green-500 flex items-center">
                  <FaCheckCircle className="mr-1" /> +155 this month
                </span>
              </p>
            </div>
          </div>
          
          <div className="dashboard-card primary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">Study Time</p>
                <h3 className="text-3xl font-bold text-oxford mt-1">{studentStats.studyTimeHours} hrs</h3>
              </div>
              <div className="p-3 bg-turquoise bg-opacity-10 rounded-full">
                <FaClock className="h-6 w-6 text-turquoise" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                <span className="text-green-500 flex items-center">
                  <FaCheckCircle className="mr-1" /> +12 hrs this week
                </span>
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Start a Quiz */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-oxford mb-4 flex items-center">
                <FaPlay className="mr-2 text-turquoise" /> Start a New Quiz
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-oxford mb-3">Quiz Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise focus:border-turquoise"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                      <option value={5}>5th Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise focus:border-turquoise">
                      <option value="all">All Modules</option>
                      <option value="1">Dental Anatomy</option>
                      <option value="2">Oral Histology</option>
                      <option value="3">Dental Materials</option>
                      <option value="4">Periodontics</option>
                      <option value="5">Endodontics</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise focus:border-turquoise">
                      <option value="all">All Courses</option>
                      <option value="1">Cavity Preparation</option>
                      <option value="2">Root Canal Treatment</option>
                      <option value="3">Composite Restorations</option>
                      <option value="4">Crown Preparation</option>
                      <option value="5">Dental Implants</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                    <select className="w-full border-gray-300 rounded-md shadow-sm focus:ring-turquoise focus:border-turquoise">
                      <option value="10">10 Questions</option>
                      <option value="20">20 Questions</option>
                      <option value="30">30 Questions</option>
                      <option value="40">40 Questions</option>
                      <option value="50">50 Questions</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Link 
                    href="/student/quiz"
                    className="px-6 py-2 bg-turquoise text-white rounded-md shadow-sm hover:bg-turquoise-dark transition-colors flex items-center"
                  >
                    <FaPlay className="mr-2" /> Start Quiz
                  </Link>
                </div>
              </div>
              
              <hr className="my-6" />
              
              <h3 className="text-lg font-semibold text-oxford mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {recommendedQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-oxford">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          quiz.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-800' 
                            : quiz.difficulty === 'Medium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">{quiz.questionsCount} questions</span>
                      <Link 
                        href={`/student/quiz/${quiz.id}`}
                        className="text-turquoise hover:text-turquoise-dark text-sm font-medium flex items-center"
                      >
                        Start Quiz <FaPlay className="ml-1" size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Calendar and Recent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Upcoming Exams */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-oxford mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-turquoise" /> Upcoming Exams
              </h2>
              
              {upcomingExams.length === 0 ? (
                <p className="text-gray-500">No upcoming exams scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="border-l-4 border-turquoise pl-4 py-2">
                      <h3 className="font-semibold text-oxford">{exam.title}</h3>
                      <p className="text-sm text-gray-500">
                        {exam.date.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className="mt-2 flex items-center">
                        <FaClock className="text-turquoise mr-2" size={14} />
                        <Countdown date={exam.countdown} renderer={countdownRenderer} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-right">
                <Link 
                  href="/student/calendar"
                  className="text-turquoise hover:text-turquoise-dark text-sm font-medium"
                >
                  View full calendar →
                </Link>
              </div>
            </div>
            
            {/* Recent Quizzes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-oxford mb-4 flex items-center">
                <FaHistory className="mr-2 text-turquoise" /> Recent Quizzes
              </h2>
              
              {recentQuizzes.length === 0 ? (
                <p className="text-gray-500">You haven't taken any quizzes yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-oxford">{quiz.title}</h3>
                          <p className="text-xs text-gray-500">{quiz.date} • {quiz.questionsCount} questions</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`text-sm font-bold ${
                            quiz.score >= 80 ? 'text-green-600' : 
                            quiz.score >= 70 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {quiz.score}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            quiz.score >= 80 ? 'bg-green-500' : 
                            quiz.score >= 70 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${quiz.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-right">
                <Link 
                  href="/student/playlists"
                  className="text-turquoise hover:text-turquoise-dark text-sm font-medium"
                >
                  View all quizzes →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
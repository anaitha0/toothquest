'use client'; // add true answer sound 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTooth, 
  FaArrowLeft, 
  FaArrowRight, 
  FaFlag, 
  FaEye, 
  FaEyeSlash, // Icon for eliminating choices
  FaChartBar, 
  FaSpinner, 
  FaClock,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaBookOpen,
  FaHistory,
  FaUser,
  FaSearch,
  FaBell,
  FaPlay,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Dummy quiz data
const quizQuestions = [
  {
    id: 1,
    question: "Which of the following is NOT a part of the periodontium?",
    options: [
      { id: 'a', text: "Cementum" },
      { id: 'b', text: "Alveolar bone" },
      { id: 'c', text: "Dentin" },
      { id: 'd', text: "Periodontal ligament" }
    ],
    answer: 'c',
    explanation: "The periodontium includes the gingiva, periodontal ligament, cementum, and alveolar bone. Dentin is a part of the tooth structure rather than the periodontium.",
    image: "/images/question-images/dental-xray-1.jpg",
    statistics: { a: 12, b: 5, c: 74, d: 9 }
  },
  {
    id: 2,
    question: "Which dental material is most commonly used for permanent posterior restorations?",
    options: [
      { id: 'a', text: "Composite resin" },
      { id: 'b', text: "Amalgam" },
      { id: 'c', text: "Glass ionomer" },
      { id: 'd', text: "Zinc oxide eugenol" }
    ],
    answer: 'b',
    explanation: "Amalgam has traditionally been the most commonly used material for permanent posterior restorations due to its durability, strength, and cost-effectiveness. However, composite resin use has been increasing due to esthetic concerns.",
    image: null,
    statistics: { a: 35, b: 58, c: 5, d: 2 }
  },
  {
    id: 3,
    question: "What is the primary function of the dental pulp?",
    options: [
      { id: 'a', text: "Providing sensation" },
      { id: 'b', text: "Nutrition" },
      { id: 'c', text: "Defense" },
      { id: 'd', text: "All of the above" }
    ],
    answer: 'd',
    explanation: "The dental pulp has multiple functions including: providing sensation through its nerve supply, nutrition via blood vessels, defense through its immunocompetent cells, and formation of dentin (dentin formation/dentinogenesis).",
    image: "/images/question-images/dental-cavity-2.jpg",
    statistics: { a: 10, b: 12, c: 8, d: 70 }
  },
  {
    id: 4,
    question: "Which muscle is primarily responsible for closing the mouth during mastication?",
    options: [
      { id: 'a', text: "Temporalis" },
      { id: 'b', text: "Masseter" },
      { id: 'c', text: "Lateral pterygoid" },
      { id: 'd', text: "Medial pterygoid" }
    ],
    answer: 'b',
    explanation: "The masseter muscle is the primary muscle of mastication responsible for closing the mouth. It elevates the mandible against the maxilla with great force, allowing for effective chewing. The temporalis assists in this action, while the pterygoid muscles are involved in side-to-side movements and opening.",
    image: null,
    statistics: { a: 25, b: 65, c: 5, d: 5 }
  },
  {
    id: 5,
    question: "What is the most common cause of dental caries?",
    options: [
      { id: 'a', text: "Streptococcus mutans" },
      { id: 'b', text: "Porphyromonas gingivalis" },
      { id: 'c', text: "Actinomyces viscosus" },
      { id: 'd', text: "Fusobacterium nucleatum" }
    ],
    answer: 'a',
    explanation: "Streptococcus mutans is considered the primary bacterial species responsible for initiating dental caries. It produces acids from fermentable carbohydrates, leading to demineralization of tooth structure.",
    image: "/images/question-images/dental-cavity-2.jpg",
    statistics: { a: 82, b: 8, c: 6, d: 4 }
  }
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<number, string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<string>('quizzes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('toothquest-token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
      setQuizStartTime(new Date());
    }, 1500);
    
    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!quizCompleted) {
            finishQuiz();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleOptionSelect = (questionId: number, optionId: string) => {
    // Prevent selection if answered or option is eliminated
    if (showAnswer[questionId] || eliminatedOptions[questionId]?.includes(optionId)) return;
    
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleEliminateOption = (questionId: number, optionId: string) => {
    if (showAnswer[questionId]) return; // Can't change after showing answer

    setEliminatedOptions((prev) => {
      const currentEliminated = prev[questionId] || [];
      const isAlreadyEliminated = currentEliminated.includes(optionId);
      
      let newEliminatedForQuestion;
      if (isAlreadyEliminated) {
        // Un-eliminate the option
        newEliminatedForQuestion = currentEliminated.filter(id => id !== optionId);
      } else {
        // Eliminate the option
        newEliminatedForQuestion = [...currentEliminated, optionId];
      }
      
      return {
        ...prev,
        [questionId]: newEliminatedForQuestion
      };
    });
  };

  const handleShowAnswer = (questionId: number) => {
    setShowAnswer((prev) => ({
      ...prev,
      [questionId]: true
    }));
  };
  
  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
    
    toast.info(
      flaggedQuestions.includes(questionId) 
        ? "Question unflagged" 
        : "Question flagged for review"
    );
  };
  
  const handleReportQuestion = (questionId: number) => {
    // In a real app, this would open a modal for the user to provide details
    toast.info("Report functionality would be implemented here");
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!quizCompleted) {
      setShowCompletionModal(true);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const finishQuiz = () => {
    setQuizCompleted(true);
    // Calculate score
    const correctAnswers = quizQuestions.filter(q => 
      selectedOptions[q.id] === q.answer
    ).length;
    
    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    
    // Save to local storage for history
    const quizHistory = JSON.parse(localStorage.getItem('toothquest-quiz-history') || '[]');
    quizHistory.push({
      id: Date.now(),
      date: new Date().toISOString(),
      title: 'Dental Materials and Periodontics',
      score,
      questionsCount: quizQuestions.length,
      timeSpent: quizStartTime ? Math.floor((Date.now() - quizStartTime.getTime()) / 1000) : 0,
      modules: ['Dental Materials', 'Periodontics'],
      favorite: false,
      recent: true
    });
    localStorage.setItem('toothquest-quiz-history', JSON.stringify(quizHistory));
  };
  
  const calculateProgress = () => {
    const answeredCount = Object.keys(selectedOptions).length;
    return Math.round((answeredCount / quizQuestions.length) * 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    router.push('/login');
  };

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative z-10`}>
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
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/student/settings' },
            ].map((item) => (
              <div 
                key={item.id} 
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === activeTab ? 'bg-[#00BBB9]' : 'hover:bg-gray-50'
                }`}
                onClick={() => router.push(item.path)}
              >
                <div className={`${item.id === activeTab ? 'text-white' : 'text-gray-700'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === activeTab ? 'text-white' : 'text-gray-600'}`}>
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
              </div>
            ))}

            {/* Logout */}
            <div 
              className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative hover:bg-red-50`}
              onClick={handleLogout}
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
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="mt-8">
              <div className="text-xs text-gray-500 mb-2 px-4">Quiz Information</div>
              <div className={`p-4 rounded-xl ${timeRemaining < 300 ? 'bg-red-500 animate-pulse' : 'bg-[#00BBB9]'}`}>
                <div className="flex items-center justify-between text-white mb-2">
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span className="text-sm font-medium">Time Remaining</span>
                  </div>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-md">{formatTime(timeRemaining)}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5 mb-4">
                  <div 
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${Math.max(0, (timeRemaining/(30*60)) * 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-white mb-2">
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span className="text-sm font-medium">Progress</span>
                  </div>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-md">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="mt-6">
              <div className="text-xs text-gray-500 mb-2 px-4">Question Navigation</div>
              <div className="grid grid-cols-5 gap-2 px-4">
                {quizQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-full h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 transform ${
                      index === currentQuestionIndex
                        ? 'bg-[#00BBB9] text-white shadow-md scale-110' 
                        : selectedOptions[question.id]
                          ? showAnswer[question.id]
                            ? selectedOptions[question.id] === question.answer
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-blue-200 text-blue-800'
                          : flaggedQuestions.includes(question.id)
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading quiz questions...</p>
        </div>
      </div>
    );
  }
  
  if (quizCompleted) {
    // Calculate results
    const correctAnswers = quizQuestions.filter(q => 
      selectedOptions[q.id] === q.answer
    ).length;
    
    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    const timeSpent = quizStartTime 
      ? Math.floor((Date.now() - quizStartTime.getTime()) / 1000) 
      : 0;
    
    const formattedTimeSpent = formatTime(timeSpent);
    
    let feedback = '';
    if (score >= 90) {
      feedback = 'Excellent! You have mastered this topic.';
    } else if (score >= 80) {
      feedback = 'Very good! Just a few more concepts to solidify.';
    } else if (score >= 70) {
      feedback = 'Good job! You have a decent understanding of the material.';
    } else if (score >= 60) {
      feedback = 'You\'re on the right track, but need more practice.';
    } else {
      feedback = 'You should review this topic more thoroughly.';
    }

    const getScoreColor = () => {
      if (score >= 90) return 'from-green-500 to-green-600';
      if (score >= 80) return 'from-blue-500 to-blue-600';
      if (score >= 70) return 'from-yellow-500 to-yellow-600';
      if (score >= 60) return 'from-orange-400 to-orange-500';
      return 'from-red-500 to-red-600';
    };
    
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-full">
                      <FaTooth className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h1 className="text-2xl font-bold">Quiz Results</h1>
                      <p className="text-blue-100 text-sm mt-1">Dental Materials and Periodontics</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/student/dashboard')}
                    className="px-5 py-2.5 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className={`bg-gradient-to-br ${getScoreColor()} rounded-xl shadow-md p-6 text-white relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-full">
                          <FaChartBar className="h-6 w-6" />
                        </div>
                        <div className="bg-white bg-opacity-20 text-xs font-medium px-2 py-1 rounded-full">
                          Score
                        </div>
                      </div>
                      <h4 className="text-4xl font-bold">{score}%</h4>
                      <p className="text-sm opacity-90 mt-1">Final Score</p>
                      <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-white"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6">
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="white" fillOpacity="0.1" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md p-6 text-white relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-full">
                          <FaCheckCircle className="h-6 w-6" />
                        </div>
                        <div className="bg-white bg-opacity-20 text-xs font-medium px-2 py-1 rounded-full">
                          Correct
                        </div>
                      </div>
                      <h4 className="text-4xl font-bold">{correctAnswers}/{quizQuestions.length}</h4>
                      <p className="text-sm opacity-90 mt-1">Correct Answers</p>
                      <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-white"
                          style={{ width: `${(correctAnswers/quizQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6">
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="white" fillOpacity="0.1" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white relative overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-white bg-opacity-20 rounded-full">
                          <FaClock className="h-6 w-6" />
                        </div>
                        <div className="bg-white bg-opacity-20 text-xs font-medium px-2 py-1 rounded-full">
                          Time
                        </div>
                      </div>
                      <h4 className="text-4xl font-bold">{formattedTimeSpent}</h4>
                      <p className="text-sm opacity-90 mt-1">Time Spent</p>
                      <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-white"
                          style={{ width: `${Math.min(100, (timeSpent/(30*60)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6">
                      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="white" fillOpacity="0.1" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaChartBar className="mr-2 text-blue-500" /> Performance Feedback
                  </h2>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="mb-6">
                      <p className="text-lg font-semibold mb-2 text-gray-800">Overall Assessment</p>
                      <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">{feedback}</p>
                    </div>
                    
                    {quizQuestions.filter(q => selectedOptions[q.id] !== q.answer).length > 0 && (
                      <div>
                        <p className="text-lg font-semibold mb-2 text-gray-800">Areas for Improvement</p>
                        <div className="space-y-3 mt-3">
                          {quizQuestions
                            .filter(q => selectedOptions[q.id] !== q.answer)
                            .map(q => (
                              <div key={q.id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start">
                                <FaTimesCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-gray-800">{q.question}</p>
                                  <div className="mt-2 text-sm">
                                    <span className="text-gray-600">Your answer: </span>
                                    <span className="text-red-600 font-medium">
                                      {q.options.find(opt => opt.id === selectedOptions[q.id])?.text || 'Not answered'}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-600">Correct answer: </span>
                                    <span className="text-green-600 font-medium">
                                      {q.options.find(opt => opt.id === q.answer)?.text}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <button 
                    onClick={() => {
                      setQuizCompleted(false);
                      setCurrentQuestionIndex(0);
                      setShowAnswer({});
                    }}
                    className="px-6 py-3 bg-[#00BBB9] text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex-1 flex items-center justify-center"
                  >
                    <FaEye className="mr-2" /> Review Answers
                  </button>
                  
                  <button 
                    onClick={() => router.push('/student/quiz')}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 flex-1 flex items-center justify-center"
                  >
                    <FaArrowRight className="mr-2" /> Start New Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg">
            <div className="bg-[#00BBB9] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <FaTooth className="h-6 w-6" />
                  </div>
                  <h1 className="ml-3 text-xl font-bold">Dental Materials & Periodontics Quiz</h1>
                </div>
                <div className={`flex items-center ${timeRemaining < 300 ? 'animate-pulse' : ''}`}>
                  <div className="bg-teal-800 bg-opacity-30 px-4 py-2 rounded-lg flex items-center">
                    <FaClock className="mr-2 text-white" />
                    <span className={`font-mono font-bold ${timeRemaining < 300 ? 'text-red-300' : 'text-white'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600 flex items-center">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      flaggedQuestions.includes(currentQuestion.id) 
                        ? 'bg-yellow-100 text-yellow-600 shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                    title="Flag for review"
                  >
                    <FaFlag />
                  </button>
                  <button 
                    onClick={() => handleReportQuestion(currentQuestion.id)}
                    className="p-2 rounded-lg transition-all duration-200 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                    title="Report question"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                <div 
                  className="bg-[#00BBB9] h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${calculateProgress()}%` }}
                >
                  <div className="w-full h-full bg-[#00BBB9] bg-opacity-60 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <motion.div 
            key={currentQuestionIndex}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300 hover:shadow-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                {currentQuestion.question}
              </h2>
              
              {currentQuestion.image && (
                <div className="mb-6 rounded-lg overflow-hidden shadow-md">
                  <div className="bg-gray-200 w-full h-64 flex items-center justify-center">
                    <div className="text-gray-500 flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span className="mt-2">[Dental Image]</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 mb-8 text-gray-700">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptions[currentQuestion.id] === option.id;
                  const isEliminated = eliminatedOptions[currentQuestion.id]?.includes(option.id);
                  const isCorrect = option.id === currentQuestion.answer;
                  const isAnswerShown = showAnswer[currentQuestion.id];

                  const getOptionClasses = () => {
                    if (isAnswerShown) {
                      if (isCorrect) return 'bg-green-50 border-green-500 shadow-md';
                      if (isSelected) return 'bg-red-50 border-red-500 shadow-md';
                      return 'bg-white border-gray-200';
                    }
                    if (isEliminated) {
                      return 'bg-gray-100 border-gray-200 text-gray-400 line-through opacity-70 cursor-default';
                    }
                    if (isSelected) {
                      return 'bg-[#00BBB9] text-white border-blue-600 shadow-md';
                    }
                    return 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                  };

                  return (
                    <motion.div 
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Number(option.id.charCodeAt(0) - 97) * 0.1 }}
                      className={`border-2 rounded-xl p-4 transition-all duration-300 transform ${isAnswerShown || isEliminated ? '' : 'hover:scale-102 cursor-pointer'} ${getOptionClasses()}`}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-start">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                            isAnswerShown
                              ? isCorrect
                                ? 'bg-green-500 text-white'
                                : isSelected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              : isEliminated
                                ? 'bg-gray-300'
                                : isSelected
                                  ? 'bg-white text-blue-500 border-2 border-white'
                                  : 'bg-gray-200 text-gray-700'
                          }`}>
                            {option.id.toUpperCase()}
                          </div>
                          <span className="mt-2 text-lg">{option.text}</span>
                        </div>
                        
                        {!isAnswerShown && !isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminateOption(currentQuestion.id, option.id);
                            }}
                            className={`p-2 rounded-full text-gray-400 hover:bg-gray-200 transition-colors z-10 ${
                              isEliminated ? 'text-red-500 bg-red-100' : ''
                            }`}
                            title={isEliminated ? "Restore this choice" : "Eliminate this choice"}
                          >
                            <FaEyeSlash />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              {showAnswer[currentQuestion.id] && (
                <motion.div 
                  className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100 shadow-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Explanation
                  </h3>
                  <p className="text-gray-700 mb-6">{currentQuestion.explanation}</p>
                  
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FaChartBar className="mr-2 text-blue-500" /> Student Response Statistics
                    </h4>
                    <div className="space-y-4">
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                            option.id === currentQuestion.answer
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {option.id.toUpperCase()}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{option.text}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {currentQuestion.statistics[option.id as keyof typeof currentQuestion.statistics]}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  option.id === currentQuestion.answer ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${currentQuestion.statistics[option.id as keyof typeof currentQuestion.statistics] || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-5 py-2.5 rounded-lg flex items-center shadow-sm ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#00BBB9] text-white hover:bg-blue-700 transform transition-all duration-300 hover:scale-105'
                  }`}
                >
                  <FaArrowLeft className="mr-2" /> Previous
                </button>
                
                {!showAnswer[currentQuestion.id] ? (
                  <button
                    onClick={() => handleShowAnswer(currentQuestion.id)}
                    className={`px-5 py-2.5 bg-[#00BBB9] text-white rounded-lg flex items-center shadow-md transform transition-all duration-300 hover:scale-105 ${
                      !selectedOptions[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                    disabled={!selectedOptions[currentQuestion.id]}
                  >
                    <FaEye className="mr-2" /> Show Answer
                  </button>
                ) : (
                  <button
                    onClick={goToNextQuestion}
                    className="px-5 py-2.5 bg-[#00BBB9] text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transform transition-all duration-300 hover:scale-105 flex items-center"
                  >
                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <>Next <FaArrowRight className="ml-2" /></>
                    ) : (
                      <>Finish Quiz <FaCheckCircle className="ml-2" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Question Navigation - for larger screens */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 hidden md:block transition-all duration-300 hover:shadow-lg">
            <h3 className="text-gray-800 font-medium mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
              </svg>
              Question Navigation
            </h3>
            <div className="flex flex-wrap gap-2">
              {quizQuestions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-medium shadow-sm transition-all duration-300 transform ${
                    index === currentQuestionIndex
                      ? 'bg-[#00BBB9] text-white scale-110 shadow-md'
                      : selectedOptions[question.id]
                        ? showAnswer[question.id]
                          ? selectedOptions[question.id] === question.answer
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : flaggedQuestions.includes(question.id)
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } hover:scale-105`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#00BBB9] rounded mr-2"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
                  <span className="text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600">Correct</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-gray-600">Incorrect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Quiz Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scaleIn">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center">
                <FaCheckCircle className="mr-2" /> Quiz Completed
              </h2>
            </div>
            
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="mx-auto w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                  <FaChartBar className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Great Job!</h3>
                <p className="text-gray-600">
                  You've completed the quiz. Ready to see your results?
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Review Answers
                </button>
                <button
                  onClick={finishQuiz}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                >
                  View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\\:-translate-y-1:hover {
          transform: translateY(-0.25rem);
        }
      `}</style>
    </div>
  );
}
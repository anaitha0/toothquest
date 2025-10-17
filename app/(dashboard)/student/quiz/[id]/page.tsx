'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaTooth,
  FaArrowLeft,
  FaArrowRight,
  FaFlag,
  FaEye,
  FaChartBar,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPlay,
  FaRedo,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaBookOpen,
  FaUser,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Define types for our data structures
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
  image: string | null;
  statistics?: Record<string, number>;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  totalQuestions: number;
  module: string;
  year: number;
  questions: QuizQuestion[];
}

interface RecommendedQuiz {
  id: number;
  title: string;
  difficulty: string;
  questionsCount: number;
}

// Dummy recommended quizzes data
const recommendedQuizzes: RecommendedQuiz[] = [
  { id: 301, title: 'Dental Anatomy Basics', difficulty: 'Easy', questionsCount: 15 },
  { id: 302, title: 'Periodontal Diseases', difficulty: 'Medium', questionsCount: 20 },
  { id: 303, title: 'Dental Materials Advanced', difficulty: 'Hard', questionsCount: 25 }
];

export default function QuizByIdPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const quizId = parseInt(params.id);
  
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<string>('quizzes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('toothquest-token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch quiz data based on ID
    fetchQuizData();
  }, [router, quizId]);

  useEffect(() => {
    if (!quiz) return;
    
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
  }, [quiz, quizCompleted]);

  const fetchQuizData = async () => {
    // In a real app, you would fetch the quiz data from an API
    // For demo purposes, we'll create a mock quiz based on the ID

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockQuiz: Quiz = {
      id: quizId,
      title: `Quiz #${quizId}`,
      description: 'Comprehensive quiz covering dental anatomy and pathology',
      timeLimit: 30, // minutes
      totalQuestions: 5,
      module: quizId % 2 === 0 ? 'Dental Anatomy' : 'Dental Pathology',
      year: Math.ceil(quizId % 5),
      questions: [
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
      ]
    };
    
    setQuiz(mockQuiz);
    setIsLoading(false);
    setQuizStartTime(new Date());
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleOptionSelect = (questionId: number, optionId: string) => {
    if (showAnswer[questionId.toString()]) return; // Don't allow changes after showing answer
    
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId.toString()]: optionId
    }));
  };
  
  const handleShowAnswer = (questionId: number) => {
    setShowAnswer((prev) => ({
      ...prev,
      [questionId.toString()]: true
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
    toast.info("Report functionality would be implemented in a full version");
  };
  
  const goToNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!quizCompleted) {
      finishQuiz();
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const finishQuiz = () => {
    if (!quiz) return;
    setQuizCompleted(true);
    
    // Calculate score
    const correctAnswers = quiz.questions.filter((q) => 
      selectedOptions[q.id.toString()] === q.answer
    ).length;
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    
    // Save to local storage for history
    const quizHistory = JSON.parse(localStorage.getItem('toothquest-quiz-history') || '[]');
    quizHistory.push({
      id: Date.now(),
      quizId: quiz.id,
      date: new Date().toISOString(),
      title: quiz.title,
      score,
      questionsCount: quiz.questions.length,
      timeSpent: quizStartTime ? Math.floor((Date.now() - quizStartTime.getTime()) / 1000) : 0
    });
    localStorage.setItem('toothquest-quiz-history', JSON.stringify(quizHistory));
  };
  
  const calculateProgress = () => {
    if (!quiz) return 0;
    const answeredCount = Object.keys(selectedOptions).length;
    return Math.round((answeredCount / quiz.questions.length) * 100);
  };
  
  const handleRestartQuiz = () => {
    if (!quiz) return;
    setCurrentQuestionIndex(0);
    setSelectedOptions({});
    setShowAnswer({});
    setQuizCompleted(false);
    setFlaggedQuestions([]);
    setTimeRemaining(quiz.timeLimit * 60);
    setQuizStartTime(new Date());
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
              { icon: <FaHome size={20} />, name: 'Dashboard', id: 'dashboard', path: '/student/dashboard' },
              { icon: <FaBookOpen size={20} />, name: 'Quizzes', id: 'quizzes', path: '/student/quiz' },
              { icon: <FaCalendarAlt size={20} />, name: 'Calendar', id: 'calendar', path: '/student/calendar' },
              { icon: <FaUser size={20} />, name: 'Profile', id: 'profile', path: '/student/profile' },
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/student/settings' },
            ].map((item) => (
              <div 
                key={item.id} 
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === activeTab ? 'bg-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => router.push(item.path)}
              >
                <div className={`${item.id === activeTab ? 'text-white' : 'text-gray-500'}`}>
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
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        
        <main className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <FaTimesCircle className="text-red-500 h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Found</h2>
            <p className="text-gray-600 mb-6">
              The quiz you are looking for does not exist or has been removed.
            </p>
            <Link 
              href="/student/quiz"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Back to Quizzes
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  if (quizCompleted) {
    // Calculate results
    const answeredQuestions = Object.keys(selectedOptions).length;
    const correctAnswers = quiz.questions.filter((q) => 
      selectedOptions[q.id.toString()] === q.answer
    ).length;
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
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
                      <h1 className="text-2xl font-bold">{quiz.title} Results</h1>
                      <p className="text-blue-100 text-sm mt-1">{quiz.module} • Year {quiz.year}</p>
                    </div>
                  </div>
                  <Link 
                    href="/student/dashboard"
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Back to Dashboard
                  </Link>
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
                      <h4 className="text-4xl font-bold">{correctAnswers}/{quiz.questions.length}</h4>
                      <p className="text-sm opacity-90 mt-1">Correct Answers</p>
                      <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-white"
                          style={{ width: `${(correctAnswers/quiz.questions.length) * 100}%` }}
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
                    
                    {quiz.questions.filter((q) => selectedOptions[q.id.toString()] !== q.answer).length > 0 && (
                      <div>
                        <p className="text-lg font-semibold mb-2 text-gray-800">Areas for Improvement</p>
                        <div className="space-y-3 mt-3">
                          {quiz.questions
                            .filter((q) => selectedOptions[q.id.toString()] !== q.answer)
                            .map((q) => (
                              <div key={q.id} className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start">
                                <FaTimesCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                                <div>
                                  <p className="text-gray-800">{q.question}</p>
                                  <div className="mt-2 text-sm">
                                    <span className="text-gray-600">Your answer: </span>
                                    <span className="text-red-600 font-medium">
                                      {q.options.find(opt => opt.id === selectedOptions[q.id.toString()])?.text || 'Not answered'}
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
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                  <button 
                    onClick={handleRestartQuiz}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex-1 flex items-center justify-center"
                  >
                    <FaRedo className="mr-2" /> 
                    Restart Quiz
                  </button>
                  
                  <Link 
                    href="/student/quiz"
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 flex-1 flex items-center justify-center"
                  >
                    <FaPlay className="mr-2" />
                    New Quiz
                  </Link>
                </div>
                
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Quizzes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedQuizzes.map((rec) => (
                      <Link 
                        key={rec.id}
                        href={`/student/quiz/${rec.id}`}
                        className="bg-gray-50 hover:bg-blue-50 hover:text-blue-700 p-4 rounded-xl transition-colors"
                      >
                        <h3 className="font-bold mb-1">{rec.title}</h3>
                        <div className="flex justify-between text-sm">
                          <span className={
                            rec.difficulty === 'Easy' ? 'text-green-600' : 
                            rec.difficulty === 'Medium' ? 'text-yellow-600' : 
                            'text-red-600'
                          }>
                            {rec.difficulty}
                          </span>
                          <span>{rec.questionsCount} questions</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
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
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Quiz Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaTooth className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold">{quiz.title}</h1>
                    <p className="text-blue-100 text-sm">{quiz.module} • Year {quiz.year}</p>
                  </div>
                </div>
                <div className="flex items-center bg-black bg-opacity-30 px-3 py-1 rounded-md">
                  <FaClock className="mr-2 text-white" />
                  <span className={`font-mono ${timeRemaining < 300 ? 'text-red-300' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Module: {quiz.module}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Year {quiz.year}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{quiz.totalQuestions} Questions</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Progress: {calculateProgress()}%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex-grow">
                    Question {currentQuestionIndex + 1} of {quiz.questions.length}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFlagQuestion(currentQuestion.id)}
                      className={`p-2 rounded-md ${
                        flaggedQuestions.includes(currentQuestion.id) 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-500'
                      } hover:bg-gray-200 transition-colors`}
                      title="Flag for review"
                    >
                      <FaFlag />
                    </button>
                    <button
                      onClick={() => handleReportQuestion(currentQuestion.id)}
                      className="p-2 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      title="Report question"
                    >
                      <FaFlag className="text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-lg text-gray-800 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">{currentQuestion.question}</p>
                </div>
                
                {currentQuestion.image && (
                  <div className="mb-6 flex justify-center">
                    <div className="bg-gray-200 w-full max-w-md h-64 rounded-lg flex items-center justify-center">
                      <div className="text-gray-500 flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="mt-2">[Dental Image]</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option) => (
                    <motion.div 
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Number(option.id.charCodeAt(0) - 97) * 0.1 }}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                      className={`
                        p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102
                        ${selectedOptions[currentQuestion.id.toString()] === option.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'}
                        ${showAnswer[currentQuestion.id.toString()] && option.id === currentQuestion.answer 
                          ? 'border-green-500 bg-green-50' 
                          : ''}
                        ${showAnswer[currentQuestion.id.toString()] && selectedOptions[currentQuestion.id.toString()] === option.id && 
                          option.id !== currentQuestion.answer 
                          ? 'border-red-500 bg-red-50' 
                          : ''}
                      `}
                      whileHover={{ scale: showAnswer[currentQuestion.id.toString()] ? 1 : 1.02 }}
                    >
                      <div className="flex items-center">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full mr-3
                          ${selectedOptions[currentQuestion.id.toString()] === option.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'}
                          ${showAnswer[currentQuestion.id.toString()] && option.id === currentQuestion.answer 
                            ? 'bg-green-500 text-white' 
                            : ''}
                          ${showAnswer[currentQuestion.id.toString()] && selectedOptions[currentQuestion.id.toString()] === option.id && 
                            option.id !== currentQuestion.answer 
                            ? 'bg-red-500 text-white' 
                            : ''}
                        `}>
                          {option.id.toUpperCase()}
                        </div>
                        <span className={`
                          ${showAnswer[currentQuestion.id.toString()] && option.id === currentQuestion.answer 
                            ? 'font-bold text-green-700' 
                            : 'text-gray-800'}
                        `}>
                          {option.text}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {showAnswer[currentQuestion.id.toString()] && (
                  <motion.div 
                    className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-100 shadow-sm"
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
                    
                    {currentQuestion.statistics && (
                      <div className="mt-4 bg-white p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <FaChartBar className="mr-2 text-blue-500" /> Student Response Statistics
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(currentQuestion.statistics).map(([optId, percentage]) => {
                            const option = currentQuestion.options.find((o) => o.id === optId);
                            const total = Object.values(currentQuestion.statistics || {}).reduce((a, b) => a + b, 0);
                            const percent = Math.round((percentage / total) * 100);
                            
                            return (
                              <div key={optId} className="flex items-center">
                                <div className={`
                                  flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs
                                  ${optId === currentQuestion.answer 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'}
                                `}>
                                  {optId.toUpperCase()}
                                </div>
                                <div className="w-full max-w-md">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">{option?.text}</span>
                                    <span className="text-sm font-medium text-gray-700">{percent}%</span>
                                  </div>
                                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`
                                        h-full rounded-full
                                        ${optId === currentQuestion.answer ? 'bg-green-500' : 'bg-gray-400'}
                                      `}
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                <div className="flex justify-between">
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`
                      px-4 py-2 rounded-xl flex items-center shadow-sm
                      ${currentQuestionIndex === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 transform transition-all duration-300 hover:scale-105'}
                    `}
                  >
                    <FaArrowLeft className="mr-2" /> Previous
                  </button>
                  
                  <div className="space-x-3">
                    {!showAnswer[currentQuestion.id.toString()] && selectedOptions[currentQuestion.id.toString()] && (
                      <button
                        onClick={() => handleShowAnswer(currentQuestion.id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <FaEye className="mr-2" /> Show Answer
                      </button>
                    )}
                    
                    <button
                      onClick={goToNextQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <>Next <FaArrowRight className="ml-2" /></>
                      ) : (
                        <>Finish <FaCheckCircle className="ml-2" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Questions Navigation */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Questions Overview</h2>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {quiz.questions.map((q, index) => {
                  let bgColor = 'bg-gray-200';
                  let textColor = 'text-gray-700';
                  
                  if (flaggedQuestions.includes(q.id)) {
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-700';
                  }
                  
                  if (selectedOptions[q.id.toString()]) {
                    if (showAnswer[q.id.toString()]) {
                      if (selectedOptions[q.id.toString()] === q.answer) {
                        bgColor = 'bg-green-500';
                        textColor = 'text-white';
                      } else {
                        bgColor = 'bg-red-500';
                        textColor = 'text-white';
                      }
                    } else {
                      bgColor = 'bg-blue-500';
                      textColor = 'text-white';
                    }
                  }
                  
                  if (index === currentQuestionIndex) {
                    bgColor = 'bg-blue-600';
                    textColor = 'text-white';
                  }
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`
                        w-full h-10 flex items-center justify-center rounded-xl font-medium shadow-sm transition-all duration-300 transform hover:scale-105
                        ${bgColor} ${textColor}
                        hover:opacity-90
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Flagged</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Correct</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                  <span className="text-sm text-gray-600">Incorrect</span>
                </div>
              </div>
              
              <button
                onClick={finishQuiz}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <FaCheckCircle className="mr-2" /> Finish Quiz
              </button>
            </div>
          </div>
        </div>
      </main>
      
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
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
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaSignOutAlt,
  FaSave,
  FaUpload,
  FaKey,
  FaUserShield,
  FaCopy
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

// Type definitions
interface QuestionOption {
  id?: number;
  option_text: string;
  option_letter: string;
  is_correct: boolean;
}

interface Question {
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
  explanation: string;
  image?: string;
  explanation_image?: string;
  has_image: boolean;
  is_active: boolean;
  created_by: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  options: QuestionOption[];
  created_at: string;
  updated_at: string;
}

interface Module {
  id: number;
  name: string;
  description: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  module: {
    id: number;
    name: string;
    year: number;
  };
  description: string;
  created_at: string;
}

// Base form for a single question (used for both single and bulk)
interface QuestionForm {
  question_text: string;
  explanation: string;
  options: QuestionOption[];
  image?: File | null;
  explanation_image?: File | null;
}

// Interface for the complete form data for a single question
interface SingleQuestionFormData extends QuestionForm {
    module_id: string;
    course_id: string;
    year: number;
    difficulty: string;
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

const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem('toothquest-token');
  return {
    'Authorization': `Token ${token}`,
  };
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
  console.log('Request options:', options);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('toothquest-token');
      localStorage.removeItem('toothquest-user');
      window.location.href = '/login';
      return;
    }
    
    // Enhanced error logging for debugging
    const errorText = await response.text();
    console.error('Error response body:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
      console.error('Parsed error data:', errorData);
    } catch (parseError) {
      console.error('Could not parse error response as JSON');
      errorData = { message: errorText };
    }
    
    throw new Error(errorData.detail || errorData.error || errorData.message || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return;
  }
  
  return response.json();
};

const apiCallWithFile = async (endpoint: string, formData: FormData, method = 'POST') => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: getAuthHeadersForUpload(),
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('toothquest-token');
      localStorage.removeItem('toothquest-user');
      window.location.href = '/login';
      return;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const questionsPerPage = 20;
  
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [questionsToCreate, setQuestionsToCreate] = useState<QuestionForm[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bulkSettings, setBulkSettings] = useState({
    module_id: '',
    course_id: '',
    year: 1,
    difficulty: 'medium'
  });

  // Use the explicit interface for the form state
  const [formData, setFormData] = useState<SingleQuestionFormData>({
    question_text: '',
    module_id: '',
    course_id: '',
    year: 1,
    difficulty: 'medium',
    explanation: '',
    options: [
      { option_letter: 'a', option_text: '', is_correct: false },
      { option_letter: 'b', option_text: '', is_correct: false },
      { option_letter: 'c', option_text: '', is_correct: false },
      { option_letter: 'd', option_text: '', is_correct: false }
    ],
    image: null,
    explanation_image: null
  });

  const years = [1, 2, 3, 4, 5];
  const difficulties = ['easy', 'medium', 'hard'];

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
        setCurrentUser(user);
        await Promise.all([
          loadQuestions(),
          loadModules(),
          loadCourses()
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

  const loadQuestions = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: questionsPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterModule) params.append('module_name', filterModule);
      if (filterYear) params.append('year', filterYear);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);

      const data = await apiCall(`/questions/?${params.toString()}`);
      setQuestions(data.results || data);
      setTotalPages(Math.ceil((data.count || data.length) / questionsPerPage));
      setTotalQuestions(data.count || data.length);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error(`Failed to load questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const loadModules = async () => {
    try {
      const data = await apiCall('/questions/modules/');
      if (data && Array.isArray(data.results || data)) {
        setModules(data.results || data);
      } else {
        // Use dummy data if API fails or returns empty
        const dummyModules: Module[] = [
          { id: 1, name: 'Basic Dentistry', description: 'Fundamentals of dentistry', year: 1, is_active: true, created_at: new Date().toISOString() },
          { id: 2, name: 'Advanced Oral Surgery', description: 'Surgical procedures in oral cavity', year: 3, is_active: true, created_at: new Date().toISOString() },
          { id: 3, name: 'Periodontology', description: 'Study of gums and supporting structures', year: 2, is_active: true, created_at: new Date().toISOString() },
          { id: 4, name: 'Prosthodontics', description: 'Restoration of oral function and aesthetics', year: 4, is_active: true, created_at: new Date().toISOString() },
          { id: 5, name: 'Orthodontics', description: 'Correction of teeth and jaws', year: 5, is_active: true, created_at: new Date().toISOString() },
        ];
        setModules(dummyModules);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      // Fallback to dummy data
      const dummyModules: Module[] = [
        { id: 1, name: 'Basic Dentistry', description: 'Fundamentals of dentistry', year: 1, is_active: true, created_at: new Date().toISOString() },
        { id: 2, name: 'Advanced Oral Surgery', description: 'Surgical procedures in oral cavity', year: 3, is_active: true, created_at: new Date().toISOString() },
        { id: 3, name: 'Periodontology', description: 'Study of gums and supporting structures', year: 2, is_active: true, created_at: new Date().toISOString() },
        { id: 4, name: 'Prosthodontics', description: 'Restoration of oral function and aesthetics', year: 4, is_active: true, created_at: new Date().toISOString() },
        { id: 5, name: 'Orthodontics', description: 'Correction of teeth and jaws', year: 5, is_active: true, created_at: new Date().toISOString() },
      ];
      setModules(dummyModules);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await apiCall('/questions/courses/');
      if (data && Array.isArray(data.results || data)) {
        setCourses(data.results || data);
      } else {
        // Use dummy data if API fails or returns empty
        const dummyCourses: Course[] = [
          { id: 1, name: 'Dental Anatomy', description: 'Structure of teeth', module: { id: 1, name: 'Basic Dentistry', year: 1 }, created_at: new Date().toISOString() },
          { id: 2, name: 'Oral Histology', description: 'Microscopic structure of oral tissues', module: { id: 1, name: 'Basic Dentistry', year: 1 }, created_at: new Date().toISOString() },
          { id: 3, name: 'Pathology Principles', description: 'General pathology', module: { id: 1, name: 'Basic Dentistry', year: 1 }, created_at: new Date().toISOString() },
          { id: 4, name: 'Surgical Techniques', description: 'Fundamentals of surgical procedures', module: { id: 2, name: 'Advanced Oral Surgery', year: 3 }, created_at: new Date().toISOString() },
          { id: 5, name: 'Implantology', description: 'Dental implant procedures', module: { id: 2, name: 'Advanced Oral Surgery', year: 3 }, created_at: new Date().toISOString() },
          { id: 6, name: 'Gum Diseases', description: 'Diagnosis and treatment of periodontal diseases', module: { id: 3, name: 'Periodontology', year: 2 }, created_at: new Date().toISOString() },
          { id: 7, name: 'Non-Surgical Periodontal Therapy', description: 'Scaling and root planing', module: { id: 3, name: 'Periodontology', year: 2 }, created_at: new Date().toISOString() },
          { id: 8, name: 'Crown & Bridge', description: 'Fixed prosthodontics', module: { id: 4, name: 'Prosthodontics', year: 4 }, created_at: new Date().toISOString() },
          { id: 9, name: 'Removable Prosthetics', description: 'Denture fabrication', module: { id: 4, name: 'Prosthodontics', year: 4 }, created_at: new Date().toISOString() },
          { id: 10, name: 'Malocclusion Diagnostics', description: 'Diagnosis of bite problems', module: { id: 5, name: 'Orthodontics', year: 5 }, created_at: new Date().toISOString() },
          { id: 11, name: 'Orthodontic Appliances', description: 'Types and uses of braces', module: { id: 5, name: 'Orthodontics', year: 5 }, created_at: new Date().toISOString() },
        ];
        setCourses(dummyCourses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to dummy data
      const dummyCourses: Course[] = [
        { id: 1, name: 'Dental Anatomy', description: 'Structure of teeth', module: { id: 1, name: 'Basic Dentistry', year: 1 }, created_at: new Date().toISOString() },
        { id: 2, name: 'Oral Histology', description: 'Microscopic structure of oral tissues', module: { id: 1, name: 'Basic Dentistry', year: 1 }, created_at: new Date().toISOString() },
        { id: 3, name: 'Pathology Principles', description: 'General pathology', module: { id: 1, name: 'Basic Dentistry', year: 1 }, created_at: new Date().toISOString() },
        { id: 4, name: 'Surgical Techniques', description: 'Fundamentals of surgical procedures', module: { id: 2, name: 'Advanced Oral Surgery', year: 3 }, created_at: new Date().toISOString() },
        { id: 5, name: 'Implantology', description: 'Dental implant procedures', module: { id: 2, name: 'Advanced Oral Surgery', year: 3 }, created_at: new Date().toISOString() },
        { id: 6, name: 'Gum Diseases', description: 'Diagnosis and treatment of periodontal diseases', module: { id: 3, name: 'Periodontology', year: 2 }, created_at: new Date().toISOString() },
        { id: 7, name: 'Non-Surgical Periodontal Therapy', description: 'Scaling and root planing', module: { id: 3, name: 'Periodontology', year: 2 }, created_at: new Date().toISOString() },
        { id: 8, name: 'Crown & Bridge', description: 'Fixed prosthodontics', module: { id: 4, name: 'Prosthodontics', year: 4 }, created_at: new Date().toISOString() },
        { id: 9, name: 'Removable Prosthetics', description: 'Denture fabrication', module: { id: 4, name: 'Prosthodontics', year: 4 }, created_at: new Date().toISOString() },
        { id: 10, name: 'Malocclusion Diagnostics', description: 'Diagnosis of bite problems', module: { id: 5, name: 'Orthodontics', year: 5 }, created_at: new Date().toISOString() },
        { id: 11, name: 'Orthodontic Appliances', description: 'Types and uses of braces', module: { id: 5, name: 'Orthodontics', year: 5 }, created_at: new Date().toISOString() },
      ];
      setCourses(dummyCourses);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        loadQuestions(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterModule, filterYear, filterDifficulty]);

  useEffect(() => {
    if (!isLoading) {
      loadQuestions(currentPage);
    }
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  const handleAddQuestion = (bulk = false) => {
    setCurrentQuestion(null);
    setBulkMode(bulk);
    
    if (bulk) {
      setBulkSettings({ module_id: '', course_id: '', year: 1, difficulty: 'medium' });
      setQuestionsToCreate([]);
      setCurrentQuestionIndex(0);
    } else {
      setFormData({
        question_text: '',
        module_id: '',
        course_id: '',
        year: 1,
        difficulty: 'medium',
        explanation: '',
        options: [
          { option_letter: 'a', option_text: '', is_correct: false },
          { option_letter: 'b', option_text: '', is_correct: false },
          { option_letter: 'c', option_text: '', is_correct: false },
          { option_letter: 'd', option_text: '', is_correct: false }
        ],
        image: null,
        explanation_image: null
      });
    }
    
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setBulkMode(false);
    setFormData({
      question_text: question.question_text,
      module_id: question.module.id.toString(),
      course_id: question.course.id.toString(),
      year: question.year,
      difficulty: question.difficulty,
      explanation: question.explanation,
      options: question.options.map(opt => ({ ...opt })),
      image: null,
      explanation_image: null
    });
    setShowQuestionModal(true);
  };

  const handleViewQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setShowViewModal(true);
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestionToDelete(questionId);
    setShowDeleteModal(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsProcessing(true);
    try {
      await apiCall(`/questions/${questionToDelete}/`, { method: 'DELETE' });
      toast.success('Question deleted successfully');
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      await loadQuestions(currentPage === 1 ? 1 : totalQuestions - 1 > (currentPage - 1) * questionsPerPage ? currentPage : currentPage - 1);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['year'].includes(name);

    if (bulkMode && ['module_id', 'course_id', 'year', 'difficulty'].includes(name)) {
      setBulkSettings(prev => ({ ...prev, [name]: isNumeric ? parseInt(value) : value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: isNumeric ? parseInt(value) : value }));
    }
  };

  const handleOptionChange = (optionLetter: string, field: 'option_text' | 'is_correct', value: string | boolean) => {
    const updateOptions = (options: QuestionOption[]) => {
      return options.map(option => {
        if (option.option_letter === optionLetter) {
          return { ...option, [field]: value };
        }
        if (field === 'is_correct' && value === true) {
          return { ...option, is_correct: false };
        }
        return option;
      });
    };

    if (bulkMode && questionsToCreate.length > 0) {
      setQuestionsToCreate(prev => prev.map((q, index) => 
        index === currentQuestionIndex ? { ...q, options: updateOptions(q.options) } : q
      ));
    } else {
      setFormData(prev => ({ ...prev, options: updateOptions(prev.options) }));
    }
  };

  const handleBulkQuestionChange = (field: keyof QuestionForm, value: string | File | null) => {
    if (questionsToCreate.length === 0) return;
    setQuestionsToCreate(prev => prev.map((q, index) =>
      index === currentQuestionIndex ? { ...q, [field]: value } : q
    ));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'explanation_image') => {
    const file = e.target.files?.[0] || null;
    if (bulkMode) {
      handleBulkQuestionChange(type, file);
    } else {
      setFormData(prev => ({ ...prev, [type]: file }));
    }
    e.target.value = '';
  };

  const addNewQuestionToBulk = () => {
    if (questionsToCreate.length >= 10) {
      toast.error('Maximum 10 questions can be added at once');
      return;
    }
    const newQuestion: QuestionForm = {
      question_text: '',
      explanation: '',
      options: [
        { option_letter: 'a', option_text: '', is_correct: false },
        { option_letter: 'b', option_text: '', is_correct: false },
        { option_letter: 'c', option_text: '', is_correct: false },
        { option_letter: 'd', option_text: '', is_correct: false }
      ],
      image: null,
      explanation_image: null
    };
    setQuestionsToCreate(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questionsToCreate.length);
  };

  const removeQuestionFromBulk = (index: number) => {
    if (questionsToCreate.length <= 1) return;
    const updated = questionsToCreate.filter((_, i) => i !== index);
    setQuestionsToCreate(updated);
    if (currentQuestionIndex >= updated.length) {
      setCurrentQuestionIndex(updated.length - 1);
    }
  };

  const validateQuestion = (question: QuestionForm, settings: { module_id: string, course_id: string }) => {
    if (!settings.module_id || !settings.course_id) return 'Module and Course are required';
    if (!question.question_text.trim()) return 'Question text is required';
    if (question.options.some(option => !option.option_text.trim())) return 'All options must have text';
    if (!question.options.some(option => option.is_correct)) return 'Please select a correct answer';
    if (!question.explanation.trim()) return 'Explanation is required';
    return null;
  };

  const submitSingleQuestion = async () => {
    const validationError = validateQuestion(formData, { module_id: formData.module_id, course_id: formData.course_id });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Find the selected module and course names
    const selectedModule = modules.find(m => m.id.toString() === formData.module_id);
    const selectedCourse = courses.find(c => c.id.toString() === formData.course_id);

    if (!selectedModule || !selectedCourse) {
      toast.error('Invalid module or course selection');
      return;
    }

    // Send module and course names instead of IDs
    const requestData = {
      question_text: formData.question_text.trim(),
      module_name: selectedModule.name,
      course_name: selectedCourse.name,
      year: formData.year,
      difficulty: formData.difficulty,
      explanation: formData.explanation.trim(),
      options: formData.options.map(({ id, ...option }) => ({
        option_text: option.option_text.trim(),
        option_letter: option.option_letter.toLowerCase(),
        is_correct: Boolean(option.is_correct)
      }))
    };

    console.log('Submitting question data:', requestData);

    // Validate that exactly one option is correct
    const correctOptions = requestData.options.filter(opt => opt.is_correct);
    if (correctOptions.length !== 1) {
      toast.error('Exactly one option must be marked as correct');
      return;
    }

    try {
      const response = currentQuestion
        ? await apiCall(`/questions/${currentQuestion.id}/`, { 
            method: 'PATCH', 
            body: JSON.stringify(requestData) 
          })
        : await apiCall('/questions/', { 
            method: 'POST', 
            body: JSON.stringify(requestData) 
          });

      console.log('Question created/updated successfully:', response);
      const questionId = response.id;

      // Handle image uploads separately if present
      const imageFormData = new FormData();
      if (formData.image) {
        console.log('Adding question image:', formData.image.name);
        imageFormData.append('image', formData.image);
      }
      if (formData.explanation_image) {
        console.log('Adding explanation image:', formData.explanation_image.name);
        imageFormData.append('explanation_image', formData.explanation_image);
      }

      if (imageFormData.has('image') || imageFormData.has('explanation_image')) {
        console.log('Uploading images...');
        await apiCallWithFile(`/questions/${questionId}/`, imageFormData, 'PATCH');
        console.log('Images uploaded successfully');
      }

      toast.success(`Question ${currentQuestion ? 'updated' : 'created'} successfully`);
      setShowQuestionModal(false);
      await loadQuestions(currentQuestion ? currentPage : 1);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error(`Failed to save question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const submitBulkQuestions = async () => {
    if (questionsToCreate.length === 0) {
      toast.error('No questions to submit');
      return;
    }

    // Find the selected module and course names for bulk settings
    const selectedModule = modules.find(m => m.id.toString() === bulkSettings.module_id);
    const selectedCourse = courses.find(c => c.id.toString() === bulkSettings.course_id);

    if (!selectedModule || !selectedCourse) {
      toast.error('Invalid module or course selection in bulk settings');
      return;
    }

    for (let i = 0; i < questionsToCreate.length; i++) {
      const validationError = validateQuestion(questionsToCreate[i], bulkSettings);
      if (validationError) {
        toast.error(`Question ${i + 1}: ${validationError}`);
        setCurrentQuestionIndex(i);
        return;
      }
    }

    setIsProcessing(true);
    let successCount = 0;
    const totalToCreate = questionsToCreate.length;

    for (const [index, question] of questionsToCreate.entries()) {
      try {
        const requestData = {
          question_text: question.question_text.trim(),
          module_name: selectedModule.name,
          course_name: selectedCourse.name,
          year: bulkSettings.year,
          difficulty: bulkSettings.difficulty,
          explanation: question.explanation.trim(),
          options: question.options.map(({ id, ...rest }) => ({
            option_text: rest.option_text.trim(),
            option_letter: rest.option_letter.toLowerCase(),
            is_correct: Boolean(rest.is_correct)
          }))
        };

        const response = await apiCall('/questions/', { method: 'POST', body: JSON.stringify(requestData) });
        
        const imageFormData = new FormData();
        if (question.image) imageFormData.append('image', question.image);
        if (question.explanation_image) imageFormData.append('explanation_image', question.explanation_image);
        
        if (imageFormData.has('image') || imageFormData.has('explanation_image')) {
          await apiCallWithFile(`/questions/${response.id}/`, imageFormData, 'PATCH');
        }
        
        successCount++;
        toast.info(`Created question ${successCount} of ${totalToCreate}...`);
      } catch (error) {
        console.error(`Error creating question ${index + 1}:`, error);
        toast.error(`Failed to create question ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    toast.success(`Successfully created ${successCount} out of ${totalToCreate} questions`);
    setShowQuestionModal(false);
    await loadQuestions(1);
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (bulkMode) {
        await submitBulkQuestions();
      } else {
        await submitSingleQuestion();
      }
    } finally {
      if (!bulkMode) {
        setIsProcessing(false);
      }
    }
  };

  const getAvailableCourses = () => {
    const moduleId = bulkMode ? bulkSettings.module_id : formData.module_id;
    if (!moduleId) return [];
    return courses.filter(course => course.module.id.toString() === moduleId);
  };

  const difficultyColorClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#002F5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute -right-3 top-20 bg-[#002F5A] text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition-colors">
          {sidebarCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
        <div className="px-4">
          <div className="flex items-center mb-10 justify-center">
            {!sidebarCollapsed && <div className="w-full flex justify-center"><img src="/images/ui/logo.png" alt="ToothQuest Logo" className="w-32 h-auto object-contain" /></div>}
            {sidebarCollapsed && <div className="w-full flex justify-center"><img src="/images/ui/logo.png" alt="ToothQuest Logo" className="w-12 h-auto object-contain" /></div>}
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
              <Link key={item.id} href={item.path} className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${item.id === 'questions' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'}`}>
                <div className={`${item.id === 'questions' ? 'text-white' : 'text-gray-500'}`}>{item.icon}</div>
                {!sidebarCollapsed && <span className={`ml-3 text-sm font-medium ${item.id === 'questions' ? 'text-white' : 'text-gray-600'}`}>{item.name}</span>}
                {sidebarCollapsed && <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-10"><div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">{item.name}</div></div>}
              </Link>
            ))}
            <button onClick={handleLogout} className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative hover:bg-red-50`}>
              <div className="text-red-500"><FaSignOutAlt size={20} /></div>
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium text-red-600">Logout</span>}
              {sidebarCollapsed && <div className="absolute left-full ml-2 scale-0 group-hover:scale-100 transition-all duration-200 origin-left z-10"><div className="bg-gray-800 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">Logout</div></div>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(currentDate);

  const getCurrentQuestion = (): QuestionForm | SingleQuestionFormData => {
    if (bulkMode && questionsToCreate[currentQuestionIndex]) {
      return questionsToCreate[currentQuestionIndex];
    }
    return formData;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <FaQuestionCircle className="mr-3 text-[#002F5A]" /> Question Management
              </h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => handleAddQuestion(false)} className="flex items-center px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors">
                <FaPlus className="mr-2" /> Add Question
              </button>
              <button onClick={() => handleAddQuestion(true)} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <FaCopy className="mr-2" /> Bulk Add (Up to 10)
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-blue-50 rounded-xl shadow-sm p-6 border-l-4 border-[#002F5A]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                  <h3 className="text-3xl font-bold text-[#002F5A]">
                    {totalQuestions}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaQuestionCircle className="h-6 w-6 text-[#002F5A]" />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Questions</p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {questions.filter(q => q.is_active).length}
                  </h3>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With Images</p>
                  <h3 className="text-3xl font-bold text-purple-600">
                    {questions.filter(q => q.has_image).length}
                  </h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaImage className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Modules</p>
                  <h3 className="text-3xl font-bold text-orange-600">
                    {modules.length}
                  </h3>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaTooth className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-gray-900"
                >
                  <option value="">All Modules</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.name}>
                      {module.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-gray-900"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-[#002F5A] focus:border-[#002F5A] bg-white text-gray-900"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Questions Table */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="overflow-x-auto">
              {questions.length === 0 ? (
                <div className="p-8 text-center">
                  <FaQuestionCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">No questions found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || filterModule || filterYear || filterDifficulty
                      ? 'Try changing your search or filter criteria'
                      : 'Start by adding new questions to your database'}
                  </p>
                  <button 
                    onClick={() => handleAddQuestion(false)}
                    className="px-6 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add New Question
                  </button>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module/Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
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
                    {questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                            {question.question_text}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created by {question.created_by.full_name || question.created_by.username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{question.module.name}</div>
                          <div className="text-xs text-gray-500">{question.course.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {question.year}{question.year === 1 ? 'st' : question.year === 2 ? 'nd' : question.year === 3 ? 'rd' : 'th'} Year
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${difficultyColorClass(question.difficulty)}`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.has_image ? (
                            <FaImage className="h-5 w-5 text-[#002F5A]" />
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {question.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewQuestion(question)}
                              className="text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"
                              title="View Question"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="text-[#002F5A] hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                              title="Edit Question"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                              title="Delete Question"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((currentPage - 1) * questionsPerPage) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * questionsPerPage, totalQuestions)}
                      </span>{' '}
                      of <span className="font-medium">{totalQuestions}</span> results
                    </p>
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
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
       {/* Add/Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[95vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="bg-[#002F5A] p-4 text-white flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {bulkMode 
                  ? `Bulk Add Questions (${questionsToCreate.length}/10)` 
                  : currentQuestion 
                    ? 'Edit Question' 
                    : 'Add New Question'
                }
              </h2>
              <button onClick={() => setShowQuestionModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form id="question-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {bulkMode && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Bulk Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Module *</label>
                          <select name="module_id" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={bulkSettings.module_id} onChange={(e) => setBulkSettings({ ...bulkSettings, module_id: e.target.value, course_id: '' })}>
                            <option value="">Select Module</option>
                            {modules.map((module) => <option key={module.id} value={module.id}>{module.name} (Year {module.year})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                          <select name="course_id" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={bulkSettings.course_id} onChange={handleFormChange} disabled={!bulkSettings.module_id}>
                            <option value="">Select Course</option>
                            {getAvailableCourses().map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                          <select name="year" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={bulkSettings.year} onChange={handleFormChange}>
                            {years.map((year) => <option key={year} value={year}>{year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                          <select name="difficulty" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={bulkSettings.difficulty} onChange={handleFormChange}>
                            {difficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                      <button type="button" onClick={addNewQuestionToBulk} disabled={questionsToCreate.length >= 10 || !bulkSettings.module_id || !bulkSettings.course_id} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add Question {questionsToCreate.length + 1}</button>
                        {questionsToCreate.length > 0 && (
                          <div className="flex space-x-2">
                            {questionsToCreate.map((_, index) => <button key={index} type="button" onClick={() => setCurrentQuestionIndex(index)} className={`px-3 py-1 rounded-lg text-sm ${currentQuestionIndex === index ? 'bg-[#002F5A] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Q{index + 1}</button>)}
                          </div>
                        )}
                      </div>
                    </div>
                    {questionsToCreate.length === 0 && <div className="text-center py-8"><p className="text-gray-500">Configure bulk settings above and click "Add Question 1" to start</p></div>}
                  </>
                )}

                {(!bulkMode || (bulkMode && questionsToCreate.length > 0)) && (
                  <>
                    {!bulkMode && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="module_id" className="block text-sm font-medium text-gray-700 mb-1">Module *</label>
                            <select id="module_id" name="module_id" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={formData.module_id} onChange={(e) => setFormData({ ...formData, module_id: e.target.value, course_id: '' })}>
                              <option value="">Select Module</option>
                              {modules.map((module) => <option key={module.id} value={module.id}>{module.name} (Year {module.year})</option>)}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                            <select id="course_id" name="course_id" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={formData.course_id} onChange={handleFormChange} disabled={!formData.module_id}>
                              <option value="">Select Course</option>
                              {getAvailableCourses().map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                            <select id="year" name="year" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={formData.year} onChange={handleFormChange}>
                              {years.map((year) => <option key={year} value={year}>{year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</option>)}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                            <select id="difficulty" name="difficulty" required className="w-full border-2 border-gray-300 text-black rounded-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={formData.difficulty} onChange={handleFormChange}>
                              {difficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</option>)}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                    {bulkMode && questionsToCreate.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">Question {currentQuestionIndex + 1} of {questionsToCreate.length}</h4>
                          {questionsToCreate.length > 1 && <button type="button" onClick={() => removeQuestionFromBulk(currentQuestionIndex)} className="text-red-500 hover:text-red-700 p-1" title="Remove this question"><FaTrash /></button>}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                      <textarea rows={3} required className="w-full border-2 border-gray-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]" placeholder="Enter the question text..." value={getCurrentQuestion().question_text} onChange={(e) => bulkMode ? handleBulkQuestionChange('question_text', e.target.value) : setFormData({...formData, question_text: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (Optional)</label>
                        <div className="mt-1 flex items-center space-x-4 p-2 border-2 border-dashed border-gray-300 rounded-lg">
                          <label htmlFor={`question-image-${bulkMode ? currentQuestionIndex : 'single'}`} className="cursor-pointer bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition">
                            <FaUpload className="inline mr-2" /><span>Choose File</span>
                            <input id={`question-image-${bulkMode ? currentQuestionIndex : 'single'}`} name="image" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'image')} />
                          </label>
                          <span className="text-sm text-gray-500 truncate">{getCurrentQuestion().image?.name || 'No file selected'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation Image (Optional)</label>
                        <div className="mt-1 flex items-center space-x-4 p-2 border-2 border-dashed border-gray-300 rounded-lg">
                          <label htmlFor={`explanation-image-${bulkMode ? currentQuestionIndex : 'single'}`} className="cursor-pointer bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition">
                            <FaUpload className="inline mr-2" /><span>Choose File</span>
                            <input id={`explanation-image-${bulkMode ? currentQuestionIndex : 'single'}`} name="explanation_image" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'explanation_image')} />
                          </label>
                          <span className="text-sm text-gray-500 truncate">{getCurrentQuestion().explanation_image?.name || 'No file selected'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation *</label>
                      <textarea rows={4} required className="w-full border-2 border-gray-300 rounded-lg p-3 text-black focus:ring-[#002F5A] focus:border-[#002F5A]" placeholder="Explain why the correct answer is correct..." value={getCurrentQuestion().explanation} onChange={(e) => bulkMode ? handleBulkQuestionChange('explanation', e.target.value) : setFormData({...formData, explanation: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Options & Correct Answer *</label>
                      {getCurrentQuestion().options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex items-center h-5">
                            <input id={`is-correct-${option.option_letter}`} name={`is-correct-${bulkMode ? currentQuestionIndex : 'single'}`} type="radio" checked={option.is_correct} onChange={() => handleOptionChange(option.option_letter, 'is_correct', true)} className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"/>
                          </div>
                          <label htmlFor={`is-correct-${option.option_letter}`} className="text-sm font-medium text-gray-700">Correct</label>
                          <div className="flex-grow flex items-center">
                            <span className="h-full px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">{option.option_letter.toUpperCase()}</span>
                            <input type="text" required placeholder={`Option ${option.option_letter.toUpperCase()}`} className="flex-1 w-full border-2 border-gray-300 text-black rounded-r-lg p-3 focus:ring-[#002F5A] focus:border-[#002F5A]" value={option.option_text} onChange={(e) => handleOptionChange(option.option_letter, 'option_text', e.target.value)}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </form>
            <div className="bg-gray-50 p-4 flex justify-end space-x-4 border-t border-gray-200 rounded-b-xl mt-auto">
              <button type="button" onClick={() => setShowQuestionModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" form="question-form" disabled={isProcessing || (bulkMode && questionsToCreate.length === 0)} className="px-6 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center">
                {isProcessing ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Processing...</>) : (<><FaSave className="mr-2" />{bulkMode ? 'Save All Questions' : currentQuestion ? 'Save Changes' : 'Create Question'}</>)}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
          <motion.div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800">View Question Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-100 p-3 rounded-lg"><div className="font-semibold text-gray-600">Module</div><div className="text-gray-800">{currentQuestion.module.name}</div></div>
                <div className="bg-gray-100 p-3 rounded-lg"><div className="font-semibold text-gray-600">Course</div><div className="text-gray-800">{currentQuestion.course.name}</div></div>
                <div className="bg-gray-100 p-3 rounded-lg"><div className="font-semibold text-gray-600">Year</div><div className="text-gray-800">{currentQuestion.year}</div></div>
                <div className="bg-gray-100 p-3 rounded-lg"><div className="font-semibold text-gray-600">Difficulty</div><span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficultyColorClass(currentQuestion.difficulty)}`}>{currentQuestion.difficulty}</span></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Question:</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{currentQuestion.question_text}</p>
                {currentQuestion.image && <div className="mt-4"><img src={currentQuestion.image} alt="Question" className="max-w-full md:max-w-md rounded-lg shadow-md" /></div>}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Options:</h3>
                <ul className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <li key={option.id || option.option_letter} className={`flex items-start p-3 rounded-lg border ${option.is_correct ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex-shrink-0 mr-3 mt-1">{option.is_correct ? <FaCheck className="text-green-600" /> : <FaTimes className="text-red-500" />}</div>
                      <div className="text-gray-800"><span className="font-bold mr-2">{option.option_letter.toUpperCase()}.</span>{option.option_text}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Explanation:</h3>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg">{currentQuestion.explanation}</p>
                {currentQuestion.explanation_image && <div className="mt-4"><img src={currentQuestion.explanation_image} alt="Explanation" className="max-w-full md:max-w-md rounded-lg shadow-md" /></div>}
              </div>
            </div>
            <div className="bg-gray-50 p-4 border-t flex justify-end mt-auto">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-md" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><FaTrash className="h-6 w-6 text-red-600" /></div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Delete Question</h3>
              <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this question? This action cannot be undone.</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button type="button" disabled={isProcessing} onClick={confirmDeleteQuestion} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
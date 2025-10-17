'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaTooth, 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUniversity, 
  FaGraduationCap,
  FaPhone,
  FaKey,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// Type definitions
interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  university: string;
  year: number;
  phone: string;
  access_code: string;
}

interface AccessCodeValidation {
  isValid: boolean;
  isUsed: boolean;
  package: string;
  isLoading: boolean;
  error: string;
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Algerian Universities list
const ALGERIAN_UNIVERSITIES = [
  'University of Algiers 1',
  'University of Algiers 2', 
  'University of Algiers 3',
  'University of Constantine 1',
  'University of Constantine 2',
  'University of Constantine 3',
  'University of Oran 1',
  'University of Oran 2',
  'University of Annaba',
  'University of Blida 1',
  'University of Blida 2',
  'University of Batna 1',
  'University of Batna 2',
  'University of Setif 1',
  'University of Setif 2',
  'University of Tlemcen',
  'University of Bejaia',
  'University of Tizi Ouzou',
  'University of Sidi Bel Abbes',
  'University of Mostaganem'
];

const DENTAL_YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
  { value: 5, label: '5th Year' }
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creatureBlink, setCreatureBlink] = useState(false);
  
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    university: '',
    year: 1,
    phone: '',
    access_code: ''
  });

  const [accessCodeValidation, setAccessCodeValidation] = useState<AccessCodeValidation>({
    isValid: false,
    isUsed: false,
    package: '',
    isLoading: false,
    error: ''
  });

  // Creature animations
  const triggerBlink = () => {
    setCreatureBlink(true);
    setTimeout(() => setCreatureBlink(false), 300);
  };

  // Debounced access code validation
  useEffect(() => {
    const validateAccessCode = async () => {
      if (!formData.access_code || formData.access_code.length < 8) {
        setAccessCodeValidation({
          isValid: false,
          isUsed: false,
          package: '',
          isLoading: false,
          error: ''
        });
        return;
      }

      setAccessCodeValidation(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch(`${API_BASE_URL}/auth/validate-access-code/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: formData.access_code }),
        });

        const data = await response.json();

        if (response.ok) {
          setAccessCodeValidation({
            isValid: data.valid && data.status === 'unused',
            isUsed: data.status === 'used',
            package: data.package || '',
            isLoading: false,
            error: data.valid ? '' : 'Invalid access code'
          });
        } else {
          setAccessCodeValidation({
            isValid: false,
            isUsed: false,
            package: '',
            isLoading: false,
            error: data.error || 'Invalid access code'
          });
        }
      } catch (error) {
        setAccessCodeValidation({
          isValid: false,
          isUsed: false,
          package: '',
          isLoading: false,
          error: 'Failed to validate access code'
        });
      }
    };

    const timeoutId = setTimeout(validateAccessCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.access_code]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, dots, hyphens and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    // University validation
    if (!formData.university) {
      newErrors.university = 'Please select your university';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^(\+213|0)[5-7][0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Algerian phone number';
    }

    // Access code validation
    if (!formData.access_code.trim()) {
      newErrors.access_code = 'Access code is required';
    } else if (!accessCodeValidation.isValid) {
      if (accessCodeValidation.isUsed) {
        newErrors.access_code = 'This access code has already been used';
      } else if (accessCodeValidation.error) {
        newErrors.access_code = accessCodeValidation.error;
      } else {
        newErrors.access_code = 'Please enter a valid access code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!accessCodeValidation.isValid) {
      toast.error('Please enter a valid access code');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        university: formData.university,
        year: formData.year,
        phone: formData.phone.trim(),
        access_code: formData.access_code.trim()
      };

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Registration successful! Please check your email for verification.');
        
        // Store user data for potential auto-login after email verification
        localStorage.setItem('toothquest-pending-verification', JSON.stringify({
          email: formData.email,
          package: accessCodeValidation.package
        }));

        // Redirect to login page
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 2000);
      } else {
        // Handle specific errors
        if (data.username) {
          setErrors(prev => ({ ...prev, username: data.username[0] }));
        }
        if (data.email) {
          setErrors(prev => ({ ...prev, email: data.email[0] }));
        }
        if (data.access_code) {
          setErrors(prev => ({ ...prev, access_code: data.access_code[0] }));
        }
        
        toast.error(data.error || data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ToothCreature = () => (
    <motion.div 
      className="relative"
      onMouseEnter={triggerBlink}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="w-20 h-20 bg-[#00BBB9] rounded-full flex items-center justify-center relative overflow-hidden">
        {/* Tooth body */}
        <FaTooth className="text-3xl text-white" />
        
        {/* Eyes */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <motion.div 
            className={`w-2 h-2 bg-[#002F5A] rounded-full ${creatureBlink ? 'h-1' : ''}`}
            animate={{ scaleY: creatureBlink ? 0.2 : 1 }}
            transition={{ duration: 0.1 }}
          />
          <motion.div 
            className={`w-2 h-2 bg-[#002F5A] rounded-full ${creatureBlink ? 'h-1' : ''}`}
            animate={{ scaleY: creatureBlink ? 0.2 : 1 }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            repeatDelay: 1 
          }}
        />
      </div>
    </motion.div>
  );

  const PasswordCreature = ({ type }: { type: 'password' | 'confirm' }) => {
    const isVisible = type === 'password' ? showPassword : showConfirmPassword;
    const toggleVisibility = () => {
      if (type === 'password') {
        setShowPassword(!showPassword);
      } else {
        setShowConfirmPassword(!showConfirmPassword);
      }
    };

    return (
      <motion.div 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer z-10"
        onClick={toggleVisibility}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-[#00BBB9]/20 to-[#00BBB9]/30 rounded-full flex items-center justify-center relative">
          {/* Creature body */}
          <div className="w-4 h-4 bg-[#00BBB9] rounded-full relative">
            {/* Eyes */}
            <AnimatePresence mode="wait">
              {isVisible ? (
                <motion.div
                  key="open-eyes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5"
                >
                  <div className="w-1 h-1 bg-[#002F5A] rounded-full" />
                  <div className="w-1 h-1 bg-[#002F5A] rounded-full" />
                </motion.div>
              ) : (
                <motion.div
                  key="hands-over-eyes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                >
                  {/* Hands covering eyes */}
                  <div className="w-3 h-2 bg-[#002F5A] rounded-sm" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  const getAccessCodeStatus = () => {
    if (accessCodeValidation.isLoading) {
      return (
        <div className="flex items-center text-blue-600">
          <FaSpinner className="animate-spin mr-2" />
          <span className="text-sm">Validating...</span>
        </div>
      );
    }

    if (formData.access_code && !accessCodeValidation.isLoading) {
      if (accessCodeValidation.isValid) {
        return (
          <div className="flex items-center text-green-600">
            <FaCheckCircle className="mr-2" />
            <span className="text-sm">Valid - {accessCodeValidation.package}</span>
          </div>
        );
      } else if (accessCodeValidation.isUsed) {
        return (
          <div className="flex items-center text-red-600">
            <FaTimes className="mr-2" />
            <span className="text-sm">Code already used</span>
          </div>
        );
      } else if (accessCodeValidation.error) {
        return (
          <div className="flex items-center text-red-600">
            <FaExclamationTriangle className="mr-2" />
            <span className="text-sm">{accessCodeValidation.error}</span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF5F7] via-[#ECF5F7] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 lg:max-h-[90vh]"
      >
        {/* Left Side - Welcome Section */}
        <div className="bg-gradient-to-br from-[#002F5A] via-[#002F5A] to-[#00BBB9] p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-5 w-12 h-12 border-2 border-white rounded-full"></div>
          </div>
          
          <motion.div 
            className="text-center z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
             <div className="flex justify-center mb-6">
            <img 
          src="\images\ui\ToothQuest SVG files\Tooth Quest for dark bachgrounds vertical version.svg" 
          alt="ToothQuest Logo" 
          className="w-250 h-auto object-contain"
        />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              Join ToothQuest<span className="text-[#00BBB9]">.</span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-md">
              Start your journey to dental excellence. Get access to premium study materials and practice questions.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">2000+</div>
                <div className="text-[#00BBB9]">Practice Questions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">5</div>
                <div className="text-[#00BBB9]">Study Years</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="p-8 lg:p-12 overflow-y-auto">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#002F5A] mb-2">Create Account</h2>
            <p className="text-gray-600 mb-6">Join thousands of dental students</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Access Code - Priority field */}
              <div>
                <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                  Access Code *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="access_code"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border-2 ${
                      errors.access_code ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                    placeholder="Enter your access code"
                    value={formData.access_code}
                    onChange={handleInputChange}
                  />
                </div>
                {/* Access Code Status */}
                <div className="mt-2">
                  {getAccessCodeStatus()}
                </div>
                {errors.access_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.access_code}</p>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border-2 ${
                        errors.full_name ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border-2 ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    className={`block w-full pl-10 pr-3 py-3 border-2 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* University and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                    University *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUniversity className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="university"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border-2 ${
                        errors.university ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 transition-all outline-none`}
                      value={formData.university}
                      onChange={handleInputChange}
                    >
                      <option value="">Select University</option>
                      {ALGERIAN_UNIVERSITIES.map((university) => (
                        <option key={university} value={university}>
                          {university}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.university && (
                    <p className="mt-1 text-sm text-red-600">{errors.university}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                    Study Year *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaGraduationCap className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="year"
                      required
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 transition-all outline-none"
                      value={formData.year}
                      onChange={handleInputChange}
                    >
                      {DENTAL_YEARS.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    className={`block w-full pl-10 pr-3 py-3 border-2 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                    placeholder="+213 XXX XXX XXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      className={`block w-full pl-10 pr-12 py-3 border-2 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <PasswordCreature type="password" />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      className={`block w-full pl-10 pr-12 py-3 border-2 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none`}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <PasswordCreature type="confirm" />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                Password must contain: uppercase letter, lowercase letter, number (min 8 characters)
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !accessCodeValidation.isValid}
                className="w-full bg-gradient-to-r from-[#00BBB9] to-[#002F5A] text-white py-3 px-4 rounded-xl font-semibold hover:from-[#002F5A] hover:to-[#00BBB9] focus:outline-none focus:ring-2 focus:ring-[#00BBB9] focus:ring-offset-2 disabled:opacity-50 transition-all"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaUserPlus className="mr-2" />
                    Create Account
                  </span>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-semibold text-[#00BBB9] hover:text-[#002F5A] transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Access Code Info */}
            <div className="mt-6 bg-[#ECF5F7] p-4 rounded-xl">
              <div className="flex items-start">
                <FaKey className="h-5 w-5 text-[#00BBB9] mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-[#002F5A] mb-2">
                    Need an Access Code?
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>📚 University Library: Purchase codes from your library</p>
                    <p>💳 Online: Buy through our secure payment system</p>
                    <p>🎓 Package Types: 1st-5th year or complete access</p>
                  </div>
                  <div className="mt-3">
                    <Link 
                      href="/subscribe" 
                      className="inline-flex items-center px-3 py-1.5 bg-[#00BBB9] text-white text-xs font-medium rounded-lg hover:bg-[#002F5A] transition-colors"
                    >
                      <FaKey className="mr-1.5" />
                      Get Access Code
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center text-green-600 mb-1">
                <FaCheckCircle className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Secure Registration</span>
              </div>
              <p className="text-xs text-green-700">
                Your data is protected with 256-bit SSL encryption.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
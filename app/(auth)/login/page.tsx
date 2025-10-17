'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaEnvelope, 
  FaLock, 
  FaTooth, 
  FaSpinner, 
  FaEye, 
  FaEyeSlash,
  FaSignInAlt,
  FaGoogle,
  FaFacebook,
  FaGithub,
  FaUserPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creatureBlink, setCreatureBlink] = useState(false);

  // Creature animations
  const triggerBlink = () => {
    setCreatureBlink(true);
    setTimeout(() => setCreatureBlink(false), 300);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const data = await apiCall('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Store authentication data
      localStorage.setItem('toothquest-token', data.token);
      localStorage.setItem('toothquest-user', JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.full_name || data.user.username}!`);

      // Redirect based on user role
      if (data.user.role === 'super_admin' || data.user.role === 'admin' || data.user.role === 'moderator') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error) {
      toast.error(`Login failed: ${error}`);
      console.error('Login error:', error);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await handleEmailLogin();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login function for demo
  const quickLogin = async (userType: 'admin' | 'student') => {
    setIsLoading(true);
    
    const credentials = {
      admin: { email: 'admin@toothquest.com', password: 'admin123' },
      student: { email: 'student@toothquest.com', password: 'student123' }
    };

    setEmail(credentials[userType].email);
    setPassword(credentials[userType].password);
    
    try {
      const data = await apiCall('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials[userType]),
      });

      localStorage.setItem('toothquest-token', data.token);
      localStorage.setItem('toothquest-user', JSON.stringify(data.user));

      toast.success(`Quick login as ${userType}!`);

      if (userType === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error) {
      toast.error(`Quick login failed: ${error}`);
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

  const PasswordCreature = () => (
    <motion.div 
      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer z-10"
      onClick={() => setShowPassword(!showPassword)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-[#00BBB9]/20 to-[#00BBB9]/30 rounded-full flex items-center justify-center relative">
        {/* Creature body */}
        <div className="w-4 h-4 bg-[#00BBB9] rounded-full relative">
          {/* Eyes */}
          <AnimatePresence mode="wait">
            {showPassword ? (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF5F7] via-[#ECF5F7] to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]"
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
            
            
            
            <p className="text-xl text-white/80 mb-8 max-w-md">
              Your journey to dental excellence starts here. Practice, learn, and excel with confidence.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">2000+</div>
                <div className="text-[#00BBB9]">Practice Questions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-[#00BBB9]">Study Access</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#002F5A] mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#002F5A] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:ring-[#00BBB9] focus:border-[#00BBB9] bg-white text-gray-900 placeholder-gray-400 transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordCreature />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#00BBB9] focus:ring-[#00BBB9] border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-[#00BBB9] hover:text-[#002F5A] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#00BBB9] to-[#002F5A] text-white py-3 px-4 rounded-xl font-semibold hover:from-[#002F5A] hover:to-[#00BBB9] focus:outline-none focus:ring-2 focus:ring-[#00BBB9] focus:ring-offset-2 disabled:opacity-50 transition-all"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaSignInAlt className="mr-2" />
                    Sign In
                  </span>
                )}
              </motion.button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: FaGoogle, color: 'hover:bg-red-50 hover:border-red-300' },
                  { icon: FaFacebook, color: 'hover:bg-blue-50 hover:border-blue-300' },
                  { icon: FaGithub, color: 'hover:bg-gray-50 hover:border-gray-400' }
                ].map((social, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    className={`w-full inline-flex justify-center py-2 px-4 border-2 border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 transition-all ${social.color}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="font-semibold text-[#00BBB9] hover:text-[#002F5A] transition-colors inline-flex items-center"
                >
                  <FaUserPlus className="mr-1 h-3 w-3" />
                  Create Account
                </Link>
              </p>
            </div>

            {/* Demo credentials and quick login */}
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-[#ECF5F7] rounded-xl">
                <h4 className="text-xs font-semibold text-[#002F5A] mb-2">Demo Credentials:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Super Admin: admin@toothquest.com / admin123</div>
                  <div>Student: student@toothquest.com / student123</div>
                </div>
              </div>
              
              {/* Quick Login Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quick Admin Login
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => quickLogin('student')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quick Student Login
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
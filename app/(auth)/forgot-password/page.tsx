 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaTooth, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would make an API call to request password reset
      // This is a simulation of that process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
      console.error('Error sending reset link:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden"
          >
            <div className="bg-oxford p-6 flex items-center justify-center">
              <div className="flex items-center text-white">
                <FaTooth className="h-10 w-10 text-turquoise" />
                <h2 className="ml-3 text-2xl font-bold font-bw-mitga">
                  ToothQuest<span className="text-turquoise">.</span>
                </h2>
              </div>
            </div>
            
            <div className="px-6 py-8 text-center">
              <div className="mb-6 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="h-8 w-8 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-oxford mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We have sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions to reset your password.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                If you don't see the email, please check your spam folder or try again.
              </p>
              
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/login"
                  className="w-full py-3 bg-turquoise text-white font-bold rounded-lg hover:bg-turquoise-dark transition-colors"
                >
                  Return to Login
                </Link>
                
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-3 bg-transparent border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="bg-oxford p-6 flex items-center justify-center">
            <div className="flex items-center text-white">
              <FaTooth className="h-10 w-10 text-turquoise" />
              <h2 className="ml-3 text-2xl font-bold font-bw-mitga">
                ToothQuest<span className="text-turquoise">.</span>
              </h2>
            </div>
          </div>
          
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-oxford text-center mb-2">
              Reset Your Password
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Enter your email address and we'll send you a link to reset your password
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 p-3 sm:text-sm border-gray-300 rounded-md focus:ring-turquoise focus:border-turquoise"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-turquoise hover:bg-turquoise-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-turquoise transition-colors"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-turquoise hover:text-turquoise-dark">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaTooth, FaUser, FaSignInAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);

  // Simulate checking auth state
  useEffect(() => {
    // This would normally check a token or session
    const checkAuth = () => {
      const token = localStorage.getItem('toothquest-token');
      if (token) {
        setIsLoggedIn(true);
        // In a real app, you would decode the token to get the user role
        setUserRole('student');
      }
    };
    
    // Add scroll listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    checkAuth();
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/subscription' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 mr-2 text-turquoise">
              <FaTooth size={36} className="animate-tooth-bounce" />
            </div>
            <span className={`text-2xl font-bold font-bw-mitga ${isScrolled ? 'text-oxford' : 'text-white'}`}>
              ToothQuest<span className="text-turquoise">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`font-medium transition-colors hover:text-turquoise ${
                  isScrolled ? 'text-oxford' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {isLoggedIn ? (
              <Link 
                href={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="px-4 py-2 bg-turquoise text-white rounded-lg flex items-center space-x-2 hover:bg-turquoise-dark transition-colors"
              >
                <FaUser />
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className={`font-medium transition-colors hover:text-turquoise flex items-center space-x-1 ${
                    isScrolled ? 'text-oxford' : 'text-white'
                  }`}
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-2xl"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FaTimes className={isScrolled ? 'text-oxford' : 'text-white'} />
            ) : (
              <FaBars className={isScrolled ? 'text-oxford' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-oxford font-medium py-2 hover:text-turquoise transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {isLoggedIn ? (
                  <Link
                    href={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                    className="bg-turquoise text-white py-3 rounded-lg text-center flex items-center justify-center space-x-2 hover:bg-turquoise-dark transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-oxford font-medium py-2 flex items-center space-x-2 hover:text-turquoise transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaSignInAlt />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="bg-turquoise text-white py-3 rounded-lg text-center hover:bg-turquoise-dark transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
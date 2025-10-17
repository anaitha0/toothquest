 
'use client';

import Link from 'next/link';
import { FaTooth, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-oxford text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Company Info */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <div className="relative w-10 h-10 mr-2 text-turquoise">
                <FaTooth size={36} />
              </div>
              <span className="text-2xl font-bold font-bw-mitga">
                ToothQuest<span className="text-turquoise">.</span>
              </span>
            </Link>
            <p className="text-gray-300 mb-4">
              The ultimate dental MCQ platform designed to help dental students excel in their exams.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-turquoise transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-turquoise transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-turquoise transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-300 hover:text-turquoise transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-gray-300 hover:text-turquoise transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-turquoise transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Subscription Plans */}
          <div>
            <h3 className="text-xl font-bold mb-4">Subscription Plans</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/subscription#year1" className="text-gray-300 hover:text-turquoise transition-colors">
                  1st Year Package
                </Link>
              </li>
              <li>
                <Link href="/subscription#year2" className="text-gray-300 hover:text-turquoise transition-colors">
                  2nd Year Package
                </Link>
              </li>
              <li>
                <Link href="/subscription#year3" className="text-gray-300 hover:text-turquoise transition-colors">
                  3rd Year Package
                </Link>
              </li>
              <li>
                <Link href="/subscription#year4" className="text-gray-300 hover:text-turquoise transition-colors">
                  4th Year Package
                </Link>
              </li>
              <li>
                <Link href="/subscription#year5" className="text-gray-300 hover:text-turquoise transition-colors">
                  5th Year Package
                </Link>
              </li>
              <li>
                <Link href="/subscription#complete" className="text-gray-300 hover:text-turquoise transition-colors">
                  Complete Package
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-turquoise" />
                <span className="text-gray-300">
                  Faculty of Dental Medicine,<br />
                  University Campus, Main Street,<br />
                  Algiers, Algeria
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-turquoise" />
                <a href="mailto:info@toothquest.com" className="text-gray-300 hover:text-turquoise transition-colors">
                  info@toothquest.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-3 text-turquoise" />
                <a href="tel:+213123456789" className="text-gray-300 hover:text-turquoise transition-colors">
                  +213 12 345 6789
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} ToothQuest. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-gray-400 text-sm hover:text-turquoise transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 text-sm hover:text-turquoise transition-colors">
              Terms of Service
            </Link>
            <Link href="/faq" className="text-gray-400 text-sm hover:text-turquoise transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
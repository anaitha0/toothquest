import { useState } from 'react';
import Link from 'next/link';
import { 
  FaTooth, 
  FaHome,
  FaGraduationCap,
  FaBookOpen,
  FaCalendarAlt,
  FaChartLine,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaUserAlt,
  FaClipboardList
} from 'react-icons/fa';

interface SidebarProps {
  activeTab: string;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onLogout }: SidebarProps) {
  return (
    <aside className="p-4 h-screen">
      <div className="bg-indigo-600 rounded-3xl h-full flex flex-col p-4 shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center p-4">
          <div className="bg-white rounded-full p-3">
            <FaTooth className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-8">
          <ul className="space-y-6">
            <li>
              <Link 
                href="/dashboard" 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <FaHome className="h-6 w-6" />
              </Link>
            </li>
            <li>
              <Link 
                href="/calendar" 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'calendar' 
                    ? 'bg-white text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <FaCalendarAlt className="h-6 w-6" />
              </Link>
            </li>
            <li>
              <Link 
                href="/messages" 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'messages' 
                    ? 'bg-white text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
            </li>
            <li>
              <Link 
                href="/patients" 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'patients' 
                    ? 'bg-white text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <FaUserAlt className="h-6 w-6" />
              </Link>
            </li>
            <li>
              <Link 
                href="/reports" 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'reports' 
                    ? 'bg-white text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <FaClipboardList className="h-6 w-6" />
              </Link>
            </li>
            <li>
              <Link 
                href="/settings" 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  activeTab === 'settings' 
                    ? 'bg-white text-indigo-600' 
                    : 'text-white hover:bg-indigo-500'
                }`}
              >
                <FaCog className="h-6 w-6" />
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="mt-auto mb-4">
          <button 
            onClick={onLogout}
            className="flex items-center justify-center p-3 rounded-xl text-white hover:bg-indigo-500 transition-all duration-200 w-full"
          >
            <FaSignOutAlt className="h-6 w-6" />
          </button>
        </div>
      </div>
    </aside>
  );
}
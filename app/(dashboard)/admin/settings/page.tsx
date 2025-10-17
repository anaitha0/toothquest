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
  FaReceipt,
  FaEnvelope,
  FaLock,
  FaDatabase,
  FaServer,
  FaCloudUploadAlt,
  FaBell,
  FaSignOutAlt,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaKey} from 'react-icons/fa6';

// Email settings dummy data
const emailSettings = {
  smtpServer: 'smtp.toothquest.com',
  smtpPort: 587,
  smtpUsername: 'notifications@toothquest.com',
  smtpPassword: '••••••••••••',
  fromEmail: 'notifications@toothquest.com',
  fromName: 'ToothQuest Education',
  enableEmails: true
};

// Email templates dummy data
const emailTemplates = [
  { id: 1, name: 'Welcome Email', subject: 'Welcome to ToothQuest', lastUpdated: '2025-01-15' },
  { id: 2, name: 'Password Reset', subject: 'ToothQuest - Reset Your Password', lastUpdated: '2025-01-15' },
  { id: 3, name: 'Account Confirmation', subject: 'Confirm Your ToothQuest Account', lastUpdated: '2025-01-15' },
  { id: 4, name: 'Subscription Receipt', subject: 'Your ToothQuest Subscription Receipt', lastUpdated: '2025-01-15' },
  { id: 5, name: 'Subscription Expiry', subject: 'Your ToothQuest Subscription is Expiring Soon', lastUpdated: '2025-01-15' }
];

// System settings dummy data
const systemSettings = {
  maintenanceMode: false,
  debugMode: false,
  maxUploadSize: 10, // MB
  sessionTimeout: 60, // minutes
  allowRegistration: true,
  requireEmailVerification: true,
  maxLoginAttempts: 5,
  backupFrequency: 'daily',
  lastBackup: '2025-03-27 03:00:00'
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ToothQuest',
    siteDescription: 'Dental exams platform for dental students',
    contactEmail: 'contact@toothquest.com',
    supportPhone: '+213 123 456 789',
    privacyPolicy: '',
    termsOfService: ''
  });
  
  const [emailConfig, setEmailConfig] = useState(emailSettings);
  const [systemConfig, setSystemConfig] = useState(systemSettings);
  
  useEffect(() => {
    // Check if user is logged in and is an admin
    const token = localStorage.getItem('toothquest-token');
    const user = localStorage.getItem('toothquest-user');
    
    
    // Load privacy policy and terms content (simulated)
    const privacyContent = `
# Privacy Policy

**Last Updated: March 15, 2025**

This Privacy Policy describes how ToothQuest ("we", "us", or "our") collects, uses, and shares your information when you use our services.

## Information We Collect

- **Account Information**: When you register, we collect your name, email address, and academic information.
- **Usage Data**: We collect information about how you interact with our platform.
- **Quiz Results**: We store your quiz attempts and scores to track your progress.

## How We Use Your Information

- To provide and improve our services
- To personalize your learning experience
- To communicate with you about your account and our services
- To analyze usage patterns and optimize our platform

## Data Security

We implement appropriate security measures to protect your personal information and maintain its confidentiality.

## Your Rights

You have the right to access, correct, and delete your personal information. To exercise these rights, please contact us at privacy@toothquest.com.
    `;
    
    const termsContent = `
# Terms of Service

**Last Updated: March 15, 2025**

These Terms of Service ("Terms") govern your access to and use of the ToothQuest platform.

## Account Registration

You must register for an account to access our services. You are responsible for maintaining the confidentiality of your account credentials.

## Subscription and Payments

- Subscription fees are charged according to the plan you select.
- All payments are processed securely through our payment providers.
- Subscriptions auto-renew unless cancelled before the renewal date.

## User Conduct

You agree not to:
- Share your account credentials with others
- Attempt to reverse engineer our platform
- Use our services for any illegal purposes
- Distribute or share content from our platform without permission

## Intellectual Property

All content on the ToothQuest platform is owned by us or our licensors and is protected by intellectual property laws.

## Termination

We reserve the right to suspend or terminate your account for violations of these Terms or for any other reason at our discretion.
    `;
    
    // Simulate loading data
    setTimeout(() => {
      setGeneralSettings(prev => ({
        ...prev,
        privacyPolicy: privacyContent,
        termsOfService: termsContent
      }));
      setIsLoading(false);
    }, 1000);
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('toothquest-token');
    localStorage.removeItem('toothquest-user');
    router.push('/login');
  };

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSystemSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSystemConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number'
          ? parseInt(value)
          : value
    }));
  };
  
  const handleSaveSettings = (type: 'general' | 'email' | 'system') => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} settings saved successfully`);
    }, 1500);
  };
  
  const handleBackupDatabase = () => {
    toast.info('Database backup initiated');
    
    // Simulate backup process
    setTimeout(() => {
      setSystemConfig(prev => ({
        ...prev,
        lastBackup: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }));
      toast.success('Database backup completed successfully');
    }, 3000);
  };
  
  const handleResetToDefault = (type: 'general' | 'email' | 'system') => {
    if (confirm('Are you sure you want to reset to default settings? This action cannot be undone.')) {
      setIsSaving(true);
      
      // Simulate API call
      setTimeout(() => {
        if (type === 'general') {
          setGeneralSettings({
            siteName: 'ToothQuest',
            siteDescription: 'Dental exams platform for dental students',
            contactEmail: 'contact@toothquest.com',
            supportPhone: '+213 123 456 789',
            privacyPolicy: generalSettings.privacyPolicy,
            termsOfService: generalSettings.termsOfService
          });
        } else if (type === 'email') {
          setEmailConfig(emailSettings);
        } else if (type === 'system') {
          setSystemConfig(systemSettings);
        }
        
        setIsSaving(false);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} settings reset to default`);
      }, 1500);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Enhanced Sidebar Component
  const EnhancedSidebar = () => {
    return (
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white rounded-tr-2xl rounded-br-2xl shadow-lg h-full py-6 transition-all duration-300 ease-in-out relative`}>
        {/* Toggle button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-[#002F5A] text-white p-1.5 rounded-full shadow-md hover:bg-[#002F5A] transition-colors"
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
              { icon: <FaChartBar size={20} />, name: 'Dashboard', id: 'dashboard', path: '/admin/dashboard' },
              { icon: <FaUsers size={20} />, name: 'Users', id: 'users', path: '/admin/users' },
              { icon: <FaQuestionCircle size={20} />, name: 'Questions', id: 'questions', path: '/admin/questions' },
              { icon: <FaExclamationTriangle size={20} />, name: 'Reported Questions', id: 'reports', path: '/admin/reports' },
              { icon: <FaKey size={20} />, name: 'Access Codes', id: 'codes', path: '/admin/codes' },
              { icon: <FaUserShield size={20} />, name: 'Admin Management', id: 'admin-management', path: '/admin/admins' },
              { icon: <FaClipboardList size={20} />, name: 'Statistics', id: 'statistics', path: '/admin/statistics' },
              { icon: <FaCog size={20} />, name: 'Settings', id: 'settings', path: '/admin/settings' },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative ${
                  item.id === 'settings' ? 'bg-[#002F5A]' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`${item.id === 'settings' ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                
                {!sidebarCollapsed && (
                  <span className={`ml-3 text-sm font-medium ${item.id === 'settings' ? 'text-white' : 'text-gray-600'}`}>
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
              </Link>
            ))}

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className={`group flex items-center py-3 ${sidebarCollapsed ? 'justify-center' : 'px-4'} rounded-xl cursor-pointer relative hover:bg-red-50`}
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
            </button>
          </div>
        </div>
      </div>
    );
  };

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(currentDate);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Settings</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === 'general' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('general')}
              >
                General Settings
              </button>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === 'email' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('email')}
              >
                Email Settings
              </button>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === 'system' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('system')}
              >
                System Settings
              </button>
            </div>
          </div>
          
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">General Settings</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleResetToDefault('general')}
                    disabled={isSaving}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => handleSaveSettings('general')}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <input
                    type="text"
                    id="siteDescription"
                    name="siteDescription"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="supportPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    id="supportPhone"
                    name="supportPhone"
                    className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                    value={generalSettings.supportPhone}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="privacyPolicy" className="block text-sm font-medium text-gray-700 mb-1">
                  Privacy Policy
                </label>
                <textarea
                  id="privacyPolicy"
                  name="privacyPolicy"
                  rows={10}
                  className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-mono text-sm"
                  value={generalSettings.privacyPolicy}
                  onChange={handleGeneralSettingsChange}
                />
              </div>
              
              <div>
                <label htmlFor="termsOfService" className="block text-sm font-medium text-gray-700 mb-1">
                  Terms of Service
                </label>
                <textarea
                  id="termsOfService"
                  name="termsOfService"
                  rows={10}
                  className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-mono text-sm"
                  value={generalSettings.termsOfService}
                  onChange={handleGeneralSettingsChange}
                />
              </div>
            </motion.div>
          )}
          
          {/* Email Settings */}
          {activeTab === 'email' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Email Configuration</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleResetToDefault('email')}
                      disabled={isSaving}
                      className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                    >
                      Reset to Default
                    </button>
                    <button
                      onClick={() => handleSaveSettings('email')}
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableEmails"
                      name="enableEmails"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={emailConfig.enableEmails}
                      onChange={handleEmailSettingsChange}
                    />
                    <label htmlFor="enableEmails" className="ml-2 block text-sm text-gray-900">
                      Enable Email Notifications
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      id="smtpServer"
                      name="smtpServer"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:opacity-50"
                      value={emailConfig.smtpServer}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailConfig.enableEmails}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      id="smtpPort"
                      name="smtpPort"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:opacity-50"
                      value={emailConfig.smtpPort}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailConfig.enableEmails}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      id="smtpUsername"
                      name="smtpUsername"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:opacity-50"
                      value={emailConfig.smtpUsername}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailConfig.enableEmails}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      id="smtpPassword"
                      name="smtpPassword"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:opacity-50"
                      value={emailConfig.smtpPassword}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailConfig.enableEmails}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      id="fromEmail"
                      name="fromEmail"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:opacity-50"
                      value={emailConfig.fromEmail}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailConfig.enableEmails}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      id="fromName"
                      name="fromName"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:opacity-50"
                      value={emailConfig.fromName}
                      onChange={handleEmailSettingsChange}
                      disabled={!emailConfig.enableEmails}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => toast.info('Test email would be sent in a full version')}
                    disabled={!emailConfig.enableEmails || isSaving}
                    className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaEnvelope className="inline-block mr-2" />
                    Send Test Email
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Email Templates</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emailTemplates.map((template) => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{template.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{template.lastUpdated}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => toast.info('Email template editor would open in a full version')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* System Settings */}
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleResetToDefault('system')}
                    disabled={isSaving}
                    className="px-4 py-2 border-2 border-blue-300 rounded-lg text-black hover:bg-blue-50 transition-colors bg-white"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => handleSaveSettings('system')}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={systemConfig.maintenanceMode}
                      onChange={handleSystemSettingsChange}
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                      Maintenance Mode
                    </label>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="debugMode"
                      name="debugMode"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={systemConfig.debugMode}
                      onChange={handleSystemSettingsChange}
                    />
                    <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-900">
                      Debug Mode
                    </label>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      name="allowRegistration"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={systemConfig.allowRegistration}
                      onChange={handleSystemSettingsChange}
                    />
                    <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                      Allow User Registration
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      name="requireEmailVerification"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={systemConfig.requireEmailVerification}
                      onChange={handleSystemSettingsChange}
                    />
                    <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                      Require Email Verification
                    </label>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      id="maxUploadSize"
                      name="maxUploadSize"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                      value={systemConfig.maxUploadSize}
                      onChange={handleSystemSettingsChange}
                      min="1"
                      max="50"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      id="sessionTimeout"
                      name="sessionTimeout"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                      value={systemConfig.sessionTimeout}
                      onChange={handleSystemSettingsChange}
                      min="15"
                      max="240"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      id="maxLoginAttempts"
                      name="maxLoginAttempts"
                      className="w-full border-2 border-blue-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                      value={systemConfig.maxLoginAttempts}
                      onChange={handleSystemSettingsChange}
                      min="3"
                      max="10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Management</h3>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Database Backup</h4>
                      <p className="text-sm text-gray-600">
                        Last backup: {systemConfig.lastBackup}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <div>
                        <label htmlFor="backupFrequency" className="sr-only">Backup Frequency</label>
                        <select
                          id="backupFrequency"
                          name="backupFrequency"
                          className="block w-full pl-3 pr-10 py-2 text-base border-2 border-blue-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white text-black"
                          value={systemConfig.backupFrequency}
                          onChange={handleSystemSettingsChange}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <button
                        onClick={handleBackupDatabase}
                        className="px-4 py-2 bg-[#002F5A] text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaDatabase className="inline-block mr-2" />
                        Backup Now
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => toast.info('Database optimization would be performed in a full version')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaServer className="inline-block mr-2" />
                    Optimize Database
                  </button>
                  
                  <button
                    onClick={() => toast.info('Cache would be cleared in a full version')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <FaCloudUploadAlt className="inline-block mr-2" />
                    Clear Cache
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );}
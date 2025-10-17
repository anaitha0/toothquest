'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTooth, 
  FaUpload, 
  FaCheck, 
  FaTimes, 
  FaSpinner,
  FaHome,
  FaUser,
  FaBookOpen,
  FaCog,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ReceiptUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<string>('payment');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFileName(file.name);
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setFilePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileName) {
      toast.error('Please upload your payment receipt');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setIsSubmitted(true);
      toast.success('Receipt uploaded successfully!');
    }, 2000);
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
  
  if (isSubmitted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <EnhancedSidebar />
        
        <main className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white text-center">
              <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <FaCheck className="text-3xl text-white" />
              </div>
              <h1 className="text-2xl font-bold">Receipt Submitted!</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Thank you for your payment. Our team will verify your receipt and activate your subscription within 24 hours.
                You'll receive a confirmation email once your account is activated.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={() => router.push('/student/dashboard')}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
                
                <button 
                  onClick={() => {
                    // In a real app, this would contact support
                    toast.info('Support contact feature would be implemented here');
                  }}
                  className="w-full py-3 bg-transparent border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </motion.div>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Upload Payment Receipt</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FaTooth className="h-6 w-6 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold">Payment Receipt Upload</h1>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Payment Instructions</h2>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>Make a payment to our bank account using the details provided on the subscription page.</li>
                    <li>Take a clear photo or screenshot of your payment receipt.</li>
                    <li>Upload the receipt image below.</li>
                    <li>Add any notes that might help us verify your payment (optional).</li>
                    <li>Click "Submit Receipt" to complete your subscription request.</li>
                  </ol>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Receipt
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    filePreview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="file"
                    id="receipt"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  
                  {filePreview ? (
                    <div>
                      <div className="mx-auto mb-4 relative">
                        <img 
                          src={filePreview} 
                          alt="Receipt preview" 
                          className="max-h-64 mx-auto rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilePreview(null);
                            setFileName('');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{fileName}</p>
                      <p className="mt-2 text-sm text-blue-600">Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload your receipt</p>
                      <p className="mt-1 text-xs text-gray-500">Supports: JPG, PNG, PDF (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any details that might help us verify your payment..."
                ></textarea>
              </div>
              
              <div className="flex justify-between items-center">
                <Link 
                  href="/subscription"
                  className="text-gray-600 hover:text-blue-600 transition-colors flex items-center"
                >
                  <FaChevronLeft className="mr-1" size={14} />
                  Back to Subscription
                </Link>
                
                <button
                  type="submit"
                  disabled={!fileName || isUploading}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center transition-colors ${
                    !fileName || isUploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      Submit Receipt
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaTooth, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCreditCard, 
  FaMoneyBillWave,
  FaHome,
  FaUser,
  FaHistory,
  FaBookOpen,
  FaCog,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const plans = [
  {
    id: 'year1',
    title: '1st Year Package',
    price: 1200,
    description: 'Access to all 1st year dental courses and questions',
    features: [
      'All 1st year modules',
      'Full access to question bank',
      'Detailed explanations',
      'Performance tracking',
      'Exam calendar',
      'Mobile access'
    ],
    missingFeatures: [
      'Content from other years',
      'Premium support'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'year2',
    title: '2nd Year Package',
    price: 1200,
    description: 'Access to all 2nd year dental courses and questions',
    features: [
      'All 2nd year modules',
      'Full access to question bank',
      'Detailed explanations',
      'Performance tracking',
      'Exam calendar',
      'Mobile access'
    ],
    missingFeatures: [
      'Content from other years',
      'Premium support'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'year3',
    title: '3rd Year Package',
    price: 1800,
    description: 'Access to all 3rd year dental courses and questions',
    features: [
      'All 3rd year modules',
      'Full access to question bank',
      'Detailed explanations',
      'Performance tracking',
      'Exam calendar',
      'Mobile access'
    ],
    missingFeatures: [
      'Content from other years',
      'Premium support'
    ],
    popular: true,
    color: 'blue'
  },
  {
    id: 'year4',
    title: '4th Year Package',
    price: 1800,
    description: 'Access to all 4th year dental courses and questions',
    features: [
      'All 4th year modules',
      'Full access to question bank',
      'Detailed explanations',
      'Performance tracking',
      'Exam calendar',
      'Mobile access'
    ],
    missingFeatures: [
      'Content from other years',
      'Premium support'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'year5',
    title: '5th Year Package',
    price: 1800,
    description: 'Access to all 5th year dental courses and questions',
    features: [
      'All 5th year modules',
      'Full access to question bank',
      'Detailed explanations',
      'Performance tracking',
      'Exam calendar',
      'Mobile access'
    ],
    missingFeatures: [
      'Content from other years',
      'Premium support'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'complete',
    title: 'Pack Résidanat',
    price: 4500,
    description: 'Full access to all years and premium features',
    features: [
      'All modules from all years',
      'Full access to entire question bank',
      'Detailed explanations',
      'Advanced performance analytics',
      'Exam calendar with reminders',
      'Mobile access',
      'Priority support',
      'No advertisements'
    ],
    missingFeatures: [],
    popular: true,
    color: 'purple'
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'receipt'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('subscription');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('toothquest-token');
    setIsLoggedIn(!!token);
  }, []);
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    
    // Scroll to payment section
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handlePayment = () => {
    if (!selectedPlan) {
      toast.error('Please select a plan first');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      
      if (paymentMethod === 'card') {
        toast.success('Payment successful! Your account has been upgraded.');
        router.push('/student/dashboard');
      } else {
        router.push('/receipt-upload');
      }
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
              <h1 className="text-xl font-bold text-gray-800">Subscription Plans</h1>
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <motion.div 
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-lg ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500 transform scale-105' : 'hover:transform hover:scale-102'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: plans.indexOf(plan) * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 transform translate-x-2 translate-y-2 rotate-12 rounded">
                    POPULAR
                  </div>
                )}
                
                <div className={`p-6 ${plan.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white`}>
                  <h2 className="text-xl font-bold mb-2">{plan.title}</h2>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm opacity-80"> DA / year</span>
                  </div>
                  <p className="text-blue-100">
                    {plan.description}
                  </p>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-gray-700 mb-4">Features</h3>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                    
                    {plan.missingFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start text-gray-400">
                        <FaTimesCircle className="text-red-300 mt-1 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 rounded-xl font-bold transition-colors ${
                      selectedPlan === plan.id
                        ? 'bg-gray-200 text-gray-800'
                        : plan.color === 'purple'
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Payment Section */}
          <motion.div 
            id="payment-section"
            className={`max-w-4xl mx-auto ${!selectedPlan ? 'opacity-50' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedPlan ? 1 : 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>
                
                {!isLoggedIn && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You need to be logged in to complete your purchase.{' '}
                          <Link href="/login" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                            Log in
                          </Link>
                          {' '}or{' '}
                          <Link href="/register" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                            Register
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center transition-colors ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaCreditCard className={`mr-2 ${paymentMethod === 'card' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={paymentMethod === 'card' ? 'font-medium text-blue-700' : 'text-gray-600'}>
                      Pay with Dahabia Card
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('receipt')}
                    className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center transition-colors ${
                      paymentMethod === 'receipt' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaMoneyBillWave className={`mr-2 ${paymentMethod === 'receipt' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={paymentMethod === 'receipt' ? 'font-medium text-blue-700' : 'text-gray-600'}>
                      Upload Payment Receipt
                    </span>
                  </button>
                </div>
                
                {paymentMethod === 'card' ? (
                  <div className="space-y-4 mb-8">
                    <div>
                      <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="card-name"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Name on card"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card-number"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          id="card-expiry"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-700 mb-1">
                          Security Code
                        </label>
                        <input
                          type="text"
                          id="card-cvc"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-gray-600 mb-4">
                      Make a payment to our account and upload the receipt. We'll verify your payment and activate your account.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-xl mb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Bank Account Details</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li><span className="font-medium">Account Name:</span> ToothQuest Educational</li>
                        <li><span className="font-medium">Bank:</span> Algeria National Bank</li>
                        <li><span className="font-medium">Account Number:</span> 123456789012345</li>
                        <li><span className="font-medium">Reference:</span> Your full name</li>
                      </ul>
                    </div>
                    
                    <p className="text-sm text-gray-500 italic">
                      After making payment, click "Continue" to upload your receipt.
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    {selectedPlan && (
                      <p className="text-gray-600">
                        <span className="font-medium">Selected plan:</span>{' '}
                        {plans.find(p => p.id === selectedPlan)?.title} -{' '}
                        <span className="font-bold">{plans.find(p => p.id === selectedPlan)?.price} DA</span>
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={handlePayment}
                    disabled={!selectedPlan || !isLoggedIn || isLoading}
                    className={`px-8 py-3 rounded-xl font-bold transition-colors ${
                      !selectedPlan || !isLoggedIn || isLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      paymentMethod === 'card' ? 'Complete Payment' : 'Continue'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
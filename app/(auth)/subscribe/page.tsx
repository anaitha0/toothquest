'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaTooth, 
  FaCheck, 
  FaCrown, 
  FaStar, 
  FaGraduationCap,
  FaBook,
  FaChartLine,
  FaMobile,
  FaShieldAlt,
  FaInfinity,
  FaCreditCard,
  FaUniversity,
  FaCalendarAlt,
  FaDownload,
  FaSpinner,
  FaArrowRight,
  FaGift
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  popular?: boolean;
  features: string[];
  color: string;
  icon: React.ReactNode;
  year?: number;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1st-year',
    name: '1st Year Package',
    description: 'Perfect for dental school beginners',
    price: 1200,
    originalPrice: 1500,
    duration: '12 months',
    year: 1,
    features: [
      '300+ 1st year specific questions',
      'Basic anatomy & fundamentals',
      'Study progress tracking',
      'Mobile app access',
      'Email support',
      'Basic study materials'
    ],
    color: 'from-green-500 to-green-600',
    icon: <FaGraduationCap className="text-2xl" />
  },
  {
    id: '2nd-year',
    name: '2nd Year Package',
    description: 'Building on fundamentals',
    price: 1800,
    originalPrice: 2200,
    duration: '12 months',
    year: 2,
    features: [
      '500+ 2nd year questions',
      'Pathology & microbiology',
      'Interactive case studies',
      'Detailed explanations',
      'Progress analytics',
      'Study schedule planner'
    ],
    color: 'from-blue-500 to-blue-600',
    icon: <FaBook className="text-2xl" />
  },
  {
    id: '3rd-year',
    name: '3rd Year Package',
    description: 'Clinical knowledge focus',
    price: 2000,
    originalPrice: 2500,
    duration: '12 months',
    year: 3,
    features: [
      '600+ 3rd year clinical questions',
      'Clinical procedures & techniques',
      'Radiology interpretation',
      'Case-based learning',
      'Performance insights',
      'Peer discussion forums'
    ],
    color: 'from-purple-500 to-purple-600',
    icon: <FaChartLine className="text-2xl" />
  },
  {
    id: '4th-year',
    name: '4th Year Package',
    description: 'Advanced clinical practice',
    price: 2200,
    originalPrice: 2800,
    duration: '12 months',
    year: 4,
    features: [
      '700+ advanced clinical questions',
      'Complex case management',
      'Treatment planning',
      'Specialized procedures',
      'Mock examinations',
      'Expert consultations'
    ],
    color: 'from-orange-500 to-orange-600',
    icon: <FaShieldAlt className="text-2xl" />
  },
  {
    id: '5th-year',
    name: '5th Year Package',
    description: 'Final year exam preparation',
    price: 2500,
    originalPrice: 3000,
    duration: '12 months',
    year: 5,
    features: [
      '800+ final year questions',
      'Comprehensive exam prep',
      'Board exam simulations',
      'Professional practice prep',
      'Career guidance',
      'Certification support'
    ],
    color: 'from-red-500 to-red-600',
    icon: <FaCrown className="text-2xl" />
  },
  {
    id: 'complete',
    name: 'Complete Package',
    description: 'All years included - Best Value!',
    price: 4500,
    originalPrice: 6000,
    duration: 'Lifetime access',
    popular: true,
    features: [
      '2000+ questions (all years)',
      'Complete dental curriculum',
      'Lifetime updates',
      'All premium features',
      'Priority support',
      'Exclusive content',
      'Mobile & web access',
      'Downloadable materials'
    ],
    color: 'from-gradient-start to-gradient-end',
    icon: <FaInfinity className="text-2xl" />
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('complete');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'ccp' | 'bank'>('ccp');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowPaymentModal(false);
      toast.success('🎉 Payment information submitted! Please upload your receipt to complete activation.');
      
      // Redirect to receipt upload page
      router.push('/upload-receipt');
    } catch (error) {
      toast.error('Payment submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ToothCreature = ({ animated = false }: { animated?: boolean }) => (
    <motion.div 
      className="relative"
      animate={animated ? { 
        rotate: [0, 10, -10, 0],
        y: [0, -5, 0]
      } : {}}
      transition={{ 
        duration: 2,
        repeat: animated ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center relative overflow-hidden shadow-lg">
        <FaTooth className="text-2xl text-blue-500" />
        
        {/* Eyes */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
        </div>
        
        {/* Sparkle */}
        <motion.div
          className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5 
          }}
        />
      </div>
    </motion.div>
  );

  const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <ToothCreature animated />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Learning Path
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Select the perfect study package for your dental education journey. 
              All plans include expert-verified questions and comprehensive explanations.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center">
                <FaCheck className="mr-2 text-green-300" />
                <span>2000+ Questions</span>
              </div>
              <div className="flex items-center">
                <FaCheck className="mr-2 text-green-300" />
                <span>Expert Verified</span>
              </div>
              <div className="flex items-center">
                <FaCheck className="mr-2 text-green-300" />
                <span>Mobile Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedPlan === plan.id 
                  ? 'border-blue-500 ring-4 ring-blue-200 transform scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-2xl hover:scale-102'
              } ${plan.popular ? 'ring-4 ring-yellow-200' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
              whileHover={{ y: -5 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center">
                    <FaStar className="mr-1" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="bg-white p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {plan.originalPrice && (
                      <span className="text-2xl text-gray-400 line-through">
                        {plan.originalPrice.toLocaleString()} DA
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-600">DA</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.duration}</p>
                  {plan.originalPrice && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mt-2">
                      <FaGift className="mr-1" />
                      Save {((plan.originalPrice - plan.price) / plan.originalPrice * 100).toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <FaCheck className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <motion.button
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleSubscribe}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue with {selectedPlanData?.name}
            <FaArrowRight className="ml-2" />
          </motion.button>
          
          <p className="text-gray-600 mt-4">
            Next: Choose payment method and upload receipt
          </p>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPlanData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Selected Plan Summary */}
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Selected Plan</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedPlanData.name}</p>
                      <p className="text-sm text-gray-600">{selectedPlanData.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedPlanData.price.toLocaleString()} DA
                      </p>
                      {selectedPlanData.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {selectedPlanData.originalPrice.toLocaleString()} DA
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => setPaymentMethod('ccp')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        paymentMethod === 'ccp' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <FaCreditCard className="text-2xl text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium">CCP Account</p>
                          <p className="text-sm text-gray-600">Pay with CCP</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        paymentMethod === 'bank' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <FaUniversity className="text-2xl text-green-600" />
                        <div className="text-left">
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-gray-600">Wire transfer</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Payment Instructions:</h4>
                  {paymentMethod === 'ccp' ? (
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>1. Transfer {selectedPlanData.price.toLocaleString()} DA to CCP account: <strong>001234567890</strong></p>
                      <p>2. Include reference: <strong>TOOTHQUEST-{selectedPlanData.id.toUpperCase()}</strong></p>
                      <p>3. Take a screenshot of the payment receipt</p>
                      <p>4. Upload the receipt on the next page for verification</p>
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>1. Bank: Banque Nationale d'Algérie (BNA)</p>
                      <p>2. Account: 123456789012345</p>
                      <p>3. Amount: {selectedPlanData.price.toLocaleString()} DA</p>
                      <p>4. Reference: TOOTHQUEST-{selectedPlanData.id.toUpperCase()}</p>
                      <p>5. Upload bank receipt for verification</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      'Proceed to Receipt Upload'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ToothQuest?
            </h2>
            <p className="text-xl text-gray-600">
              The most comprehensive dental study platform in Algeria
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaBook className="text-3xl text-blue-600" />,
                title: 'Expert Content',
                description: 'Questions reviewed by dental professionals'
              },
              {
                icon: <FaMobile className="text-3xl text-green-600" />,
                title: 'Mobile Access',
                description: 'Study anywhere, anytime on any device'
              },
              {
                icon: <FaChartLine className="text-3xl text-purple-600" />,
                title: 'Progress Tracking',
                description: 'Monitor your learning with detailed analytics'
              },
              {
                icon: <FaShieldAlt className="text-3xl text-orange-600" />,
                title: 'Guaranteed Quality',
                description: '30-day money-back guarantee'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-lg"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
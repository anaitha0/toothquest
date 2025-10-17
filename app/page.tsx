'use client';   // testimonials adjustable  n remove selct plan

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FaTooth, 
  FaPlay,
  FaPause,
  FaArrowRight,
  FaCheck,
  FaStar,
  FaQuoteLeft,
  FaRocket,
  FaShieldAlt,
  FaChartBar,
  FaMobile,
  FaGlobeAmericas,
  FaAward,
  FaLightbulb,
  FaBookOpen,
  FaUserMd,
  FaHeartbeat,
  FaFlask
} from 'react-icons/fa';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Transform values for parallax effects
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.7, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    setIsLoaded(true);
    // Auto-play video on mount
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Debug: Log video loading events
      video.addEventListener('loadstart', () => console.log('Video loading started'));
      video.addEventListener('loadeddata', () => console.log('Video data loaded'));
      video.addEventListener('canplay', () => console.log('Video can start playing'));
      video.addEventListener('error', (e) => console.error('Video error:', e));
      
      video.play().catch(err => {
        console.error('Video play failed:', err);
      });
    }
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECF5F7]" ref={containerRef}>
      {/* Full-Screen Video Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ scale: videoScale }}
        >
          {/* Actual Video Element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-80 z-5"
            loop
            muted={isMuted}
            playsInline
            autoPlay
            onLoadedData={() => {
              console.log('Video loaded successfully!');
              // Hide fallback background when video loads
              const fallbackBg = document.querySelector('.fallback-bg');
              if (fallbackBg) {
                (fallbackBg as HTMLElement).style.opacity = '0.3';
              }
            }}
            onError={(e) => {
              console.error('Video failed to load:', e);
              // If video fails to load, show fallback background
              const fallbackBg = document.querySelector('.fallback-bg');
              if (fallbackBg) {
                (fallbackBg as HTMLElement).style.opacity = '1';
              }
            }}
          >
            {/* Your local video file - try just this first */}
            <source src="/bg.mp4" type="video/mp4" />
          </video>
          
          {/* Fallback Background - Always visible as overlay */}
          <div className="fallback-bg absolute inset-0 bg-gradient-to-br from-[#002F5A] via-[#00BBB9] to-[#002F5A] transition-opacity duration-1000">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            
            {/* Central Dental Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="relative"
              >
                <FaTooth className="text-white text-9xl opacity-10" />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    rotate: [0, -360],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="w-32 h-32 border-4 border-white/20 rounded-full"></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Video Overlay - Darker Blue Tint */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#002F5A]/90 via-[#002F5A]/85 to-[#002F5A]/90 z-10"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* Additional Text Readability Overlay */}
        <div className="absolute inset-0 bg-[#002F5A]/60 z-15"></div>

        {/* Navigation */}
        <nav className="relative z-50 flex justify-between items-center p-8 lg:px-16 py-6">
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo Container - Replace the FaTooth with your logo */}
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              {/* 
                REPLACE THIS SECTION WITH YOUR LOGO:
                Option 1: Image logo
                <img src="\images\ui\ToothQuest SVG files\Tooth Quest for dark bachgrounds.svg" alt="ToothQuest Logo" className="w-12 h-12" />
                
                Option 2: SVG logo  
                <img src="/your-logo.svg" alt="ToothQuest Logo" className="w-12 h-12" />
                
                Put your logo file in the public/ folder (same place as your video)
                Then replace the FaTooth line below with one of the options above
              */}
              
            </div>
            <span className="text-3xl font-bold text-white">ToothQuest</span>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex items-center space-x-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="#features" className="text-white/80 hover:text-white transition-colors font-medium text-lg">Features</Link>
            <Link href="#testimonials" className="text-white/80 hover:text-white transition-colors font-medium text-lg">Reviews</Link>
            <Link href="/login" className="text-white/80 hover:text-white transition-colors font-medium text-lg">Login</Link>
            <Link href="/register" className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30 font-medium text-lg">
              Get Started
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-50 container mx-auto px-6 lg:px-12 pt-20">
          <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div
              style={{ y: textY }}
              className="text-center max-w-4xl"
            >
              <motion.h1 
                className="text-6xl lg:text-8xl font-bold text-white leading-tight mb-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BBB9] to-white">
                Study Smarter

                </span>
                <br />
                Score Higher!
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Transform your dental education with our comprehensive platform. 
                Practice with 2000+ expert-verified questions and excel in your exams.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link 
                  href="/register"
                  className="group bg-white text-[#002F5A] px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-all flex items-center justify-center space-x-2 shadow-2xl"
                >
                  <span>Start Learning</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#features"
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/30 hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Explore Features</span>
                </Link>
              </motion.div>

              <motion.div 
                className="flex items-center justify-center space-x-12 text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">2000+</div>
                  <div className="text-sm">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">98%</div>
                  <div className="text-sm">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm">Access</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-8 right-8 z-60 flex space-x-4">
          <button
            onClick={toggleVideo}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
          >
            {isVideoPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm">Scroll to explore</span>
            <div className="w-1 h-8 bg-white/40 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Modern Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ECF5F7] to-transparent"></div>
        
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-[#002F5A] mb-6">
              Why Choose <span className="text-[#00BBB9]">ToothQuest</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets dental education excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaRocket className="text-4xl" />,
                title: "Accelerated Progress",
                description: "Advanced spaced repetition and performance analytics help you learn faster and retain more.",
                color: "from-[#00BBB9] to-blue-500",
                bgColor: "bg-blue-50"
              },
              {
                icon: <FaShieldAlt className="text-4xl" />,
                title: "Expert Verified",
                description: "All content reviewed and approved by leading dental professionals and academic institutions.",
                color: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-50"
              },
              {
                icon: <FaChartBar className="text-4xl" />,
                title: "Advanced Analytics",
                description: "Detailed performance insights with predictive scoring to identify your exam readiness.",
                color: "from-indigo-500 to-purple-500",
                bgColor: "bg-indigo-50"
              },
              {
                icon: <FaGlobeAmericas className="text-4xl" />,
                title: "Global Standards",
                description: "Content aligned with international dental education standards and certification requirements.",
                color: "from-[#002F5A] to-[#00BBB9]",
                bgColor: "bg-slate-50"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className={`group ${feature.bgColor} rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#002F5A] mb-4 group-hover:text-[#00BBB9] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-[#ECF5F7] via-white to-[#ECF5F7] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-[#00BBB9] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#002F5A] rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-[#002F5A] mb-6">
              Success <span className="text-[#00BBB9]">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of dental students who have transformed their exam performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "ToothQuest's comprehensive platform completely transformed my study approach. My exam scores improved by 40% in just 3 months!",
                name: "Dr. Sarah Mansouri",
                title: "Final Year Student",
                university: "Constantine University",
                rating: 5,
                specialty: "Oral Surgery",
                avatar: "👩‍⚕️"
              },
              {
                quote: "The expert-verified content and detailed analytics helped me understand complex concepts. Best investment in my dental education!",
                name: "Ahmed Benali",
                title: "4th Year Student", 
                university: "Algiers University",
                rating: 5,
                specialty: "Orthodontics",
                avatar: "👨‍⚕️"
              },
              {
                quote: "The analytics dashboard shows exactly where I need to focus. It's like having a personal study coach available 24/7.",
                name: "Leila Zidane",
                title: "3rd Year Student",
                university: "Oran University",
                rating: 5,
                specialty: "Periodontics",
                avatar: "👩‍⚕️"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                {/* Background Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00BBB9]/10 to-transparent rounded-bl-3xl"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <FaQuoteLeft className="text-3xl text-[#00BBB9] mb-4" />
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-lg" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic leading-relaxed text-lg">"{testimonial.quote}"</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00BBB9] to-[#002F5A] rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-[#002F5A] text-lg">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                      <p className="text-xs text-[#00BBB9] font-medium">{testimonial.university}</p>
                      <p className="text-xs text-gray-400">{testimonial.specialty}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#002F5A] via-[#00BBB9] to-[#002F5A] text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white rounded-full opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-8">
              Ready to Transform
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#ECF5F7]">
                Your Future?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl mb-12 max-w-4xl mx-auto opacity-90 leading-relaxed">
              Join the next generation of dental professionals. Start your journey with ToothQuest today 
              and experience the future of dental education.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                href="/register" 
                className="bg-white text-[#002F5A] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-3"
              >
                <span>Begin Your Journey</span>
                <FaRocket />
              </Link>
              <Link 
                href="/subscription" 
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span>View Plans</span>
                <FaArrowRight />
              </Link> 
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
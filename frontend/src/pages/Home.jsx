import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBars,
    FaTimes,
    FaRobot,
    FaCalendarAlt,
    FaComments,
    FaChartLine,
    FaBrain,
    FaArrowRight,
    FaUsers,
} from 'react-icons/fa';

const Home = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    // --- Component: FeatureCard (Refined) ---
    const FeatureCard = ({ icon: Icon, title, description }) => (
        <div className='p-8 bg-white rounded-2xl shadow-lg border-t-4 border-purple-500 hover:shadow-2xl hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-1 text-center h-full flex flex-col'>
            <div className='text-5xl text-purple-600 mb-4 flex justify-center'>
                <Icon />
            </div>
            <h3 className='font-extrabold text-xl text-gray-900 mb-2'>{title}</h3>
            <p className='text-gray-600 flex-grow'>{description}</p>
        </div>
    );

    // --- Component: StepCard (Refined for better flow) ---
    const StepCard = ({ number, title, description }) => (
        <div className='relative bg-white p-8 pt-12 rounded-xl shadow-xl border-b-4 border-purple-300 flex-1 text-center min-w-0'>
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-purple-600 text-white rounded-full text-2xl font-black ring-8 ring-white shadow-xl'>
                {number}
            </div>
            <h3 className='text-2xl font-bold text-purple-700 mt-4 mb-3'>{title}</h3>
            <p className='text-gray-600'>{description}</p>
        </div>
    );

    return (
        <div className="font-sans min-h-screen flex flex-col bg-gray-50">
            
            {/* --- Navigation Bar (Slightly improved styling) --- */}
            <nav className='bg-white sticky top-0 z-30 shadow-md'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center h-20'>
                        <div className='text-3xl font-extrabold text-purple-700'>
                            <Link to="/" className='flex items-center space-x-3'>
                                <FaBrain className="text-purple-500 text-4xl" /> {/* Changed icon to Brain for mentorship theme */}
                                <span className='tracking-tight'>MentorConnect</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Links */}
                        <div className='hidden md:flex items-center space-x-6'>
                            <Link 
                                to="/login" 
                                className='text-lg font-semibold text-gray-700 hover:text-purple-600 transition duration-200'
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className='text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-full px-7 py-3 transition duration-200 shadow-lg transform hover:scale-105'
                            >
                                Start Free Trial
                            </Link>
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className='md:hidden'>
                            <button 
                                onClick={() => setMenuOpen(!menuOpen)} 
                                className='text-purple-600 p-2 rounded-md hover:bg-purple-50 transition'
                            >
                                {menuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {menuOpen && (
                    <div className='md:hidden absolute top-20 left-0 right-0 bg-white shadow-xl py-4 transition-all duration-300 ease-in-out z-20 border-t border-gray-100'>
                        <div className='px-4 flex flex-col gap-3'>
                            <Link 
                                onClick={() => setMenuOpen(false)}
                                to="/login" 
                                className='text-lg font-medium text-purple-700 hover:bg-purple-50 rounded-lg px-4 py-3 transition text-center'
                            >
                                Login
                            </Link>
                            <Link 
                                onClick={() => setMenuOpen(false)}
                                to="/signup" 
                                className='text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-3 transition text-center shadow-lg'
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- Hero Section (More dynamic background and focus) --- */}
            <section className='text-center py-24 md:py-36 px-6 bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden'>
                {/* Background visual element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full opacity-20 blur-3xl animate-pulse delay-500"></div>

                <div className='max-w-5xl mx-auto relative z-10'>
                    <p className='uppercase text-sm font-bold tracking-widest text-purple-500 mb-4'>Personalized Growth. Proven Success.</p>
                    <h1 className='text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight'>
                        Unlock Your Potential with <span className='text-purple-600'>Expert Mentorship</span>
                    </h1>
                    <p className='text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-12'>
                        Your gateway to expert mentorship and guidance. Connect with industry professionals, advance your career, and achieve your goals faster.
                    </p>
                    <div className='mt-10 flex flex-col sm:flex-row justify-center gap-5'>
                        <Link 
                            to="/signup" 
                            className='bg-purple-600 text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-purple-700 transition duration-300 shadow-xl flex items-center justify-center space-x-2 transform hover:scale-105 ring-4 ring-purple-300 ring-opacity-50'
                        >
                            <span>Get Started Now</span>
                            <FaArrowRight size={18} />
                        </Link>
                        {/* <Link 
                            to="/mentors" 
                            className='bg-white text-purple-600 border border-purple-600 px-10 py-4 rounded-full font-bold text-xl hover:bg-purple-50 transition duration-300 shadow-md flex items-center justify-center'
                        >
                            Explore Mentors
                        </Link> */}
                    </div>
                </div>
            </section>

            {/* --- Why Choose Section (Features - Grid improved) --- */}
            <section className='py-20 px-4 md:px-10 bg-white'>
                <h2 className='text-4xl font-extrabold text-center text-gray-800 mb-4'>What Makes Us Different?</h2>
                <p className='text-center text-gray-600 max-w-3xl mx-auto mb-16 text-lg'>Experience the future of personalized learning with our cutting-edge platform designed for real-world success.</p>

                <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto'>
                    <FeatureCard 
                        icon={FaRobot} 
                        title="AI Matching"
                        description="Our advanced algorithm intelligently pairs you with the perfect mentor based on skills, goals, and culture fit."
                    />
                    <FeatureCard 
                        icon={FaCalendarAlt} 
                        title="Flexible Sessions"
                        description="Book sessions that fit your busy life with easy calendar integration, global time zone support, and instant confirmations."
                    />
                    <FeatureCard 
                        icon={FaComments} 
                        title="Direct Connect"
                        description="Connect instantly via integrated video, chat, and collaborative tools for dynamic, real-time learning."
                    />
                    <FeatureCard 
                        icon={FaChartLine} 
                        title="Goal Tracking"
                        description="Monitor your growth with detailed analytics, achievement milestones, and performance reports on your mentorship goals."
                    />
                </div>
            </section>
            
            <hr className="max-w-7xl mx-auto border-gray-200" />

            {/* --- How It Works Section (Improved responsiveness and flow) --- */}
            <section className='py-20 px-6 bg-gray-50'>
                <h2 className='text-4xl font-extrabold text-center text-gray-800 mb-16'>How It Works: <span className='text-purple-600'>Your 3-Step Journey</span></h2>
                
                {/* Responsive grid for steps, using relative positioning for arrows/separators */}
                <div className='grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative'>
                    <StepCard 
                        number={1} 
                        title="Define Your Goal"
                        description="Complete a quick profile detailing your background, career aspirations, and what you need help achieving."
                    />
                    
                    {/* Arrow for Desktop/Tablet */}
                    <div className='hidden md:flex absolute inset-y-0 right-1/3 mr-[-6px] items-center justify-center pointer-events-none'>
                        <FaArrowRight size={40} className="text-purple-300" />
                    </div>
                    {/* Arrow for Mobile/Small screens */}
                    <div className='md:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-solid border-transparent border-t-purple-300'></div>

                    <StepCard 
                        number={2} 
                        title="Match & Connect"
                        description="Our smart system presents your best mentor options. Choose, book your first session, and connect via our platform."
                    />
                    
                    {/* Arrow for Desktop/Tablet */}
                    <div className='hidden md:flex absolute inset-y-0 right-0 mr-[-6px] items-center justify-center pointer-events-none'>
                        <FaArrowRight size={40} className="text-purple-300" />
                    </div>
                     {/* Arrow for Mobile/Small screens */}
                    <div className='md:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-solid border-transparent border-t-purple-300'></div>


                    <StepCard 
                        number={3} 
                        title="Accelerate Your Career"
                        description="Start receiving personalized advice, actionable feedback, and the guidance you need to succeed faster."
                    />
                </div>
                
                {/* Final CTA below the steps */}
                <div className="text-center mt-20">
                    <Link 
                        to="/signup" 
                        className='inline-flex items-center space-x-3 bg-purple-500 text-white px-12 py-4 rounded-lg font-bold text-xl hover:bg-purple-600 transition shadow-2xl'
                    >
                        <span>Join MentorConnect Today</span>
                        <FaUsers size={20} />
                    </Link>
                </div>
            </section>

            {/* --- Footer (Simplified and cleaner) --- */}
            <footer className='bg-gray-800 text-white py-12'>
                <div className='max-w-7xl mx-auto px-6 text-center'>
                    <div className='flex items-center justify-center space-x-3 mb-4'>
                        <FaBrain className="text-purple-500 text-3xl" />
                        <span className='text-2xl font-extrabold tracking-tight'>MentorConnect</span>
                    </div>
                    <p className='text-sm text-gray-400 mb-4'>
                        The premier platform for connecting ambitious learners with world-class mentors.
                    </p>
                    <div className='bg-gray-700/50 rounded-lg p-4 mb-6 max-w-4xl mx-auto'>
                        <p className='text-sm text-gray-300 font-semibold mb-2 flex items-center justify-center space-x-2'>
                            <span>Ethical & Privacy Notice:</span>
                        </p>
                        <p className='text-xs text-gray-400 leading-relaxed'>
                            By using MentorConnect, you agree to our terms requiring professional conduct and educational use. We collect user data (names, history, chat logs) for platform operation, store it in encrypted databases, and never share it without permission. Continued use implies acceptance of these policies.
                        </p>
                    </div>
                    <p className='mt-6 text-xs text-gray-500'>&copy; {new Date().getFullYear()} MentorConnect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
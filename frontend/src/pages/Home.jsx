import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaRocket,
    FaBars,
    FaTimes,
    FaRobot,
    FaCalendarAlt,
    FaComments,
    FaChartLine,
    FaUserPlus,
    FaBrain,
    FaArrowRight,
} from 'react-icons/fa';

const Home = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const FeatureCard = ({ icon: Icon, title, description }) => (
        <div className='p-8 bg-white shadow-xl rounded-xl border border-purple-100 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 text-center'>
            <div className='text-4xl text-purple-600 mb-4 flex justify-center'>
                <Icon />
            </div>
            <h3 className='font-bold text-xl text-gray-800 mb-2'>{title}</h3>
            <p className='text-gray-600'>{description}</p>
        </div>
    );

    const StepCard = ({ number, title, description }) => (
        <div className='relative bg-white p-8 rounded-xl shadow-2xl border-t-4 border-purple-500 flex-1 text-center'>
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-full text-xl font-bold ring-4 ring-white shadow-lg'>
                {number}
            </div>
            <h3 className='text-2xl font-bold text-purple-700 mt-4 mb-2'>{title}</h3>
            <p className='text-gray-600'>{description}</p>
        </div>
    );

    return (
        <div className="font-sans min-h-screen flex flex-col">
            {/* Navigation Bar */}
            <nav className='bg-white sticky top-0 z-30 shadow-lg'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center h-20'>
                        <div className='text-3xl font-extrabold text-purple-700 flex items-center'>
                            <Link to="/" className='flex items-center space-x-2'>
                                <FaRocket className="text-purple-500" />
                                <span>MentorConnect</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Links */}
                        <div className='hidden md:flex items-center space-x-4'>
                            <Link 
                                to="/login" 
                                className='text-lg font-medium text-purple-700 hover:text-purple-900 transition duration-200 px-4 py-2'
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className='text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 transition duration-200 shadow-md hover:shadow-lg'
                            >
                                Sign Up
                            </Link>
                        </div>
                        
                        {/* Mobile Menu Button */}
                        <div className='md:hidden'>
                            <button 
                                onClick={() => setMenuOpen(!menuOpen)} 
                                className='text-purple-600 p-2 rounded-md hover:bg-purple-100 transition'
                            >
                                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {menuOpen && (
                    <div className='md:hidden absolute top-20 left-0 right-0 bg-white shadow-xl py-4 transition-all duration-300 ease-in-out z-20'>
                        <div className='px-4 flex flex-col gap-3'>
                            <Link 
                                to="/login" 
                                className='text-lg font-medium text-purple-700 hover:bg-purple-50 rounded-md px-4 py-3 transition text-center border-b'
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className='text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-3 transition text-center shadow-md'
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className='flex-grow text-center py-20 px-6 bg-purple-50 overflow-hidden'>
                <div className='max-w-4xl mx-auto'>
                    <h1 className='text-5xl md:text-7xl font-extrabold text-purple-800 mb-6 leading-tight'>
                        Unlock Your Potential with Expert Mentorship
                    </h1>
                    <p className='text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10'>
                        Your gateway to expert mentorship and guidance. Connect with industry professionals, advance your career, and achieve your goals faster.
                    </p>
                    <div className='mt-8 flex flex-col sm:flex-row justify-center gap-4'>
                        <Link 
                            to="/signup" 
                            className='bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-purple-700 transition shadow-lg flex items-center justify-center space-x-2'
                        >
                            <span>Get Started Today</span>
                            <FaArrowRight size={18} />
                        </Link>
                        <Link 
                            to="/login" 
                            className='bg-gray-200 text-gray-800 px-8 py-4 rounded-lg font-semibold text-xl hover:bg-gray-300 transition shadow-md flex items-center justify-center'
                        >
                            Existing User? Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Section (Features) */}
            <section className='py-20 px-4 md:px-10 bg-white'>
                <h2 className='text-4xl font-extrabold text-center text-purple-700 mb-4'>Why Choose MentorConnect?</h2>
                <p className='text-center text-gray-600 max-w-3xl mx-auto mb-16'>Experience the future of personalized learning with our cutting-edge platform designed for success.</p>

                <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto'>
                    <FeatureCard 
                        icon={FaRobot} 
                        title="AI Powered Matching"
                        description="Our advanced algorithm matches students with perfect mentors based on skills, goals, and learning style."
                    />
                    <FeatureCard 
                        icon={FaCalendarAlt} 
                        title="Flexible Scheduling"
                        description="Book sessions that fit your schedule with easy calendar integration and instant confirmations."
                    />
                    <FeatureCard 
                        icon={FaComments} 
                        title="Real-time Communication"
                        description="Connect instantly through video calls, chat, and collaborative whiteboards for dynamic learning."
                    />
                    <FeatureCard 
                        icon={FaChartLine} 
                        title="Progress Tracking"
                        description="Monitor your learning journey with detailed analytics, achievement milestones, and performance reports."
                    />
                </div>
            </section>

            {/* How It Works Section */}
            <section className='py-20 px-6 bg-purple-50'>
                <h2 className='text-4xl font-extrabold text-center text-purple-700 mb-16'>Your Path to Success in 3 Simple Steps</h2>
                <div className='flex flex-col md:flex-row justify-center gap-10 max-w-5xl mx-auto'>
                    <StepCard 
                        number={1} 
                        title="Create Your Profile"
                        description="Sign up and tell us about your background, career aspirations, and what you hope to achieve."
                    />
                    <div className='hidden md:flex items-center justify-center'>
                        <FaArrowRight size={30} className="text-purple-400" />
                    </div>
                    <StepCard 
                        number={2} 
                        title="Get AI-Matched"
                        description="Our intelligent system analyzes your needs to connect you with the most suitable expert mentor."
                    />
                    <div className='hidden md:flex items-center justify-center'>
                        <FaArrowRight size={30} className="text-purple-400" />
                    </div>
                    <StepCard 
                        number={3} 
                        title="Start Learning"
                        description="Schedule your first session and begin your personalized, goal-driven mentorship journey."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className='bg-purple-800 text-white py-8 text-center'>
                <p className='text-lg font-semibold mb-2'>MentorConnect 🚀</p>
                <p className='text-sm text-purple-200'>&copy; {new Date().getFullYear()} All rights reserved. Built for connection and growth.</p>
            </footer>
        </div>
    );
};

export default Home;

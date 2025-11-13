import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaKey, FaChevronLeft, FaArrowRight, FaTimes } from "react-icons/fa";
import API_BASE_URL from "../config";

// PasswordInput Component (Moved outside to prevent loss of focus/reconciliation issue)
const PasswordInput = ({ value, onChange, placeholder, showState, toggleShowState }) => (
    <div className="relative">
        <input
            type={showState ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 pr-12"
        />
        <button
            type="button"
            onClick={toggleShowState}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
            aria-label={showState ? "Hide password" : "Show password"}
        >
            {showState ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
    </div>
);

const Login = () => {
    const [userType, setUserType] = useState("student");
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const payload =
            userType === "student"
                ? { enrollment_number: loginId, password }
                : { mentor_id: loginId, password };

        const url =
            userType === "student"
                ? `${API_BASE_URL}/login/student`
                : `${API_BASE_URL}/login/mentor`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`Welcome, ${userType}!`);
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", userType);
                if (userType === "student")
                    localStorage.setItem("enrollment_number", loginId);
                else localStorage.setItem("mentor_id", loginId);

                window.location.href =
                    userType === "student" ? "/student-dashboard" : "/mentor-dashboard";
            } else toast.error(data.error || "Login failed");
        } catch (err) {
            toast.error("Network error. Please try again.");
        }
    };

    const handleSendOtp = async () => {
        if (!email) return toast.error("Please enter your registered email");
        try {
            const res = await fetch(`${API_BASE_URL}/forgot-password/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: userType }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("OTP sent to your email!");
                setStep(2);
            } else toast.error(data.error || "Failed to send OTP. Check email and role.");
        } catch {
            toast.error("Network error while sending OTP");
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmPassword)
            return toast.error("All fields are required");
        if (newPassword !== confirmPassword)
            return toast.error("New passwords do not match");

        try {
            const res = await fetch(`${API_BASE_URL}/forgot-password/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword, role: userType }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Password reset successfully! You can now log in.");
                resetForgotPasswordState();
            } else toast.error(data.error || "Invalid OTP or request failed");
        } catch {
            toast.error("Network error while resetting password");
        }
    };

    const resetForgotPasswordState = () => {
        setShowForgotModal(false);
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setShowResetPassword(false);
        setShowConfirmPassword(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 md:p-8">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-sm p-8 border border-purple-100 transform hover:shadow-3xl transition-shadow duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-purple-700 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500">Sign in to access your resources</p>

                    <div className="flex justify-center mt-6 p-1 bg-gray-100 rounded-xl space-x-1 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setUserType("student")}
                            className={`flex-1 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                                userType === "student"
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-300/50"
                                    : "text-gray-600 hover:bg-white"
                            }`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType("mentor")}
                            className={`flex-1 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                                userType === "mentor"
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-300/50"
                                    : "text-gray-600 hover:bg-white"
                            }`}
                        >
                            Mentor
                        </button>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {userType === "student" ? "Enrollment Number" : "Mentor ID"}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                placeholder={
                                    userType === "student"
                                        ? "Enter your enrollment number"
                                        : "Enter your mentor ID"
                                }
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                            />
                            <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            showState={showPassword}
                            toggleShowState={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-700 transition transform hover:scale-[1.01] shadow-lg shadow-purple-400/50"
                    >
                        Log In
                    </button>
                </form>

                <div className="flex justify-between items-center mt-6 text-sm">
                    <button
                        onClick={() => setShowForgotModal(true)}
                        className="text-gray-600 hover:text-purple-600 font-medium transition"
                    >
                        Forgot Password?
                    </button>
                    <a
                        href="/signup"
                        className="text-purple-600 font-bold hover:text-purple-700 transition flex items-center space-x-1"
                    >
                        <span>New User? Sign Up</span>
                        <FaArrowRight size={12} />
                    </a>
                </div>
            </div>

            {showForgotModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-purple-700">
                                {step === 1 ? "Account Verification" : "Reset Password"}
                            </h2>
                            <button onClick={resetForgotPasswordState} className="text-gray-500 hover:text-red-500 p-1">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        {step === 1 && <p className="text-gray-600 mb-4">Enter your registered email to receive a verification code.</p>}

                        {step === 2 && (
                            <div className="text-sm text-center bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4">
                                OTP sent to **{email}**. Check your spam folder.
                            </div>
                        )}

                        <form className="space-y-4">
                            {step === 1 ? (
                                <>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Registered Email Address"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-md"
                                    >
                                        Send OTP
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 6-digit OTP"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                                            maxLength={6}
                                        />
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    
                                    <PasswordInput
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        showState={showResetPassword}
                                        toggleShowState={() => setShowResetPassword(!showResetPassword)}
                                    />
                                    
                                    <PasswordInput
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        showState={showConfirmPassword}
                                        toggleShowState={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow-md"
                                    >
                                        Reset Password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="mt-2 w-full text-sm text-gray-500 hover:text-purple-600 flex items-center justify-center space-x-1"
                                    >
                                        <FaChevronLeft size={12}/>
                                        <span>Back to Email</span>
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
        </div>
    );
};

export default Login;
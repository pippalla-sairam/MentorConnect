import React, { useState } from "react";
// NOTE: Removed `useNavigate` as it causes errors in this environment.
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const [userType, setUserType] = useState("student"); // student or mentor
    const [loginId, setLoginId] = useState(""); // enrollment_number or mentor_id
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Replaced useNavigate with direct window manipulation for compatibility
    // const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const payload =
            userType === "student"
                ? { enrollment_number: loginId, password }
                : { mentor_id: loginId, password };

        const url =
            userType === "student"
                ? "http://localhost:5000/login/student"
                : "http://localhost:5000/login/mentor";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Login successful!", { position: "top-center", autoClose: 1500 });
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", userType);
                if (userType === "student") {
                    localStorage.setItem("enrollment_number", loginId);
                } else {
                    localStorage.setItem("mentor_id", loginId);
                }

                // Redirect based on role using window.location.href
                if (userType === "student") window.location.href = "/student-dashboard";
                else if (userType === "mentor") window.location.href = "/mentor-dashboard";
            } else {
                toast.error(data.error || "Login failed", { position: "top-center" });
            }
        } catch (err) {
            toast.error("Something went wrong: " + err.message, { position: "top-center" });
        }
    };

    const renderToggle = (type) => {
        const isActive = userType === type;
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        
        return (
            <button
                type="button"
                onClick={() => setUserType(type)}
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    isActive 
                        ? "bg-purple-600 text-white shadow-md shadow-purple-300" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
                {typeLabel}
            </button>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-sm p-8 border border-purple-100 transition duration-500">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-purple-700 mb-2">MentorConnect</h1>
                    <p className="text-gray-500">Sign in to your dashboard</p>

                    {/* Toggle Switch */}
                    <div className="flex justify-center mt-6 p-1 bg-gray-100 rounded-xl space-x-1">
                        {renderToggle("student")}
                        {renderToggle("mentor")}
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {userType === "student" ? "Enrollment Number" : "Mentor ID"}
                        </label>
                        <input
                            type="text"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            placeholder={userType === "student" ? "Enter your enrollment number" : "Enter your mentor ID"}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 mt-2 -translate-y-1/2 text-sm text-purple-600 font-medium hover:text-purple-800"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-purple-700 transition transform hover:scale-[1.01] shadow-lg shadow-purple-200"
                    >
                        Log In
                    </button>
                </form>

                <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                    <a href="/#" className="hover:text-purple-600 transition">Forgot Password?</a>
                    {/* Using <a> tag for navigation consistency */}
                    <a href="/signup" className="text-purple-600 font-medium hover:text-purple-700 transition">Create an account →</a>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Login;
import React, { useState } from "react";
// NOTE: Removed `useNavigate` import and will use window.location for navigation.
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
    // const navigate = useNavigate(); // Replaced by window.location.href
    const [userType, setUserType] = useState("student"); // student or mentor

    const [formData, setFormData] = useState({
        // Student Fields
        enrollment_number: "",
        full_name: "",
        email: "",
        password: "",
        contact_number: "",
        address: "",
        dob: "",
        image: "",
        stream: "",
        major: "",
        skills: "",
        interests: "",

        // Mentor Fields
        mentor_id: "",
        department: "",
        designation: "",
        research_areas: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");

    // Password strength checker
    const checkStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        if (strength <= 1) return "Weak";
        if (strength === 2) return "Medium";
        if (strength >= 3) return "Strong";
    };

    const handleChange = (e) => {
        const { id, value, files } = e.target;
        if (id === "password") setPasswordStrength(checkStrength(value));

        if (id === "image" && files?.length > 0) {
            setFormData({ ...formData, image: URL.createObjectURL(files[0]) });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordStrength === "Weak") {
            toast.error(
                "Password too weak. Use at least 8 chars with numbers, uppercase & symbols.",
                { position: "top-center" }
            );
            return;
        }

        // Prepare payload: filter out unused fields based on user type
        const basePayload = {
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            contact_number: formData.contact_number,
            address: formData.address,
            dob: formData.dob,
            image: formData.image,
        };
        
        let finalPayload;
        let url;

        if (userType === "student") {
            url = "http://localhost:5000/signup/student";
            finalPayload = {
                ...basePayload,
                enrollment_number: formData.enrollment_number,
                stream: formData.stream,
                major: formData.major,
                skills: formData.skills.split(",").map((s) => s.trim()).filter(s => s.length > 0),
                interests: formData.interests.split(",").map((i) => i.trim()).filter(i => i.length > 0),
            };
        } else { // mentor
            url = "http://localhost:5000/signup/mentor";
            finalPayload = {
                ...basePayload,
                mentor_id: formData.mentor_id,
                department: formData.department,
                designation: formData.designation,
                research_areas: formData.research_areas.split(",").map((r) => r.trim()).filter(r => r.length > 0),
            };
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Signup successful! Redirecting to login...", {
                    position: "top-center",
                    autoClose: 2000,
                });
                // Use window.location.href for redirection
                setTimeout(() => window.location.href = "/login", 2500);
            } else {
                toast.error(data.error || "Signup failed", { position: "top-center" });
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

    const getPasswordStrengthColor = (strength) => {
        switch (strength) {
            case "Strong":
                return "text-green-600";
            case "Medium":
                return "text-yellow-600";
            case "Weak":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-3xl p-8 border border-purple-100 transition duration-500">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-purple-700 mb-2">MentorConnect</h1>
                    <p className="text-gray-500">Sign up to join our community!</p>

                    {/* Toggle Switch */}
                    <div className="flex justify-center mt-6 p-1 bg-gray-100 rounded-xl space-x-1">
                        {renderToggle("student")}
                        {renderToggle("mentor")}
                    </div>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                    {/* Conditional ID Fields */}
                    {userType === "student" ? (
                        <div>
                            <label htmlFor="enrollment_number" className="block text-sm font-medium text-gray-700 mb-1">Enrollment Number</label>
                            <input
                                type="text"
                                id="enrollment_number"
                                value={formData.enrollment_number}
                                onChange={handleChange}
                                placeholder="e.g., 123456789"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="mentor_id" className="block text-sm font-medium text-gray-700 mb-1">Mentor ID</label>
                            <input
                                type="text"
                                id="mentor_id"
                                value={formData.mentor_id}
                                onChange={handleChange}
                                placeholder="Enter ID provided by Admin"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                required
                            />
                        </div>
                    )}

                    {/* Common Fields */}
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            id="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition pr-16" // pr-16 keeps space for the button
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                // FIX: Use top-1/2 and -translate-y-1/2 for precise vertical centering
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 px-3 text-sm text-purple-600 font-medium hover:text-purple-800 transition"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {formData.password && (
                            <p className={`mt-2 text-sm font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                                Password Strength: **{passwordStrength}**
                            </p>
                        )}
                    </div>
                    
                    {/* Contact, Address, DOB, Image */}
                    <div>
                        <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                            type="text"
                            id="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            placeholder="e.g., +91 9876543210"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                            type="date"
                            id="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                        <input
                            type="file"
                            id="image"
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition"
                            accept="image/*"
                        />
                    </div>


                    {/* Student-only fields */}
                    {userType === "student" && (
                        <>
                            <div>
                                <label htmlFor="stream" className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
                                <input
                                    type="text"
                                    id="stream"
                                    value={formData.stream}
                                    onChange={handleChange}
                                    placeholder="e.g., B.Tech"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                                <input
                                    type="text"
                                    id="major"
                                    value={formData.major}
                                    onChange={handleChange}
                                    placeholder="e.g., Computer Engineering"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                                <input
                                    type="text"
                                    id="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g., React, Node.js, Python"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
                                <input
                                    type="text"
                                    id="interests"
                                    value={formData.interests}
                                    onChange={handleChange}
                                    placeholder="e.g., Web Development, Machine Learning"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                        </>
                    )}

                    {/* Mentor-only fields */}
                    {userType === "mentor" && (
                        <>
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    id="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g., Computer Science"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                <input
                                    type="text"
                                    id="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g., Assistant Professor"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="research_areas" className="block text-sm font-medium text-gray-700 mb-1">Research Areas (comma separated)</label>
                                <input
                                    type="text"
                                    id="research_areas"
                                    value={formData.research_areas}
                                    onChange={handleChange}
                                    placeholder="e.g., AI, Data Science, Robotics"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                />
                            </div>
                        </>
                    )}

                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-purple-700 transition transform hover:scale-[1.01] shadow-lg shadow-purple-200"
                        >
                            Create Account
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-purple-600 font-medium hover:text-purple-800 hover:underline transition">
                        Login here
                    </a>
                </p>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signup;
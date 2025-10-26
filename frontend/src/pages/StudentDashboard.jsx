import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaBook,
  FaChartBar,
  FaCalendarCheck,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaIdCard,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const sidebarNavItems = [
  { name: "Dashboard", icon: FaChartBar },
  { name: "Profile", icon: FaIdCard },
  { name: "Courses", icon: FaBook },
  { name: "Grades", icon: FaUserGraduate },
  { name: "Attendance", icon: FaCalendarCheck },
  { name: "Mentors", icon: FaUserGraduate },  // 👈 added new tab
  { name: "Settings", icon: FaCog },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [profile, setProfile] = useState({});
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    address: "",
    dob: "",
    stream: "",
    major: "",
    skills: "",
    interests: "",
    image: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [mentors, setMentors] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);

  const token = localStorage.getItem("token");

  // Helper function for fetching data
  const fetchData = async (endpoint, setData) => {
    try {
      const res = await fetch(`http://localhost:5000/student/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setData(data);
      else toast.error(data.error);
    } catch (err) {
      toast.error("Failed to fetch " + endpoint);
    }
  };

  // Fetch initial data and handle window resize
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      setIsSidebarOpen(currentWidth >= 768);
    };

    window.addEventListener("resize", handleResize);

    fetchData("profile", setProfile);
    fetchData("courses", setCourses);
    fetchData("grades", setGrades);
    fetchData("attendance", setAttendance);
    fetchData("mentors", setMentors);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update formData whenever profile changes
  useEffect(() => {
    setFormData({
      full_name: profile.full_name || "",
      email: profile.email || "",
      contact_number: profile.contact_number || "",
      address: profile.address || "",
      dob: profile.dob || "",
      stream: profile.stream || "",
      major: profile.major || "",
      skills: profile.skills?.join(", ") || "",
      interests: profile.interests?.join(", ") || "",
      image: profile.image || "",
    });
  }, [profile]);

  useEffect(() => {
    const fetchRecommendedMentors = async () => {
      if (!profile?.id) return;

      try {
        const res = await fetch(
          `http://localhost:5000/recommendations/${profile.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) {
          setRecommendedMentors(data.recommendations || []);
        } else {
          toast.error(data.error || "Failed to fetch recommendations");
        }
      } catch (err) {
        toast.error("Server error fetching recommendations");
      }
    };

    fetchRecommendedMentors();
  }, [profile, token]);

  // Add state for assigned mentors
  const [assignedMentors, setAssignedMentors] = useState([]);

  // Fetch assigned mentors after profile loads
  useEffect(() => {
    const fetchAssignedMentors = async () => {
      if (!profile?.id) return;

      try {
        const res = await fetch(
          `http://localhost:5000/student/assigned-mentors/${profile.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) {
          setAssignedMentors(data.assignedMentors || []);
        } else {
          toast.error(data.error || "Failed to fetch assigned mentors");
        }
      } catch (err) {
        toast.error("Server error fetching assigned mentors");
      }
    };

    fetchAssignedMentors();
  }, [profile, token]);


  // Calculations
  const avgAttendance =
    attendance.length > 0
      ? (
        attendance.reduce(
          (sum, a) => sum + parseFloat(a.attendance_percentage),
          0
        ) / attendance.length
      ).toFixed(1)
      : 0;

  const avgGrade =
    grades.length > 0
      ? (
        grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) /
        grades.length
      ).toFixed(1)
      : 0;

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // API Call: Update Profile
  const updateProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/student/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(s => s),
          interests: formData.interests.split(",").map((i) => i.trim()).filter(i => i),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchData("profile", setProfile);
      } else toast.error(data.error);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  // API Call: Change Password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/student/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else toast.error(data.error);
    } catch (err) {
      toast.error("Failed to change password");
    }
  };

  // Render function for main content area
  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">Your Profile</h2>
            <div className="bg-white shadow-xl rounded-xl overflow-hidden p-8">
              <div className="flex items-center space-x-6 mb-8">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-indigo-300 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-5xl text-gray-500">
                    <FaIdCard />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-indigo-700">
                    {profile.full_name || "N/A"}
                  </h3>
                  <p className="text-gray-600">{profile.email || "N/A"}</p>
                  <p className="text-md font-medium text-purple-600 mt-1">
                    {profile.role || "Student"} | ID: {profile.enrollment_number || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                <p><strong>Contact Number:</strong> {profile.contact_number || "N/A"}</p>
                <p><strong>DOB:</strong> {profile.dob || "N/A"}</p>
                <p><strong>Stream:</strong> {profile.stream || "N/A"}</p>
                <p><strong>Major:</strong> {profile.major || "N/A"}</p>
                <p className="md:col-span-2"><strong>Address:</strong> {profile.address || "N/A"}</p>
                <p className="md:col-span-2">
                  <strong>Skills:</strong> {profile.skills && profile.skills.length > 0 ? profile.skills.join(", ") : "None specified"}
                </p>
                <p className="md:col-span-2">
                  <strong>Interests:</strong> {profile.interests && profile.interests.length > 0 ? profile.interests.join(", ") : "None specified"}
                </p>
              </div>
            </div>
          </div>
        );

      case "Courses":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">My Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length > 0 ? courses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white shadow-lg rounded-xl p-5 border border-indigo-200 hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-in-out"
                >
                  <h3 className="text-xl font-bold text-indigo-700 mb-2">
                    {c.code} - {c.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    <FaBook className="inline mr-2 text-sm" />
                    Semester {c.semester}
                  </p>
                  <p className="text-sm text-gray-500">
                    Faculty: {c.faculty_name || "N/A"}
                  </p>
                </div>
              )) : (
                <p className="text-gray-500 col-span-full">You are not currently enrolled in any courses.</p>
              )}
            </div>
          </div>
        );

      case "Grades":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">My Grades</h2>

            {/* Grades List */}
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Individual Scores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {grades.length > 0 ? grades.map((g) => (
                <div
                  key={g.id}
                  className="bg-white shadow-lg rounded-xl p-5 border border-green-200 hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-in-out flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {g.subject_name}
                    </h3>
                    <p className="text-sm text-gray-500">{g.exam_type || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl">
                      Grade: <span className="font-extrabold text-green-600">{g.grade}</span>
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 col-span-full">No grades available yet.</p>
              )}
            </div>

            {/* Grades Chart (BarChart) */}
            <div className="mt-8 bg-white shadow-xl rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Grades Performance Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                {grades.length > 0 ? (
                  <BarChart data={grades}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject_name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="grade" fill="#8884d8" name="Score" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No grades data to display in chart.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "Attendance":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">Attendance Overview</h2>

            {/* Attendance List */}
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Subject Percentages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {attendance.length > 0 ? attendance.map((a) => (
                <div
                  key={a.id}
                  className="bg-white shadow-lg rounded-xl p-5 border border-blue-200 hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 ease-in-out flex justify-between items-center"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {a.subject_name}
                  </h3>
                  <p className="text-xl">
                    <span
                      className={`font-extrabold ${a.attendance_percentage >= 75
                        ? "text-green-600"
                        : a.attendance_percentage >= 50
                          ? "text-yellow-500"
                          : "text-red-600"
                        }`}
                    >
                      {a.attendance_percentage}%
                    </span>
                  </p>
                </div>
              )) : (
                <p className="text-gray-500 col-span-full">No attendance records found.</p>
              )}
            </div>

            {/* Attendance Chart (LineChart) */}
            <div className="mt-8 bg-white shadow-xl rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Attendance Trend Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                {attendance.length > 0 ? (
                  <LineChart data={attendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject_name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attendance_percentage" stroke="#3b82f6" name="Attendance (%)" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No attendance data to display in chart.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "Mentors":
        // Helper function to render a mentor card
        const renderMentorCard = (mentor, type) => {
          const colors = type === "recommended"
            ? { border: "border-indigo-400", bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-300", reason: mentor.reason || "Semantic match based on profile." }
            : { border: "border-green-400", bg: "bg-green-100", text: "text-green-700", ring: "ring-green-300", reason: "Assigned mentor for guidance." };

          const details = mentor.mentor_details || mentor;

          return (
            <div
              key={details.id || details.mentor_id}
              className={`bg-white border-2 ${colors.border} shadow-2xl rounded-xl p-6 transition-transform duration-300 hover:scale-[1.03] hover:shadow-indigo-300/50`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-14 h-14 rounded-full ${type === "recommended" ? "bg-indigo-500" : "bg-green-500"} flex items-center justify-center text-white text-2xl font-bold ${colors.ring}`}>
                    {details.full_name ? details.full_name.charAt(0) : "M"}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">{details.full_name || "Mentor"}</h3>
                    <p className={`${type === "recommended" ? "text-indigo-600" : "text-green-600"} text-sm font-semibold`}>
                      {details.designation || "Faculty Member"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg my-4 text-center ${colors.bg}`}>
                <span className="block text-sm font-medium text-gray-600">Match Score:</span>
                <span className={`text-3xl font-extrabold ${colors.text}`}>
                  {mentor.score ? (mentor.score * 100).toFixed(1) : "N/A"}%
                </span>
              </div>

              <div className="text-gray-700 text-sm space-y-2 border-t pt-4">
                <p>
                  <span className="font-semibold text-gray-800">Department:</span> {details.department || "—"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Focus Areas:</span>{" "}
                  <span className="line-clamp-2">
                    {Array.isArray(details.research_areas) ? details.research_areas.join(", ") : details.research_areas || "—"}
                  </span>
                </p>
                <p className={`pt-2 text-xs italic border-t border-dashed mt-2 ${type === "recommended" ? "text-indigo-600" : "text-green-600"}`}>
                  **Reason:** {colors.reason}
                </p>
              </div>
            </div>
          );
        };

        return (
          <div className="p-6 space-y-12">

            {/* Assigned Mentors */}
            <section>
              <h2 className="text-3xl font-extrabold text-green-800 mb-8 border-b-4 border-green-200 pb-3 flex items-center">
                <FaUserGraduate className="mr-3 text-3xl" />
                Assigned Mentors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {assignedMentors.length > 0
                  ? assignedMentors.map((am) => renderMentorCard(am, "assigned"))
                  : (
                    <p className="text-gray-500 col-span-full text-center py-10 bg-white rounded-xl shadow-lg">
                      No assigned mentors yet.
                    </p>
                  )}
              </div>
            </section>

            {/* Recommended Mentors */}
            <section>
              <h2 className="text-3xl font-extrabold text-indigo-800 mb-8 border-b-4 border-indigo-200 pb-3 flex items-center">
                <FaUserGraduate className="mr-3 text-3xl" />
                Top Recommended Mentors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {recommendedMentors.length > 0
                  ? recommendedMentors.map((rec) => renderMentorCard(rec, "recommended"))
                  : (
                    <p className="text-gray-500 col-span-full text-center py-10 bg-white rounded-xl shadow-lg">
                      No recommended mentors found based on your profile.
                    </p>
                  )}
              </div>
            </section>
          </div>
        );

      case "Settings":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">Account Settings</h2>

            {/* --- Update Profile Section --- */}
            <div className="bg-white shadow-xl rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">Edit Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData).map(([key, value]) => {
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  const inputType = key.includes("password") ? "password" : key.includes("email") ? "email" : "text";

                  if (key === "image") {
                    return (
                      <div key={key}>
                        <label className="block mb-1 font-medium">Profile Image URL</label>
                        <input type="text" name={key} value={value} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                    );
                  } else if (key === "skills" || key === "interests") {
                    return (
                      <div key={key} className="md:col-span-2">
                        <label className="block mb-1 font-medium">{label} (comma-separated)</label>
                        <input type="text" name={key} value={value} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                    );
                  } else {
                    return (
                      <div key={key}>
                        <label className="block mb-1 font-medium">{label}</label>
                        <input type={inputType} name={key} value={value} onChange={handleProfileChange} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      </div>
                    );
                  }
                })}
              </div>
              <button onClick={updateProfile} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors" >
                Update Profile
              </button>
            </div>

            {/* --- Change Password Section --- */}
            <div className="bg-white shadow-xl rounded-xl p-6">
              <h3 className="text-xl font-semibold text-red-700 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="password"
                  placeholder="Old Password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
              <button
                onClick={changePassword}
                className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        );

      case "Dashboard":
      default:
        return (
          <div className="p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">👋 Welcome, {profile.full_name || "Student"}!</h2>

            {/* --- Info Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white shadow-xl rounded-xl p-6 text-center border-l-4 border-green-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-600">Overall Grade</h3>
                <p className="text-4xl font-bold text-green-600">{avgGrade}</p>
              </div>
              <div className="bg-white shadow-xl rounded-xl p-6 text-center border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-600">Avg. Attendance</h3>
                <p className="text-4xl font-bold text-blue-600">{avgAttendance}%</p>
              </div>
              <div className="bg-white shadow-xl rounded-xl p-6 text-center border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold mb-2 text-gray-600">Courses Enrolled</h3>
                <p className="text-4xl font-bold text-purple-600">{courses.length}</p>
              </div>
            </div>

            {/* --- Grades Chart --- */}
            <div className="mt-8 bg-white shadow-xl rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Grades Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                {grades.length > 0 ? (
                  <BarChart data={grades}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject_name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="grade" fill="#8884d8" name="Score" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No grades data to display.
                  </div>
                )}
              </ResponsiveContainer>
            </div>

            {/* --- Attendance Chart --- */}
            <div className="mt-8 bg-white shadow-xl rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                {attendance.length > 0 ? (
                  <LineChart data={attendance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject_name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attendance_percentage" stroke="#3b82f6" name="Attendance (%)" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No attendance data to display.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* NEW: Overlay Backdrop. 
        It only renders when the sidebar is open AND we are on a mobile screen (< 768px).
      */}
      {isSidebarOpen && windowWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-indigo-700 text-white flex flex-col flex-shrink-0 h-full z-50 transition-transform duration-300 ease-in-out ${windowWidth < 768
          ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full")
          : "translate-x-0" // Always visible on desktop
          }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-600">
          <h1 className="text-2xl font-extrabold">Student Portal</h1>
          {/* Close button always visible on mobile sidebar */}
          {windowWidth < 768 && (
            <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-indigo-600">
              <FaTimes size={20} />
            </button>
          )}
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarNavItems.map(
            ({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => {
                  setActiveTab(name);
                  if (windowWidth < 768) setIsSidebarOpen(false); // Close on mobile click
                }}
                className={`w-full text-left flex items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${activeTab === name
                  ? "bg-indigo-800 text-white shadow-lg"
                  : "hover:bg-indigo-600 text-indigo-100"
                  }`}
              >
                <Icon className="inline mr-3" size={18} />
                {name}
              </button>
            )
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-4 py-3 rounded-lg font-medium text-red-300 hover:bg-red-700 transition-colors mt-8"
          >
            <FaSignOutAlt className="inline mr-3" size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Mobile Sidebar Toggle Button */}
        {windowWidth < 768 && !isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-xl hover:bg-indigo-700 transition"
          >
            <FaBars size={20} />
          </button>
        )}

        {/* Render Content */}
        {renderContent()}
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default StudentDashboard;
import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaEdit, // Added for Schedule tab
  FaTrash, // Added for Schedule tab
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Combined sidebar items with 'Schedule'
const sidebarNavItems = [
  { name: "Dashboard", icon: FaTachometerAlt },
  { name: "All Students", icon: FaUserGraduate },
  { name: "Schedule", icon: FaCog }, // Added new tab
  { name: "Settings", icon: FaCog },
];

const MentorsDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [subjects, setSubjects] = useState([]);

  // State for Schedule tab functionality
  const [schedule, setSchedule] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    type: "free",
  });

  const token = localStorage.getItem("token");

  // --- API Fetching Functions ---

  const fetchData = async (endpoint, setData) => {
    try {
      const res = await fetch(`http://localhost:5000/mentors/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setData(data);
      else
        toast.error(
          `Failed to fetch ${endpoint}: ${data.error || "Server error"}`
        );
    } catch {
      toast.error(`Network error: Could not connect to fetch ${endpoint}`);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/mentors/student-details/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setSelectedStudentDetails(data);
        setShowDetails(true);
      } else {
        toast.error(data.error || "Failed to fetch student details");
      }
    } catch {
      toast.error("Network error while fetching student details");
    }
  };

  const fetchSchedule = async () => {
  try {
    const mentor_id = localStorage.getItem("mentor_id");
    const res = await fetch(`http://localhost:5000/mentors/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setSchedule(data);
    else setSchedule([]);
  } catch {
    toast.error("Failed to fetch schedule");
  }
};


  // --- useEffect Hook ---

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      if (currentWidth >= 768) setIsSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);

    // Initial data fetches
    fetchData("students", setStudents);
    fetchData("subjects", setSubjects);
    fetchSchedule(); // Fetch schedule on component mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Utility Functions ---

  const getSubjectName = (subjectId) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Unknown Subject";
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- Student Management Functions ---

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/mentors/delete-user/student/${userId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Student deleted successfully!");
        fetchData("students", setStudents);
      } else toast.error(data.error || "Failed to delete student.");
    } catch {
      toast.error("Network error while deleting student.");
    }
  };

  // --- Schedule Management Functions (New) ---

  const handleSlotChange = (e) => {
    const { name, value } = e.target;
    setSlotForm({ ...slotForm, [name]: value });
  };

  const handleAddOrUpdateSlot = async () => {
  const method = editingSlot ? "PUT" : "POST";
  const url = editingSlot
    ? `http://localhost:5000/mentors/schedule/${editingSlot.id}`
    : "http://localhost:5000/mentors/schedule";

  try {
    const mentor_id = localStorage.getItem("mentor_id"); // dynamically fetched

    if (!mentor_id) {
      toast.error("Mentor ID not found. Please log in again.");
      return;
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...slotForm, mentor_id }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message || "Schedule updated successfully!");
      fetchSchedule();
      setSlotForm({ day_of_week: "", start_time: "", end_time: "", type: "free" });
      setEditingSlot(null);
    } else {
      toast.error(data.error || "Failed to save slot.");
    }
  } catch {
    toast.error("Network error while saving slot");
  }
};


  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      type: slot.type,
    });
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      const res = await fetch(`http://localhost:5000/mentors/schedule/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Slot deleted successfully!");
        fetchSchedule();
      } else toast.error(data.error || "Failed to delete slot.");
    } catch {
      toast.error("Network error while deleting slot");
    }
  };

  // --- Render Functions for Tabs ---

  const renderScheduleTab = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return (
      <div className="p-6">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
          Mentor Schedule Management 📅
        </h2>

        <div className="mb-8 bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700">
            {editingSlot ? "Edit Availability Slot" : "Add New Availability Slot"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              name="day_of_week"
              value={slotForm.day_of_week}
              onChange={handleSlotChange}
              className="border rounded p-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="time"
              name="start_time"
              value={slotForm.start_time}
              onChange={handleSlotChange}
              className="border rounded p-3 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Start Time"
            />
            <input
              type="time"
              name="end_time"
              value={slotForm.end_time}
              onChange={handleSlotChange}
              className="border rounded p-3 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="End Time"
            />
            <select
              name="type"
              value={slotForm.type}
              onChange={handleSlotChange}
              className="border rounded p-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="free">Free/Consultation</option>
              <option value="class">Class/Meeting</option>
            </select>
            <button
              onClick={handleAddOrUpdateSlot}
              className={`lg:col-span-1 sm:col-span-2 col-span-1 text-white px-4 py-3 rounded-lg font-medium transition ${
                editingSlot
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              {editingSlot ? (
                <>
                  <FaEdit className="inline mr-2" /> Update Slot
                </>
              ) : (
                <>
                  <FaEdit className="inline mr-2" /> Add Slot
                </>
              )}
            </button>
          </div>
          {editingSlot && (
            <button
              onClick={() => {
                setEditingSlot(null);
                setSlotForm({
                  day_of_week: "",
                  start_time: "",
                  end_time: "",
                  type: "free",
                });
              }}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <h3 className="text-xl font-semibold p-4 text-gray-800 border-b">
            Current Schedule Overview
          </h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedule.length > 0 ? (
                schedule.map((slot) => (
                  <tr key={slot.id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {slot.day_of_week}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {slot.start_time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {slot.end_time}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          slot.type === "class"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {slot.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Slot"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Slot"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No schedule slots added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAllStudentsTab = () => (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        All Registered Students 🧑‍🎓
      </h2>
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID / Enr. No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Major
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length > 0 ? (
              students.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-indigo-50 transition duration-150 cursor-pointer"
                  onClick={() => fetchStudentDetails(s.id)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                    {s.enrollment_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {s.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.major}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(s.id);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
        Settings ⚙️
      </h2>
      <div className="bg-white shadow-xl rounded-xl p-6">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">
          System Management Tools
        </h3>
        <div className="space-y-4">
          <button className="w-full text-left bg-yellow-100 text-yellow-800 p-4 rounded-lg font-medium hover:bg-yellow-200 transition">
            Re-index Database (Simulated)
          </button>
          <button className="w-full text-left bg-red-100 text-red-800 p-4 rounded-lg font-medium hover:bg-red-200 transition">
            Archive Old Data
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          *These buttons are placeholders for backend actions.
        </p>
      </div>
    </div>
  );

  const renderDashboardTab = () => {
    const studentByMajorData = students.reduce((acc, student) => {
      const major = student.major || "Unknown";
      const existing = acc.find((item) => item.major === major);
      if (existing) existing.count++;
      else acc.push({ major, count: 1 });
      return acc;
    }, []);

    return (
      <div className="p-6">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
          Mentors Control Panel ✨
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500 font-medium">Total Students</p>
            <h2 className="text-4xl font-extrabold text-indigo-600 mt-1">
              {students.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500 font-medium">Average Score</p>
            <h2 className="text-4xl font-extrabold text-green-600 mt-1">
              {students.length > 0
                ? (
                    students.reduce((acc, s) => acc + (s.score || 0), 0) /
                    students.length
                  ).toFixed(2)
                : "0.00"}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500 font-medium">Active Slots (Today)</p>
            <h2 className="text-4xl font-extrabold text-purple-600 mt-1">
              {schedule.filter(s => s.day_of_week === new Date().toLocaleString('en-US', { weekday: 'long' })).length}
            </h2>
          </div>
        </div>

        <div className="mt-8 bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Student Count by Major
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {studentByMajorData.length > 0 ? (
              <BarChart data={studentByMajorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="major" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#6366f1" name="Students" />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No student data for major distribution.
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "All Students":
        return renderAllStudentsTab();
      case "Schedule":
        return renderScheduleTab();
      case "Settings":
        return renderSettingsTab();
      default:
        return renderDashboardTab();
    }
  };

  // --- Main Component Render ---

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {isSidebarOpen && windowWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed md:relative w-64 bg-purple-800 text-white flex flex-col h-full z-50 transition-transform duration-300 ${
          windowWidth < 768
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-purple-700">
          <h1 className="text-2xl font-extrabold">Mentors Portal</h1>
          {windowWidth < 768 && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-purple-700"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarNavItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => {
                setActiveTab(name);
                if (windowWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left flex items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                activeTab === name
                  ? "bg-purple-900 text-white shadow-lg"
                  : "hover:bg-purple-700 text-purple-100"
              }`}
            >
              <Icon className="inline mr-3" size={18} />
              {name}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center px-4 py-3 rounded-lg font-medium text-red-300 hover:bg-red-700 transition-colors mt-8"
          >
            <FaSignOutAlt className="inline mr-3" size={18} />
            Logout
          </button>
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto relative">
        {windowWidth < 768 && !isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-40 bg-purple-600 text-white p-3 rounded-full shadow-xl hover:bg-purple-700 transition"
          >
            <FaBars size={20} />
          </button>
        )}

        {renderContent()}
      </div>

      {/* Student Details Modal (Existing from original code) */}
      {showDetails && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-11/12 md:w-3/4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-indigo-800 border-b pb-2">
              Student Profile: {selectedStudentDetails.student.full_name}
            </h3>

            {/* Personal Details */}
            <div className="mb-4 space-y-1">
              <h4 className="font-bold text-lg mb-2 text-gray-700">Personal Details:</h4>
              <p>
                <strong>Enrollment Number:</strong>{" "}
                {selectedStudentDetails.student.enrollment_number}
              </p>
              <p>
                <strong>Email:</strong> {selectedStudentDetails.student.email}
              </p>
              <p>
                <strong>Contact:</strong>{" "}
                {selectedStudentDetails.student.contact_number || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {selectedStudentDetails.student.address || "N/A"}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {selectedStudentDetails.student.dob || "N/A"}
              </p>
              <p>
                <strong>Stream / Major:</strong>{" "}
                {selectedStudentDetails.student.stream ||
                  selectedStudentDetails.student.major}
              </p>
              <p>
                <strong>Year / Semester:</strong>{" "}
                {selectedStudentDetails.student.year} /{" "}
                {selectedStudentDetails.student.semester}
              </p>
              <p>
                <strong>Skills:</strong>{" "}
                {selectedStudentDetails.student.skills?.join(", ") || "N/A"}
              </p>
              <p>
                <strong>Interests:</strong>{" "}
                {selectedStudentDetails.student.interests?.join(", ") || "N/A"}
              </p>
            </div>

            {/* Grades */}
            <div className="mb-4">
              <h4 className="font-bold text-lg mb-2 text-gray-700">Grades:</h4>
              {selectedStudentDetails.grades?.length > 0 ? (
                <table className="w-full mb-4 border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentDetails.grades.map((g, idx) => (
                      <tr key={g.id || idx} className="border-t">
                        <td className="px-4 py-2 text-sm">
                          {getSubjectName(g.subject_id)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">{g.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No grades available.</p>
              )}
            </div>

            {/* Attendance */}
            <div className="mb-4">
              <h4 className="font-bold text-lg mb-2 text-gray-700">Attendance:</h4>
              {selectedStudentDetails.attendance?.length > 0 ? (
                <table className="w-full border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Semester</th>
                      <th className="px-4 py-2 text-left">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentDetails.attendance.map((a, idx) => (
                      <tr key={a.id || idx} className="border-t">
                        <td className="px-4 py-2 text-sm">
                          {getSubjectName(a.subject_id)}
                        </td>
                        <td className="px-4 py-2 text-sm">{a.semester}</td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {a.attendance_percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No attendance records.</p>
              )}
            </div>

            <button
              onClick={() => {
                setShowDetails(false);
                setSelectedStudentDetails(null);
              }}
              className="mt-4 bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-purple-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default MentorsDashboard;
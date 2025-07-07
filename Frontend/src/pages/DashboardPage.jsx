import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Upload,
  Edit,
  Clock,
  User,
  UserCheck,
  Trash2,
  LogOut,
} from "lucide-react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import Clients from "./clients";
import Staff from "./staff";
import Appointment from "./appointment";
import AppointmentNature from "./AppointmentNature";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6F61', '#6B7280'];

const SentimentBadge = ({ sentiment, score }) => {
  const getSentimentColor = () => {
    if (!sentiment) return "bg-gray-100 text-gray-800";
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };
  const getSentimentIcon = () => {
    if (!sentiment) return "😐";
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor()}`}
    >
      <span className="mr-2">{getSentimentIcon()}</span>
      {sentiment || "No feedback"}
      {score && (
        <span className="ml-2 text-xs opacity-75">
          ({score > 0 ? "+" : ""}
          {score.toFixed(2)})
        </span>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("appointment");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFilterDate, setSelectedFilterDate] = useState("31/06/2021");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
    averageRating: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    gender: [],
    age: [],
    occupation: [],
    civil_status: [],
    consultation_topics: [],
  });

  // Authentication check
  useEffect(() => {
    const isDemo = localStorage.getItem("isDemo") === "true";
    const authToken = localStorage.getItem("authToken");
    if (!isDemo && !authToken && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/client-appointments/");
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await response.json();
        if (data.success) {
          const processedAppointments = data.data.map((app) => ({
            id: app.id,
            date: new Date(app.appointment_date).toLocaleDateString("en-GB"),
            nature: app.inquiry_display_name,
            status: app.status,
            feedback: app.feedback,
            rating: app.rating,
            sentiment: app.sentiment_label,
            sentimentScore: app.sentiment_score,
            attachments: app.attachments || [],
          }));
          setAppointments(processedAppointments);
          calculateFeedbackStats(processedAppointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/client-appointments/dashboard_stats/");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, []);

  const calculateFeedbackStats = (appointments) => {
    const feedbacks = appointments.filter((a) => a.feedback);
    const positive = feedbacks.filter((a) => a.sentiment === "Positive").length;
    const neutral = feedbacks.filter((a) => a.sentiment === "Neutral").length;
    const negative = feedbacks.filter((a) => a.sentiment === "Negative").length;
    const ratings = feedbacks.filter((a) => a.rating).map((a) => a.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;
    setFeedbackStats({
      positive,
      neutral,
      negative,
      averageRating: parseFloat(averageRating.toFixed(1)),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("clientData");
    localStorage.removeItem("isDemo");
    navigate("/");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "appointment", label: "Appointment Schedule" },
    { id: "appointment-nature", label: "Appointment Nature" },
    { id: "clients", label: "Clients" },
    { id: "staff", label: "Staff" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Dashboard Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">
                    Total Appointments
                  </h3>
                  <p className="text-3xl font-bold">{appointments.length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Active Clients</h3>
                  <p className="text-3xl font-bold">{dashboardData.gender.reduce((sum, g) => sum + g.value, 0)}</p>
                </div>
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Staff Members</h3>
                  <p className="text-3xl font-bold">8</p> {/* Update with real data if available */}
                </div>
              </div>

              {/* Graphs Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6 text-slate-800">Client Demographics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Gender Distribution Pie Chart */}
                  <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                    <h4 className="font-medium text-slate-700 mb-3">Gender Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.gender}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {dashboardData.gender.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Age Distribution Bar Chart */}
                  <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                    <h4 className="font-medium text-slate-700 mb-3">Age Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboardData.age}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Occupation Distribution Pie Chart */}
                  <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                    <h4 className="font-medium text-slate-700 mb-3">Occupation</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.occupation}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {dashboardData.occupation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Civil Status Pie Chart */}
                  <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                    <h4 className="font-medium text-slate-700 mb-3">Civil Status</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.civil_status}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {dashboardData.civil_status.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Consultation Topics Bar Chart */}
                  <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                    <h4 className="font-medium text-slate-700 mb-3">Consultation Topics</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboardData.consultation_topics}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-900 to-slate-800 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">
                    Feedback Sentiment
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Positive</span>
                      <span>{feedbackStats.positive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Neutral</span>
                      <span>{feedbackStats.neutral}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Negative</span>
                      <span>{feedbackStats.negative}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-900 to-slate-800 text-white p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
                  <div className="flex items-center justify-center">
                    <div className="text-4xl font-bold mr-2">
                      {feedbackStats.averageRating}
                    </div>
                    <div className="text-yellow-400 text-2xl">
                      {"★".repeat(Math.round(feedbackStats.averageRating))}
                      {"☆".repeat(5 - Math.round(feedbackStats.averageRating))}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-center opacity-80">
                    Based on{" "}
                    {feedbackStats.positive +
                      feedbackStats.neutral +
                      feedbackStats.negative}{" "}
                    feedbacks
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-white rounded-xl p-6 shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
                <div className="space-y-4">
                  {appointments
                    .filter((a) => a.feedback)
                    .slice(0, 3)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.nature}</p>
                            <p className="text-sm text-gray-600">
                              {appointment.date}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <div className="text-yellow-400 mr-2">
                              {"★".repeat(appointment.rating)}
                              {"☆".repeat(5 - appointment.rating)}
                            </div>
                            <SentimentBadge
                              sentiment={appointment.sentiment}
                              score={appointment.sentimentScore}
                            />
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700">
                          {appointment.feedback}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "appointment":
        return (
          <Appointment
            appointments={appointments}
            setAppointments={setAppointments}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            isDeleteModalOpen={isDeleteModalOpen}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
            selectedFilterDate={selectedFilterDate}
            setSelectedFilterDate={setSelectedFilterDate}
          />
        );
      case "appointment-nature":
        return <AppointmentNature />;
      case "clients":
        return <Clients />;
      case "staff":
        return <Staff />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(234,179,8,0.1)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(234,179,8,0.05)_0%,_transparent_50%)]"></div>
      {/* Sidebar */}
      <div
        className={`relative transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm h-full shadow-2xl border-r border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-slate-800">ADMIN</h1>
                  <p className="text-sm text-gray-600">A-M-S</p>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${
                  isSidebarOpen ? "px-4" : "px-2 justify-center"
                } py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-900 to-slate-800 text-white shadow-lg"
                    : "text-slate-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            ))}
          </nav>
          {/* Logout Button */}
          <div className="absolute bottom-6 left-0 right-0 px-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`w-full flex items-center ${
                isSidebarOpen ? "px-4" : "px-2 justify-center"
              } py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-all duration-200`}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Appointment & Analytics
              </h1>
              <h2 className="text-xl font-semibold text-yellow-400">
                Management System
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">Welcome back,</p>
              <p className="text-yellow-400 font-semibold text-lg">
                Admin User
              </p>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        </div>
        {/* Content Area */}
        <div className="relative">{renderContent()}</div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
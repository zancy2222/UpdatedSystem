import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Upload,
  FileText,
  Clock,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ClientProfile from "../components/ClientProfile";
import ClientAppointment from "../components/ClientAppointment";
import ClientAppointmentHistoryDemo from "../components/ClientAppointmentHistoryDemo";

export default function ClientAppointmentSystem() {
  const [activeTab, setActiveTab] = useState("appointment");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState(""); // NEW: Track specific officer ID
  const [showSchedule, setShowSchedule] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(new Date());
  const [fullyBookedDates, setFullyBookedDates] = useState([]);

  // UPDATED: Store detailed officer schedules with IDs
  const [officerSchedules, setOfficerSchedules] = useState({
    head: { officers: [], schedule: [], timeSlot: "" },
    deputy: { officers: [], schedule: [], timeSlot: "" },
    admin: { officers: [], schedule: [], timeSlot: "" },
    examiner: { officers: [], schedule: [], timeSlot: "" },
  });

  // NEW: Store date-to-officer mapping
  const [dateOfficerMapping, setDateOfficerMapping] = useState({});

  // State for loading and error
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);

  // UPDATED: Fetch officer schedules from API with proper officer mapping
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        const response = await fetch("/api/appointment-schedules/");
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await response.json();

        if (data.success) {
          // Create a more detailed mapping that tracks individual officers
          const schedulesMap = {
            head: { officers: new Map(), dates: new Set(), timeSlot: "" },
            deputy: { officers: new Map(), dates: new Set(), timeSlot: "" },
            admin: { officers: new Map(), dates: new Set(), timeSlot: "" },
            examiner: { officers: new Map(), dates: new Set(), timeSlot: "" },
          };

          // NEW: Create date-to-officer mapping
          const newDateOfficerMapping = {};

          data.data.forEach((app) => {
            const dateStr = new Date(app.date).toISOString().split("T")[0];

            if (app.head_of_office_detail) {
              schedulesMap.head.dates.add(dateStr);
              schedulesMap.head.timeSlot = app.time_slot;
              schedulesMap.head.officers.set(app.head_of_office_detail.id, {
                id: app.head_of_office_detail.id,
                name: app.head_of_office_detail.full_name || "Head of Office",
                dates:
                  schedulesMap.head.officers.get(app.head_of_office_detail.id)
                    ?.dates || [],
              });
              schedulesMap.head.officers
                .get(app.head_of_office_detail.id)
                .dates.push(dateStr);
              newDateOfficerMapping[dateStr] =
                newDateOfficerMapping[dateStr] || {};
              newDateOfficerMapping[dateStr].head =
                app.head_of_office_detail.id;
            }

            if (app.deputy_detail) {
              schedulesMap.deputy.dates.add(dateStr);
              schedulesMap.deputy.timeSlot = app.time_slot;
              schedulesMap.deputy.officers.set(app.deputy_detail.id, {
                id: app.deputy_detail.id,
                name: app.deputy_detail.full_name || "Deputy",
                dates:
                  schedulesMap.deputy.officers.get(app.deputy_detail.id)
                    ?.dates || [],
              });
              schedulesMap.deputy.officers
                .get(app.deputy_detail.id)
                .dates.push(dateStr);
              newDateOfficerMapping[dateStr] =
                newDateOfficerMapping[dateStr] || {};
              newDateOfficerMapping[dateStr].deputy = app.deputy_detail.id;
            }

            if (app.admin_officer_detail) {
              schedulesMap.admin.dates.add(dateStr);
              schedulesMap.admin.timeSlot = app.time_slot;
              schedulesMap.admin.officers.set(app.admin_officer_detail.id, {
                id: app.admin_officer_detail.id,
                name:
                  app.admin_officer_detail.full_name ||
                  "Administrative Officer",
                dates:
                  schedulesMap.admin.officers.get(app.admin_officer_detail.id)
                    ?.dates || [],
              });
              schedulesMap.admin.officers
                .get(app.admin_officer_detail.id)
                .dates.push(dateStr);
              newDateOfficerMapping[dateStr] =
                newDateOfficerMapping[dateStr] || {};
              newDateOfficerMapping[dateStr].admin =
                app.admin_officer_detail.id;
            }

            if (app.examiner_detail) {
              schedulesMap.examiner.dates.add(dateStr);
              schedulesMap.examiner.timeSlot = app.time_slot;
              schedulesMap.examiner.officers.set(app.examiner_detail.id, {
                id: app.examiner_detail.id,
                name: app.examiner_detail.full_name || "Examiner",
                dates:
                  schedulesMap.examiner.officers.get(app.examiner_detail.id)
                    ?.dates || [],
              });
              schedulesMap.examiner.officers
                .get(app.examiner_detail.id)
                .dates.push(dateStr);
              newDateOfficerMapping[dateStr] =
                newDateOfficerMapping[dateStr] || {};
              newDateOfficerMapping[dateStr].examiner = app.examiner_detail.id;
            }
          });

          // Convert Maps to Arrays for easier rendering
          setOfficerSchedules({
            head: {
              officers: Array.from(schedulesMap.head.officers.values()),
              schedule: Array.from(schedulesMap.head.dates),
              timeSlot: schedulesMap.head.timeSlot,
            },
            deputy: {
              officers: Array.from(schedulesMap.deputy.officers.values()),
              schedule: Array.from(schedulesMap.deputy.dates),
              timeSlot: schedulesMap.deputy.timeSlot,
            },
            admin: {
              officers: Array.from(schedulesMap.admin.officers.values()),
              schedule: Array.from(schedulesMap.admin.dates),
              timeSlot: schedulesMap.admin.timeSlot,
            },
            examiner: {
              officers: Array.from(schedulesMap.examiner.officers.values()),
              schedule: Array.from(schedulesMap.examiner.dates),
              timeSlot: schedulesMap.examiner.timeSlot,
            },
          });

          setDateOfficerMapping(newDateOfficerMapping);
        }
      } catch (error) {
        setScheduleError("Failed to load schedules. Please try again later.");
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, []);

useEffect(() => {
  const fetchFullDates = async () => {
    try {
      const res = await fetch("/api/client-appointments/full_dates/");
      const result = await res.json();
      if (result.success) {
        setFullyBookedDates(result.data); // Dates in 'YYYY-MM-DD' format
      }
    } catch (err) {
      console.error("Failed to fetch fully booked dates:", err);
    }
  };

  fetchFullDates();
}, []);
  // Sample appointments data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      nameOfInquiry: "Documentary Requirements",
      apptDate: "2025-06-15",
      status: "Pending",
      feedback: "",
    },
    {
      id: 2,
      nameOfInquiry: "Court Cases",
      apptDate: "2025-06-16",
      status: "Confirmed",
      feedback: "",
    },
  ]);

  // Load client data on component mount
  useEffect(() => {
    const storedClientData = localStorage.getItem("clientData");
    const storedIsDemo = localStorage.getItem("isDemo") === "true";
    if (storedClientData && !storedIsDemo) {
      setClientData(JSON.parse(storedClientData));
    }
    setIsDemo(storedIsDemo);
  }, []);

  const [appointmentNatures, setAppointmentNatures] = useState([]);

  // 2. Function to fetch appointment natures from API
  const fetchAppointmentNatures = async () => {
    try {
      console.log("");
      const response = await fetch("/api/appointment-natures/");
      const data = await response.json();

      if (response.ok) {
        // Transform the data to match your existing structure
        const transformedNatures = data.map((nature) => ({
          value: nature.id.toString(), // Use ID as value
          label: nature.nature,
          description: nature.description,
          officer: mapRoutingOptionToOfficerType(nature.routing_option),
        }));
        setAppointmentNatures(transformedNatures);
      } else {
        console.error("Failed to fetch appointment natures:", data);
        alert("Failed to load inquiry types. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching appointment natures:", error);
      alert("Error loading inquiry types. Please try again.");
    } finally {
      console.log("");
    }
  };

  // 3. Helper function to map routing options to officer types
  const mapRoutingOptionToOfficerType = (routingOption) => {
    const mapping = {
      "Head of Office": "head",
      Deputy: "deputy",
      "Administrative Officer": "admin",
      Examiner: "examiner",
    };
    return mapping[routingOption] || "head"; // Default to head if not found
  };

  // 4. useEffect to fetch data when component mounts
  useEffect(() => {
    fetchAppointmentNatures();
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 5. Updated handleNext function
  const handleNext = () => {
    if (selectedInquiry) {
      const inquiry = appointmentNatures.find(
        (type) => type.value === selectedInquiry
      );
      if (inquiry) {
        setSelectedOfficer(inquiry.officer);
        setShowSchedule(true);
      }
    }
  };

  // 6. Updated handleDone function
  const handleDone = async () => {
  if (selectedDate && selectedInquiry && selectedOfficerId) {
    if (fullyBookedDates.includes(selectedDate)) {
      alert("Sorry, this date is already fully booked. Please choose another one.");
      return;
    }

    try {
      const inquiry = appointmentNatures.find(
        (type) => type.value === selectedInquiry
      );

      if (!inquiry) {
        alert("Selected inquiry type not found. Please try again.");
        return;
      }

      const clientId = getClientId();
      if (!clientId) {
        alert("Client ID is missing. Please try logging in again.");
        return;
      }

      console.log("Creating appointment with:", {
        date: selectedDate,
        inquiry: selectedInquiry,
        officerType: inquiry.officer,
        officerId: selectedOfficerId,
        attachments: attachments.length,
      });

      const formData = new FormData();
      formData.append("client", clientId);
      formData.append("inquiry_type", selectedInquiry);
      formData.append("appointment_date", selectedDate);
      formData.append("officer_type", inquiry.officer);
      formData.append("officer_id", selectedOfficerId);
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch("/api/client-appointments/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        const selectedOfficerData = officerSchedules[inquiry.officer].officers.find(
          (officer) => officer.id.toString() === selectedOfficerId.toString()
        );
        const officerName = selectedOfficerData?.name || inquiry.label;

        const newAppointment = {
          id: data.data.id,
          nameOfInquiry: inquiry.label,
          apptDate: selectedDate,
          status: "Pending",
          feedback: "",
          assignedOfficer: officerName,
          attachments: data.data.attachments || [],
        };

        setAppointments((prev) => [...prev, newAppointment]);

        // Reset form state
        setSelectedInquiry("");
        setAttachments([]);
        setSelectedOfficer("");
        setSelectedDate("");
        setSelectedOfficerId("");
        setShowSchedule(false);
        setIsModalOpen(false);
        setShowConfirmation(false);

        alert(
          `Appointment created successfully with ${officerName}! ${
            attachments.length > 0
              ? `${attachments.length} file(s) uploaded.`
              : ""
          }`
        );
        window.location.reload();
      } else {
        alert(data.message || "Failed to create appointment");
        if (data.errors) {
          console.error("Validation errors:", data.errors);
        }
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error creating appointment. Please try again.");
    }
  }
};

  const giveFeedback = (id, feedback) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, feedback } : apt))
    );
  };

  const menuItems = [
    { id: "appointment", label: "Appointment" },
    { id: "profile", label: "Profile" },
    { id: "history", label: "History" },
  ];

  //Logout
  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("clientData");
    localStorage.removeItem("isDemo");
    // Navigate back to login
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointment":
        return (
          <ClientAppointment
            appointments={appointments}
            setIsModalOpen={setIsModalOpen}
            giveFeedback={giveFeedback}
          />
        );
      case "profile":
        return <ClientProfile clientData={clientData} isDemo={isDemo} />;
      case "history":
        return <ClientAppointmentHistoryDemo />;
      default:
        return null;
    }
  };

  // Helper function to get client display name
  const getClientDisplayName = () => {
    if (isDemo) {
      return "Demo Client";
    }
    if (clientData) {
      return clientData.firstname
        ? `${clientData.firstname} ${clientData.lastname || ""}`.trim()
        : clientData.username || "Client";
    }
    return "Client";
  };

  // Helper function to get client ID (hidden but available)
  const getClientId = () => {
    if (isDemo) {
      return "DEMO001";
    }
    return clientData?.id || clientData?.client_id || "N/A";
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isDateAvailable = (date) => {
    const dateString = formatDateToString(date);
    return officerSchedules[selectedOfficer]?.schedule.includes(dateString);
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(calendarView);
    newDate.setMonth(newDate.getMonth() + direction);
    setCalendarView(newDate);
  };

  const handleDateSelection = (dateString) => {
    setSelectedDate(dateString);

    // Find which specific officer is available on this date
    const officerForDate = dateOfficerMapping[dateString]?.[selectedOfficer];
    if (officerForDate) {
      // Find the officer details to ensure they exist
      const officerDetails = officerSchedules[selectedOfficer]?.officers.find(
        (officer) => officer.id.toString() === officerForDate.toString()
      );

      if (officerDetails) {
        setSelectedOfficerId(officerForDate.toString());
      } else {
        setSelectedOfficerId("");
        console.error("Officer not found in schedule:", officerForDate);
      }
    } else {
      setSelectedOfficerId("");
      console.error("No officer found for date:", dateString);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarView);
    const firstDayOfMonth = getFirstDayOfMonth(calendarView);
    const monthYear = calendarView.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        calendarView.getFullYear(),
        calendarView.getMonth(),
        day
      );
      const dateString = formatDateToString(date);
      const isAvailable = isDateAvailable(date);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate === dateString;
      const isPast = date < today;
      const isWeekdayDate = isWeekday(date);
      const isFullyBooked = fullyBookedDates.includes(dateString)

      days.push(
  <button
    key={day}
    onClick={() => {
      if (isAvailable && !isPast && isWeekdayDate && !isFullyBooked) {
        handleDateSelection(dateString);
      }
    }}
    disabled={!isAvailable || isPast || !isWeekdayDate || isFullyBooked}
    className={`
      h-12 w-full flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200
      ${
        isSelected
          ? "bg-blue-600 text-white shadow-lg transform scale-105"
          : isFullyBooked
          ? "bg-red-200 text-red-700 cursor-not-allowed"
          : isAvailable && !isPast && isWeekdayDate
          ? "bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300"
          : isPast || !isWeekdayDate
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-400 cursor-not-allowed"
      }
      ${isToday && !isSelected && !isFullyBooked ? "ring-2 ring-blue-400" : ""}
    `}
  >
    <span className="relative">
      {day}
      {isAvailable && !isPast && isWeekdayDate && !isFullyBooked && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
      )}
    </span>
  </button>
);

    }

    // Get the selected officer's name for display
    const getSelectedOfficerName = () => {
      if (selectedOfficerId && selectedDate) {
        const officer = officerSchedules[selectedOfficer].officers.find(
          (o) => o.id.toString() === selectedOfficerId.toString()
        );
        return officer?.name || "Officer";
      }
      return null;
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-xl font-bold text-gray-800">{monthYear}</h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">{days}</div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded mr-2"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>

        {/* Time Slot Display */}
        {officerSchedules[selectedOfficer]?.timeSlot && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-800">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">Available Time: </span>
              <span className="ml-1 font-bold">
                {officerSchedules[selectedOfficer].timeSlot}
              </span>
            </div>
          </div>
        )}

        {/* Selected Date and Officer Display */}
        {selectedDate && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Selected Date: </span>
                <span className="ml-1 font-bold">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* NEW: Display assigned officer */}
            {getSelectedOfficerName() && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center text-purple-800">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">Assigned Officer: </span>
                  <span className="ml-1 font-bold">
                    {getSelectedOfficerName()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
                  <h1 className="text-lg font-bold text-slate-800">CLIENT</h1>
                  <p className="text-sm text-gray-600">Portal</p>
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
                  viewBox="0 0 24 24"
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Client Portal
              </h1>
              <h2 className="text-xl font-semibold text-yellow-400">
                Appointment Management
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">Welcome back,</p>
              <p className="text-yellow-400 font-semibold text-lg">
                {getClientDisplayName()}
              </p>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        </div>

        {/* Content Area */}
        <div className="relative">{renderContent()}</div>
      </div>

      {/* Set Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Set New Appointment
                </h3>
                {/* Client Information Display */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-blue-800">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">Client: </span>
                    <span className="ml-1 font-semibold">
                      {getClientDisplayName()}
                    </span>
                    {/* Hidden client ID for form processing */}
                    <input
                      type="hidden"
                      value={getClientId()}
                      name="client_id"
                      id="client_id"
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    ID: {getClientId()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setShowSchedule(false);
                  setSelectedInquiry("");
                  setAttachments([]);
                  setSelectedOfficer("");
                  setSelectedDate("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {!showSchedule ? (
              <>
                {/* Inquiry Type Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-700 mb-4">
                    Select Inquiry Type:
                  </h4>
                  {appointmentNatures.length > 0 ? (
                    <div className="space-y-3">
                      {appointmentNatures.map((type) => (
                        <label
                          key={type.value}
                          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="inquiry"
                            value={type.value}
                            checked={selectedInquiry === type.value}
                            onChange={(e) => setSelectedInquiry(e.target.value)}
                            className="mr-3 text-blue-600"
                          />
                          <div>
                            <span className="text-slate-700 font-medium block">
                              {type.label}
                            </span>
                            {type.description && (
                              <span className="text-slate-500 text-sm block mt-1">
                                {type.description}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-slate-700 bg-red-50 rounded-lg">
                      No inquiry types available
                    </div>
                  )}
                </div>
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOCX, JPG, PNG (MAX. 5MB each)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm text-slate-700 truncate max-w-xs">
                              {file.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!selectedInquiry}
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Schedule Selection with Calendar */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-700 mb-2">
                    Select Available Date
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Choose from available dates (Monday to Friday only):
                  </p>

                  {isLoadingSchedules ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : scheduleError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                      {scheduleError}
                    </div>
                  ) : officerSchedules[selectedOfficer]?.schedule.length ===
                    0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
                      No available schedules found for this inquiry type.
                    </div>
                  ) : (
                    renderCalendar()
                  )}
                </div>

                {/* Done Button */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowSchedule(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setShowConfirmation(true)}
                    disabled={!selectedDate}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Confirm Action
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to set an appointment?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  handleDone();
                }}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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

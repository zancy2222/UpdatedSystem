import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Upload,
  FileText,
  Eye,
  User,
  Clock,
  LogOut,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PersonnelProfile from "../components/PersonnelProfile";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export function AppointmentList() {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [calendarView, setCalendarView] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [officerSchedules, setOfficerSchedules] = useState({
    head: { officers: [], schedule: [], timeSlot: "" },
    deputy: { officers: [], schedule: [], timeSlot: "" },
    admin: { officers: [], schedule: [], timeSlot: "" },
    examiner: { officers: [], schedule: [], timeSlot: "" },
  });
  const [dateOfficerMapping, setDateOfficerMapping] = useState({});
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [fullyBookedDates, setFullyBookedDates] = useState([]);

  // Get personnel data from localStorage
  const getPersonnelData = () => {
    return JSON.parse(localStorage.getItem("personnelData") || {});
  };

const positionKeyMap = {
  "head of office": "head",
  "deputy": "deputy",
  "administrative officer": "admin",
  "examiner": "examiner",
};
const position = getPersonnelData()?.position?.toLowerCase() || "";


  const selectedOfficer = positionKeyMap[position] || "";


  // Fetch available schedules
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
          const schedulesMap = {
            head: { officers: new Map(), dates: new Set(), timeSlot: "" },
            deputy: { officers: new Map(), dates: new Set(), timeSlot: "" },
            admin: { officers: new Map(), dates: new Set(), timeSlot: "" },
            examiner: { officers: new Map(), dates: new Set(), timeSlot: "" },
          };
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

  // Fetch fully booked dates
  useEffect(() => {
    const fetchFullyBookedDates = async () => {
      try {
        const response = await fetch("/api/client-appointments/full_dates/");
        if (!response.ok) {
          throw new Error("Failed to fetch fully booked dates");
        }
        const data = await response.json();
        if (data.success) {
          setFullyBookedDates(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching fully booked dates:", error);
      }
    };

    fetchFullyBookedDates();
  }, []);

  // Fetch appointments assigned to this personnel
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const personnel = getPersonnelData();

      if (!personnel?.id) {
        throw new Error("Personnel data not found");
      }

      const response = await fetch(
        `http://localhost:8000/api/client-appointments/?officer_id=${personnel.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const filteredAppointments = data.data.filter(
          (appt) => appt.assigned_officer === personnel.id
        );

        setAppointments(
          filteredAppointments.map((appt) => ({
            id: appt.id,
            clientName: appt.client_name || "Unknown Client",
            date: new Date(appt.appointment_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            }),
            rawDate: appt.appointment_date,
            natureOfInquiry: appt.inquiry_display_name || appt.inquiry_type,
            status: appt.status.toLowerCase(),
            hasAttachment: appt.attachments?.length > 0,
            attachments: appt.attachments || [],
            assignedOfficer: appt.assigned_officer_name,
            clientContact: appt.client_contact,
          }))
        );
      } else {
        setError(data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const confirmStatusChange = async () => {
    try {
      const capitalizedStatus =
      selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/client-appointments/${selectedId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status:
              selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1),
            officer_id: getPersonnelData().id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchAppointments();
        toast.success(`Status set to ${capitalizedStatus}`);
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      setSelectedId(null);
      setSelectedStatus("");
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedOfficerId) {
      setError("Please select a new date");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/client-appointments/${selectedId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointment_date: selectedDate,
            status: "Rescheduled",
            officer_id: selectedOfficerId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`Status set to Rescheduled`);
        await fetchAppointments();
        
      } else {
        throw new Error(data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRescheduleModalOpen(false);
      setSelectedId(null);
      setSelectedDate("");
      setSelectedOfficerId("");
      setCalendarView(new Date());
    }
  };

  const viewAttachment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAttachmentModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "rescheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statusMap = {
      pending: ["confirmed", "rescheduled", "cancelled"],
      confirmed: ["completed", "rescheduled", "cancelled"],
      rescheduled: ["confirmed", "cancelled"],
      cancelled: [],
      completed: [],
    };

    return statusMap[currentStatus] || [];
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
      const isFullyBooked = fullyBookedDates.includes(dateString);

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
        const officer = officerSchedules[selectedOfficer]?.officers.find(
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
            <div className="w-3 h-3 bg-red-200 rounded mr-2"></div>
            <span className="text-gray-600">Fully Booked</span>
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <div className="flex items-center">
          <X className="w-5 h-5 mr-2" />
          {error}
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchAppointments();
          }}
          className="mt-2 text-sm underline hover:no-underline text-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            My Appointments
          </h2>
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No appointments assigned to you
            </h3>
            <p className="text-gray-500">
              You'll see appointments here when they're assigned to you
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <th className="px-6 py-3 text-left font-medium rounded-tl-lg">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Inquiry</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Actions</th>
                  <th className="px-6 py-3 text-left font-medium rounded-tr-lg">
                    Files
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr
                    key={appointment.id}
                    className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {appointment.clientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.clientContact}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {appointment.natureOfInquiry}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setSelectedId(appointment.id);
                          if (e.target.value === "rescheduled") {
                            setIsRescheduleModalOpen(true);
                          } else {
                            setIsConfirmModalOpen(true);
                          }
                        }}
                        value={appointment.status}
                        disabled={
                          getStatusOptions(appointment.status).length === 0
                        }
                        className={`px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          getStatusOptions(appointment.status).length === 0
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "hover:border-blue-400"
                        }`}
                      >
                        <option value={appointment.status} hidden>
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </option>
                        {getStatusOptions(appointment.status).map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {appointment.hasAttachment ? (
                        <button
                          onClick={() => viewAttachment(appointment)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View ({appointment.attachments.length})
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attachment Modal */}
      {isAttachmentModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Attachments for {selectedAppointment.clientName}'s appointment
              </h3>
              <button
                onClick={() => setIsAttachmentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {selectedAppointment.attachments.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No attachments available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedAppointment.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center min-w-0">
                      <FileText className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round(attachment.file_size / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `http://localhost:8000/api/client-appointments/${selectedAppointment.id}/download_attachment/?attachment_id=${attachment.id}`
                            );
                            const data = await response.json();
                            if (data.success && data.data.file_url) {
                              window.open(data.data.file_url, "_blank");
                            } else {
                              throw new Error(
                                data.message || "Failed to open attachment"
                              );
                            }
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-center mb-4">
              Confirm Status Change
            </h3>
            <p className="text-center text-gray-700 mb-6">
              Change status to{" "}
              <span className="font-bold capitalize">{selectedStatus}</span>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reschedule Appointment</h3>
              <button
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setSelectedDate("");
                  setSelectedOfficerId("");
                  setSelectedId(null);
                  setCalendarView(new Date());
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            {isLoadingSchedules ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading schedules...</span>
              </div>
            ) : scheduleError ? (
              <div className="text-red-700 mb-4">{scheduleError}</div>
            ) : officerSchedules[selectedOfficer]?.schedule.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
                No available schedules found for this inquiry type.
              </div>
            ) : (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 mb-2">
                  Select Available Date
                </h4>
                <p className="text-gray-600 mb-4">
                  Choose from available dates (Monday to Friday only):
                </p>
                {renderCalendar()}
              </div>
            )}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setIsRescheduleModalOpen(false);
                  setSelectedDate("");
                  setSelectedOfficerId("");
                  setSelectedId(null);
                  setCalendarView(new Date());
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedOfficerId || isLoadingSchedules}
                className={`px-4 py-2 rounded text-white transition-colors ${
                  !selectedDate || !selectedOfficerId || isLoadingSchedules
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main PersonnelDashboard Component
export default function PersonnelDashboard() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("appointment-list");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [personnelData, setPersonnelData] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const navigate = useNavigate();

  // Load personnel data on component mount
  useEffect(() => {
    const storedPersonnelData = localStorage.getItem("personnelData");
    const storedIsDemo = localStorage.getItem("isDemo") === "true";

    if (storedPersonnelData && !storedIsDemo) {
      setPersonnelData(JSON.parse(storedPersonnelData));
    }
    setIsDemo(storedIsDemo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("personnelData");
    localStorage.removeItem("isDemo");
    navigate("/");
  };

  const menuItems = [
    { id: "appointment-list", label: "Appointments", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "appointment-list":
        return <AppointmentList />;
      case "profile":
        return (
          <PersonnelProfile personnelData={personnelData} isDemo={isDemo} />
        );
      default:
        return <AppointmentList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(234,179,8,0.1)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(234,179,8,0.05)_0%,_transparent_50%)]"></div>

      <div
        className={`relative transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm h-full shadow-2xl border-r border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-slate-800">
                    PERSONNEL
                  </h1>
                  <p className="text-sm text-gray-600">Dashboard</p>
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
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
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
                  <Icon className="w-5 h-5" />
                  {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              );
            })}
          </nav>

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

      <div className="flex-1 p-6 relative">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Personnel Dashboard
              </h1>
              <h2 className="text-xl font-semibold text-yellow-400">
                Appointment Management System
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">Welcome back,</p>
              <p className="text-yellow-400 font-semibold text-lg">
                {personnelData
                  ? personnelData.firstname || personnelData.username
                  : "Personnel"}
              </p>
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        </div>

        <div className="relative">{renderContent()}</div>
      </div>

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
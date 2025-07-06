import React, { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  X,
  Calendar,
  User,
  Clock,
  FileText,
  Download,
  Eye,
  MessageSquare,
  Star,
} from "lucide-react";

const ClientAppointment = ({ setIsModalOpen }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [language, setLanguage] = useState("en"); // Default to English

  // Get client ID from localStorage or demo mode
  const getClientId = () => {
    const isDemo = localStorage.getItem("isDemo") === "true";
    if (isDemo) {
      return "DEMO001";
    }
    const clientData = JSON.parse(localStorage.getItem("clientData") || "{}");
    return clientData?.id || clientData?.client_id || null;
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const clientId = getClientId();
      let url = "/api/client-appointments/";

      // Only fetch Pending, Confirmed, Cancelled, and Completed-without-feedback
      if (clientId && clientId !== "DEMO001") {
        url += `?client_id=${clientId}&status=Pending,Confirmed,Cancelled,Completed`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const formattedAppointments = data.data
          // Filter out Completed appointments WITH feedback
          .filter((appt) => appt.status !== "Completed" || !appt.feedback)
          .map((appointment) => ({
            id: appointment.id,
            nameOfInquiry: appointment.inquiry_display_name,
            apptDate: new Date(
              appointment.appointment_date
            ).toLocaleDateString(),
            status: appointment.status,
            feedback: appointment.feedback || "",
            rating: appointment.rating || 0,
            clientName: appointment.client_name,
            assignedOfficer: appointment.assigned_officer_name,
            attachments: appointment.attachments || [],
            createdAt: appointment.created_at,
          }));
        setAppointments(formattedAppointments);
      } else {
        setError("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Error loading appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async () => {
    try {
      const response = await fetch(
        `/api/client-appointments/${selectedAppointmentId}/cancel/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        await fetchAppointments();
        setShowConfirmModal(false);
        setSelectedAppointmentId(null);
      } else {
        alert(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Error cancelling appointment. Please try again.");
    }
  };

  // Submit feedback
// Update your submitFeedback function to include language:
const submitFeedback = async () => {
  try {
    const response = await fetch(
      `/api/client-appointments/${selectedAppointmentId}/feedback/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback,
          rating,
          language, // Include the language in the request
        }),
      }
    );

    const data = await response.json();
    if (data.success) {
      await fetchAppointments();
      setIsFeedbackModalOpen(false);
      setFeedback("");
      setRating(0);
      setSelectedAppointmentId(null);
      setLanguage('en'); // Reset to English
    } else {
      alert(data.message || "Failed to submit feedback");
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    alert("Error submitting feedback. Please try again.");
  }
};

  const handleAttachmentClick = (appt) => {
    setSelectedAppointment(appt);
    setIsAttachmentModalOpen(true);
  };

  const handleDownloadAttachment = async (
    appointmentId,
    attachmentId,
    filename
  ) => {
    try {
      const response = await fetch(
        `/api/client-appointments/${appointmentId}/download_attachment/?attachment_id=${attachmentId}`
      );
      const data = await response.json();

      if (data.success && data.data.file_url) {
        window.open(data.data.file_url, "_blank");
      } else {
        alert(
          "Failed to open attachment: " +
            (data.message || "File URL not available")
        );
      }
    } catch (error) {
      console.error("Error opening attachment:", error);
      alert("Error opening attachment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading appointments...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-blue-600" />
              My Appointments
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your appointment requests
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Set Appointment
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <X className="w-5 h-5 mr-2" />
              {error}
            </div>
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {appointments.length === 0 && !error ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No appointments yet
            </h3>
            <p className="text-gray-500 mb-6">
              Set your first appointment to get started
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set Appointment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <th className="px-6 py-4 text-left font-semibold rounded-tl-lg">
                    Inquiry Type
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Appointment Date
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Assigned Officer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Attachments
                  </th>
                  <th className="px-6 py-4 text-left font-semibold rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr
                    key={appointment.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="font-medium text-slate-700">
                          {appointment.nameOfInquiry}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {appointment.apptDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-600">
                        <User className="w-4 h-4 mr-2" />
                        {appointment.assignedOfficer || "Not assigned"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {appointment.attachments.length} file(s)
                        </span>
                        <button
                          onClick={() => handleAttachmentClick(appointment)}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors shadow-sm flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(appointment.status === "Pending" ||
                          appointment.status === "Confirmed") && (
                          <button
                            onClick={() => {
                              setSelectedAppointmentId(appointment.id);
                              setShowConfirmModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
                          >
                            Cancel
                          </button>
                        )}
                        {appointment.status === "Completed" &&
                          !appointment.feedback && (
                            <button
                              onClick={() => {
                                setSelectedAppointmentId(appointment.id);
                                setIsFeedbackModalOpen(true);
                              }}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Feedback
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              Cancel Appointment
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to cancel this appointment?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedAppointmentId(null);
                }}
                className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
              >
                No
              </button>
              <button
                onClick={cancelAppointment}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Submit Feedback</h3>
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(false);
                  setFeedback("");
                  setRating(0);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Share your experience with this appointment..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="en">English</option>
                <option value="tl">Tagalog</option>
                <option value="ilo">Ilocano</option>
                <option value="ceb">Cebuano</option>
                {/* Add more languages as needed */}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsFeedbackModalOpen(false);
                  setFeedback("");
                  setRating(0);
                }}
                className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={!feedback || rating === 0}
                className={`px-4 py-2 rounded text-white transition ${
                  !feedback || rating === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      {isAttachmentModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Attachments for {selectedAppointment.nameOfInquiry}
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
                <div className="mb-4">
                  <Upload size={48} className="mx-auto text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  No attachments found for this appointment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedAppointment.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center flex-1">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round(attachment.file_size / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleDownloadAttachment(
                          selectedAppointment.id,
                          attachment.id,
                          attachment.filename
                        )
                      }
                      className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View in new tab"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointment;

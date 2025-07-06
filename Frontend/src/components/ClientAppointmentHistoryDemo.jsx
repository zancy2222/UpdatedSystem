import React, { useState, useEffect } from 'react';
import { Upload, X, Eye, Star } from 'lucide-react';

const ClientAppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
      if (clientId && clientId !== "DEMO001") {
        url += `?client_id=${clientId}&status=Completed,Cancelled`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.data.map(appointment => ({
          id: appointment.id,
          date: new Date(appointment.appointment_date).toLocaleDateString(),
          nature: appointment.inquiry_display_name,
          status: appointment.status,
          feedback: appointment.feedback,
          rating: appointment.rating,
          attachments: appointment.attachments || []
        })));
      } else {
        setError("Failed to fetch appointment history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Error loading appointment history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Appointment History</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <th className="px-6 py-4 text-left rounded-tl-lg">Date</th>
                <th className="px-6 py-4 text-left">Nature of Inquiry</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Rating</th>
                <th className="px-6 py-4 text-left rounded-tr-lg">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">{appt.date}</td>
                  <td className="px-6 py-4">{appt.nature}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                      appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {appt.status === 'Completed' && appt.rating ? renderStars(appt.rating) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {appt.status === 'Completed' && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setIsFeedbackModalOpen(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {appt.feedback ? 'View Feedback' : 'No Feedback'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedAppointment.feedback ? 'Feedback Details' : 'No Feedback Submitted'}
              </h3>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {selectedAppointment.feedback ? (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Rating</h4>
                  {renderStars(selectedAppointment.rating)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {selectedAppointment.feedback}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-600">No feedback was submitted for this appointment.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointmentHistory;
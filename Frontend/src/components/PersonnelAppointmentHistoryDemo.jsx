import React from "react";

export default function PersonnelAppointmentHistoryDemo() {
  const appointments = [
    {
      name: "Juan Dela Cruz",
      date: "2025-06-15",
      inquiry: "Land Title",
      status: "Completed",
    },
    {
      name: "Maria Santos",
      date: "2025-06-14",
      inquiry: "Verification",
      status: "Cancelled",
    },
    {
      name: "Jose Rizal",
      date: "2025-06-13",
      inquiry: "Inquiry",
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Appointment History</h2>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-4 py-3 text-left rounded-tl-lg">Client Name</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Nature of Inquiry</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">{appt.name}</td>
                  <td className="px-4 py-3">{appt.date}</td>
                  <td className="px-4 py-3">{appt.inquiry}</td>
                  <td className="px-4 py-3 capitalize">{appt.status}</td>
                  <td className="px-4 py-3">
                    {appt.status.toLowerCase() === "completed" && (
                      <button className="px-3 py-1 text-sm bg-yellow-400 text-white rounded">
                        Follow Up
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

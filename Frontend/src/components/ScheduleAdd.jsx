import { X, Calendar } from "lucide-react";
import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScheduleAdd = ({
  isModalOpen,
  setIsModalOpen,
  selectedDate,
  setSelectedDate,
  formData,
  handleInputChange,
  handleFormSubmit,
  personnelOptions,
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  return (
    isModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">
                Add Schedule
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Calendar Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Calendar size={20} />
                Select Date
              </h4>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={formData.timeSlot}
                  onChange={(e) =>
                    handleInputChange("timeSlot", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-red-50 font-semibold text-red-700"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Head Of Office
                </label>
                <select
                  value={formData.headOfOffice}
                  onChange={(e) =>
                    handleInputChange("headOfOffice", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Head of Office</option>
                  {personnelOptions.head_of_office.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name ||
                        `${person.firstname} ${person.lastname}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Deputy
                </label>
                <select
                  value={formData.deputy}
                  onChange={(e) => handleInputChange("deputy", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Deputy (Optional)</option>
                  {personnelOptions.deputies.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name ||
                        `${person.firstname} ${person.lastname}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Assigned Administrative Officer
                </label>
                <select
                  value={formData.adminOfficer}
                  onChange={(e) =>
                    handleInputChange("adminOfficer", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    Select Administrative Officer (Optional)
                  </option>
                  {personnelOptions.admin_officers.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name ||
                        `${person.firstname} ${person.lastname}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Assigned Examiner
                </label>
                <select
                  value={formData.examiner}
                  onChange={(e) =>
                    handleInputChange("examiner", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Examiner (Optional)</option>
                  {personnelOptions.examiners.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name ||
                        `${person.firstname} ${person.lastname}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmationModal(true)}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                ADD
              </button>
            </div>
          </div>
        </div>

        {showConfirmationModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-slate-800">
                  Confirm Schedule Addition
                </h3>
                <p className="text-gray-700">
                  Are you sure you want to add this schedule?
                </p>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmationModal(false);
                      handleFormSubmit();
                    }}
                    className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Yes, Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default ScheduleAdd;

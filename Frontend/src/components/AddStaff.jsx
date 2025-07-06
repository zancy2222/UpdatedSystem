
import { X } from 'lucide-react';
import React, { useState } from 'react';
const AddStaff = ({
  isModalOpen,
  setIsModalOpen,
  isEditMode,
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  positionOptions
}) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  return (
    isModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-800 to-blue-800 p-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-white hover:text-gray-300 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Repeatable Input Fields */}
                {[
                  ['username', 'Username', 'text'],
                  ['password', 'Password', 'password'],
                  ['firstname', 'First Name', 'text'],
                  ['middlename', 'Middle Name', 'text'],
                  ['lastname', 'Last Name', 'text'],
                  ['email', 'Email', 'email'],
                  ['MobileNumber', 'Mobile Number', 'tel'],
                  ['address', 'Address', 'text'],
                  ['birthplace', 'Birthplace', 'text'],
                  ['birthday', 'Birthday', 'date']
                ].map(([name, label, type]) => (
                  <div key={name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name] || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                      required={!(isEditMode && name === 'password')}
                      placeholder={
                        isEditMode && name === 'password' ? 'Leave blank to keep current' : `Enter ${label.toLowerCase()}`
                      }
                    />
                  </div>
                ))}

                {/* Position Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    required
                  >
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Civil Status Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Civil Status</label>
                  <select
                    name="CivilStatus"
                    value={formData.CivilStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                {/* Sex Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sex</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => setShowConfirmationModal(true)}
              className="px-6 py-3 bg-yellow-400 to-blue-500 text-white rounded-xl text-sm font-medium  transition-all shadow-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isEditMode ? 'Update Staff' : 'Add Staff')}
            </button>
          </div>
        </div>
        {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {isEditMode ? 'Confirm Update' : 'Confirm Add'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to {isEditMode ? 'update' : 'add'} this staff member?
            </p>
            <div className="flex justify-end gap-4">
                <button
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowConfirmationModal(false)}
                disabled={isLoading}
                >
                Cancel
                </button>
                <button
                className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                onClick={() => {
                    setShowConfirmationModal(false);
                    handleSubmit();
                }}
                disabled={isLoading}
                >
                {isEditMode ? 'Yes, Update' : 'Yes, Add'}
                </button>
            </div>
            </div>
        </div>
        )}
      </div>

      
    )
  );
};

export default AddStaff;
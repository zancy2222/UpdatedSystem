
import React from 'react';

const PersonnelProfile = ({ personnelData, isDemo }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile</h2>

      {isDemo ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">
            Demo Mode - Profile information not available
          </p>
        </div>
      ) : personnelData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <p className="text-slate-600 bg-gray-50 p-3 rounded-lg">{personnelData.username}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <p className="text-slate-600 bg-gray-50 p-3 rounded-lg">{personnelData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
              <p className="text-slate-600 bg-gray-50 p-3 rounded-lg">
                {personnelData.first_name || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
              <p className="text-slate-600 bg-gray-50 p-3 rounded-lg">
                {personnelData.last_name || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Position</label>
              <p className="text-slate-600 bg-gray-50 p-3 rounded-lg">
                {personnelData.position || 'Not provided'}
              </p>
            </div>
            
        
          </div>
        </div>
      ) : (
        <p className="text-slate-600">Loading profile information...</p>
      )}
    </div>
  );
};

export default PersonnelProfile;

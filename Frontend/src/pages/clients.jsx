import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, X, Check, RefreshCw, Info } from 'lucide-react';

// ClientList Component
const ClientList = ({
  filteredClients,
  sortConfig,
  requestSort,
  handleEdit,
  handleDelete,
  calculateAge,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("id")}
            >
              <div className="flex items-center">
                ID
                {sortConfig.key === "id" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  ))}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("lastname")}
            >
              <div className="flex items-center">
                Name
                {sortConfig.key === "lastname" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  ))}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("birthday")}
            >
              <div className="flex items-center">
                Age
                {sortConfig.key === "birthday" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp size={16} className="ml-1" />
                  ) : (
                    <ChevronDown size={16} className="ml-1" />
                  ))}
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sex
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Civil Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredClients.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                No clients found
              </td>
            </tr>
          ) : (
            filteredClients.map((client, index) => (
              <tr key={client.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {client.lastname}, {client.firstname} {client.middlename}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contact_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.birthday ? calculateAge(client.birthday) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.sex || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.civil_status || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Info size={16} />
                    </button>
                    {/* <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ClientModal Component
const ClientModal = ({
  isModalOpen,
  setIsModalOpen,
  isEditMode,
  formData,
  handleInputChange,
  handleSubmit,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isModalOpen) return null;

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    handleSubmit({ preventDefault: () => {} });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-800 to-blue-800 p-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Client' : 'Add New Client'}
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
      
      {/* Username */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
        <p className="text-gray-900">{formData.username || '—'}</p>
      </div>

      {/* First Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
        <p className="text-gray-900">{formData.firstname || '—'}</p>
      </div>

      {/* Middle Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Middle Name</label>
        <p className="text-gray-900">{formData.middlename || '—'}</p>
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
        <p className="text-gray-900">{formData.lastname || '—'}</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <p className="text-gray-900">{formData.email || '—'}</p>
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
        <p className="text-gray-900">{formData.contact_number || '—'}</p>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Province</label>
        <p className="text-gray-900">{formData.province || '—'}</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
        <p className="text-gray-900">{formData.city || '—'}</p>
      </div>

      {/* Civil Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Civil Status</label>
        <p className="text-gray-900">{formData.civil_status || '—'}</p>
      </div>

      {/* Birthplace */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Birthplace</label>
        <p className="text-gray-900">{formData.birthplace || '—'}</p>
      </div>

      {/* Birthday */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Birthday</label>
        <p className="text-gray-900">{formData.birthday || '—'}</p>
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
        <p className="text-gray-900">{formData.sex || '—'}</p>
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
            >
              Cancel
            </button>
            {/* <button
              type="button"
              onClick={handleFormSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              {isEditMode ? 'Update Client' : 'Add Client'}
            </button> */}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Confirm Action</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to {isEditMode ? 'update' : 'add'} this client?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    middlename: '',
    lastname: '',
    email: '',
    contact_number: '',
    address: '',
    civil_status: 'Single',
    birthplace: '',
    birthday: '',
    sex: 'Male'
  });

  // API Configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // Calculate age from birthday
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Fetch clients from Django API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/clients/list/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setClients(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch clients');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load clients when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  // Handle edit action
  const handleEdit = (client) => {
    setIsEditMode(true);
    setCurrentClientId(client.id);
    setFormData({
      username: client.username,
      password: '', // Password is not shown for security
      firstname: client.firstname,
      middlename: client.middlename || '',
      lastname: client.lastname,
      email: client.email,
      contact_number: client.contact_number,
      address: client.address,
      province: client.province,
      city: client.city,
      street: client.street,
      civil_status: client.civil_status || 'Single',
      birthplace: client.birthplace,
      birthday: client.birthday,
      sex: client.sex || 'Male'
    });
    setIsModalOpen(true);
  };

  // Handle delete action
  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/clients/delete/${clientId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          // Refresh the client list after deletion
          fetchClients();
        } else {
          throw new Error(data.message || 'Failed to delete client');
        }
      } catch (err) {
        console.error('Error deleting client:', err);
        setError(err.message);
      }
    }
  };

  // Handle input change for form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let url, method;
      
      if (isEditMode) {
        url = `${API_BASE_URL}/clients/update/${currentClientId}/`;
        method = 'PUT';
      } else {
        url = `${API_BASE_URL}/clients/register/`;
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh the client list after successful operation
        fetchClients();
        setIsModalOpen(false);
      } else {
        throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'create'} client`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} client:`, err);
      setError(err.message);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort clients
  const sortedClients = [...clients].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Filter clients based on search term
  const filteredClients = sortedClients.filter(client =>
    Object.values(client).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Refresh clients
  const handleRefresh = () => {
    fetchClients();
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          {/* Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">
                Clients ({clients.length})
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
                  disabled={loading}
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading clients
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Table */}
          <ClientList
            filteredClients={filteredClients}
            sortConfig={sortConfig}
            requestSort={requestSort}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            calculateAge={calculateAge}
            loading={loading}
          />
          
          {/* Results Info */}
          {!loading && !error && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {filteredClients.length} of {clients.length} clients
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
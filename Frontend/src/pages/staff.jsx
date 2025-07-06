import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from "lucide-react";
import StaffList from "../components/StaffList";
import AddStaff from "../components/AddStaff";
export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    position: "Administrative Officer",
    lastname: "",
    firstname: "",
    middlename: "",
    email: "",
    MobileNumber: "",
    address: "",
    CivilStatus: "Single",
    birthplace: "",
    birthday: "",
    sex: "Male",
  });

  // Position options
  const positionOptions = [
    { value: "Head of Office", label: "Head of Office" },
    { value: "Deputy", label: "Deputy" },
    { value: "Administrative Officer", label: "Administrative Officer" },
    { value: "Examiner", label: "Examiner" },
  ];

  // Fetch staff data
  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/personnel/personnel/"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch staff data");
      }
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Format position for display
  const formatPosition = (position) => {
    const positionMap = {
      HeadOfOffice: "Head of Office",
      Deputy: "Deputy",
      "Administrative Officer": "Administrative Officer",
      Examiner: "Examiner",
    };
    return positionMap[position] || position;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setIsLoading(true);

    try {
      let url = "http://localhost:8000/api/personnel/personnel/";
      let method = "POST";
      let bodyData = { ...formData };

      if (isEditMode && currentStaff) {
        url = `http://localhost:8000/api/personnel/personnel/${currentStaff.id}/`;
        method = "PUT";

        // For updates, only send changed fields and exclude password if empty
        bodyData = {};
        Object.keys(formData).forEach((key) => {
          if (key !== "password" || formData.password) {
            // Only include password if it's being changed
            bodyData[key] = formData[key];
          }
        });

        // Ensure we're not sending null values - convert to empty strings
        Object.keys(bodyData).forEach((key) => {
          if (bodyData[key] === null) {
            bodyData[key] = "";
          }
        });
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error details:", errorData); // Log detailed error
        throw new Error(
          errorData.message ||
            JSON.stringify(errorData) ||
            "Failed to save staff data"
        );
      }

      // Refresh staff list
      await fetchStaff();

      // Reset form and close modal
      setFormData({
        username: "",
        password: "",
        position: "Administrative Officer",
        lastname: "",
        firstname: "",
        middlename: "",
        email: "",
        MobileNumber: "",
        address: "",
        CivilStatus: "Single",
        birthplace: "",
        birthday: "",
        sex: "Male",
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentStaff(null);
    } catch (err) {
      setError(err.message);
      console.error("Submission error:", err); // More detailed error logging
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle editing a staff member
  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    setIsEditMode(true);
    setIsModalOpen(true);
    // Set the form data with the staff member's details
    setFormData({
      username: staffMember.username,
      password: "", // Leave password blank for security
      position: staffMember.position,
      lastname: staffMember.lastname,
      firstname: staffMember.firstname,
      middlename: staffMember.middlename || "",
      email: staffMember.email,
      MobileNumber: staffMember.MobileNumber || "",
      address: staffMember.address || "",
      CivilStatus: staffMember.CivilStatus || "Single",
      birthplace: staffMember.birthplace || "",
      birthday: staffMember.birthday || "",
      sex: staffMember.sex || "Male",
    });
  };
  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/personnel/personnel/${id}/`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete staff member");
        }

        // Refresh staff list
        await fetchStaff();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort staff
  const sortedStaff = [...staff].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  // Filter staff based on search term
  const filteredStaff = sortedStaff.filter((member) =>
    Object.values(member).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading && staff.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading staff data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          {/* Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Personnel</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search Personnel..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsEditMode(false);
                    setFormData({
                      username: "",
                      password: "",
                      position: "Administrative Officer",
                      lastname: "",
                      firstname: "",
                      middlename: "",
                      email: "",
                      MobileNumber: "",
                      address: "",
                      CivilStatus: "Single",
                      birthplace: "",
                      birthday: "",
                      sex: "Male",
                    });
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Plus size={18} />
                  Add Personnel
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <StaffList
            filteredStaff={filteredStaff}
            sortConfig={sortConfig}
            requestSort={requestSort}
            formatPosition={formatPosition}
            calculateAge={calculateAge}
            handleDelete={handleDelete}
            handleEdit={handleEdit} // Add this line
          />
        </div>

        {/* Add/Edit Staff Modal */}
        <AddStaff
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          isEditMode={isEditMode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          positionOptions={positionOptions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

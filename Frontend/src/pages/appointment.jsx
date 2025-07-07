import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Edit,
  Clock,
  User,
  UserCheck,
  Trash2,
} from "lucide-react";
import ScheduleAdd from "../components/ScheduleAdd";
import ScheduleEdit from "../components/ScheduleEdit";

export default function Appointment({
  isModalOpen,
  setIsModalOpen,
  isEditModalOpen,
  setIsEditModalOpen,
  selectedFilterDate,
  setSelectedFilterDate,
}) {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEditDate, setSelectedEditDate] = useState("");
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [personnelOptions, setPersonnelOptions] = useState({
    head_of_office: [],
    deputies: [],
    admin_officers: [],
    examiners: [],
  });
  const [formData, setFormData] = useState({
    timeSlot: "2:00 - 3:30 PM",
    headOfOffice: "",
    deputy: "",
    adminOfficer: "",
    examiner: "",
  });

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD for date input
  const convertToDateInputFormat = (displayDate) => {
    if (!displayDate) return "";
    const parts = displayDate.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
        2,
        "0"
      )}`;
    }
    return displayDate;
  };

  // Fetch personnel options on component mount
  useEffect(() => {
    fetchPersonnelOptions();
  }, []);

  const fetchPersonnelOptions = async () => {
    try {
      const response = await fetch("/api/appointment-schedules/personnel-options");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Personnel options:", data);

      if (data.success) {
        setPersonnelOptions(data.data);
        if (data.data.head_of_office?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            headOfOffice: data.data.head_of_office[0].id,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching personnel options:", error);
    }
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointment-schedules/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        const formatted = data.data.map((app) => ({
          id: app.id,
          date: new Date(app.date).toLocaleDateString("en-GB"),
          timeSlot: app.time_slot,
          headOfOffice: getPersonnelName(app.head_of_office_detail),
          deputy: getPersonnelName(app.deputy_detail),
          adminOfficer: getPersonnelName(app.admin_officer_detail),
          examiner: getPersonnelName(app.examiner_detail),
        }));
        setAppointments(formatted);
      } else {
        console.error("Failed to fetch appointments:", data.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  const handleFormSubmit = async () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    try {
      const appointmentData = {
        date: selectedDate,
        time_slot: formData.timeSlot,
        head_of_office: formData.headOfOffice,
        deputy: formData.deputy || null,
        admin_officer: formData.adminOfficer || null,
        examiner: formData.examiner || null,
      };

      const response = await fetch("/api/appointment-schedules/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      const data = await response.json();

      if (data.success) {
        setAppointments((prev) => [
          ...prev,
          {
            id: data.data.id,
            date: new Date(data.data.date).toLocaleDateString("en-GB"),
            timeSlot: data.data.time_slot,
            headOfOffice: getPersonnelName(data.data.head_of_office_detail),
            deputy: getPersonnelName(data.data.deputy_detail),
            adminOfficer: getPersonnelName(data.data.admin_officer_detail),
            examiner: getPersonnelName(data.data.examiner_detail),
          },
        ]);
        setIsModalOpen(false);
        resetForm();
      } else {
        alert(data.message || "Error creating appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error creating appointment");
    }
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const appointmentData = {
        date: selectedEditDate,
        time_slot: formData.timeSlot,
        head_of_office: formData.headOfOffice,
        deputy: formData.deputy || null,
        admin_officer: formData.adminOfficer || null,
        examiner: formData.examiner || null,
      };

      const response = await fetch(
        `/api/appointment-schedules/${appointmentToEdit.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );
      const data = await response.json();

      if (data.success) {
        const updatedAppointments = appointments.map((app) =>
          app.id === appointmentToEdit.id
            ? {
                ...app,
                date: new Date(data.data.date).toLocaleDateString("en-GB"),
                timeSlot: data.data.time_slot,
                headOfOffice: getPersonnelName(data.data.head_of_office_detail),
                deputy: getPersonnelName(data.data.deputy_detail),
                adminOfficer: getPersonnelName(data.data.admin_officer_detail),
                examiner: getPersonnelName(data.data.examiner_detail),
              }
            : app
        );
        setAppointments(updatedAppointments);
        setIsEditModalOpen(false);
        resetForm();
      } else {
        alert(data.message || "Error updating appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error updating appointment");
    }
  };

  const getPersonnelName = (personnel) => {
    return personnel ? personnel.full_name : "";
  };

  const handleEditClick = (appointment) => {
    setAppointmentToEdit(appointment);
    setSelectedEditDate(convertToDateInputFormat(appointment.date));

    const findPersonnelId = (personnelArray, name) => {
      if (!name || !personnelArray || personnelArray.length === 0) return "";
      const person = personnelArray.find((p) => {
        const fullName =
          p.full_name || `${p.firstname || ""} ${p.lastname || ""}`.trim();
        return fullName === name;
      });
      return person ? person.id : "";
    };

    const headOfOfficeId = findPersonnelId(
      personnelOptions.head_of_office,
      appointment.headOfOffice
    );
    const deputyId = findPersonnelId(
      personnelOptions.deputies,
      appointment.deputy
    );
    const adminOfficerId = findPersonnelId(
      personnelOptions.admin_officers,
      appointment.adminOfficer
    );
    const examinerId = findPersonnelId(
      personnelOptions.examiners,
      appointment.examiner
    );

    console.log("Edit appointment values:", {
      headOfOfficeId,
      deputyId,
      adminOfficerId,
      examinerId,
      originalAppointment: appointment,
    });

    setFormData({
      timeSlot: appointment.timeSlot,
      headOfOffice: headOfOfficeId,
      deputy: deputyId,
      adminOfficer: adminOfficerId,
      examiner: examinerId,
    });

    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedEditDate("");
    const defaultHeadOfOffice =
      personnelOptions.head_of_office.length > 0
        ? personnelOptions.head_of_office[0].id
        : "";
    setFormData({
      timeSlot: "2:00 - 3:30 PM",
      headOfOffice: defaultHeadOfOffice,
      deputy: "",
      adminOfficer: "",
      examiner: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredAppointments = appointments.filter((app) =>
    selectedFilterDate ? app.date === selectedFilterDate : true
  );

  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Appointment Schedules
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Array.from(new Set(appointments.map((app) => app.date))).map(
            (date) => (
              <button
                key={date}
                onClick={() => setSelectedFilterDate(date)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  date === selectedFilterDate
                    ? "bg-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {date}
              </button>
            )
          )}
          <button
            onClick={() => setSelectedFilterDate("")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
              !selectedFilterDate
                ? "bg-yellow-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Dates
          </button>
        </div>

        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        {appointment.timeSlot}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{appointment.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(appointment)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Head Of Office
                  </label>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-800">
                      {appointment.headOfOffice}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Deputy
                  </label>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-800">{appointment.deputy}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Assigned Administrative Officer
                  </label>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                    <UserCheck size={16} className="text-gray-400" />
                    <span className="text-gray-800">
                      {appointment.adminOfficer}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Assigned Examiner
                  </label>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                    <UserCheck size={16} className="text-gray-400" />
                    <span className="text-gray-800">
                      {appointment.examiner}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ScheduleAdd
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        personnelOptions={personnelOptions}
      />

      <ScheduleEdit
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleEditSubmit={handleEditSubmit}
        personnelOptions={personnelOptions}
        selectedDate={selectedEditDate}
        setSelectedDate={setSelectedEditDate}
      />
    </div>
  );
}
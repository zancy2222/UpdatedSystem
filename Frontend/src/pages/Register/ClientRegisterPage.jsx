import React, { useState, useEffect } from "react";

export default function ClientRegisterPage() {
  const navigate = (path) => {
    window.location.href = path;
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    lastname: "",
    firstname: "",
    middlename: "",
    email: "",
    contact_number: "",
    address: "",
    civil_status: "Single",
    birthplace: "",
    birthday: "",
    sex: "Male",
    province: "",
    city: "",
    barangay: "",
    street: "",
    is_pwd: false,
    is_pregnant: false,
    occupation: "",
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
// 🔃 Fetch Provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://psgc.gitlab.io/api/provinces/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  // 🔁 Fetch Cities when province changes
  useEffect(() => {
    const selectedProvince = provinces.find(
      (prov) => prov.name === formData.province
    );
    if (!selectedProvince) return;

    const fetchCities = async () => {
      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/provinces/${selectedProvince.code}/cities/`
        );
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [formData.province]);

  // 🔁 Fetch Barangays when city changes
  useEffect(() => {
    const selectedCity = cities.find((city) => city.name === formData.city);
    if (!selectedCity) return;

    const fetchBarangays = async () => {
      try {
        const response = await fetch(
          `https://psgc.gitlab.io/api/cities/${selectedCity.code}/barangays/`
        );
        const data = await response.json();
        setBarangays(data);
      } catch (error) {
        console.error("Error fetching barangays:", error);
      }
    };
    fetchBarangays();
  }, [formData.city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate age from birthday
    const age = calculateAge(formData.birthday);

    // Validate age is at least 18
    if (age < 18) {
      setError("You can't register because you're below 18");
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setShowConfirm(true);
  };

  const confirmRegistration = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/clients/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            lastname: formData.lastname,
            firstname: formData.firstname,
            middlename: formData.middlename,
            email: formData.email,
            contact_number: formData.contact_number,
            province: formData.province,
            city: formData.city,
            barangay: formData.barangay,
            street: formData.street,
            civil_status: formData.civil_status,
            birthplace: formData.birthplace,
            birthday: formData.birthday,
            sex: formData.sex,
            is_pwd: formData.is_pwd,
            is_pregnant: formData.is_pregnant,
            occupation: formData.occupation,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store token and redirect
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("clientData", JSON.stringify(data.data.client));
        alert("Client registration successful");
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
        if (data.errors) {
          console.error("Validation errors:", data.errors);
          // Display specific field errors if needed
          if (data.errors.province) {
            setError(data.errors.province[0]);
          } else if (data.errors.city) {
            setError(data.errors.city[0]);
          } else if (data.errors.barangay) {
            setError(data.errors.barangay[0]);
          }
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const cancelRegistration = () => {
    setShowConfirm(false);
  };

  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const today = new Date();
    const birthDate = new Date(birthday);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(234,179,8,0.1)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(234,179,8,0.05)_0%,_transparent_50%)]"></div>

      <div className="relative max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            Appointment & Analytics
          </h1>
          <h2 className="text-xl font-semibold text-yellow-400">
            Management System
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Registration Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">
              Create Your Client Account
            </h3>
            <p className="text-gray-600 mt-1">
              Join our appointment management system as a client
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 text-red-600 text-sm">{error}</div>
              )}
            </div>

            {/* Personal Information */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="middlename"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middlename"
                    name="middlename"
                    value={formData.middlename}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="birthday"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Birthday *
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="age"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Age
                  </label>
                  <input
                    type="text"
                    id="age"
                    value={calculateAge(formData.birthday)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    disabled
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="sex"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Sex *
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="civil_status"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Civil Status *
                  </label>
                  <select
                    id="civil_status"
                    name="civil_status"
                    value={formData.civil_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="birthplace"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Birthplace *
                  </label>
                  <input
                    type="text"
                    id="birthplace"
                    name="birthplace"
                    value={formData.birthplace}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="occupation"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Occupation (Optional)
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your profession"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-100">
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact_number"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    pattern="^\d{11}$"
                    maxLength={11}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Province *
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >

                    <option value="">Select Province</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    City/Municipality *
                  </label>
                    <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={!formData.province}
                  >
                    <option value="">Select City/Municipality</option>
                    {cities.map((city) => (
                    <option key={city.code} value={city.name}>
                        {city.name}
                    </option>
                          ))}
                
                  </select>

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="barangay"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Barangay *
                  </label>
                 <select
                    id="barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={!formData.city}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((brgy) => (
                      <option key={brgy.code} value={brgy.name}>
                        {brgy.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="street"
                    className="block text-sm font-semibold text-slate-700 mb-1"
                  >
                    Street (Optional)
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Special Fields Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 mt-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm font-bold">4</span>
                  </div>
                  Special Information
                </h4>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_pwd"
                      name="is_pwd"
                      checked={formData.is_pwd}
                      onChange={(e) =>
                        setFormData({ ...formData, is_pwd: e.target.checked })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_pwd"
                      className="ml-2 text-sm font-medium text-slate-700"
                    >
                      Person with Disability (PWD)
                    </label>
                  </div>
                  {formData.sex === "Female" && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_pregnant"
                        name="is_pregnant"
                        checked={formData.is_pregnant}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_pregnant: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <label
                        htmlFor="is_pregnant"
                        className="ml-2 text-sm font-medium text-slate-700"
                      >
                        Pregnant
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-900 to-slate-800 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:from-blue-800 hover:to-slate-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none border-2 border-transparent hover:border-yellow-400"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Client Account...
                  </div>
                ) : (
                  "Create Client Account"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6 pb-6">
          <p className="text-gray-300">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2 bg-transparent border-none cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-blue-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Confirm Client Registration
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Please review your information carefully. Are you sure you want
                to create this client account?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmRegistration}
                  className="bg-gradient-to-r from-blue-900 to-slate-800 text-white px-6 py-2 rounded-lg hover:from-blue-800 hover:to-slate-700 transition-all duration-200 font-semibold"
                >
                  Yes, Create Account
                </button>
                <button
                  onClick={cancelRegistration}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

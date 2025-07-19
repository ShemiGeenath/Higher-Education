import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    schoolName: '',
    email: '',
    age: '',
    contact: '',
    address: '',
    guardianName: '',
    guardianContact: '',
    admissionDate: new Date().toISOString().split('T')[0],
    stream: '',
    profilePicture: null
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, profilePicture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setTouched({ ...touched, [name]: true });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
      case 'nic':
        return /^[0-9]{9}[vVxX]?$/.test(value) ? '' : 'Invalid NIC format';
      case 'contact':
      case 'guardianContact':
        return /^[0-9]{10}$/.test(value) ? '' : 'Must be 10 digits';
      case 'age':
        return value >= 5 && value <= 25 ? '' : 'Age must be between 5-25';
      default:
        return value.trim() === '' ? 'This field is required' : '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      await axios.post("http://localhost:5000/api/students", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMessage('Student added successfully!');
      setFormData({
        name: '',
        nic: '',
        schoolName: '',
        email: '',
        age: '',
        contact: '',
        address: '',
        guardianName: '',
        guardianContact: '',
        admissionDate: new Date().toISOString().split('T')[0],
        stream: '',
        profilePicture: null
      });
      setTouched({});
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error adding student');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: 'name', type: 'text', label: 'Full Name' },
    { name: 'nic', type: 'text', label: 'NIC Number', placeholder: '200012345678 or 200012345678V' },
    { name: 'schoolName', type: 'text', label: 'School Name' },
    { name: 'email', type: 'email', label: 'Email Address' },
    { name: 'age', type: 'number', label: 'Age', min: 5, max: 25 },
    { name: 'contact', type: 'tel', label: 'Contact Number', placeholder: '0771234567' },
    { name: 'address', type: 'text', label: 'Address' },
    { name: 'guardianName', type: 'text', label: 'Guardian Name' },
    { name: 'guardianContact', type: 'tel', label: 'Guardian Contact', placeholder: '0771234567' },
  ];

  const streamOptions = [
    'Physical Science',
    'Biological Science',
    'Commerce',
    'Arts',
    'Technology',
    'Mathematics'
  ];

   const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h2 className="text-2xl font-bold">Student Registration</h2>
          <p className="text-blue-100">Fill in the details to register a new student</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => {
              const error = touched[field.name] && validateField(field.name, formData[field.name]);
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} *
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    required
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${error ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stream *
              </label>
              <select
                name="stream"
                value={formData.stream}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="">Select a stream</option>
                {streamOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {touched.stream && !formData.stream && (
                <p className="mt-1 text-sm text-red-600">Please select a stream</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Date *
              </label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture *
            </label>
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Choose File
                </span>
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleChange}
                  accept="image/*"
                  required
                  className="sr-only"
                />
              </label>
              <span className="ml-2 text-sm text-gray-500">
                {formData.profilePicture ? formData.profilePicture.name : 'No file chosen'}
              </span>
            </div>
            {formData.profilePicture && (
              <div className="mt-2">
                <img 
                  src={URL.createObjectURL(formData.profilePicture)} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Register Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
      </div>
    </div>

  );
};

export default AddStudent;
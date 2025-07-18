import React, { useState } from 'react';
import axios from 'axios';

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, profilePicture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
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

      await axios.post('/api/students', data, {
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
    } catch (err) {
      setErrorMessage('Error adding student');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold text-blue-600">Add Student</h2>

      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}

      {['name', 'nic', 'schoolName', 'email', 'age', 'contact', 'address', 'guardianName', 'guardianContact'].map(field => (
        <div key={field}>
          <label className="block capitalize">{field.replace(/([A-Z])/g, ' $1')} *</label>
          <input
            type={field === 'email' ? 'email' : field === 'age' ? 'number' : 'text'}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
      ))}

      <div>
        <label>Stream *</label>
        <select name="stream" value={formData.stream} onChange={handleChange} required className="w-full border p-2 rounded">
          <option value="">Select</option>
          <option>Physical Science</option>
          <option>Biological Science</option>
          <option>Commerce</option>
          <option>Arts</option>
        </select>
      </div>

      <div>
        <label>Profile Picture *</label>
        <input type="file" name="profilePicture" onChange={handleChange} accept="image/*" required />
      </div>

      <div>
        <label>Admission Date *</label>
        <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className="w-full border p-2 rounded" required />
      </div>

      <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {isLoading ? 'Submitting...' : 'Add Student'}
      </button>
    </form>
  );
};

export default AddStudent;

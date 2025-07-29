// src/pages/AttendancePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AttendancePage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    fetchStudentAndClasses();
    fetchAttendance();
  }, [studentId]);

  const fetchStudentAndClasses = async () => {
    try {
      const res = await axios.get(`${API}/students/${studentId}`);
      setStudent(res.data);
      setClasses(res.data.enrolledClasses.filter(c => c.active).map(c => c.class));
    } catch (err) {
      toast.error('Failed to load student data');
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${API}/attendance/student/${studentId}`);
      setAttendanceHistory(res.data);
    } catch (err) {
      toast.error('Failed to load attendance history');
    }
  };

  const markAttendance = async (classId, status = 'present') => {
    try {
      await axios.post(`${API}/attendance/scan`, {
        studentId,
        classId,
        status,
        notes: ''
      });
      toast.success(`Marked as ${status}`);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark attendance');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Attendance for {student?.name}</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {classes.map((cls) => (
          <div key={cls._id} className="p-4 rounded shadow bg-white">
            <h3 className="text-md font-semibold">{cls.className} ({cls.subject})</h3>
            <p className="text-sm text-gray-600">Day: {cls.day}, Time: {cls.time}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => markAttendance(cls._id, 'present')}
                className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Present
              </button>
              <button
                onClick={() => markAttendance(cls._id, 'late')}
                className="px-3 py-1 rounded bg-yellow-600 text-white text-sm hover:bg-yellow-700"
              >
                Late
              </button>
              <button
                onClick={() => markAttendance(cls._id, 'excused')}
                className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Excused
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Attendance History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left text-sm">Date</th>
              <th className="p-2 text-left text-sm">Class</th>
              <th className="p-2 text-left text-sm">Status</th>
              <th className="p-2 text-left text-sm">Marked By</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.map((rec, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 text-sm">{new Date(rec.date).toLocaleDateString()}</td>
                <td className="p-2 text-sm">{rec.class?.className} ({rec.class?.subject})</td>
                <td className={`p-2 text-sm capitalize ${rec.status === 'absent' ? 'text-red-600' : 'text-green-600'}`}>{rec.status}</td>
                <td className="p-2 text-sm">{rec.markedBy?.name || 'System'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/pages/StudentManagement.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { QRScanner } from '../components/QRScanner';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [query, setQuery]       = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null); // for details drawer
  const [qrStudent, setQrStudent] = useState(null); // for QR modal
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/students`);
      setStudents(data || []);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }

  // Optional: search client-side (NIC, name, email, etc)
  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter(s =>
      [s.name, s.nic, s.email, s.schoolName, s.stream, s.contact]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
    );
  }, [students, query]);

  // When we scan a QR, we expect to get either:
  // - just the studentId string, or
  // - a JSON with { studentId: '...', ... }
  async function handleScanResult(text) {
    try {
      let studentId = text;
      try {
        const parsed = JSON.parse(text);
        if (parsed.studentId) studentId = parsed.studentId;
      } catch (_) { /* it's fine if it's not JSON */ }

      // If you added the /lookup route you could call: /students/lookup?q=<text>
      const { data } = await axios.get(`${API}/students/${studentId}`);
      setSelectedStudent(data);
      setShowScanner(false);
    } catch (e) {
      console.error(e);
      alert('No student found for scanned QR');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchStudents()}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Refresh
          </button>
          <button
          onClick={() => setShowScanner(true)}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          >
            Scan QR to Find Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, NIC, email, stream..."
          className="w-full sm:w-96 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Error / Loading */}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}
      {loading && <p>Loading...</p>}

      {/* Students Table */}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-500">No students found.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Profile</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">NIC</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Stream</th>
                <th className="px-4 py-3 font-medium">Enrolled Classes</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {s.profilePicture ? (
                      <img
                        src={`${API.replace('/api', '')}/uploads/${s.profilePicture}`}
                        alt={s.name}
                        className="w-12 h-12 object-cover rounded-full border"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}`
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">{s.name?.[0]}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">{s.nic}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.contact}</td>
                  <td className="px-4 py-2">{s.stream}</td>
                  <td className="px-4 py-2">
                    {(s.enrolledClasses || []).filter(ec => ec.active !== false).length} active
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setQrStudent(s)}
                        className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200"
                      >
                        QR
                      </button>
                      <button
                        onClick={() => navigate(`/payments/${s._id}`)}
                        className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Payment
                      </button>
                      <button
                        onClick={() => navigate(`/AttendancePage/${s._id}`)}
                        className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Attendance
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Drawer */}
      {selectedStudent && (
        <DetailsDrawer
          studentId={selectedStudent._id}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* QR Modal */}
      {qrStudent && (
        <QRModal
          student={qrStudent}
          onClose={() => setQrStudent(null)}
        />
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onResult={handleScanResult}
        />
      )}
    </div>
  );
}

/* -------------------- Details Drawer -------------------- */

function DetailsDrawer({ studentId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError]     = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/students/${studentId}`);
        setStudent(data);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.error || 'Failed to load student');
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, API]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full sm:w-[480px] bg-white h-full overflow-y-auto shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <button
            onClick={onClose}
            className="rounded p-2 hover:bg-gray-100"
          >✕</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className='text-red-600'>{error}</p>}

        {student && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {student.profilePicture ? (
                <img
                  src={`${API.replace('/api', '')}/uploads/${student.profilePicture}`}
                  alt={student.name}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">{student.name?.[0]}</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{student.name}</h3>
                <p className="text-gray-600 text-sm">{student.stream}</p>
              </div>
            </div>

            <section>
              <h4 className="font-semibold mb-2">Basic Info</h4>
              <ul className="text-sm space-y-1">
                <li><span className="font-medium">NIC:</span> {student.nic}</li>
                <li><span className="font-medium">Email:</span> {student.email}</li>
                <li><span className="font-medium">Contact:</span> {student.contact}</li>
                <li><span className="font-medium">Age:</span> {student.age}</li>
                <li><span className="font-medium">School:</span> {student.schoolName}</li>
                <li><span className="font-medium">Address:</span> {student.address || '—'}</li>
                <li><span className="font-medium">Admission Date:</span> {new Date(student.admissionDate).toLocaleDateString()}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Guardian Info</h4>
              <ul className="text-sm space-y-1">
                <li><span className="font-medium">Name:</span> {student.guardianName || '—'}</li>
                <li><span className="font-medium">Contact:</span> {student.guardianContact || '—'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-semibold mb-2">Enrolled Classes</h4>
              {(!student.enrolledClasses || student.enrolledClasses.length === 0) && (
                <p className="text-sm text-gray-500">No classes enrolled.</p>
              )}

              <div className="space-y-3">
                {(student.enrolledClasses || []).map((ec, idx) => (
                  <div
                    key={idx}
                    className={`border rounded p-3 ${ec.active === false ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{ec.class?.className || 'Class'}</div>
                      <span className={`text-xs px-2 py-0.5 rounded ${ec.active === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {ec.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Subject: {ec.class?.subject}</div>
                      <div>Teacher: {ec.class?.teacher?.name}</div>
                      <div>Fee: {ec.class?.fee}</div>
                      <div>Day/Time: {ec.class?.day} {ec.class?.time}</div>
                      <div>Enrolled: {new Date(ec.enrolledDate).toLocaleDateString()}</div>
                      {ec.unenrolledDate && (
                        <div>Unenrolled: {new Date(ec.unenrolledDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- QR Modal -------------------- */

function QRModal({ student, onClose }) {
  // What you encode in QR:
  // 1) Just student._id
  // 2) A JSON blob with more info for redundancy
  const payload = JSON.stringify({
    studentId: student._id,
    name: student.name,
    nic: student.nic
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
        <h3 className="text-lg font-semibold mb-4">{student.name}'s QR</h3>
        <div className="bg-white p-4 inline-block rounded">
          <QRCode value={payload} size={220} />
        </div>
        <p className="text-xs text-gray-500 mt-3 break-all">
          {payload}
        </p>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Scanner Modal -------------------- */

function ScannerModal({ onResult, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Scan Student QR</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">✕</button>
        </div>
        <div className="rounded overflow-hidden">
          <QRScanner onDecoded={(text) => onResult(text)} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Allow camera permission to scan.
        </p>
      </div>
    </div>
  );
}

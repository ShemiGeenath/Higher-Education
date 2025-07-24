// src/pages/AttendancePage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AttendancePage() {
  const { studentId } = useParams();
  return (
    <div className="p-6">
      <Link to="/" className="text-sm underline">&larr; Back</Link>
      <h1 className="text-2xl font-bold mt-2">Attendance for Student {studentId}</h1>
      {/* Your attendance UI here */}
    </div>
  );
}

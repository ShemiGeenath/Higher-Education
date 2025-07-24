import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Pages/ProtectedRoute";
import DashboardContent from "./components/DashboardContent";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AddStudent from "./Pages/AddStudent";
import Teachers from "./Pages/Teachers";
import Classes from "./Pages/Classes";
import StudentManagement from "./Pages/StudentManagement ";
import Payments from "./Pages/Payments";
import AttendancePage from "./Pages/AttendancePage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
            <Route path="/DashboardContent" element={<ProtectedRoute> <DashboardContent /> </ProtectedRoute>} />
            <Route path="/Sidebar" element={<ProtectedRoute> <Sidebar /> </ProtectedRoute>} />
            <Route path="/Navbar" element={<ProtectedRoute> <Navbar /> </ProtectedRoute>} />
            <Route path="/AddStudent" element={<ProtectedRoute> <AddStudent /> </ProtectedRoute>} />
            <Route path="/Teachers" element={<ProtectedRoute> <Teachers /> </ProtectedRoute>} />
            <Route path="/Classes" element={<ProtectedRoute> <Classes /> </ProtectedRoute>} />
            <Route path="/StudentManagement" element={<ProtectedRoute> <StudentManagement /> </ProtectedRoute>} />
            <Route path="/Payments" element={<ProtectedRoute> <Payments /> </ProtectedRoute>} />
            <Route path="/AttendancePage" element={<ProtectedRoute> <AttendancePage /> </ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/AttendancePage/:id" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />

           
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

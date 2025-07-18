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
           
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

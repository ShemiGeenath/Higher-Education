import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiUserPlus, FiBook, FiCalendar, 
  FiDollarSign, FiClipboard, FiPieChart, FiLogOut, 
  FiChevronDown, FiChevronUp, FiCreditCard 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [openSections, setOpenSections] = useState({
    management: true,
    operations: true,
    finance: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} md:block w-64 bg-white shadow-sm h-screen fixed md:relative z-10`}>
      <nav className="mt-6">
        <div className="px-6">
          <Link 
            to="/dashboard" 
            className="flex items-center px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg"
            onClick={closeSidebar}
          >
            <FiHome className="mr-3" />
            Dashboard
          </Link>
        </div>

        {/* Management Section */}
        <div className="px-6 mt-6">
          <div 
            className="flex items-center justify-between px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => toggleSection('management')}
          >
            <span>Management</span>
            {openSections.management ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          {openSections.management && (
            <div className="mt-3 space-y-1">
              <Link 
                to="/AddStudent" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiUserPlus className="mr-3" />
                Add Student
              </Link>
              <Link 
                to="/Student" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiUsers className="mr-3" />
                Student List
              </Link>
              <Link 
                to="/Teachers" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiUsers className="mr-3" />
                Teachers
              </Link>
              <Link 
                to="/Classes" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiBook className="mr-3" />
                Classes
              </Link>
            </div>
          )}
        </div>

        {/* Operations Section */}
        <div className="px-6 mt-6">
          <div 
            className="flex items-center justify-between px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => toggleSection('operations')}
          >
            <span>Operations</span>
            {openSections.operations ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          {openSections.operations && (
            <div className="mt-3 space-y-1">
              <Link 
                to="/Attendance" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiClipboard className="mr-3" />
                Attendance
              </Link>
              <Link 
                to="/Reports" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiPieChart className="mr-3" />
                Reports
              </Link>
            </div>
          )}
        </div>

        {/* Finance Section (Added Teacher Payments) */}
        <div className="px-6 mt-6">
          <div 
            className="flex items-center justify-between px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => toggleSection('finance')}
          >
            <span>Finance</span>
            {openSections.finance ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          {openSections.finance && (
            <div className="mt-3 space-y-1">
              <Link 
                to="/Payment" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiDollarSign className="mr-3" />
                Student Payments
              </Link>
              <Link 
                to="/TeacherPayments" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={closeSidebar}
              >
                <FiCreditCard className="mr-3" />
                Teacher Payments
              </Link>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="px-6 mt-6">
          <div className="mt-3 space-y-1">
            <Link 
              to="/logout" 
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={closeSidebar}
            >
              <FiLogOut className="mr-3" />
              Logout
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
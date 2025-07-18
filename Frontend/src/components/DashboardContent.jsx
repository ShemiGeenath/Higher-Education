import React from 'react';
import { Link } from 'react-router-dom'

import { 
  FiUsers, FiBook, FiDollarSign, FiClipboard, 
  FiUserPlus, FiPieChart, FiCreditCard 
} from 'react-icons/fi';

const DashboardContent = () => {
  // Sample stats data
  const stats = [
    { name: 'Total Students', value: 248, icon: <FiUsers className="h-6 w-6 text-white" />, change: '+12%', changeType: 'positive' },
    { name: 'Active Classes', value: 18, icon: <FiBook className="h-6 w-6 text-white" />, change: '+2', changeType: 'positive' },
    { name: 'Teachers', value: 24, icon: <FiUsers className="h-6 w-6 text-white" />, change: '0%', changeType: 'neutral' },
    { name: 'Pending Payments', value: 8, icon: <FiDollarSign className="h-6 w-6 text-white" />, change: '-3', changeType: 'negative' },
    { name: 'Unpaid Salaries', value: 3, icon: <FiCreditCard className="h-6 w-6 text-white" />, change: '+1', changeType: 'negative' },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, action: 'New student registered', time: '10 min ago', icon: <FiUserPlus className="h-5 w-5 text-green-600" /> },
    { id: 2, action: 'Payment received from John Doe', time: '25 min ago', icon: <FiDollarSign className="h-5 w-5 text-blue-600" /> },
    { id: 3, action: 'Teacher salary paid to Sarah', time: '1 hour ago', icon: <FiCreditCard className="h-5 w-5 text-purple-600" /> },
    { id: 4, action: 'Attendance marked for Math 101', time: '2 hours ago', icon: <FiClipboard className="h-5 w-5 text-yellow-600" /> },
  ];

  return (
    <main className="flex-1 p-8">
      <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${
                  stat.changeType === 'positive' ? 'bg-green-500' : 
                  stat.changeType === 'negative' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {stat.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activities</h3>
            <p className="mt-1 text-sm text-gray-500">Latest actions in the system</p>
          </div>
          <div className="bg-white overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
            <button className="text-sm font-medium text-green-600 hover:text-green-500">
              View all activities
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-500">Frequently used actions</p>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            <Link
              to="/AddStudent"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="bg-green-100 p-3 rounded-full">
                <FiUserPlus className="h-6 w-6 text-green-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">Add Student</span>
            </Link>
            <Link
              to="/Attendance"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <FiClipboard className="h-6 w-6 text-blue-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">Mark Attendance</span>
            </Link>
            <Link
              to="/Payment"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiDollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">Record Payment</span>
            </Link>
            <Link
              to="/TeacherPayments"
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="bg-purple-100 p-3 rounded-full">
                <FiCreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700">Pay Teacher</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardContent;
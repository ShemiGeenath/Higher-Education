import React from 'react';
import { FiBell, FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
        >
          <FiMenu className="h-6 w-6" />
        </button>
<h1 className="text-2xl font-bold text-green-700">Siයානා</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">Notifications</span>
              <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></div>
              <FiBell className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <img
                  className="ml-2 h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
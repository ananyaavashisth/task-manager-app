import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">Taskflow</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/projects" className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <span className="text-sm font-medium text-gray-700 mr-4">Hello, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

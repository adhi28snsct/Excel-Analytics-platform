import { Outlet } from 'react-router-dom';
import Sidebar from '../pages/Sidebar';

const DashboardLayout = () => {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear auth token
    window.location.href = '/login';  // Redirect to login
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Right Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logout */}
        <header className="flex justify-end items-center p-4 bg-gray-800 text-white">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded shadow"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
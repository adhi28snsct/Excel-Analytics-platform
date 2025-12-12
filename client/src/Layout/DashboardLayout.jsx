import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../pages/Sidebar';

const DashboardLayout = () => {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear auth token
    window.location.href = '/login';  // Redirect to login
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins">
      {/* Navbar */}
      <nav className="bg-cyan-700 text-white px-6 py-4 shadow-md">
        <div className="flex justify-between items-center">
          {/* Left: Sidebar Toggle + Title */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button */}
            <button className="bg-blue-900 hover:bg-blue-800 p-2 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Title */}
            <Link to="/dashboard/home" className="text-xl font-semibold tracking-wide whitespace-nowrap">
              Excel Analytics
            </Link>
          </div>

          {/* Right: Navigation Links + Logout */}
          <div className="flex items-center space-x-6">
            <Link to="/dashboard/dashboard" className="hover:text-cyan-300">Dashboard</Link>
            <Link to="/dashboard/analytics" className="hover:text-cyan-300">Analytics</Link>
            <Link to="/dashboard/uploadpanel" className="hover:text-cyan-300">Upload</Link>
            <Link to="/dashboard/uploads" className="hover:text-cyan-300">History</Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded shadow text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-neutral-900 text-gray-300 py-6">
            <div className="text-center text-sm">
              &copy; {new Date().getFullYear()} Excel Analytics Platform. Built by{" "}
              <span className="font-semibold text-white">Adhithya</span>.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
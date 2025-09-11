import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analytics', path: '/dashboard/analytics' },
    { label: 'Stat', path: '/dashboard/stat' },
    { label: 'Upload Panel', path: '/dashboard/uploadpanel' },
    { label: 'Visualize', path: '/dashboard/visualize' },
    { label: 'Home', path: '/dashboard/home' },
    { label: 'Uploaded Files', path: '/dashboard/files' } 
  ];

  return (
    <>
      {/* 🍔 Hamburger Menu */}
      <button
        className="fixed top-4 left-4 z-50 text-white bg-blue-900 p-2 rounded-md focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="space-y-1">
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </div>
      </button>

      {/* 🌘 Optional Overlay for mobile */}
      {/* 
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )} 
      */}

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-6 text-2xl font-bold border-b border-blue-800">
          Excel Dash 🔍
        </div>
        <nav className="mt-6 space-y-2">
          {navItems.map(({ label, path }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`block px-6 py-3 rounded-md hover:bg-blue-700 transition ${
                  isActive ? 'bg-blue-700 font-semibold' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
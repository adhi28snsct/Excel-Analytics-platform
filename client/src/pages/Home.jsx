import React from 'react';
import { useNavigate } from 'react-router-dom';

const Card = ({ label, icon, path, navigate }) => {
  return (
    <a
      href={path}
      onClick={(e) => {
        e.preventDefault();
        navigate(path);
      }}
      className="flex flex-col items-center justify-center p-8 h-48 rounded-3xl shadow-2xl transition
                bg-white/40 backdrop-blur-md text-white
                hover:scale-105 transform duration-300 border border-white/30"
    >
      <div className="text-5xl mb-4 drop-shadow-lg">{icon}</div>
      <div className="text-xl font-bold tracking-wide text-center drop-shadow-lg">{label}</div>
    </a>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const cards = [
    { label: 'Upload Panel', icon: '📂', path: '/dashboard/uploadpanel' },
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Analytics', icon: '📈', path: '/dashboard/analytics' },
    { label: 'Stat', icon: '📉', path: '/dashboard/stat' },
    { label: 'Visualize', icon: '📡', path: '/dashboard/visualize' }
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-400">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-white text-center drop-shadow-xl">
          Welcome to Excel Analytics 👋
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 auto-rows-fr">
          {cards.map(({ label, icon, path }) => (
            <Card key={label} label={label} icon={icon} path={path} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

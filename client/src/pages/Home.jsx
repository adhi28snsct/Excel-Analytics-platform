export default function Home() {
  const cards = [
    { label: 'Upload Panel', icon: '📂', path: '/dashboard/uploadpanel' },
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Analytics', icon: '📈', path: '/dashboard/analytics' },
    { label: 'Stat', icon: '📉', path: '/dashboard/stat' },
    { label: 'Visualize', icon: '📡', path: '/dashboard/visualize' }
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-400">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Welcome to Excel Analytics 👋
      </h1>

      <div className="grid grid-cols-3 gap-x-6 gap-y-10 auto-rows-fr">
        {cards.map(({ label, icon, path }) => (
          <a
            key={label}
            href={path}
            className="flex flex-col items-center justify-center h-40 rounded-lg shadow-lg transition
                       bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white
                       hover:scale-105 transform duration-300"
          >
            <div className="text-4xl mb-2 drop-shadow-lg">{icon}</div>
            <div className="text-lg font-semibold tracking-wide">{label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

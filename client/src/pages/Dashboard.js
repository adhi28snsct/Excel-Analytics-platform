import { useEffect } from 'react';

const Dashboard = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Unauthorized. Please log in.');
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard!</h1>
      <p className="text-gray-600 mt-2">You’ll see your uploaded files and analytics here soon.</p>
    </div>
  );
};

export default Dashboard;
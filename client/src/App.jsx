import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Admin
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './Admin/Admin';
import AdminDashboard from './pages/AdminDashboard'; // ✅ NEW

// Dashboard Layout
import DashboardLayout from './Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Stat from './pages/Stat';
import Upload from './pages/Upload';
import UploadHistory from './pages/UploadHistory';
import Visualize from './pages/Visualize';
import Home from './pages/Home';
import FileDashboard from './pages/FileDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* ✅ NEW */}

        {/* 📊 Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/:id" element={<Analytics />} />
          <Route path="stat" element={<Stat />} />
          <Route path="uploadpanel" element={<Upload />} />
          <Route path="home" element={<Home />} />
          <Route path="uploads" element={<UploadHistory />} />
          <Route path="files" element={<FileDashboard />} />

          {/* 🎯 Visualize Routes */}
          <Route path="visualize" element={<Navigate to="/dashboard/uploads" />} />
          <Route path="visualize/:fileId" element={<Visualize />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
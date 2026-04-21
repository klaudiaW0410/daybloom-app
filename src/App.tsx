import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { Navbar } from './components/Navbar';

// Lazy load pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Today } from './pages/Today';
import { Journal } from './pages/Journal';
import { Calendar } from './pages/Calendar';
import { Habits } from './pages/Habits';
import { Goals } from './pages/Goals';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loading-screen">Loading DayBloom...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute><Navigate to="/today" replace /></ProtectedRoute>} />
            <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
            <Route path="/journal/:date" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

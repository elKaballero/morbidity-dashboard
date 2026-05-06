import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import DataEntry from './pages/DataEntry';
import History from './pages/History';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route 
                path="/daily-entry" 
                element={
                  <ProtectedRoute allowedRoles={['branch']}>
                    <DailyEntry />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/data-entry" 
                element={
                  <ProtectedRoute allowedRoles={['branch']}>
                    <DataEntry />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NiparPage from './pages/NiparPage';
import EncabPage from './pages/EncabPage';
import RecolhidosPage from './pages/RecolhidosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import UtilizadoresPage from './pages/UtilizadoresPage';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.perfil !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="nipar" element={<NiparPage />} />
            <Route path="encabecamento" element={<EncabPage />} />
            <Route path="recolhidos" element={<RecolhidosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="utilizadores" element={<ProtectedRoute adminOnly><UtilizadoresPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

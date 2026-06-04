import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/shared/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapaPage from './pages/MapaPage';
import VehiculosPage from './pages/VehiculosPage';
import IncidentesPage from './pages/IncidentesPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/mapa" element={
            <PrivateRoute><MapaPage /></PrivateRoute>
          } />
          <Route path="/vehiculos" element={
            <PrivateRoute><VehiculosPage /></PrivateRoute>
          } />
          <Route path="/incidentes" element={
            <PrivateRoute><IncidentesPage /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import AppointmentForm from './components/AppointmentForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import ServiceManager from './components/ServiceManager';
import ProductManager from './components/ProductManager'
import Shop from './components/Shop'; 
import AdminStats from './components/AdminStats';

// --- COMPONENTE DASHBOARD ---
function Dashboard() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);

  // (Mantén aquí tu función fetchAppointments y el useEffect...)
  const fetchAppointments = () => {
      fetch('http://localhost:3001/appointments')
        .then((res) => res.json())
        .then((data) => setAppointments(data));
  };
  useEffect(() => { fetchAppointments(); }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h1>💇‍♂️ Peluquería - Hola {user?.name}</h1>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <span style={{ background: '#eee', padding: '5px 10px', borderRadius: '15px', fontSize: '12px' }}>
            {user?.role === 'admin' ? '👑 ADMIN' : '👤 CLIENTE'}
          </span>
          <button onClick={logout} style={{ background: 'red', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </nav>

      {/* --- ZONA EXCLUSIVA DE ADMIN --- */}
      {user?.role === 'admin' && (
        <>
          {/* 1. Las Estadísticas van PRIMERO */}
          <AdminStats />
          
          {/* 2. Luego los gestores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
             {/* Puse los gestores en una grilla para que se vea más ordenado, si quieres */}
             <ServiceManager />
             <ProductManager />
          </div>
        </>
      )}
      
      {/* Formulario de Turnos (Visible para todos, pero con comportamiento distinto) */}
      <AppointmentForm onAppointmentCreated={fetchAppointments} />
      
      <hr style={{ margin: '30px 0' }} />

      {/* COMPONENTE TIENDA (NUEVO) */}
      <Shop /> 
      
      <hr style={{ margin: '30px 0' }} />
      
      <h2>📅 Mis Turnos</h2>
      {/* (Mantén aquí tu lista de turnos...) */}
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {appointments.map((appt) => (
          <div key={appt.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#fff' }}>
             <h3>📅 {appt.date} - {appt.time}</h3>
             <p><strong>Cliente:</strong> {appt.User?.name}</p>
             <p><strong>Servicio:</strong> {appt.Service?.name || 'Eliminado'}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
// --- PROTECTOR DE RUTAS ---
// CAMBIO AQUÍ: Usamos ReactNode en lugar de JSX.Element
function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>; // <--- ESPERA AQUÍ

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// --- APP PRINCIPAL ---
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
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
import SalesForm from './components/SalesForm';

// --- COMPONENTE DASHBOARD ---
function Dashboard() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);

  // 1. ESTADO "GATILLO": Cada vez que este número cambia, las stats se recargan
  const [statsTrigger, setStatsTrigger] = useState(0);

  // 2. FUNCIÓN PARA DISPARAR LA RECARGA
  const refreshStats = () => {
    setStatsTrigger(prev => prev + 1);
  };

  const fetchAppointments = () => {
      fetch('http://localhost:3001/appointments')
        .then((res) => {
            if (!res.ok) throw new Error("Error en el servidor");
            return res.json();
        })
        .then((data) => {
            // SEGURIDAD: Solo guardamos si es una lista (Array) real
            if (Array.isArray(data)) {
                setAppointments(data);
            } else {
                console.error("Formato de datos incorrecto:", data);
                setAppointments([]); 
            }
        })
        .catch(err => {
            console.error("Error cargando turnos:", err);
            setAppointments([]); // En caso de error, lista vacía para no romper la pantalla
        });
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
          {/* 3. LE PASAMOS EL GATILLO AL COMPONENTE DE ESTADÍSTICAS */}
          <AdminStats refreshTrigger={statsTrigger} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
             <ServiceManager />
             
             {/* 4. LE PASAMOS LA FUNCIÓN DE RECARGA AL GESTOR DE PRODUCTOS */}
             <ProductManager onUpdate={refreshStats} />
          </div>
        </>
      )}
      
      <AppointmentForm onAppointmentCreated={fetchAppointments} />
      {/* AQUÍ AGREGAMOS EL FORMULARIO DE VENTAS NUEVO */}
             <div style={{ flex: 1 }}>
                <SalesForm onSaleCompleted={refreshStats} />
             </div>
      
      <hr style={{ margin: '30px 0' }} />
      
      <h2>📅 Mis Turnos</h2>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {appointments.map((appt) => (
          <div key={appt.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#fff' }}>
             <h3>📅 {appt.date} - {appt.time}</h3>
             
             {/* --- CAMBIO AQUÍ: Muestra User.name SI EXISTE, sino muestra clientName --- */}
             <p><strong>Cliente:</strong> {appt.User?.name || appt.clientName || 'Anónimo'}</p>
             
             <p><strong>Servicio:</strong> {appt.Service?.name || 'Eliminado'}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

// --- PROTECTOR DE RUTAS ---
function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>;

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
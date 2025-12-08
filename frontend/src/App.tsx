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
import ClientList from './components/ClientList';


// --- COMPONENTE DASHBOARD ---
function Dashboard() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // 1. ESTADO "GATILLO": La señal para recargar estadísticas y listas
  const [statsTrigger, setStatsTrigger] = useState(0);

  // --- ESTADOS PARA EDICIÓN DE TURNOS ---
  const [editingApptId, setEditingApptId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ date: '', time: '' });

  // 2. FUNCIÓN DE RECARGA GLOBAL
  const refreshStats = () => setStatsTrigger(prev => prev + 1);

  const fetchAppointments = () => {
    let url = 'http://localhost:3001/appointments';
    if (user?.role === 'client') {
        url = `http://localhost:3001/appointments?userId=${user.id}`;
    }

    fetch(url)
      .then((res) => { if (!res.ok) throw new Error("Error server"); return res.json(); })
      .then((data) => {
          if (Array.isArray(data)) setAppointments(data);
          else setAppointments([]);
      })
      .catch(err => { console.error(err); setAppointments([]); });
  };
  
  useEffect(() => { if(user) fetchAppointments(); }, [user]);

  // --- FUNCIONES DE EDICIÓN ---
  const startEditing = (appt: any) => {
    setEditingApptId(appt.id);
    setEditData({ date: appt.date, time: appt.time }); 
  };

  const cancelEditing = () => {
    setEditingApptId(null);
    setEditData({ date: '', time: '' });
  };

  const saveEdit = async (id: number) => {
    const selectedDate = new Date(`${editData.date}T${editData.time}`);
    const now = new Date();
    const day = selectedDate.getDay();
    const hour = parseInt(editData.time.split(':')[0]);

    if (selectedDate < now) return alert('Error: Fecha pasada.');
    if (day === 0 || day === 1) return alert('Cerrado Domingos y Lunes.');
    if (hour < 9 || hour >= 18) return alert('Horario de 09:00 a 18:00 hs.');

    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        alert('✅ Turno reprogramado con éxito');
        setEditingApptId(null);
        fetchAppointments(); 
        refreshStats(); // Actualizamos las estadísticas al reprogramar
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  // --- NUEVA FUNCIÓN: COMPLETAR TURNO (COBRAR) ---
  const completeAppointment = async (id: number) => {
    if (!confirm('¿Marcar turno como REALIZADO y cobrar?')) return;

    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }) // Enviamos el nuevo estado
      });

      if (res.ok) {
        alert('✅ Turno completado. Dinero agregado a la caja.');
        fetchAppointments();
        refreshStats(); // ¡Esto actualiza el panel de dinero al instante!
      } else {
        alert('Error al actualizar');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  // --- NUEVA FUNCIÓN: CANCELAR TURNO ---
  const cancelAppointment = async (id: number) => {
    if (!confirm('¿Seguro que deseas cancelar este turno?')) return;

    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // IMPORTANTE: Enviamos el rol del usuario para que el backend sepa si aplicar la regla de 24hs
        body: JSON.stringify({ status: 'cancelled', requestingRole: user?.role }) 
      });

      if (res.ok) {
        alert('✅ Turno cancelado.');
        fetchAppointments();
        refreshStats();
      } else {
        const err = await res.json();
        alert(err.error); // Mostramos el error del backend si falta menos de 24hs
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

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
          {/* 1. Estadísticas arriba de todo */}
          <AdminStats refreshTrigger={statsTrigger} />
          
          {/* 2. Gestores de Servicios y Productos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
             <ServiceManager onUpdate={refreshStats} />
             <ProductManager onUpdate={refreshStats} />
          </div>

          {/* 3. Formularios de Acción (Turnos y Ventas) - AHORA ESTÁN MÁS ARRIBA */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
             <div style={{ flex: 1 }}> 
                <AppointmentForm 
                    onAppointmentCreated={() => { fetchAppointments(); refreshStats(); }} 
                    refreshTrigger={statsTrigger}
                /> 
             </div>
             <div style={{ flex: 1 }}> 
                <SalesForm 
                    onSaleCompleted={refreshStats} 
                    refreshTrigger={statsTrigger}
                /> 
             </div>
          </div>

          {/* 4. Lista de Clientes - MOVIDA AL FINAL DEL PANEL ADMIN */}
          <div style={{ marginTop: '30px' }}>
            <ClientList />
          </div>
        </>
      )}

      {/* ZONA CLIENTE: Formulario de Turnos */}
      {user?.role === 'client' && (
         <AppointmentForm onAppointmentCreated={fetchAppointments} />
      )}
      
      {user?.role === 'client' && (
        <> <hr style={{ margin: '30px 0' }} /> <Shop /> </>
      )}
      
      <hr style={{ margin: '30px 0' }} />
      
      <h2>📅 Mis Turnos</h2>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {appointments.map((appt) => (
          <div key={appt.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: editingApptId === appt.id ? '#e3f2fd' : '#fff' }}>
             
             {/* MODO EDICIÓN */}
             {editingApptId === appt.id ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 <label style={{fontWeight: 'bold', color: '#007bff'}}>Reprogramar:</label>
                 <input 
                    type="date" 
                    value={editData.date} 
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                    style={{ padding: '5px' }}
                 />
                 <input 
                    type="time" 
                    value={editData.time}
                    min="09:00" max="18:00"
                    onChange={(e) => setEditData({...editData, time: e.target.value})}
                    style={{ padding: '5px' }}
                 />
                 <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => saveEdit(appt.id)} style={{ flex: 1, background: '#28a745', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                    <button onClick={cancelEditing} style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                 </div>
               </div>
             ) : (
               /* MODO VISUALIZACIÓN */
               <>
                 <h3>
                    📅 {appt.date.split('-').reverse().join('/')} a las {appt.time.slice(0, 5)} hs
                 </h3>
                 <p><strong>Cliente:</strong> {appt.User?.name || appt.clientName || 'Anónimo'}</p>
                 <p><strong>Servicio:</strong> {appt.Service?.name || 'Eliminado'} {appt.Service ? `($${appt.Service.price})` : ''}</p>
                 
{/* Estado con color */}
                 <p>Estado: <strong style={{ 
                     color: appt.status === 'completed' ? 'green' : 
                            appt.status === 'cancelled' ? 'red' : '#007bff' 
                 }}>
                    {appt.status === 'completed' ? 'REALIZADO ✅' : 
                     appt.status === 'cancelled' ? 'CANCELADO ❌' : 'PENDIENTE'}
                 </strong></p>

                 {/* BOTONES DE ACCIÓN (Solo si está pendiente) */}
                 {appt.status === 'pending' && (
                   <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                     
                     {/* 1. Botón Editar (Para todos) */}
                     <button 
                        onClick={() => startEditing(appt)}
                        style={{ flex: 1, background: '#007bff', color:'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                     >
                       Editar
                     </button>

                     {/* 2. Botón CANCELAR (NUEVO - Para todos) */}
                     <button 
                        onClick={() => cancelAppointment(appt.id)}
                        style={{ flex: 1, background: '#dc3545', color:'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                     >
                       Cancelar
                     </button>
                     
                     {/* 3. Botón COBRAR (Solo Admin) */}
                     {user?.role === 'admin' && (
                        <button 
                            onClick={() => completeAppointment(appt.id)}
                            style={{ flex: 1, background: '#28a745', color:'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Cobrar
                        </button>
                     )}
                   </div>
                 )}
               </>
             )}
          </div>
        ))}
      </div>

    </div>
  );
}

function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Cargando sesión...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

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
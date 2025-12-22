import { useEffect, useState, type PropsWithChildren } from 'react';

import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

import AppointmentForm from './components/AppointmentForm';

import LoginPage from './pages/LoginPage';

import RegisterPage from './pages/RegisterPage';

import ResetPasswordPage from './pages/ResetPasswordPage';

import { AuthProvider, useAuth } from './context/AuthContext';

import './App.css';

import ServiceManager from './components/ServiceManager';

import ProductManager from './components/ProductManager'

import Shop from './components/Shop';

import AdminStats from './components/AdminStats';

import SalesForm from './components/SalesForm';

import ClientList from './components/ClientList';

import UserProfile from './components/UserProfile';

import Header from './components/Header';



// --- COMPONENTE DASHBOARD ---

function Dashboard() {

  const { user } = useAuth();

  const [appointments, setAppointments] = useState<any[]>([]);

  const [statsTrigger, setStatsTrigger] = useState(0);

 

  const [activeTab, setActiveTab] = useState('inicio');



  // 1. NUEVO ESTADO: Para abrir/cerrar el sub-menú de Turnos

  const [isTurnosMenuOpen, setIsTurnosMenuOpen] = useState(false); // <--- NUEVO



  const [editingApptId, setEditingApptId] = useState<number | null>(null);

  const [editData, setEditData] = useState({ date: '', time: '' });



  const refreshStats = () => setStatsTrigger(prev => prev + 1);



  const fetchAppointments = () => {

    let url = 'http://localhost:3001/appointments';

    if (user?.role === 'client') {

        url = `http://localhost:3001/appointments?userId=${user.id}`;

    }

    fetch(url)

      .then((res) => { if (!res.ok) throw new Error("Error server"); return res.json(); })

      .then((data) => { if (Array.isArray(data)) setAppointments(data); else setAppointments([]); })

      .catch(err => { console.error(err); setAppointments([]); });

  };

 

  useEffect(() => {

      if(user) { fetchAppointments(); setActiveTab('inicio'); }

  }, [user]);



  // --- FUNCIONES DE TURNOS (Iguales que antes) ---

  const startEditing = (appt: any) => { setEditingApptId(appt.id); setEditData({ date: appt.date, time: appt.time }); };

  const cancelEditing = () => { setEditingApptId(null); setEditData({ date: '', time: '' }); };



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

        alert('✅ Turno reprogramado');

        setEditingApptId(null);

        fetchAppointments();

        refreshStats();

      } else { const err = await res.json(); alert('Error: ' + err.error); }

    } catch (error) { alert('Error de conexión'); }

  };



  const completeAppointment = async (id: number) => {

    if (!confirm('¿Marcar turno como REALIZADO y cobrar?')) return;

    try {

      const res = await fetch(`http://localhost:3001/appointments/${id}`, {

        method: 'PUT',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ status: 'completed' })

      });

      if (res.ok) { alert('✅ Cobrado.'); fetchAppointments(); refreshStats(); }

      else { alert('Error al actualizar'); }

    } catch (error) { alert('Error de conexión'); }

  };



  const cancelAppointment = async (id: number) => {

    if (!confirm('¿Seguro que deseas cancelar?')) return;

    try {

      const res = await fetch(`http://localhost:3001/appointments/${id}`, {

        method: 'PUT',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ status: 'cancelled', requestingRole: user?.role })

      });

      if (res.ok) { alert('✅ Cancelado.'); fetchAppointments(); refreshStats(); }

      else { const err = await res.json(); alert(err.error); }

    } catch (error) { alert('Error de conexión'); }

  };



  // --- COMPONENTE LISTA REUTILIZABLE (Ahora recibe la lista filtrada) ---

  const AppointmentsList = ({ list }: { list: any[] }) => (

    <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>

        {list.length === 0 ? <p style={{color: '#666', fontStyle: 'italic'}}>No hay turnos en esta sección.</p> : null}

       

        {list.map((appt) => (

          <div key={appt.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: editingApptId === appt.id ? '#e3f2fd' : '#fff' }}>

             {editingApptId === appt.id ? (

               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                 <label style={{fontWeight: 'bold', color: '#007bff'}}>Reprogramar:</label>

                 <input type="date" value={editData.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setEditData({...editData, date: e.target.value})} style={{ padding: '5px' }} />

                 <input type="time" value={editData.time} min="09:00" max="18:00" onChange={(e) => setEditData({...editData, time: e.target.value})} style={{ padding: '5px' }} />

                 <div style={{ display: 'flex', gap: '5px' }}>

                    <button onClick={() => saveEdit(appt.id)} style={{ flex: 1, background: '#28a745', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>

                    <button onClick={cancelEditing} style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>

                 </div>

               </div>

             ) : (

               <>

                 <h3>📅 {appt.date.split('-').reverse().join('/')} a las {appt.time.slice(0, 5)} hs</h3>

                 <p><strong>Cliente:</strong> {appt.User?.name || appt.clientName || 'Anónimo'}</p>

                 <p><strong>Servicio:</strong> {appt.Service?.name || 'Eliminado'} {appt.Service ? `($${appt.Service.price})` : ''}</p>

                 <p>Estado: <strong style={{ color: appt.status === 'completed' ? 'green' : appt.status === 'cancelled' ? 'red' : '#007bff' }}>{appt.status === 'completed' ? 'REALIZADO ✅' : appt.status === 'cancelled' ? 'CANCELADO ❌' : 'PENDIENTE'}</strong></p>

                 {appt.status === 'pending' && (

                   <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>

                     <button onClick={() => startEditing(appt)} style={{ flex: 1, background: '#007bff', color:'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>

                     <button onClick={() => cancelAppointment(appt.id)} style={{ flex: 1, background: '#dc3545', color:'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>

                     {user?.role === 'admin' && (

                        <button onClick={() => completeAppointment(appt.id)} style={{ flex: 1, background: '#28a745', color:'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Cobrar</button>

                     )}

                   </div>

                 )}

               </>

             )}

          </div>

        ))}

    </div>

  );



  const renderContent = () => {

    // 1. VISTAS DE ADMIN

    if (user?.role === 'admin') {

        switch (activeTab) {

            case 'inicio': return <AdminStats refreshTrigger={statsTrigger} />;

            case 'turnos': return <><AppointmentForm onAppointmentCreated={() => { fetchAppointments(); refreshStats(); }} refreshTrigger={statsTrigger} /><br/><AppointmentsList list={appointments} /></>;

            case 'ventas': return <SalesForm onSaleCompleted={refreshStats} refreshTrigger={statsTrigger} />;

            case 'servicios': return <ServiceManager onUpdate={refreshStats} />;

            case 'productos': return <ProductManager onUpdate={refreshStats} />;

            case 'clientes': return <ClientList />;

            default: return <AdminStats refreshTrigger={statsTrigger} />;

        }

    }

   

    // 2. VISTAS DE CLIENTE (CON LÓGICA DE FILTRADO)

    if (user?.role === 'client') {

        // Filtros

        const pendingList = appointments.filter(a => a.status === 'pending');

        const historyList = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');



        switch (activeTab) {

            case 'inicio': // Por defecto mostramos todo

            case 'agendar': // Vista solo para Agendar

                return (

                    <>

                        <h2 style={{borderBottom: '2px solid #007bff', paddingBottom: '10px'}}>📅 Agendar Nuevo Turno</h2>

                        <AppointmentForm onAppointmentCreated={() => { fetchAppointments(); setActiveTab('pendientes'); }} />

                    </>

                );

            case 'pendientes': // Vista solo Pendientes

                return (

                    <>

                        <h2 style={{borderBottom: '2px solid #ffc107', paddingBottom: '10px'}}>⏳ Turnos Pendientes</h2>

                        <AppointmentsList list={pendingList} />

                    </>

                );

            case 'historial': // Vista solo Historial

                return (

                    <>

                        <h2 style={{borderBottom: '2px solid #28a745', paddingBottom: '10px'}}>📜 Historial de Turnos</h2>

                        <AppointmentsList list={historyList} />

                    </>

                );

           

            case 'tienda': return <Shop />;

            case 'perfil': return <UserProfile />;

            default: return <AppointmentsList list={appointments} />;

        }

    }

  };



  return (

    <div className="admin-container">

     

      {/* 1. SIDEBAR */}

      <div className="sidebar">

        <h2 style={{fontSize: '14px', textTransform: 'uppercase', color: '#6c757d', letterSpacing: '1px', marginBottom: '20px'}}>Navegación</h2>

       

        {/* MENÚ DE ADMIN */}

        {user?.role === 'admin' && (

            <>

                <button className={`sidebar-btn ${activeTab === 'inicio' ? 'active' : ''}`} onClick={() => setActiveTab('inicio')}>📊 Resumen</button>

                <button className={`sidebar-btn ${activeTab === 'turnos' ? 'active' : ''}`} onClick={() => setActiveTab('turnos')}>📅 Turnos</button>

                <button className={`sidebar-btn ${activeTab === 'ventas' ? 'active' : ''}`} onClick={() => setActiveTab('ventas')}>💰 Ventas</button>

                <button className={`sidebar-btn ${activeTab === 'servicios' ? 'active' : ''}`} onClick={() => setActiveTab('servicios')}>✂️ Servicios</button>

                <button className={`sidebar-btn ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>🧴 Productos</button>

                <button className={`sidebar-btn ${activeTab === 'clientes' ? 'active' : ''}`} onClick={() => setActiveTab('clientes')}>👥 Clientes</button>

            </>

        )}



{/* MENÚ DE CLIENTE (CON ANIMACIÓN) */}

        {user?.role === 'client' && (

            <>

                {/* BOTÓN PADRE: MIS TURNOS */}

                <button

                    className={`sidebar-btn ${['agendar', 'pendientes', 'historial'].includes(activeTab) ? 'active' : ''}`}

                    onClick={() => setIsTurnosMenuOpen(!isTurnosMenuOpen)}

                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}

                >

                    <span>📅 Mis Turnos</span>

                    {/* La flechita ahora tiene clase para animarse */}

                    <span className={`arrow-icon ${isTurnosMenuOpen ? 'open' : ''}`} style={{ fontSize: '10px' }}>▼</span>

                </button>



                {/* SUB-MENÚ (Siempre está en el código, pero CSS controla si se ve) */}

                <div className={`submenu-container ${isTurnosMenuOpen ? 'open' : ''}`}>

                    <div style={{ display: 'flex', flexDirection: 'column', padding: '5px 0' }}>

                        <button

                            className={`sidebar-btn ${activeTab === 'agendar' ? 'active' : ''}`}

                            onClick={() => setActiveTab('agendar')}

                            style={{ paddingLeft: '35px', fontSize: '13px' }}

                        >

                            ➕ Agendar Nuevo

                        </button>



                        <button

                            className={`sidebar-btn ${activeTab === 'pendientes' ? 'active' : ''}`}

                            onClick={() => setActiveTab('pendientes')}

                            style={{ paddingLeft: '35px', fontSize: '13px' }}

                        >

                            ⏳ Pendientes

                        </button>



                        <button

                            className={`sidebar-btn ${activeTab === 'historial' ? 'active' : ''}`}

                            onClick={() => setActiveTab('historial')}

                            style={{ paddingLeft: '35px', fontSize: '13px' }}

                        >

                            📜 Historial

                        </button>

                    </div>

                </div>



                <button className={`sidebar-btn ${activeTab === 'tienda' ? 'active' : ''}`} onClick={() => setActiveTab('tienda')}>🛍️ Tienda</button>

                <button className={`sidebar-btn ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>👤 Mi Perfil</button>

            </>

        )}

      </div>



      {/* 2. ZONA DERECHA */}

      <div className="main-content-wrapper">

         <Header onNavigate={(tab) => {

             // Si navegan desde el header, abrimos el menú si es necesario

             if (['agendar', 'pendientes', 'historial'].includes(tab)) setIsTurnosMenuOpen(true);

             setActiveTab(tab);

         }} />



         <div className="content-area">

            {renderContent()}

         </div>

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

          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}


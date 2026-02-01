import './App.css';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import AppointmentForm from './components/AppointmentForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import ServiceManager from './components/ServiceManager';
import ProductManager from './components/ProductManager'
import Shop from './components/Shop'; 
import AdminStats from './components/AdminStats';
import SalesForm from './components/SalesForm';
import ClientList from './components/ClientList'; 
import UserProfile from './components/UserProfile';
import Header from './components/Header'; 
import Home from './components/Home';
import Footer from './components/Footer';
import { API_URL } from './config';
import OrderHistory from './components/OrderHistory';
import TextAnimation from './components/TextAnimation'; 
import type { Appointment } from './types/models';

import { ExportButtons } from './components/ExportButtons';

// --- COMPONENTE DASHBOARD ---
function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statsTrigger, setStatsTrigger] = useState(0);
  
  // Estado de navegación
  const [activeTab, setActiveTab] = useState('home');

  // Estado para el sub-menú de turnos
  const [isTurnosMenuOpen, setIsTurnosMenuOpen] = useState(false); 

  // Estado para el sub-menú de tienda
  const [isTiendaMenuOpen, setIsTiendaMenuOpen] = useState(false);
  
  // Estado para colapsar la barra lateral (Sidebar)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Estado para menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [editingApptId, setEditingApptId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ date: '', time: '' });

  const refreshStats = () => setStatsTrigger(prev => prev + 1);

  const fetchAppointments = () => {
    let url = `${API_URL}/appointments`;
    if (user?.role === 'client') {
        url = `${API_URL}/appointments?userId=${user.id}`;
    }
    fetch(url)
      .then((res) => { if (!res.ok) throw new Error("Error server"); return res.json(); })
      .then((data) => { if (Array.isArray(data)) setAppointments(data); else setAppointments([]); })
      .catch(err => { console.error(err); setAppointments([]); });
  };
  
  useEffect(() => { 
      if(user) { 
          fetchAppointments(); 
          setActiveTab('home'); 
      }
  }, [user]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) setIsTurnosMenuOpen(false);
  };

  // Maneja el cierre del menú móvil
  const handleNavigation = (tabName: string) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false); 
  };

  // --- FUNCIONES DE TURNOS ---
  const startEditing = (appt: any) => { setEditingApptId(appt.id); setEditData({ date: appt.date, time: appt.time }); };
  const cancelEditing = () => { setEditingApptId(null); setEditData({ date: '', time: '' }); };

  // --- LÓGICA REAL DE GUARDADO ---
  const saveEdit = async (id: number) => {
    const selectedDate = new Date(`${editData.date}T${editData.time}`);
    const now = new Date();
    const day = selectedDate.getDay();
    const hour = parseInt(editData.time.split(':')[0]);

    if (selectedDate < now) return alert('Error: Fecha pasada.');
    if (day === 0 || day === 1) return alert('Cerrado Domingos y Lunes.');
    if (hour < 9 || hour >= 18) return alert('Horario de 09:00 a 18:00 hs.');

    try {
      const res = await fetch(`${API_URL}/appointments/${id}`, {
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
      const res = await fetch(`${API_URL}/appointments/${id}`, {
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
      const res = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', requestingRole: user?.role }) 
      });
      if (res.ok) { alert('✅ Cancelado.'); fetchAppointments(); refreshStats(); }
      else { const err = await res.json(); alert(err.error); }
    } catch (error) { alert('Error de conexión'); }
  };

  // --- COMPONENTE LISTA REUTILIZABLE ---
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
    // --- LÓGICA DE ADMIN ---
    if (user?.role === 'admin') {
        switch (activeTab) {
            case 'home': return <Home />;
            case 'inicio': return <AdminStats refreshTrigger={statsTrigger} />;
            case 'turnos': return (
                <>
                    <AppointmentForm onAppointmentCreated={() => { fetchAppointments(); refreshStats(); }} refreshTrigger={statsTrigger} />
                    <br/>
                    <ExportButtons data={appointments} label="turnos_admin" />
                    <AppointmentsList list={appointments} />
                </>
            );
            case 'ventas': return <SalesForm onSaleCompleted={refreshStats} refreshTrigger={statsTrigger} />;
            case 'servicios': return <ServiceManager onUpdate={refreshStats} />;
            case 'productos': return <ProductManager onUpdate={refreshStats} />;
            case 'tienda': return <Shop />;
            case 'historial_ventas': return <OrderHistory />;
            case 'clientes': return <ClientList />;
            default: return <AdminStats refreshTrigger={statsTrigger} />;
        }
    }
    // --- LÓGICA DE CLIENTE ---
    if (user?.role === 'client') {
        const pendingList = appointments.filter(a => a.status === 'pending');
        const historyList = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
        switch (activeTab) {
            case 'home': return <Home />;
            case 'inicio': 
            case 'agendar': return <><h2 style={{borderBottom: '2px solid #007bff'}}>📅 Agendar</h2><AppointmentForm onAppointmentCreated={() => { fetchAppointments(); setActiveTab('pendientes'); }} /></>;
            
            case 'pendientes': return (
                <>
                    <h2 style={{borderBottom: '2px solid #ffc107'}}>⏳ Pendientes</h2>
                    <ExportButtons data={pendingList} label="mis_pendientes" />
                    <AppointmentsList list={pendingList} />
                </>
            );
            
            case 'historial': return (
                <>
                    <h2 style={{borderBottom: '2px solid #28a745'}}>📜 Historial</h2>
                    <ExportButtons data={historyList} label="mi_historial" />
                    <AppointmentsList list={historyList} />
                </>
            );
            
            case 'tienda': return <Shop />;
            case 'mis_compras': return <OrderHistory />;
            case 'perfil': return <UserProfile />;
            default: return <AppointmentsList list={appointments} />;
        }
    }
  };

  // --- HELPER PARA BOTONES DEL SIDEBAR ---
  const SidebarItem = ({ icon, text, onClick, isActive, hasSubmenu = false, isOpen = false }: any) => (
    <button 
        className={`sidebar-btn ${isActive ? 'active' : ''}`} 
        onClick={(e) => {
            if (onClick) onClick(e);
            if (!hasSubmenu) setIsMobileMenuOpen(false);
        }}
        title={text}
    >
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
        
        <TextAnimation text={text} />

        {hasSubmenu && !isCollapsed && (
             <span className={`arrow-icon ${isOpen ? 'open' : ''}`}>▼</span>
        )}
    </button>
  );

  return (
    <div className="admin-container">
      
      {/* SIDEBAR DINÁMICA (CON SOPORTE MÓVIL) */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        {/* Botón "X" para cerrar solo en móvil */}
        <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileMenuOpen(false)}
        >
            ✕
        </button>

        <button onClick={toggleSidebar} className="menu-toggle-btn desktop-only">☰</button>

        <h2 className="btn-text" style={{fontSize: '14px', textTransform: 'uppercase', color: '#6c757d', letterSpacing: '1px', marginBottom: '20px', whiteSpace: 'nowrap'}}>
            Navegación
        </h2>
        
        {/* MENÚ DE ADMIN */}
        {user?.role === 'admin' && (
            <>
                <SidebarItem icon="🏠" text="Inicio" tabName="home" isActive={activeTab === 'home'} onClick={() => handleNavigation('home')} />
                <SidebarItem icon="📊" text="Resumen" tabName="inicio" isActive={activeTab === 'inicio'} onClick={() => handleNavigation('inicio')} />
                <SidebarItem icon="📅" text="Turnos" tabName="turnos" isActive={activeTab === 'turnos'} onClick={() => handleNavigation('turnos')} />
                <SidebarItem icon="✂️" text="Servicios" tabName="servicios" isActive={activeTab === 'servicios'} onClick={() => handleNavigation('servicios')} />

                <SidebarItem 
                  icon="💈" text="Administrar Tienda" isActive={['tienda','productos','ventas','historial_ventas'].includes(activeTab)}
                  hasSubmenu={true} isOpen={isTiendaMenuOpen}
                  onClick={() => {
                      if (isCollapsed) { setIsCollapsed(false); setIsTiendaMenuOpen(true); } 
                      else { setIsTiendaMenuOpen(!isTiendaMenuOpen); }
                  }}
                />

                <div className={`submenu-container ${isTiendaMenuOpen && !isCollapsed ? 'open' : ''}`} style={{ overflow: 'hidden', maxHeight: isTiendaMenuOpen && !isCollapsed ? '300px' : '0', transition: 'max-height 0.3s ease', paddingLeft: '20px' }}>
                  <SidebarItem icon="🛍️" text="Tienda" tabName="tienda" isActive={activeTab === 'tienda'} onClick={() => handleNavigation('tienda')} />
                  <SidebarItem icon="🧴" text="Administrar Productos" tabName="productos" isActive={activeTab === 'productos'} onClick={() => handleNavigation('productos')} />
                  <SidebarItem icon="💰" text="Asignar Ventas" tabName="ventas" isActive={activeTab === 'ventas'} onClick={() => handleNavigation('ventas')} />
                  <SidebarItem icon="📜" text="Historial Ventas" tabName="historial_ventas" isActive={activeTab === 'historial_ventas'} onClick={() => handleNavigation('historial_ventas')} />
                </div>

                <SidebarItem icon="👤" text="Clientes" tabName="clientes" isActive={activeTab === 'clientes'} onClick={() => handleNavigation('clientes')} />
            </>
        )}

        {/* MENÚ DE CLIENTE */}
        {user?.role === 'client' && (
            <>
                <SidebarItem icon="🏠" text="Inicio" tabName="home" isActive={activeTab === 'home'} onClick={() => handleNavigation('home')} />
                <SidebarItem 
                    icon="📅" text="Mis Turnos" isActive={['agendar', 'pendientes', 'historial'].includes(activeTab)} 
                    hasSubmenu={true} isOpen={isTurnosMenuOpen}
                    onClick={() => {
                        if (isCollapsed) { setIsCollapsed(false); setIsTurnosMenuOpen(true); } 
                        else { setIsTurnosMenuOpen(!isTurnosMenuOpen); }
                    }} 
                />
                <div className={`submenu-container ${isTurnosMenuOpen && !isCollapsed ? 'open' : ''}`} style={{ overflow: 'hidden', maxHeight: isTurnosMenuOpen && !isCollapsed ? '200px' : '0', transition: 'max-height 0.3s ease', paddingLeft: '20px' }}>
                    <SidebarItem icon="➕" text="Agendar" isActive={activeTab === 'agendar'} onClick={() => handleNavigation('agendar')} />
                    <SidebarItem icon="⏳" text="Pendientes" isActive={activeTab === 'pendientes'} onClick={() => handleNavigation('pendientes')} />
                    <SidebarItem icon="📜" text="Historial" isActive={activeTab === 'historial'} onClick={() => handleNavigation('historial')} />
                </div>
                <SidebarItem icon="🛍️" text="Tienda" tabName="tienda" isActive={activeTab === 'tienda'} onClick={() => handleNavigation('tienda')} />
                <SidebarItem icon="📜" text="Mis Compras" tabName="mis_compras" isActive={activeTab === 'mis_compras'} onClick={() => handleNavigation('mis_compras')} />
                <SidebarItem icon="👤" text="Mi Perfil" tabName="perfil" isActive={activeTab === 'perfil'} onClick={() => handleNavigation('perfil')} />
            </>
        )}
      </div>

      {/*  ZONA DERECHA (CONTENIDO) */}
      <div className="main-content-wrapper" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
         
         {/* HEADER UNIFICADO */}
         <Header 
            onNavigate={handleNavigation} 
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)} 
         />

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
        <div style={{ flex: '1 0 auto', width: '100%' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
        
        {/* Footer sin div extra para que el Sticky funcione bien */}
        <Footer />
        
      </AuthProvider>
    </BrowserRouter>
  );
}
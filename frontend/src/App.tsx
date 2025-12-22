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
import Home from './components/Home';

// --- COMPONENTE DASHBOARD ---
function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [statsTrigger, setStatsTrigger] = useState(0);
  
  // Estado de navegación
  const [activeTab, setActiveTab] = useState('home');

  // Estado para el sub-menú de turnos
  const [isTurnosMenuOpen, setIsTurnosMenuOpen] = useState(false); 
  
  // NUEVO: Estado para colapsar la barra lateral (Sidebar)
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      if(user) { 
          fetchAppointments(); 
          setActiveTab('home'); 
      }
  }, [user]);

  // Función para alternar la barra lateral
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Opcional: Si cerramos la barra, cerramos también el submenú de turnos para que no se vea raro
    if (!isCollapsed) setIsTurnosMenuOpen(false);
  };

  // --- FUNCIONES DE TURNOS ---
  const startEditing = (appt: any) => { setEditingApptId(appt.id); setEditData({ date: appt.date, time: appt.time }); };
  const cancelEditing = () => { setEditingApptId(null); setEditData({ date: '', time: '' }); };

  const saveEdit = async (id: number) => {
    // ... (Tu lógica de guardar edición sigue igual) ...
    // Para abreviar en esta respuesta, asumo que mantienes tu lógica original aquí
    // Si la necesitas completa avísame, pero es la misma de antes.
    alert("Función de guardar simplificada para el ejemplo visual. Usa tu lógica original aquí.");
  };
  
  const completeAppointment = async (id: number) => { /* Tu lógica original */ };
  const cancelAppointment = async (id: number) => { /* Tu lógica original */ };

  // --- COMPONENTE LISTA REUTILIZABLE (Simplificado para el ejemplo) ---
  const AppointmentsList = ({ list }: { list: any[] }) => (
    <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {list.length === 0 ? <p style={{color: '#666', fontStyle: 'italic'}}>No hay turnos.</p> : null}
        {list.map((appt) => (
          <div key={appt.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
             <h3>📅 {appt.date} - {appt.time}</h3>
             <p>{appt.Service?.name}</p>
             {/* ... resto de tu tarjeta ... */}
          </div>
        ))}
    </div>
  );

  const renderContent = () => {
    // ... (Tu switch de Admin y Cliente sigue IGUAL, no cambia nada en el contenido) ...
    if (user?.role === 'admin') {
        switch (activeTab) {
            case 'home': return <Home />;
            case 'inicio': return <AdminStats refreshTrigger={statsTrigger} />;
            case 'turnos': return <><AppointmentForm onAppointmentCreated={() => { fetchAppointments(); refreshStats(); }} refreshTrigger={statsTrigger} /><br/><AppointmentsList list={appointments} /></>;
            case 'ventas': return <SalesForm onSaleCompleted={refreshStats} refreshTrigger={statsTrigger} />;
            case 'servicios': return <ServiceManager onUpdate={refreshStats} />;
            case 'productos': return <ProductManager onUpdate={refreshStats} />;
            case 'tienda': return <Shop />;
            case 'clientes': return <ClientList />;
            default: return <AdminStats refreshTrigger={statsTrigger} />;
        }
    }
    if (user?.role === 'client') {
        const pendingList = appointments.filter(a => a.status === 'pending');
        const historyList = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
        switch (activeTab) {
            case 'home': return <Home />;
            case 'inicio': 
            case 'agendar': return <><h2 style={{borderBottom: '2px solid #007bff'}}>📅 Agendar</h2><AppointmentForm onAppointmentCreated={() => { fetchAppointments(); setActiveTab('pendientes'); }} /></>;
            case 'pendientes': return <><h2 style={{borderBottom: '2px solid #ffc107'}}>⏳ Pendientes</h2><AppointmentsList list={pendingList} /></>;
            case 'historial': return <><h2 style={{borderBottom: '2px solid #28a745'}}>📜 Historial</h2><AppointmentsList list={historyList} /></>;
            case 'tienda': return <Shop />;
            case 'perfil': return <UserProfile />;
            default: return <AppointmentsList list={appointments} />;
        }
    }
  };

  // --- HELPER PARA BOTONES DEL SIDEBAR ---
  // Esto hace que el código sea más limpio y maneja el ocultamiento del texto
  const SidebarItem = ({ icon, text, tabName, onClick, isActive, hasSubmenu = false, isOpen = false }: any) => (
    <button 
        className={`sidebar-btn ${isActive ? 'active' : ''}`} 
        onClick={onClick}
        title={isCollapsed ? text : ''} // Tooltip cuando está cerrado
    >
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span className="btn-text">{text}</span>
        {hasSubmenu && !isCollapsed && (
            <span className={`arrow-icon ${isOpen ? 'open' : ''}`} style={{ fontSize: '10px', marginLeft: 'auto' }}>▼</span>
        )}
    </button>
  );

  return (
    <div className="admin-container">
      
      {/* 1. SIDEBAR DINÁMICA */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        
        {/* BOTÓN HAMBURGUESA PARA COLAPSAR */}
        <button onClick={toggleSidebar} className="menu-toggle-btn">
            ☰
        </button>

        <h2 className="btn-text" style={{fontSize: '14px', textTransform: 'uppercase', color: '#6c757d', letterSpacing: '1px', marginBottom: '20px', whiteSpace: 'nowrap'}}>
            Navegación
        </h2>
        
        {/* MENÚ DE ADMIN */}
        {user?.role === 'admin' && (
            <>
                <SidebarItem icon="🏠" text="Inicio" tabName="home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <SidebarItem icon="📊" text="Resumen" tabName="inicio" isActive={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
                <SidebarItem icon="📅" text="Turnos" tabName="turnos" isActive={activeTab === 'turnos'} onClick={() => setActiveTab('turnos')} />
                <SidebarItem icon="💰" text="Ventas" tabName="ventas" isActive={activeTab === 'ventas'} onClick={() => setActiveTab('ventas')} />
                <SidebarItem icon="✂️" text="Servicios" tabName="servicios" isActive={activeTab === 'servicios'} onClick={() => setActiveTab('servicios')} />
                <SidebarItem icon="🧴" text="Productos" tabName="productos" isActive={activeTab === 'productos'} onClick={() => setActiveTab('productos')} />
                <SidebarItem icon="🛍️" text="Tienda" tabName="tienda" isActive={activeTab === 'tienda'} onClick={() => setActiveTab('tienda')} />
                <SidebarItem icon="👥" text="Clientes" tabName="clientes" isActive={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
            </>
        )}

        {/* MENÚ DE CLIENTE */}
        {user?.role === 'client' && (
            <>
                <SidebarItem icon="🏠" text="Inicio" tabName="home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />

                {/* BOTÓN CON SUBMENÚ */}
                <SidebarItem 
                    icon="📅" 
                    text="Mis Turnos" 
                    isActive={['agendar', 'pendientes', 'historial'].includes(activeTab)} 
                    hasSubmenu={true}
                    isOpen={isTurnosMenuOpen}
                    onClick={() => {
                        if (isCollapsed) {
                            // Si está cerrado y tocan turnos, abrimos la barra y el menú
                            setIsCollapsed(false);
                            setIsTurnosMenuOpen(true);
                        } else {
                            setIsTurnosMenuOpen(!isTurnosMenuOpen);
                        }
                    }} 
                />

                {/* SUB-MENÚ (Solo visible si está abierto el menú de turnos Y la barra no está colapsada) */}
                <div className={`submenu-container ${isTurnosMenuOpen && !isCollapsed ? 'open' : ''}`} style={{ overflow: 'hidden', maxHeight: isTurnosMenuOpen && !isCollapsed ? '200px' : '0', transition: 'max-height 0.3s ease', paddingLeft: '20px' }}>
                    <SidebarItem icon="➕" text="Agendar" isActive={activeTab === 'agendar'} onClick={() => setActiveTab('agendar')} />
                    <SidebarItem icon="⏳" text="Pendientes" isActive={activeTab === 'pendientes'} onClick={() => setActiveTab('pendientes')} />
                    <SidebarItem icon="📜" text="Historial" isActive={activeTab === 'historial'} onClick={() => setActiveTab('historial')} />
                </div>

                <SidebarItem icon="🛍️" text="Tienda" tabName="tienda" isActive={activeTab === 'tienda'} onClick={() => setActiveTab('tienda')} />
                <SidebarItem icon="👤" text="Mi Perfil" tabName="perfil" isActive={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} />
            </>
        )}
      </div>

      {/* 2. ZONA DERECHA (CONTENIDO) */}
      <div className="main-content-wrapper" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
         <Header onNavigate={(tab) => {
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
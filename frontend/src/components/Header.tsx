import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onNavigate: (tab: string) => void;
  onToggleMobileMenu: () => void; // <--- NUEVA PROP PARA EL MENÚ
}

export default function Header({ onNavigate, onToggleMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="top-header">
      
      {/* 1. IZQUIERDA: Botón de Menú (Solo visible en móvil por CSS) */}
      <button className="mobile-menu-trigger" onClick={onToggleMobileMenu}>
        ☰
      </button>

      {/* 2. CENTRO: Logo y Nombre (Botón Home) */}
      <div 
        className="header-logo" 
        onClick={() => onNavigate('home')} 
        style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }} // Centrado
      >
        <div className="header-logo">
        <img 
        src="/logoMC.png" 
        alt="Logo Mara Cabo" 
        className="header-logo-img" 
    />
        <span>Mara Cabo <strong>Estilista</strong></span>
      </div> 
      </div>

      {/* 3. DERECHA: Usuario */}
      <div 
        className="header-user-section" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="header-user-info">
          <span className="header-user-name">{user?.name}</span>
          <span className="header-user-role">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
        </div>
        <div style={{ fontSize: '20px', background: '#eee', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          👤
        </div>

        {/* Dropdown de Cerrar Sesión */}
        {showDropdown && (
          <div className="header-dropdown">
            <div className="dropdown-item danger" onClick={logout}>
              🚪 Cerrar Sesión
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
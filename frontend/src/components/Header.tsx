import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onNavigate: (tab: string) => void; // Función para cambiar de pestaña en App.tsx
}

export default function Header({ onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si haces click afuera
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleProfile = () => {
    setIsOpen(false);
    onNavigate('perfil'); // Cambiamos la pestaña a 'perfil'
  };

  return (
    <header className="top-header">
      {/* IZQUIERDA: LOGO */}
      <div className="header-logo">
        <span style={{ fontSize: '24px' }}>💇‍♂️</span>
        <span>Mara Cabo <strong>Estilista</strong></span>
      </div>

      {/* DERECHA: USUARIO + DROPDOWN */}
      <div 
        className="header-user-section" 
        onClick={() => setIsOpen(!isOpen)}
        ref={dropdownRef}
      >
        {/* Texto (Nombre y Rol) */}
        <div className="header-user-info">
          <span className="header-user-name">{user?.name}</span>
          <span className="header-user-role">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
        </div>


        {/* Flechita (Gira si está abierto) */}
        <span style={{ fontSize: '12px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>▼</span>

        {/* --- EL MENÚ DESPLEGABLE --- */}
        {isOpen && (
          <div className="header-dropdown">
            {/* Solo mostramos "Mi Perfil" si es cliente (o si quieres habilitarlo para admin también) */}
            {user?.role === 'client' && (
                <div className="dropdown-item" onClick={handleProfile}>
                  👤 Mi Perfil
                </div>
            )}
            
            <div className="dropdown-item danger" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
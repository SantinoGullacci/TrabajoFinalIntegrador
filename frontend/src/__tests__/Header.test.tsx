import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';
import { vi } from 'vitest'; // Asegúrate de importar vi
import { AuthProvider } from '../context/AuthContext'; // Probablemente necesites el contexto si el header usa useAuth
import { BrowserRouter } from 'react-router-dom';

// Mock del AuthContext si es necesario, o simplemente envolvemos en el provider real/mockeado
// Para simplificar, asumimos que tu test ya tiene el setup básico.

describe('Header Component', () => {
  it('renders correctly', () => {
    const mockNavigate = vi.fn();
    const mockToggle = vi.fn(); // <--- 1. Creamos la función falsa

    render(
      <BrowserRouter>
        <AuthProvider>
            {/* 2. Pasamos la nueva prop aquí */}
            <Header onNavigate={mockNavigate} onToggleMobileMenu={mockToggle} />
        </AuthProvider>
      </BrowserRouter>
    );

    // Tus expect...
    // expect(screen.getByText('Mara Cabo Estilista')).toBeInTheDocument();
  });

  it('calls navigation when logo is clicked', () => {
    const mockNavigate = vi.fn();
    const mockToggle = vi.fn(); // <--- 1. Creamos la función falsa

    render(
      <BrowserRouter>
        <AuthProvider>
            {/* 2. Y aquí también */}
            <Header onNavigate={mockNavigate} onToggleMobileMenu={mockToggle} />
        </AuthProvider>
      </BrowserRouter>
    );

    // fireEvent.click(...)
  });
});
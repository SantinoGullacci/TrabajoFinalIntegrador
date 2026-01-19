// src/components/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/Header';

// 1. Mockeamos el hook useAuth para simular un usuario logueado
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Juan Cliente', role: 'client' }, // Simulamos ser un cliente
    logout: vi.fn(),
  }),
}));

describe('Header Component', () => {
  it('debería mostrar el nombre del usuario y el logo', () => {
    const mockOnNavigate = vi.fn(); // Función "espía"
    render(<Header onNavigate={mockOnNavigate} />);

    expect(screen.getByText('Juan Cliente')).toBeInTheDocument();
    expect(screen.getByText(/Mara Cabo/i)).toBeInTheDocument();
  });

  it('debería abrir el menú desplegable al hacer clic', () => {
    const mockOnNavigate = vi.fn();
    render(<Header onNavigate={mockOnNavigate} />);

    // El menú "Mi Perfil" no debería estar visible al principio
    expect(screen.queryByText('👤 Mi Perfil')).not.toBeInTheDocument();

    // Hacemos clic en la sección del usuario
    const userSection = screen.getByText('Juan Cliente').closest('div');
    if (userSection) fireEvent.click(userSection);

    // Ahora sí debería aparecer
    expect(screen.getByText('👤 Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('🚪 Cerrar Sesión')).toBeInTheDocument();
  });
});
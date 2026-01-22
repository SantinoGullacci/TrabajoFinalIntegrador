import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock del AuthContext
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { name: 'Tester', role: 'admin' },
      logout: vi.fn(),
    }),
    AuthProvider: ({ children }: any) => <div>{children}</div>,
  };
});

describe('Header Component', () => {
  it('debería mostrar el logo correctamente', () => {
    const mockNavigate = vi.fn();
    const mockToggle = vi.fn(); 

    render(
      <BrowserRouter>
          <Header onNavigate={mockNavigate} onToggleMobileMenu={mockToggle} />
      </BrowserRouter>
    );

    // SOLUCIÓN: Buscamos la imagen por su texto alternativo (alt="Logo Mara Cabo")
    // Esto es más robusto que buscar texto partido en varios spans
    expect(screen.getByAltText(/Logo Mara Cabo/i)).toBeInTheDocument();

    // Opcional: También podemos verificar que aparezca la palabra "Estilista"
    expect(screen.getByText(/Estilista/i)).toBeInTheDocument();
  });
});
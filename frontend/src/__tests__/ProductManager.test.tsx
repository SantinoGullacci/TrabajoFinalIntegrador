import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductManager from '../components/ProductManager'; 

// Datos falsos para la prueba
const MOCK_PRODUCTS = [
  { id: 1, name: 'Shampoo Premium', price: 1500, stock: 10, category: 'Lavado', brand: 'Loreal' },
  { id: 2, name: 'Cera Mate', price: 800, stock: 2, category: 'Peinado', brand: 'Redken' },
];

// Creamos el mock
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('ProductManager Component', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it('debería obtener y mostrar la lista de productos', async () => {
    // Simulamos la respuesta
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => MOCK_PRODUCTS,
    });

    // Mockeamos la función onUpdate 
    const mockOnUpdate = vi.fn();
    render(<ProductManager onUpdate={mockOnUpdate} />);

    // Verificamos que aparezca el título
    expect(screen.getByText(/Administrar Productos/i)).toBeInTheDocument();

    // Esperamos a que el useEffect haga el fetch y pinte los productos
    await waitFor(() => {
      expect(screen.getByText('Shampoo Premium')).toBeInTheDocument();
      expect(screen.getByText('Cera Mate')).toBeInTheDocument();
    });

    // Verificamos el precio
    expect(screen.getByText('$1500')).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportButtons } from '../components/ExportButtons';

// Mockeamos las librerías complejas para que no rompan el test
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }: any) => <div>{children({ loading: false })}</div>,
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  StyleSheet: { create: () => ({}) },
}));

// Mockeamos las utilidades
vi.mock('../utils/exportToExcel', () => ({
  generarExcel: vi.fn(),
}));
vi.mock('../utils/reportUtils', () => ({
  procesarDatosParaReporte: (data: any) => ({ items: data, granTotal: 100 }),
}));

describe('ExportButtons Component', () => {
  it('NO debería renderizar nada si la lista de datos está vacía', () => {
    const { container } = render(<ExportButtons data={[]} />);
    // Esperamos que el div esté vacío
    expect(container).toBeEmptyDOMElement();
  });

  it('debería mostrar los botones Excel y PDF si hay datos', () => {
    const datosPrueba = [{ id: 1, name: 'Turno Prueba' }];
    render(<ExportButtons data={datosPrueba} />);

    expect(screen.getByText(/Excel/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF/i)).toBeInTheDocument();
  });
});
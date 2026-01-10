import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportePDF } from './ReportePDF'; 
import { generarExcel } from '../utils/exportToExcel';
import { procesarDatosParaReporte } from '../utils/reportUtils';

interface Props {
  data: any[]; 
  label?: string; // Para ponerle nombre al archivo (ej: "pendientes")
}

export const ExportButtons = ({ data, label = "reporte" }: Props) => {
  
  // 1. Si la lista está vacía, no mostramos los botones
  if (!data || data.length === 0) return null;

  // 2. Procesamos los datos una sola vez aquí
  const datosProcesados = procesarDatosParaReporte(data);
  const nombreArchivo = `${label}_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '15px' }}>
      
      {/* --- BOTÓN EXCEL --- */}
      <button 
        onClick={() => generarExcel(datosProcesados)}
        style={{ 
          backgroundColor: '#217346', 
          color: 'white', 
          border: 'none', 
          padding: '8px 15px', 
          borderRadius: '5px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span>📊</span> Excel
      </button>

      {/* --- BOTÓN PDF --- */}
      <PDFDownloadLink 
        document={<ReportePDF data={datosProcesados} />} 
        fileName={`${nombreArchivo}.pdf`}
      >
        {({ loading }) => (
          <button style={{ 
            backgroundColor: '#D32F2F', 
            color: 'white', 
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {loading ? 'Generando...' : '📄 PDF'}
          </button>
        )}
      </PDFDownloadLink>

    </div>
  );
};
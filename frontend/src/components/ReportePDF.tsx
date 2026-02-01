import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { DataReporte } from '../utils/reportUtils';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  header: { marginBottom: 20, borderBottom: 1, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold' },
  metaData: { fontSize: 10, color: 'gray', marginTop: 5 },
  
  // Caja de resumen
  summaryBox: { backgroundColor: '#f0f8ff', padding: 10, marginBottom: 20, borderRadius: 5 },
  summaryText: { fontSize: 12, fontWeight: 'bold' },

  // Tabla
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf' },
  tableRow: { margin: "auto", flexDirection: "row", borderBottomWidth: 1, borderColor: '#bfbfbf' },
  col1: { width: "40%", padding: 5 }, // Servicio
  col2: { width: "25%", padding: 5 }, // Fecha
  col3: { width: "15%", padding: 5 }, // Estado
  col4: { width: "20%", padding: 5, textAlign: 'right', fontWeight: 'bold' }, // Precio
});

// Componente del PDF
export const ReportePDF = ({ data }: { data: DataReporte }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.title}>Reporte de Turnos</Text>
        <Text style={styles.metaData}>Generado: {data.fechaGeneracion}</Text>
      </View>

      {/* Resumen */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>RESUMEN</Text>
        <Text>Cantidad de Turnos: {data.cantidadItems}</Text>
        <Text>Total Valorizado: ${data.granTotal}</Text>
      </View>

      {/* Tabla */}
      <View style={styles.table}>
        <View style={[styles.tableRow, { backgroundColor: '#e0e0e0', fontWeight: 'bold' }]}>
          <Text style={styles.col1}>Servicio</Text>
          <Text style={styles.col2}>Fecha</Text>
          <Text style={styles.col3}>Estado</Text>
          <Text style={styles.col4}>Precio</Text>
        </View>

        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{item.producto}</Text>
            <Text style={styles.col2}>{item.fechaFormateada}</Text>
            <Text style={styles.col3}>{item.estado}</Text>
            <Text style={styles.col4}>${item.precioUnitario}</Text>
          </View>
        ))}
      </View>

    </Page>
  </Document>
);
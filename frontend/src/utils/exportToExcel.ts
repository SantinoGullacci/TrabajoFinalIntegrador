import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { DataReporte } from './reportUtils'; // Importa la interfaz desde el archivo vecino

export const generarExcel = async (datosProcesados: DataReporte) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  // Definir columnas
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Servicio', key: 'producto', width: 30 },
    { header: 'Fecha', key: 'fechaFormateada', width: 15 },
    { header: 'Estado', key: 'estado', width: 15 },
    { header: 'Precio ($)', key: 'precioUnitario', width: 15 },
  ];

  // Agregar filas
  datosProcesados.items.forEach((item) => {
    worksheet.addRow(item);
  });

  // Agregar espacio y totales
  worksheet.addRow([]); 
  const rowResumen = worksheet.addRow(['RESUMEN', '', '', '', `Total: $${datosProcesados.granTotal}`]);
  rowResumen.font = { bold: true };

  // Generar y descargar
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Reporte_${Date.now()}.xlsx`);
};
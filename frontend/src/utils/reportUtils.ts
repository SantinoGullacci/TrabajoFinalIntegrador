// Define la estructura de un ítem individual en el reporte
export interface ItemReporte {
  id: number;
  producto: string;      
  precioUnitario: number;
  cantidad: number;
  totalLinea: number;
  fechaFormateada: string;
  estado: string;
}

// Define la estructura general del reporte (Totales + Lista de ítems)
export interface DataReporte {
  items: ItemReporte[];
  granTotal: number;
  cantidadItems: number;
  fechaGeneracion: string;
}

// ESTA FUNCIÓN CONVIERTE TUS TURNOS A FORMATO DE REPORTE
export const procesarDatosParaReporte = (turnos: any[]): DataReporte => {
  let granTotal = 0;

  const items = turnos.map(t => {
    // Si el servicio fue borrado, ponemos precio 0
    const precio = t.Service?.price || 0;
    const nombreServicio = t.Service?.name || 'Servicio Eliminado';
    
    granTotal += precio;

    return {
      id: t.id,
      producto: nombreServicio, 
      precioUnitario: precio,
      cantidad: 1, 
      totalLinea: precio,
      fechaFormateada: t.date, 
      estado: t.status
    };
  });

  return {
    items,
    granTotal,
    cantidadItems: items.length,
    fechaGeneracion: new Date().toLocaleString()
  };
};
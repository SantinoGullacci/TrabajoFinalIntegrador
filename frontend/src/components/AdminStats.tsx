import { useEffect, useState } from 'react';

interface Stats {
  money: number;
  appointments: {
    total: number;
    pending: number;
  };
  alerts: { name: string; stock: number }[];
}

// 1. Definimos la interfaz de las Props para recibir el "gatillo"
interface AdminStatsProps {
  refreshTrigger: number;
}

// 2. Recibimos la prop en la función
export default function AdminStats({ refreshTrigger }: AdminStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Esta función se ejecutará al inicio Y cada vez que 'refreshTrigger' cambie
    fetch('http://localhost:3001/reports/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, [refreshTrigger]); // <--- 3. ¡Aquí está la magia! Agregamos la dependencia

  if (!stats) return <p>Cargando estadísticas...</p>;

  const cardStyle = {
    flex: 1,
    padding: '20px',
    borderRadius: '10px',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    minWidth: '200px'
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: '10px' }}>📊 Panel de Control</h2>
      
      {/* TARJETAS SUPERIORES */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        
        {/* Tarjeta de DINERO */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)' }}>
          <h3>💰 Ingresos Totales</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
            ${stats.money.toLocaleString()}
          </p>
          <small>Ventas históricas</small>
        </div>

        {/* Tarjeta de TURNOS */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #17a2b8 0%, #117a8b 100%)' }}>
          <h3>📅 Turnos Agendados</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
            {stats.appointments.total}
          </p>
          <small>{stats.appointments.pending} pendientes de atención</small>
        </div>

        {/* Tarjeta de ALERTAS */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', color: '#333' }}>
          <h3>⚠️ Alerta Stock Bajo</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>
            {stats.alerts.length}
          </p>
          <small>Productos por agotarse</small>
        </div>
      </div>

      {/* LISTA DE PRODUCTOS EN RIESGO */}
      {stats.alerts.length > 0 && (
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>📢 Atención: Reponer Stock</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {stats.alerts.map((prod, index) => (
              <li key={index} style={{ color: '#856404' }}>
                <strong>{prod.name}</strong> (Quedan solo {prod.stock} u.)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
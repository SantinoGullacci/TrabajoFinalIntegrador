import { useState, useEffect } from 'react';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  // Estado para el formulario nuevo
  const [newService, setNewService] = useState({ name: '', price: 0, duration: 30 });

  // Cargar servicios al abrir el componente
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch('http://localhost:3001/services');
    const data = await res.json();
    setServices(data);
  };

  // Función para CREAR
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || newService.price <= 0) return alert('Datos inválidos');

    try {
      const res = await fetch('http://localhost:3001/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        alert('✅ Servicio creado');
        setNewService({ name: '', price: 0, duration: 30 }); // Limpiar form
        fetchServices(); // Recargar lista
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función para BORRAR
  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar este servicio?')) return;

    try {
      const res = await fetch(`http://localhost:3001/services/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchServices(); // Recargar lista visualmente
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa', marginBottom: '30px' }}>
      <h2>🛠️ Administrar Servicios (CRUD)</h2>
      
      {/* Formulario de Creación */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Nombre:</label>
          <input 
            type="text" 
            placeholder="Ej: Barba Premium" 
            value={newService.name}
            onChange={e => setNewService({...newService, name: e.target.value})}
            style={{ padding: '5px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Precio ($):</label>
          <input 
            type="number" 
            placeholder="5000" 
            value={newService.price}
            onChange={e => setNewService({...newService, price: Number(e.target.value)})}
            style={{ padding: '5px', width: '80px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Duración (min):</label>
          <input 
            type="number" 
            value={newService.duration}
            onChange={e => setNewService({...newService, duration: Number(e.target.value)})}
            style={{ padding: '5px', width: '60px' }}
          />
        </div>
        <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
          + Agregar
        </button>
      </form>

      {/* Lista de Servicios Existentes */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Servicio</th>
            <th style={{ padding: '8px' }}>Precio</th>
            <th style={{ padding: '8px' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{s.name}</td>
              <td style={{ padding: '8px' }}>${s.price}</td>
              <td style={{ padding: '8px' }}>
                <button 
                  onClick={() => handleDelete(s.id)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Eliminar 🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
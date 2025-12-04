import { useState, useEffect } from 'react';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({ name: '', price: 0, duration: 30 });
  
  // Estado para saber si estamos editando (null = creando, numero = editando ese ID)
  const [editingId, setEditingId] = useState<number | null>(null);

  // Cargar servicios al iniciar
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:3001/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Función única para CREAR o EDITAR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) return alert('Datos inválidos');

    try {
      let url = 'http://localhost:3001/services';
      let method = 'POST';

      // SI ESTAMOS EDITANDO, CAMBIAMOS LA URL Y EL METODO
      if (editingId !== null) {
        url = `http://localhost:3001/services/${editingId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(editingId !== null ? '✅ Servicio actualizado' : '✅ Servicio creado');
        resetForm();
        fetchServices();
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función para borrar
  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar este servicio?')) return;
    await fetch(`http://localhost:3001/services/${id}`, { method: 'DELETE' });
    fetchServices();
  };

  // Función para cargar los datos en el formulario (Modo Edición)
  const startEditing = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration
    });
  };

  // Función para cancelar edición y limpiar form
  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, duration: 30 });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa', marginBottom: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        🛠️ Administrar Servicios
        {editingId !== null && <span style={{ fontSize: '14px', color: '#e67e22' }}>(Modo Edición)</span>}
      </h2>
      
      {/* FORMULARIO HÍBRIDO (CREAR / EDITAR) */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap', background: editingId ? '#fff3cd' : 'transparent', padding: editingId ? '10px' : '0', borderRadius: '5px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Nombre:</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '5px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Precio ($):</label>
          <input 
            type="number" 
            value={formData.price}
            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            style={{ padding: '5px', width: '80px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Minutos:</label>
          <input 
            type="number" 
            value={formData.duration}
            onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
            style={{ padding: '5px', width: '60px' }}
            required
          />
        </div>

        {/* Botón Principal (Cambia de color y texto según el modo) */}
        <button type="submit" style={{ background: editingId ? '#32b119ff' : '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
          {editingId ? '✅ Guardar Cambios' : '+ Agregar'}
        </button>

        {/* Botón Cancelar (Solo aparece si estamos editando) */}
        {editingId && (
          <button type="button" onClick={resetForm} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
            Cancelar ❌
          </button>
        )}
      </form>

      {/* LISTA DE SERVICIOS */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Servicio</th>
            <th style={{ padding: '8px' }}>Precio</th>
            <th style={{ padding: '8px' }}>Duración</th>
            <th style={{ padding: '8px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd', background: editingId === s.id ? '#fff3cd' : 'transparent' }}>
              <td style={{ padding: '8px' }}>{s.name}</td>
              <td style={{ padding: '8px' }}>${s.price}</td>
              <td style={{ padding: '8px' }}>{s.duration} min</td>
              <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                
                {/* Botón EDITAR */}
                <button 
                  onClick={() => startEditing(s)}
                  style={{ background: '#07eeffff', color: 'black', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Editar
                </button>

                {/* Botón ELIMINAR */}
                <button 
                  onClick={() => handleDelete(s.id)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
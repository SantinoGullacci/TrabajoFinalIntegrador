import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

//  Recibimos onUpdate
export default function ServiceManager({ onUpdate }: { onUpdate: () => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({ name: '', price: 0, duration: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`);
      const data = await res.json();
      setServices(data);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) return alert('Datos inválidos');

    try {
      let url = `${API_URL}/services`;
      let method = 'POST';

      if (editingId !== null) {
        url = `${API_URL}/services/${editingId}`;
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
        onUpdate(); 
      } else {
        alert('Error al guardar');
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar este servicio?')) return;
    await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
    fetchServices();
    onUpdate(); 
  };

  const startEditing = (service: Service) => {
    setEditingId(service.id);
    setFormData({ name: service.name, price: service.price, duration: service.duration });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, duration: 0 });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa', marginBottom: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        🛠️ Administrar Servicios
        {editingId !== null && <span style={{ fontSize: '14px', color: '#e67e22' }}>(Modo Edición)</span>}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap', background: editingId ? '#fff3cd' : 'transparent', padding: editingId ? '10px' : '0', borderRadius: '5px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Nombre:</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '5px' }} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Precio ($):</label>
          <input type="number" className="no-spinner" value={formData.price === 0 ? '' : formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})} placeholder="0" style={{ padding: '5px', width: '80px' }} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Minutos:</label>
          <input type="number" className="no-spinner" value={formData.duration === 0 ? '' : formData.duration} onChange={e => setFormData({...formData, duration: e.target.value === '' ? 0 : Number(e.target.value)})} placeholder="30" style={{ padding: '5px', width: '60px' }} required />
        </div>

        <button type="submit" style={{ background: editingId ? '#32b119ff' : '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
          {editingId ? '✅ Guardar' : '+ Agregar'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar ❌</button>
        )}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}><th style={{padding:'8px'}}>Servicio</th><th style={{padding:'8px'}}>Precio</th><th style={{padding:'8px'}}>Duración</th><th style={{padding:'8px'}}>Acciones</th></tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd', background: editingId === s.id ? '#fff3cd' : 'transparent' }}>
              <td style={{ padding: '8px' }}>{s.name}</td>
              <td style={{ padding: '8px' }}>${s.price}</td>
              <td style={{ padding: '8px' }}>{s.duration} min</td>
              <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                <button onClick={() => startEditing(s)} style={{ background: '#07eeffff', color: 'black', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Editar</button>
                <button onClick={() => handleDelete(s.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // <--- Importamos el contexto

interface User { id: string; name: string; }
interface Service { id: number; name: string; price: number; }

export default function AppointmentForm({ onAppointmentCreated }: { onAppointmentCreated: () => void }) {
  const { user } = useAuth(); // <--- Obtenemos al usuario logueado (Josue)
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientName, setClientName] = useState(''); 
  const [serviceId, setServiceId] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // Si es ADMIN cargamos la lista de usuarios. Si es CLIENTE, no hace falta.
    if (user?.role === 'admin') {
      fetch('http://localhost:3001/users').then(res => res.json()).then(data => setUsers(data));
    }
    // Servicios los cargamos siempre
    fetch('http://localhost:3001/services').then(res => res.json()).then(data => setServices(data));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalUserId = '';

    // LÓGICA DE ROLES
    if (user?.role === 'admin') {
      // Si soy admin, busco el ID en base al nombre que escribí
      const selectedUser = users.find(u => u.name.toLowerCase() === clientName.toLowerCase());
      if (!selectedUser) return alert('Usuario no encontrado');
      finalUserId = selectedUser.id;
    } else {
      // Si soy cliente, EL ID SOY YO MISMO
      finalUserId = user?.id || '';
    }

    const newAppointment = {
      date,
      time,
      UserId: finalUserId,
      ServiceId: serviceId
    };

    // ... (El resto del fetch es igual que antes) ...
    try {
      const response = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      if (response.ok) {
        alert('✅ Turno reservado');
        onAppointmentCreated();
        setDate(''); setTime(''); setClientName('');
      } else {
        alert('Error al reservar');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#222', color: 'white' }}>
      <h3>📅 {user?.role === 'admin' ? 'Agendar Turno (Admin)' : `Hola ${user?.name}, reserva tu turno`}</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        
        {/* SOLO MOSTRAMOS EL BUSCADOR SI ES ADMIN */}
        {user?.role === 'admin' && (
          <>
            <label>Buscar Cliente:</label>
            <input list="user-options" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Buscar..." required />
            <datalist id="user-options">{users.map(u => <option key={u.id} value={u.name} />)}</datalist>
          </>
        )}

        <label>Servicio:</label>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
          <option value="">Seleccionar...</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
        </select>

        <label>Fecha:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <label>Hora:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

        <button type="submit" style={{ marginTop: '10px', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
          Confirmar Reserva
        </button>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface User { id: string; name: string; }
interface Service { id: number; name: string; price: number; }

// 1. Recibimos refreshTrigger
export default function AppointmentForm({ onAppointmentCreated, refreshTrigger = 0 }: { onAppointmentCreated: () => void, refreshTrigger?: number }) {
  const { user } = useAuth();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientName, setClientName] = useState(''); 
  const [isGuest, setIsGuest] = useState(false); 
  const [serviceId, setServiceId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // 2. Agregamos refreshTrigger al useEffect para recargar la lista de servicios
  useEffect(() => {
    if (user?.role === 'admin') {
      fetch(`${API_URL}/users`).then(res => res.json()).then(data => setUsers(data));
    }
    fetch(`${API_URL}/services`).then(res => res.json()).then(data => setServices(data));
  }, [user, refreshTrigger]); // <--- ¡AQUÍ ESTÁ LA CLAVE!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = new Date(`${date}T${time}`);
    const now = new Date();
    const day = selectedDate.getDay(); 
    const hour = parseInt(time.split(':')[0]);

    if (selectedDate < now) return alert('❌ Error: Fecha pasada.');
    if (day === 0 || day === 1) return alert('❌ Cerrado Domingos y Lunes.');
    if (hour < 9 || hour >= 18) return alert('❌ Horario de 09:00 a 18:00 hs.');

    let payload: any = { date, time, ServiceId: serviceId };

    if (user?.role === 'admin') {
      if (isGuest) {
        payload.clientName = clientName; 
        payload.UserId = null;
      } else {
        const selectedUser = users.find(u => u.name.toLowerCase() === clientName.toLowerCase());
        if (!selectedUser) return alert('Usuario no encontrado. ¿Querías usar "Cliente sin cuenta"?');
        payload.UserId = selectedUser.id;
      }
    } else {
      payload.UserId = user?.id;
    }

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('✅ Turno reservado');
        onAppointmentCreated();
        setDate(''); setTime(''); setClientName(''); setIsGuest(false);
      } else {
        const err = await response.json();
        alert('Error: ' + err.error);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#222', color: 'white' }}>
      <h3>📅 {user?.role === 'admin' ? 'Agendar Turno (Admin)' : `Hola ${user?.name}, reserva tu turno`}</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        {user?.role === 'admin' && (
          <div style={{ background: '#333', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', color: '#17a2b8' }}>
              <input type="checkbox" checked={isGuest} onChange={(e) => { setIsGuest(e.target.checked); setClientName(''); }} /> Cliente sin cuenta
            </label>
            <label>Nombre del Cliente:</label>
            {isGuest ? (
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Cliente de paso..." required style={{ padding: '8px', width: '93%' }} />
            ) : (
              <>
                <input list="user-options" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Buscar usuario..." required style={{ padding: '8px', width: '93%' }} />
                <datalist id="user-options">{users.map(u => <option key={u.id} value={u.name} />)}</datalist>
              </>
            )}
          </div>
        )}

        <label>Servicio:</label>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Seleccionar...</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
        </select>

        <label>Fecha:</label>
        <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} required style={{ padding: '8px' }} />
        <label>Hora:</label>
        <input type="time" value={time} min="09:00" max="18:00" onChange={(e) => setTime(e.target.value)} required style={{ padding: '8px' }} />

        <button type="submit" style={{ marginTop: '10px', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}>Confirmar Reserva</button>
      </form>
    </div>
  );
}
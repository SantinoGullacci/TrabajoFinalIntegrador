import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface User { id: string; name: string; }
interface Service { id: number; name: string; price: number; }

export default function AppointmentForm({ onAppointmentCreated }: { onAppointmentCreated: () => void }) {
  const { user } = useAuth();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Estados para selección de cliente
  const [clientName, setClientName] = useState(''); // Nombre para buscar O para cliente físico
  const [isGuest, setIsGuest] = useState(false); // <--- NUEVO: Checkbox estado
  
  const [serviceId, setServiceId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('http://localhost:3001/users').then(res => res.json()).then(data => setUsers(data));
    }
    fetch('http://localhost:3001/services').then(res => res.json()).then(data => setServices(data));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload: any = {
      date,
      time,
      ServiceId: serviceId
    };

    // LÓGICA: ¿Es Admin agendando?
    if (user?.role === 'admin') {
      if (isGuest) {
        // CASO 1: Cliente Físico (sin ID)
        payload.clientName = clientName; 
        payload.UserId = null;
      } else {
        // CASO 2: Cliente Registrado (buscamos su ID)
        const selectedUser = users.find(u => u.name.toLowerCase() === clientName.toLowerCase());
        if (!selectedUser) return alert('Usuario registrado no encontrado. ¿Querías usar "Cliente sin cuenta"?');
        payload.UserId = selectedUser.id;
      }
    } else {
      // CASO 3: Cliente auto-agendándose
      payload.UserId = user?.id;
    }

    try {
      const response = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('✅ Turno reservado');
        onAppointmentCreated();
        // Limpiar campos
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
        
        {/* LOGICA DE ADMIN: Buscador o Input libre */}
        {user?.role === 'admin' && (
          <div style={{ background: '#333', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', color: '#17a2b8' }}>
              <input 
                type="checkbox" 
                checked={isGuest} 
                onChange={(e) => { setIsGuest(e.target.checked); setClientName(''); }} 
              />
              Cliente sin cuenta
            </label>

            <label>Nombre del Cliente:</label>
            {isGuest ? (
              // INPUT LIBRE (Para Juan Perez que pasó por la calle)
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                placeholder="Ej: Cliente de paso..." 
                required 
                style={{ padding: '8px', width: '93%' }}
              />
            ) : (
              // BUSCADOR (Para usuarios registrados)
              <>
                <input 
                  list="user-options" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="Buscar usuario registrado..." 
                  required 
                  style={{ padding: '8px', width: '93%' }}
                />
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
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ padding: '8px' }} />
        <label>Hora:</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required style={{ padding: '8px' }} />

        <button type="submit" style={{ marginTop: '10px', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}>
          Confirmar Reserva
        </button>
      </form>
    </div>
  );
}
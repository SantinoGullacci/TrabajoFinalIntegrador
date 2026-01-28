import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

interface Service { id: number; name: string; price: number; duration: number; }
interface Appointment { date: string; time: string; Service?: { duration: number }; }
interface User { id: string; name: string; email: string; }

// Helper para convertir "HH:MM" a minutos totales
const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export default function AppointmentForm({ onAppointmentCreated, refreshTrigger }: any) {
  const { user } = useAuth();
  
  // --- ESTADOS DE DATOS ---
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Lista de usuarios para el Admin
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  
  // --- ESTADOS DEL FORMULARIO ---
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // --- ESTADOS EXCLUSIVOS DE ADMIN ---
  const [isGuest, setIsGuest] = useState(false);           // ¿Es cliente de paso?
  const [adminClientName, setAdminClientName] = useState(''); // Nombre escrito a mano
  const [adminSelectedUserId, setAdminSelectedUserId] = useState(''); // ID seleccionado del select

  const [loading, setLoading] = useState(false);

  // 1. Cargar Servicios y Usuarios (si es admin)
  useEffect(() => {
    // Cargar Servicios
    fetch(`${API_URL}/services`)
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(console.error);

    // Si es Admin, cargar lista de usuarios para el select
    if (user?.role === 'admin') {
        fetch(`${API_URL}/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(console.error);
    }
  }, [user]);

  // 2. Buscar turnos ocupados cuando cambia la fecha
  useEffect(() => {
    if (date) {
        fetch(`${API_URL}/appointments`) 
            .then(res => res.json())
            .then((data: any[]) => {
                const daysAppts = data.filter(a => a.date === date && a.status !== 'cancelled');
                setExistingAppointments(daysAppts);
            })
            .catch(console.error);
    }
  }, [date, refreshTrigger]);

  // --- GENERADOR DE HORARIOS INTELIGENTE ---
  const generateTimeSlots = () => {
    if (!selectedServiceId || !date) return [];

    const service = services.find(s => s.id === Number(selectedServiceId));
    if (!service) return [];
    
    const duration = service.duration || 30;
    const slots = [];
    
    let startMin = 9 * 60; // 09:00
    const endMin = 18 * 60; // 18:00
    const step = 30; 

    while (startMin + duration <= endMin) {
        const h = Math.floor(startMin / 60).toString().padStart(2, '0');
        const m = (startMin % 60).toString().padStart(2, '0');
        const timeString = `${h}:${m}`;
        
        const potentialStart = startMin;
        const potentialEnd = startMin + duration;

        const isOccupied = existingAppointments.some(appt => {
            const apptStart = toMinutes(appt.time);
            const apptDuration = appt.Service?.duration || 30; 
            const apptEnd = apptStart + apptDuration;
            return (potentialStart < apptEnd && potentialEnd > apptStart);
        });

        if (!isOccupied) {
            slots.push(timeString);
        }
        startMin += step;
    }
    return slots;
  };

  const availableSlots = generateTimeSlots();

  // --- GUARDAR TURNO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Debes iniciar sesión');
    if (!selectedTime) return alert('Selecciona un horario');

    // LÓGICA DE USUARIO FINAL
    let finalUserId: string | null = user.id;      // Por defecto soy yo (Cliente)
    let finalClientName: string | null = null;     // Por defecto no hay nombre manual

    // SI SOY ADMIN, SOBRESCRIBIMOS:
    if (user.role === 'admin') {
        if (isGuest) {
            // Caso 1: Admin crea turno para alguien de la calle
            if (!adminClientName.trim()) return alert('Escribe el nombre del cliente.');
            finalUserId = null; // No hay ID de usuario
            finalClientName = adminClientName;
        } else {
            // Caso 2: Admin crea turno para un usuario registrado
            if (!adminSelectedUserId) return alert('Selecciona un usuario de la lista.');
            finalUserId = adminSelectedUserId;
            finalClientName = null;
        }
    }

    const appointmentData = {
        date,
        time: selectedTime,
        ServiceId: Number(selectedServiceId),
        UserId: finalUserId,       // <--- Aquí va el ID correcto (Mío o del elegido)
        clientName: finalClientName, // <--- Aquí va el nombre manual (si aplica)
        status: 'pending'
    };

    try {
        setLoading(true);
        const res = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });

        if (res.ok) {
            alert('✅ Turno agendado con éxito');
            onAppointmentCreated();
            // Resetear formulario
            setDate(''); 
            setSelectedTime(''); 
            setSelectedServiceId('');
            setAdminClientName('');
            setAdminSelectedUserId('');
            setIsGuest(false);
        } else {
            const err = await res.json();
            alert('❌ Error: ' + (err.error || 'Horario no disponible'));
        }
    } catch (error) {
        alert('Error de conexión');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>📅 Agendar Nuevo Turno</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* --- SECCIÓN EXCLUSIVA DE ADMIN: ELEGIR CLIENTE --- */}
        {user?.role === 'admin' && (
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <label style={{ fontWeight: 'bold', color: '#d63384', display: 'block', marginBottom: '10px' }}>👤 ¿Para quién es el turno?</label>
                
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                        <input 
                            type="checkbox" 
                            checked={isGuest} 
                            onChange={(e) => { setIsGuest(e.target.checked); setAdminClientName(''); setAdminSelectedUserId(''); }} 
                        /> 
                        Es un cliente sin cuenta (Invitado)
                    </label>
                </div>

                {isGuest ? (
                    <input 
                        type="text" 
                        placeholder="Nombre del cliente..." 
                        value={adminClientName} 
                        onChange={(e) => setAdminClientName(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                ) : (
                    <select 
                        value={adminSelectedUserId} 
                        onChange={(e) => setAdminSelectedUserId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Seleccionar Cliente --</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                               👤 {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                )}
            </div>
        )}

        {/* 1. SELECCIONAR SERVICIO */}
        <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                {user?.role === 'admin' ? '2. ¿Qué se va a hacer?' : '1. ¿Qué te quieres hacer?'}
            </label>
            <select 
                value={selectedServiceId} 
                onChange={e => { setSelectedServiceId(e.target.value); setSelectedTime(''); }} 
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
                <option value="">-- Selecciona un servicio --</option>
                {services.map(s => (
                    <option key={s.id} value={s.id}>
                        {s.name} (${s.price}) - ⏱️ {s.duration || 30} min
                    </option>
                ))}
            </select>
        </div>

        {/* 2. SELECCIONAR FECHA */}
        <div style={{ opacity: selectedServiceId ? 1 : 0.5, pointerEvents: selectedServiceId ? 'auto' : 'none' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                {user?.role === 'admin' ? '3. Elige el día' : '2. Elige el día'}
            </label>
            <input 
                type="date" 
                value={date} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={e => { setDate(e.target.value); setSelectedTime(''); }} 
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
        </div>

        {/* 3. GRILLA DE HORARIOS */}
        {date && selectedServiceId && (
            <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Horarios Disponibles ({availableSlots.length})</label>
                
                {availableSlots.length === 0 ? (
                    <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '5px', textAlign: 'center' }}>
                        🚫 No hay turnos disponibles.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '5px' }}>
                        {availableSlots.map(time => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => setSelectedTime(time)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: selectedTime === time ? '2px solid #007bff' : '1px solid #ddd',
                                    background: selectedTime === time ? '#e7f1ff' : 'white',
                                    color: selectedTime === time ? '#007bff' : '#333',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* RESUMEN Y BOTÓN */}
        {selectedTime && (
            <div style={{ marginTop: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                    Agendando <strong>{services.find(s => s.id === Number(selectedServiceId))?.name}</strong><br/>
                    el <strong>{date.split('-').reverse().join('/')}</strong> a las <strong>{selectedTime} hs</strong>.
                </p>
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', marginTop: '15px', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
                >
                    {loading ? 'Confirmando...' : '✅ Confirmar Turno'}
                </button>
            </div>
        )}

      </form>
    </div>
  );
}
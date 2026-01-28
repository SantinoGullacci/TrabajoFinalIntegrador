import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

interface Service { id: number; name: string; price: number; duration: number; }
interface Appointment { date: string; time: string; Service?: { duration: number }; }

// Helper para convertir "HH:MM" a minutos totales (para comparar fácil)
const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export default function AppointmentForm({ onAppointmentCreated, refreshTrigger }: any) {
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Aquí guardamos los turnos QUE YA EXISTEN ese día para calcular huecos
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  
  const [loading, setLoading] = useState(false);

  // 1. Cargar Servicios
  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(console.error);
  }, []);

  // 2. Cuando cambia la FECHA, buscamos los turnos ocupados de ese día
  useEffect(() => {
    if (date) {
        // Pedimos TODOS los turnos (sin filtrar por usuario) para ver ocupación
        // NOTA: Tu backend debe permitir esto o crear una ruta específica pública de disponibilidad
        fetch(`${API_URL}/appointments`) 
            .then(res => res.json())
            .then((data: any[]) => {
                // Filtramos solo los de la fecha seleccionada y que no estén cancelados
                const daysAppts = data.filter(a => a.date === date && a.status !== 'cancelled');
                setExistingAppointments(daysAppts);
            })
            .catch(console.error);
    }
  }, [date, refreshTrigger]);

  // --- GENERADOR DE HORARIOS DISPONIBLES ---
  const generateTimeSlots = () => {
    if (!selectedServiceId || !date) return [];

    const service = services.find(s => s.id === Number(selectedServiceId));
    if (!service) return [];
    
    const duration = service.duration || 30; // Duración del servicio elegido
    const slots = [];
    
    // Configuración: Horario de 9:00 a 18:00, intervalos de 30 mins (o 15 si prefieres)
    let startMin = 9 * 60; // 09:00
    const endMin = 18 * 60; // 18:00
    const step = 30; // <--- CAMBIA ESTO A 15 O 5 SI QUIERES MÁS PRECISIÓN

    while (startMin + duration <= endMin) {
        // Convertimos minutos actuales a "HH:MM"
        const h = Math.floor(startMin / 60).toString().padStart(2, '0');
        const m = (startMin % 60).toString().padStart(2, '0');
        const timeString = `${h}:${m}`;
        
        // Calculamos fin del turno potencial
        const potentialStart = startMin;
        const potentialEnd = startMin + duration;

        // VERIFICAMOS SI CHOCA CON ALGÚN TURNO EXISTENTE
        const isOccupied = existingAppointments.some(appt => {
            const apptStart = toMinutes(appt.time);
            // Si el turno existente no tiene servicio asociado, asumimos 30 min por seguridad
            const apptDuration = appt.Service?.duration || 30; 
            const apptEnd = apptStart + apptDuration;

            // Lógica de colisión: (NuevoInicio < ViejoFin) Y (NuevoFin > ViejoInicio)
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

    const appointmentData = {
        date,
        time: selectedTime,
        ServiceId: Number(selectedServiceId),
        UserId: user.id, // Si eres admin y quieres agendar para otro, esto cambia (ver SalesForm)
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
            setDate(''); setSelectedTime(''); setSelectedServiceId('');
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
        
        {/* 1. SELECCIONAR SERVICIO */}
        <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>1. ¿Qué te quieres hacer?</label>
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
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>2. Elige el día</label>
            <input 
                type="date" 
                value={date} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={e => { setDate(e.target.value); setSelectedTime(''); }} 
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
        </div>

        {/* 3. GRILLA DE HORARIOS (Súper Estética) */}
        {date && selectedServiceId && (
            <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>3. Horarios Disponibles ({availableSlots.length})</label>
                
                {availableSlots.length === 0 ? (
                    <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '5px', textAlign: 'center' }}>
                        🚫 No hay turnos disponibles para este día. Intenta otra fecha.
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
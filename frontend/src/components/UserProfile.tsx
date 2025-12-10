import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user, login } = useAuth(); 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos actuales
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch('http://localhost:3001/users')
        .then(res => {
            if (!res.ok) throw new Error('No se pudo conectar al servidor');
            return res.json();
        })
        .then((users: any[]) => {
            // Buscamos nuestro usuario en la lista
            const myUser = users.find(u => u.id === user.id);
            if (myUser) {
                setFormData({
                    name: myUser.name || '',
                    email: myUser.email || '',
                    phone: myUser.phone || ''
                });
            } else {
                // Fallback: Si no nos encontramos en la lista, usamos los datos del contexto
                setFormData({
                    name: user.name,
                    email: '', // El contexto a veces no tiene el mail, cuidado ahí
                    phone: ''
                });
            }
        })
        .catch(err => {
            console.error(err);
            setError('No se pudieron cargar los datos frescos.');
            // En caso de error, intentamos mostrar lo que tenemos en memoria
            setFormData(prev => ({...prev, name: user.name }));
        })
        .finally(() => {
            // ESTO ES LO QUE FALTABA: Terminar la carga sí o sí
            setLoading(false);
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: formData.phone })
      });

      if (res.ok) {
        alert('✅ Perfil actualizado');
        // Actualizamos el contexto
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            login(currentToken, { ...user, name: formData.name });
        }
      } else {
        alert('Error al actualizar');
      }
    } catch (error) { alert('Error de conexión'); }
  };

  if (loading) return <div style={{padding: 20}}>Cargando perfil...</div>;

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', maxWidth: '500px' }}>
      <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>👤 Mi Perfil</h2>
      
      {error && <p style={{color: 'red', fontSize: '14px'}}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email (No modificable):</label>
            <input 
                type="email" 
                value={formData.email} 
                disabled 
                style={{ width: '100%', background: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }} 
            />
        </div>

        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo:</label>
            <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%' }}
                required
            />
        </div>

        <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono:</label>
            <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="Ej: 11 1234 5678"
                style={{ width: '100%' }}
            />
        </div>

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            💾 Guardar Cambios
        </button>

      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function UserProfile() {
  const { user, login } = useAuth(); 
  
  // Datos Personales
  const [formData, setFormData] = useState({ 
      name: user?.name || '', 
      email: user?.email || '', 
      phone: ''
  });

  // Cambio de Contraseña
  const [passData, setPassData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch('${API_URL}/users')
        .then(res => res.json())
        .then((users: UserData[]) => {
            const myUser = users.find(u => u.id === user.id);
            if (myUser) {
                setFormData({
                    name: myUser.name || '',
                    email: myUser.email || user.email || '',
                    phone: myUser.phone || ''
                });
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Guardar Perfil (Nombre/Teléfono)
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: formData.phone })
      });

      if (res.ok) {
        alert('✅ Perfil actualizado');
        const currentToken = localStorage.getItem('token');
        if (currentToken) login(currentToken, { ...user, name: formData.name });
      } else {
        alert('Error al actualizar');
      }
    } catch (error) { alert('Error de conexión'); }
  };

  // Guardar Password
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (passData.newPassword !== passData.confirmPassword) return alert('❌ Las contraseñas no coinciden');
    if (passData.newPassword.length < 6) return alert('❌ Mínimo 6 caracteres');

    try {
        const res = await fetch(`${API_URL}/auth/change-password/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            })
        });
        const data = await res.json();

        if (res.ok) {
            alert('✅ Contraseña cambiada con éxito');
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) { alert('Error de conexión'); }
  };

  if (loading && !formData.email) return <div style={{padding: 20}}>Cargando perfil...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* TARJETA 1: DATOS PERSONALES */}
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>👤 Datos Personales</h2>
        
        <form onSubmit={handleSubmitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email (No modificable):</label>
                <input type="email" value={formData.email} readOnly style={{ width: '100%', background: '#e9ecef', color: '#6c757d' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre:</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} required />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono:</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%' }} />
                </div>
            </div>

            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                💾 Guardar Datos
            </button>
        </form>
      </div>

      {/* TARJETA 2: SEGURIDAD */}
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0, color: '#dc3545' }}>🔐 Seguridad</h2>
        <form onSubmit={handleSubmitPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña Actual:</label>
                <input type="password" value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} style={{ width: '100%' }} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Nueva Contraseña:</label>
                    <input type="password" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} style={{ width: '100%' }} required />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Repetir Nueva:</label>
                    <input type="password" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} style={{ width: '100%' }} required />
                </div>
            </div>
            <button type="submit" style={{ padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                🔄 Actualizar Contraseña
            </button>
        </form>
      </div>
    </div>
  );
}
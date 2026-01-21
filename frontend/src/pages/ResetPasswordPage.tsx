import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', securityAnswer: '', newPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('${API_URL}/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('✅ ¡Contraseña cambiada! Ahora inicia sesión con la nueva clave.');
        navigate('/login');
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) { alert('Error de conexión'); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Segoe UI, sans-serif', background: '#f0f2f5' }}>
      <form onSubmit={handleSubmit} style={{ padding: '40px', border: 'none', borderRadius: '10px', width: '350px', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>🔑 Recuperar Acceso</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px', textAlign: 'center' }}>
          Responde la pregunta de seguridad para validar tu identidad.
        </p>

        <label style={{fontSize: '13px', fontWeight: '600', color: '#444'}}>Email registrado:</label>
        <input 
            type="email" 
            placeholder="juan@ejemplo.com" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '15px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />

        {/* AQUÍ ESTÁ EL CAMBIO CLAVE */}
        <label style={{fontSize: '13px', fontWeight: '600', color: '#444'}}>¿Nombre de tu primera mascota?</label>
        <input 
            type="text" 
            placeholder="Ej: Rex" 
            onChange={e => setFormData({...formData, securityAnswer: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '15px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />

        <label style={{fontSize: '13px', fontWeight: '600', color: '#444'}}>Nueva Contraseña:</label>
        <input 
            type="password" 
            placeholder="******" 
            onChange={e => setFormData({...formData, newPassword: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '25px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
          Restablecer Contraseña
        </button>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '14px', color: '#007bff', textDecoration: 'none' }}>Volver al Login</Link>
        </div>
      </form>
    </div>
  );
}
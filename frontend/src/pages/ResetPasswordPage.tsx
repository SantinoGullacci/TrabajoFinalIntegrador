import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

// --- ICONOS SVG ---
const EyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', securityAnswer: '', newPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
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

        <label style={{fontSize: '13px', fontWeight: '600', color: '#444'}}>¿Nombre de tu primera mascota?</label>
        <input 
            type="text" 
            placeholder="Ej: Rex" 
            onChange={e => setFormData({...formData, securityAnswer: e.target.value})} 
            required 
            style={{ width: '100%', padding: '10px', marginBottom: '15px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />

        <label style={{fontSize: '13px', fontWeight: '600', color: '#444'}}>Nueva Contraseña:</label>
        <div style={{ position: 'relative', marginBottom: '25px', marginTop: '5px' }}>
            <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="******" 
                onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                required 
                style={{ width: '100%', padding: '10px', paddingRight: '40px', border: '1px solid #ddd', borderRadius: '5px' }} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#666'
              }}
            >
              {showPassword ? EyeOffIcon : EyeIcon}
            </button>
        </div>

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
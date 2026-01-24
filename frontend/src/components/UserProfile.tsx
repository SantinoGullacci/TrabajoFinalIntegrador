import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

// --- ICONOS SVG ---
const EyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export default function UserProfile() {
  const { user, login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('Password')) {
      setPasswords({ ...passwords, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' });
        const token = localStorage.getItem('token');
        if (user && token) {
            const updatedUser = { ...user, name: formData.name, phone: formData.phone };
            login(token, updatedUser as any); 
        }
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
      return;
    }
    if (!passwords.currentPassword) {
      setMessage({ type: 'error', text: 'Debes ingresar tu contraseña actual' });
      return;
    }

    try {
      const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, password: passwords.currentPassword })
      });

      if (!loginRes.ok) {
        setMessage({ type: 'error', text: 'Tu contraseña actual es incorrecta' });
        return;
      }

      const updateRes = await fetch(`${API_URL}/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwords.newPassword })
      });

      if (updateRes.ok) {
        setMessage({ type: 'success', text: '✅ Contraseña cambiada con éxito' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#666', zIndex: 2
  };
  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', paddingRight: '40px'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '15px', marginBottom: '25px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
        👤 Mi Perfil
      </h2>

      {message.text && (
        <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}` }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* MIS DATOS */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#007bff', marginBottom: '20px' }}>📝 Mis Datos Personales</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nombre Completo:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email:</label>
              <input type="email" name="email" value={formData.email} disabled style={{ ...inputStyle, backgroundColor: '#e9ecef', cursor: 'not-allowed' }} title="El email no se puede cambiar" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Teléfono:</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <button type="submit" style={{ marginTop: '10px', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* CAMBIAR CONTRASEÑA */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>🔒 Cambiar Contraseña</h3>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Contraseña Actual:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  required={passwords.newPassword !== ''}
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={eyeButtonStyle}>
                  {showCurrentPassword ? EyeOffIcon : EyeIcon}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nueva Contraseña:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={eyeButtonStyle}>
                  {showNewPassword ? EyeOffIcon : EyeIcon}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Confirmar Nueva Contraseña:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  required={passwords.newPassword !== ''}
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeButtonStyle}>
                  {showConfirmPassword ? EyeOffIcon : EyeIcon}
                </button>
              </div>
            </div>
            <button type="submit" style={{ marginTop: '10px', padding: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
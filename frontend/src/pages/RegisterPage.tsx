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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    securityAnswer: '' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('✅ ¡Cuenta creada! Ahora inicia sesión.');
        navigate('/login');
      } else {
        alert(data.error || 'Error al registrarse');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <form onSubmit={handleSubmit} style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '8px', width: '350px', background: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center' }}>📝 Crear Cuenta</h2>
        
        <input name="name" placeholder="Nombre Completo" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />
        
        {/* Campo Password con Ojito */}
        <div style={{ position: 'relative', margin: '10px 0' }}>
            <input 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Contraseña" 
                onChange={handleChange} 
                required 
                style={{ display: 'block', width: '100%', padding: '10px', paddingRight: '40px' }} 
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

        <input name="phone" placeholder="Teléfono" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />

        <div style={{ marginTop: '15px', marginBottom: '20px', background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>
            🔒 Pregunta de Seguridad (Para recuperar cuenta):
          </label>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>
            ¿Cuál fue el nombre de tu primera mascota? 🐶🐱
          </label>
          <input name="securityAnswer" placeholder="Ej: Firulais" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ced4da', borderRadius: '5px' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          Registrarse
        </button>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión aquí</Link>
        </p>
      </form>
    </div>
  );
}
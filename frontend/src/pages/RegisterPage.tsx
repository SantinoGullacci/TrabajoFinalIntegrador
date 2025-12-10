import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // 1. Agregamos securityAnswer al estado
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
      const response = await fetch('http://localhost:3001/register', {
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
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />
        <input name="phone" placeholder="Teléfono" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />

        {/* --- NUEVA SECCIÓN: PREGUNTA DE SEGURIDAD --- */}
        <div style={{ marginTop: '15px', marginBottom: '20px', background: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>
            🔒 Pregunta de Seguridad (Para recuperar cuenta):
          </label>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>
            ¿Cuál fue el nombre de tu primera mascota? 🐶🐱
          </label>
          <input 
            name="securityAnswer" 
            placeholder="Ej: Firulais" 
            onChange={handleChange} 
            required 
            style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0', border: '1px solid #ced4da', borderRadius: '5px' }} 
          />
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
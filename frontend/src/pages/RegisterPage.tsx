import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Usamos Link para navegar

export default function RegisterPage() {
  const navigate = useNavigate(); // Hook para redirigir al usuario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
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
        navigate('/login'); // Lo mandamos al login para que entre
      } else {
        alert(data.error || 'Error al registrarse');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <form onSubmit={handleSubmit} style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '8px', width: '350px', background: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center' }}>📝 Crear Cuenta</h2>
        
        <input name="name" placeholder="Nombre Completo" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} required style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />
        <input name="phone" placeholder="Teléfono" onChange={handleChange} style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }} />

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
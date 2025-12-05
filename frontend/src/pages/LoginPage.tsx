import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Esta función se ejecuta al hacer click en "Entrar" O al apretar "Enter"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue sola
    
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/'); // Te manda al Dashboard
      } else {
        alert(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      {/* CLAVE: Usar la etiqueta <form onSubmit={handleSubmit}> 
         hace que la tecla ENTER dispare el evento automáticamente.
      */}
      <form onSubmit={handleSubmit} style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '8px', width: '300px', background: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center' }}>🔐 Iniciar Sesión</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required 
            autoFocus // Ponemos el cursor aquí al cargar la página
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required 
          />
        </div>

        {/* El type="submit" es el que conecta el Enter con el formulario */}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Entrar
        </button>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          ¿Eres nuevo? <Link to="/register">Crea tu cuenta aquí</Link>
        </p>
      </form>
    </div>
  );
}
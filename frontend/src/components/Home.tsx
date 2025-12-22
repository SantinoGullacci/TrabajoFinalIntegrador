import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// INFO POR DEFECTO (Se muestra mientras carga)
const DEFAULT_INFO = {
  name: "Mara Cabo Estilista",
  description: "Cargando descripción...",
  phone: "...",
  hours: "...",
  address: "..."
};

export default function Home() {
  const { user } = useAuth();
  
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [isEditing, setIsEditing] = useState(false);

  // 1. CARGAR DATOS (GET)
  useEffect(() => {
    fetch('http://localhost:3001/businessInfo')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setInfo(data);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. GUARDAR CAMBIOS (PUT)
  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:3001/businessInfo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      });
      if (res.ok) {
        setIsEditing(false);
        alert('✅ Información actualizada para todos');
      } else {
        alert('❌ Error al guardar');
      }
    } catch (error) {
      alert('❌ Error de conexión');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
{/* CABECERA (NOMBRE FIJO - NO EDITABLE) */}
      <div style={{ 
        
        // CAMBIO AQUÍ: Aumentamos el padding vertical (antes era solo '40px')
        // Probamos con 100px arriba/abajo y 20px a los lados.
        // Puedes aumentar el 100px si aún necesitas ver más imagen.
        padding: '100px 20px', 
        
        textAlign: 'center',
        marginBottom: '30px',
        // Imagen de fondo
        backgroundImage: 'url("/bannerMC.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* ... título h1 ... */}
      </div>

      {/* BOTONERA ADMIN */}
      {user?.role === 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          {isEditing ? (
            <>
              <button onClick={handleSave} style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>💾 Guardar Cambios</button>
              <button onClick={() => setIsEditing(false)} style={{ background: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>❌ Cancelar</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{ background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✏️ Modo Edición</button>
          )}
        </div>
      )}

      {/* TARJETAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* DESCRIPCIÓN (Editable) */}
        <div style={cardStyle}>
          <h3>💈 Sobre Nosotros</h3>
          {isEditing ? (
            <textarea name="description" value={info.description} onChange={handleChange} rows={4} style={{ width: '100%', padding: '10px' }} />
          ) : (
            <p style={{ lineHeight: '1.6', color: '#555' }}>{info.description}</p>
          )}
        </div>

        {/* CONTACTO (Editable) */}
        <div style={cardStyle}>
          <h3>📞 Contacto & 🕒 Horarios</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Teléfono:</strong>
            {isEditing ? <input type="text" name="phone" value={info.phone} onChange={handleChange} style={inputStyle} /> : <span style={{ marginLeft: '10px' }}>{info.phone}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Dirección:</strong>
            {isEditing ? <input type="text" name="address" value={info.address} onChange={handleChange} style={inputStyle} /> : <span style={{ marginLeft: '10px' }}>{info.address}</span>}
          </div>

          <div>
            <strong>Horarios de Atención:</strong>
            {isEditing ? <input type="text" name="hours" value={info.hours} onChange={handleChange} style={inputStyle} /> : <div style={{ background: '#e9ecef', padding: '10px', borderRadius: '5px', marginTop: '5px', fontWeight: 'bold' }}>{info.hours}</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

const cardStyle = { background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderTop: '4px solid #333' };
const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' };
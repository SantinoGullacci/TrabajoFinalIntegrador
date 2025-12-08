import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
}

export default function ClientList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando clientes...</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', marginBottom: '30px' }}>
      <h2 style={{ borderLeft: '5px solid #6c757d', paddingLeft: '10px' }}>👥 Listado de Usuarios Registrados</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ background: '#343a40', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Teléfono</th>
              <th style={{ padding: '10px' }}>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
                <td style={{ padding: '10px' }}>{u.email}</td>
                <td style={{ padding: '10px' }}>{u.phone || '-'}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    background: u.role === 'admin' ? '#ffc107' : '#e2e6ea', 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: u.role === 'admin' ? '#333' : '#666'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
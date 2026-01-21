import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
}

export default function ClientList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para el usuario que se está editando (Si es null, el modal está cerrado)
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = () => {
    fetch('${API_URL}/users')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- FUNCIÓN BAJA (DELETE) ---
  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ ¿Estás seguro de eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('✅ Usuario eliminado');
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert('❌ Error al eliminar');
      }
    } catch (error) { alert('Error de conexión'); }
  };

  // --- FUNCIÓN MODIFICACIÓN (UPDATE) ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: editingUser.name,
            phone: editingUser.phone,
            role: editingUser.role // Enviamos el rol modificado
        })
      });

      if (res.ok) {
        alert('✅ Usuario actualizado');
        setEditingUser(null); // Cerramos el modal
        fetchUsers(); // Recargamos la lista
      } else {
        alert('❌ Error al actualizar');
      }
    } catch (error) { alert('Error de conexión'); }
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', marginBottom: '30px' }}>
      <h2 style={{ borderLeft: '5px solid #007bff', paddingLeft: '10px', color: '#333' }}>
        👥 Lista de Usuarios
      </h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', color: '#333', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px' }}>Nombre</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Teléfono</th>
              <th style={{ padding: '12px' }}>Rol</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name}</td>
                <td style={{ padding: '10px', color: '#666' }}>{u.email}</td>
                <td style={{ padding: '10px' }}>{u.phone || '-'}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    background: u.role === 'admin' ? '#fff3cd' : '#d1e7dd', 
                    color: u.role === 'admin' ? '#856404' : '#0f5132',
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    
                    {/* BOTÓN EDITAR (LÁPIZ) */}
                    <button 
                      onClick={() => setEditingUser(u)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                      title="Editar"
                    >
                      ✏️
                    </button>

                    {/* BOTÓN ELIMINAR (BASURA) */}
                    <button 
                      onClick={() => handleDelete(u.id)}
                      disabled={u.id === currentUser?.id}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer', 
                        fontSize: '18px',
                        opacity: u.id === currentUser?.id ? 0.3 : 1
                      }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>✏️ Editar Usuario</h3>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre:</label>
                <input 
                  type="text" 
                  value={editingUser.name} 
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email (No editable):</label>
                <input 
                  type="text" 
                  value={editingUser.email} 
                  disabled
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#e9ecef' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Teléfono:</label>
                <input 
                  type="text" 
                  value={editingUser.phone} 
                  onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Rol:</label>
                <select 
                  value={editingUser.role} 
                  onChange={e => setEditingUser({...editingUser, role: e.target.value as 'admin' | 'client'})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar</button>
                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
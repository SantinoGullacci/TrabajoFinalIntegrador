import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'client';
  notes?: string; // <--- NUEVO CAMPO
}

export default function ClientList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para edición normal (Nombre/Rol)
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- ESTADOS PARA LA FICHA TÉCNICA ---
  const [notesUser, setNotesUser] = useState<User | null>(null); // Usuario cuya ficha estamos viendo
  const [currentNotes, setCurrentNotes] = useState(''); // El texto de la nota

  const fetchUsers = () => {
    fetch(`${API_URL}/users`)
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

  // --- FUNCIÓN MODIFICACIÓN DATOS (UPDATE) ---
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
            role: editingUser.role
        })
      });

      if (res.ok) {
        alert('✅ Usuario actualizado');
        setEditingUser(null);
        fetchUsers();
      } else {
        alert('❌ Error al actualizar');
      }
    } catch (error) { alert('Error de conexión'); }
  };

  // --- ABRIR MODAL DE NOTAS ---
  const openNotesModal = (user: User) => {
    setNotesUser(user);
    setCurrentNotes(user.notes || ''); // Cargar notas existentes o vacío
  };

  // --- GUARDAR NOTAS (FICHA) ---
  const handleSaveNotes = async () => {
    if (!notesUser) return;
    try {
        const res = await fetch(`${API_URL}/users/${notesUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: currentNotes }) // Solo enviamos la nota
        });

        if (res.ok) {
            alert('✅ Ficha técnica actualizada');
            setNotesUser(null); // Cerrar modal
            fetchUsers(); // Recargar para ver los cambios
        } else {
            alert('❌ Error al guardar la ficha');
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
              {/* COLUMNA FICHA (Solo Admins) */}
              {currentUser?.role === 'admin' && <th style={{ padding: '12px', textAlign: 'center' }}>Ficha</th>}
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
                
                {/* BOTÓN FICHA (Solo Admins) */}
                {currentUser?.role === 'admin' && (
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button 
                            onClick={() => openNotesModal(u)}
                            style={{ 
                                background: '#e7f1ff', color: '#007bff', border: '1px solid #b6d4fe', 
                                padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px',
                                display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto'
                            }}
                            title="Ver Ficha Técnica"
                        >
                            📋 {u.notes ? 'Ver' : 'Crear'}
                        </button>
                    </td>
                )}

                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => setEditingUser(u)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                      title="Editar Datos"
                    >
                      ✏️
                    </button>

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

      {/* --- MODAL 1: EDICIÓN DE DATOS --- */}
      {editingUser && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>✏️ Editar Usuario</h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre:</label>
                <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email (No editable):</label>
                <input type="text" value={editingUser.email} disabled style={{ ...inputStyle, background: '#e9ecef' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Teléfono:</label>
                <input type="text" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Rol:</label>
                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as 'admin' | 'client'})} style={inputStyle}>
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ ...btnStyle, background: '#007bff' }}>Guardar</button>
                <button type="button" onClick={() => setEditingUser(null)} style={{ ...btnStyle, background: '#6c757d' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: FICHA TÉCNICA (NOTAS) --- */}
      {notesUser && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '500px' }}>
            <h3 style={{ marginTop: 0, color: '#007bff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📋 Ficha Técnica: <span style={{color: '#333', fontSize: '18px'}}>{notesUser.name}</span>
            </h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                Espacio reservado para notas sobre tinturas, cortes, alergias o preferencias del cliente.
            </p>
            
            <textarea 
                value={currentNotes} 
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Escribe aquí las notas del cliente..."
                rows={10}
                style={{ 
                    width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', 
                    fontFamily: 'sans-serif', resize: 'vertical', marginBottom: '15px'
                }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setNotesUser(null)} style={{ ...btnStyle, background: '#6c757d' }}>Cerrar</button>
                <button onClick={handleSaveNotes} style={{ ...btnStyle, background: '#28a745' }}>💾 Guardar Ficha</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ESTILOS COMPARTIDOS
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  background: 'white', padding: '25px', borderRadius: '8px', width: '400px', 
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto'
};

const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };
const btnStyle = { flex: 1, padding: '10px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
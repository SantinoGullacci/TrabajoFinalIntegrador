import { useState, useEffect } from 'react';
import { API_URL } from '../config';

// Agregamos email y role a la interfaz para mostrar más info en el select
interface User { id: string; name: string; email?: string; role?: string; }
interface Product { id: number; name: string; price: number; stock: number; }

export default function SalesForm({ onSaleCompleted, refreshTrigger }: { onSaleCompleted: () => void, refreshTrigger: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // ESTADOS PARA LA SELECCIÓN DE USUARIO
  const [selectedUserId, setSelectedUserId] = useState<string>(''); // Guardará el ID o "guest"
  const [guestName, setGuestName] = useState(''); // Solo se usa si es guest

  // ESTADOS DEL PRODUCTO
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // 1. Cargar Usuarios y filtrar solo los clientes
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Intentamos filtrar por rol, si no tiene rol, mostramos todos
          const clients = data.filter((u: any) => u.role === 'client' || !u.role);
          setUsers(clients);
        }
      });

    // 2. Cargar Productos
    fetch(`${API_URL}/products`).then(res => res.json()).then(data => setProducts(data));
  }, [refreshTrigger]);

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!selectedUserId) return alert("Por favor selecciona un cliente.");

    let finalUserId = null;
    let finalClientName = null;

    // LÓGICA CRUCIAL PARA EL HISTORIAL
    if (selectedUserId === 'guest') {
       // Si es invitado, mandamos nombre pero userId null
       if (!guestName.trim()) return alert("Escribe el nombre del cliente de paso.");
       finalClientName = guestName;
       finalUserId = null;
    } else {
       // Si es registrado, MANDAMOS SU ID (Esto hace que aparezca en su historial)
       finalUserId = selectedUserId;
       // Opcional: mandamos el nombre también por si acaso, pero el ID es lo que importa
       const userObj = users.find(u => u.id === selectedUserId);
       finalClientName = userObj?.name;
    }

    const orderData = {
      userId: finalUserId,       // <--- AQUÍ ESTÁ LA MAGIA
      clientName: finalClientName,
      total,
      items: [{ productId: selectedProduct.id, quantity, price: selectedProduct.price }]
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('✅ Venta registrada con éxito');
        onSaleCompleted(); 
        // Resetear formulario
        setGuestName(''); 
        setSelectedUserId(''); 
        setQuantity(1); 
        setSelectedProductId('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) { alert('Error de conexión'); }
  };

  return (
    <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#222', color: 'white' }}>
      <h3>🛒 Asignar Venta (Admin)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        
        {/* SECCIÓN DE CLIENTE MEJORADA */}
        <div style={{ background: '#333', padding: '15px', borderRadius: '5px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#17a2b8', fontWeight: 'bold' }}>
                1. ¿A quién le vendes?
            </label>
            
            <select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
            >
                <option value="">-- Seleccionar Cliente --</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>
                        👤 {u.name} {u.email ? `(${u.email})` : ''}
                    </option>
                ))}
                <option value="guest">⚡ Cliente de paso (Sin cuenta)</option>
            </select>

            {/* Solo aparece si eliges "Cliente de paso" */}
            {selectedUserId === 'guest' && (
                <input 
                    type="text" 
                    value={guestName} 
                    onChange={(e) => setGuestName(e.target.value)} 
                    placeholder="Escribe el nombre del cliente..." 
                    required 
                    style={{ padding: '10px', width: '94%', border: '1px solid #17a2b8' }} 
                />
            )}
        </div>

        {/* SECCIÓN DE PRODUCTO */}
        <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>2. Producto:</label>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required style={{ padding: '10px', width: '100%' }}>
            <option value="">Seleccionar...</option>
            {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} (${p.price}) - Stock: {p.stock}</option>
            ))}
            </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <label>Cantidad:</label>
                <input type="number" min="1" max={selectedProduct?.stock || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required style={{ padding: '10px', width: '100%' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
                <label>Total:</label>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#4CAF50' }}>${total.toLocaleString()}</div>
            </div>
        </div>

        <button type="submit" style={{ marginTop: '10px', padding: '12px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', fontWeight: 'bold' }}>
            Confirmar Venta
        </button>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

// Interfaces
interface User { id: string; name: string; email?: string; role?: string; }
interface Product { id: number; name: string; price: number; stock: number; }

export default function SalesForm({ onSaleCompleted, refreshTrigger }: { onSaleCompleted: () => void, refreshTrigger: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // ESTADOS FORMULARIO
  const [isGuest, setIsGuest] = useState(false); 
  const [selectedUserId, setSelectedUserId] = useState<string>(''); 
  const [guestName, setGuestName] = useState('');
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //  Cargar Usuarios 
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const clients = data.filter((u: any) => u.role === 'client' || !u.role);
          setUsers(clients);
        }
      });

    // Cargar Productos
    fetch(`${API_URL}/products`).then(res => res.json()).then(data => setProducts(data));
  }, [refreshTrigger]);

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let finalUserId = null;
    let finalClientName = null;

    if (isGuest) {
       // Caso Invitado
       if (!guestName.trim()) return alert("Escribe el nombre del cliente de paso.");
       finalClientName = guestName;
       finalUserId = null;
    } else {
       // Caso Registrado
       if (!selectedUserId) return alert("Por favor selecciona un cliente de la lista.");
       finalUserId = selectedUserId;
       const userObj = users.find(u => u.id === selectedUserId);
       finalClientName = userObj?.name;
    }

    const orderData = {
      userId: finalUserId,
      clientName: finalClientName,
      total,
      items: [{ productId: selectedProduct.id, quantity, price: selectedProduct.price }]
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('✅ Venta registrada con éxito');
        onSaleCompleted(); 
        setGuestName(''); 
        setSelectedUserId(''); 
        setIsGuest(false);
        setQuantity(1); 
        setSelectedProductId('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) { alert('Error de conexión'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>🛒 Registrar Venta</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/*  SELECCIONAR CLIENTE  */}
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <label style={{ fontWeight: 'bold', color: '#007bff', display: 'block', marginBottom: '10px' }}>
                1. ¿A quién le vendes?
            </label>
            
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', userSelect: 'none' }}>
                    <input 
                        type="checkbox" 
                        checked={isGuest} 
                        onChange={(e) => { 
                            setIsGuest(e.target.checked); 
                            setGuestName(''); 
                            setSelectedUserId(''); 
                        }} 
                    /> 
                    Es un cliente sin cuenta (Invitado)
                </label>
            </div>

            {isGuest ? (
                // INPUT DE TEXTO (Invitado)
                <input 
                    type="text" 
                    value={guestName} 
                    onChange={(e) => setGuestName(e.target.value)} 
                    placeholder="Nombre del cliente..." 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
            ) : (
                // SELECT (Registrado)
                <select 
                    value={selectedUserId} 
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}
                >
                    <option value="">-- Seleccionar Cliente --</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            👤 {u.name} {u.email ? `(${u.email})` : ''}
                        </option>
                    ))}
                </select>
            )}
        </div>

        {/*  SELECCIONAR PRODUCTO */}
        <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>2. Producto:</label>
            <select 
                value={selectedProductId} 
                onChange={(e) => setSelectedProductId(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
                <option value="">-- Seleccionar --</option>
                {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} (${p.price}) {p.stock <= 0 ? '- SIN STOCK' : `- Stock: ${p.stock}`}
                    </option>
                ))}
            </select>
        </div>

        {/*  CANTIDAD Y TOTAL */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Cantidad:</label>
                <input 
                    type="number" 
                    min="1" 
                    max={selectedProduct?.stock || 1} 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
                />
            </div>
            
            <div style={{ flex: 1, textAlign: 'right', background: '#f1f3f5', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>Total a cobrar:</span>
                <strong style={{ fontSize: '24px', color: '#28a745' }}>${total.toLocaleString()}</strong>
            </div>
        </div>

        {/* BOTÓN CONFIRMAR */}
        <button 
            type="submit" 
            disabled={loading}
            style={{ 
                marginTop: '10px', 
                padding: '12px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? 'Procesando...' : '✅ Confirmar Venta'}
        </button>
      </form>
    </div>
  );
}
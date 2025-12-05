import { useState, useEffect } from 'react';

interface User { id: string; name: string; }
interface Product { id: number; name: string; price: number; stock: number; }

// 1. Recibimos refreshTrigger
export default function SalesForm({ onSaleCompleted, refreshTrigger }: { onSaleCompleted: () => void, refreshTrigger: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [clientName, setClientName] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 2. Agregamos refreshTrigger al useEffect para recargar stock
  useEffect(() => {
    fetch('http://localhost:3001/users').then(res => res.json()).then(data => setUsers(data));
    fetch('http://localhost:3001/products').then(res => res.json()).then(data => setProducts(data));
  }, [refreshTrigger]); // <--- ¡AQUÍ ESTÁ LA CLAVE!

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let userId = null;
    let finalClientName = null;

    if (isGuest) {
      finalClientName = clientName;
    } else {
      const userFound = users.find(u => u.name.toLowerCase() === clientName.toLowerCase());
      if (!userFound) return alert('Usuario no encontrado. ¿Querías usar "Cliente sin cuenta"?');
      userId = userFound.id;
    }

    const orderData = {
      userId,
      clientName: finalClientName,
      total,
      items: [{ productId: selectedProduct.id, quantity, price: selectedProduct.price }]
    };

    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('✅ Venta registrada con éxito');
        onSaleCompleted(); 
        setClientName(''); setIsGuest(false); setQuantity(1); setSelectedProductId('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) { alert('Error de conexión'); }
  };

  return (
    <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#222', color: 'white' }}>
      <h3>🛒 Asignar Venta (Admin)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '350px' }}>
        <div style={{ background: '#333', padding: '10px', borderRadius: '5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', color: '#17a2b8' }}>
              <input type="checkbox" checked={isGuest} onChange={(e) => { setIsGuest(e.target.checked); setClientName(''); }} /> Cliente sin cuenta
            </label>
            <label>Nombre del Cliente:</label>
            {isGuest ? (
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Cliente de paso..." required style={{ padding: '8px', width: '93%' }} />
            ) : (
              <>
                <input list="sale-user-options" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Buscar usuario..." required style={{ padding: '8px', width: '93%' }} />
                <datalist id="sale-user-options">{users.map(u => <option key={u.id} value={u.name} />)}</datalist>
              </>
            )}
        </div>

        <label>Producto:</label>
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Seleccionar...</option>
          {products.map(p => (
            <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} (${p.price}) - Stock: {p.stock}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <label>Cantidad:</label>
                <input type="number" min="1" max={selectedProduct?.stock || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required style={{ padding: '8px', width: '100%' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
                <label>Total:</label>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>${total.toLocaleString()}</div>
            </div>
        </div>

        <button type="submit" style={{ marginTop: '10px', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}>Confirmar Venta</button>
      </form>
    </div>
  );
}
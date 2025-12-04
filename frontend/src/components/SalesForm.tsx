import { useState, useEffect } from 'react';

interface User { id: string; name: string; }
interface Product { id: number; name: string; price: number; stock: number; }

export default function SalesForm({ onSaleCompleted }: { onSaleCompleted: () => void }) {
  // Estados de Cliente
  const [users, setUsers] = useState<User[]>([]);
  const [clientName, setClientName] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  // Estados de Producto
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Cargar datos al inicio
  useEffect(() => {
    fetch('http://localhost:3001/users').then(res => res.json()).then(data => setUsers(data));
    fetch('http://localhost:3001/products').then(res => res.json()).then(data => setProducts(data));
  }, []);

  // Calcular total dinámicamente
  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const total = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let userId = null;
    let finalClientName = null;

    // Lógica de Cliente
    if (isGuest) {
      finalClientName = clientName;
    } else {
      const userFound = users.find(u => u.name.toLowerCase() === clientName.toLowerCase());
      if (!userFound) return alert('Usuario registrado no encontrado. ¿Querías usar "Cliente sin cuenta"?');
      userId = userFound.id;
    }

    // Armar el objeto de venta
    const orderData = {
      userId,
      clientName: finalClientName,
      total,
      items: [
        { productId: selectedProduct.id, quantity, price: selectedProduct.price }
      ]
    };

    // Enviar al backend
    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('✅ Venta registrada con éxito');
        onSaleCompleted(); // Avisar para actualizar stock y stats
        // Resetear form
        setClientName('');
        setIsGuest(false);
        setQuantity(1);
        setSelectedProductId('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#222', color: 'white' }}>
      <h3>🛒 Asignar Venta (Admin)</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '350px' }}>
        
        {/* SELECCIÓN DE CLIENTE (Igual que en Turnos) */}
        <div style={{ background: '#333', padding: '10px', borderRadius: '5px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', color: '#17a2b8'  }}>
              <input type="checkbox" checked={isGuest} onChange={(e) => { setIsGuest(e.target.checked); setClientName(''); }} />
              Cliente sin cuenta
            </label>

            <label>Nombre del Cliente:</label>
            {isGuest ? (
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Cliente de paso..." required style={{ padding: '8px', width: '93%' }} />
            ) : (
              <>
                <input list="sale-user-options" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Buscar usuario registrado..." required style={{ padding: '8px', width: '93%' }} />
                <datalist id="sale-user-options">{users.map(u => <option key={u.id} value={u.name} />)}</datalist>
              </>
            )}
        </div>

        {/* SELECCIÓN DE PRODUCTO */}
        <label>Producto:</label>
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Seleccionar...</option>
          {products.map(p => (
            <option key={p.id} value={p.id} disabled={p.stock <= 0}>
              {p.name} (${p.price}) - Stock: {p.stock}
            </option>
          ))}
        </select>

        {/* CANTIDAD */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <label>Cantidad:</label>
                <input 
                    type="number" min="1" max={selectedProduct?.stock || 1} 
                    value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} 
                    required style={{ padding: '8px', width: '100%' }} 
                />
            </div>
            {/* VISTA PREVIA DEL TOTAL */}
            <div style={{ flex: 1, textAlign: 'right' }}>
                <label>Total a Cobrar:</label>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                    ${total.toLocaleString()}
                </div>
            </div>
        </div>

        <button type="submit" style={{ marginTop: '10px', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}>
          Confirmar Venta
        </button>
      </form>
    </div>
  );
}
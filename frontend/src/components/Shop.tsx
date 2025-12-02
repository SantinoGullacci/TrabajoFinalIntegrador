import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// --- SUB-COMPONENTE: Tarjeta Individual de Producto ---
// Lo creamos aquí mismo para aislar la lógica de "cuántos quiero comprar"
const ProductCard = ({ product, onBuy }: { product: Product, onBuy: (p: Product, qty: number) => void }) => {
  const [quantity, setQuantity] = useState(1); // Cada tarjeta tiene su propia cuenta

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '10px', 
      padding: '15px', 
      background: 'white', 
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      opacity: product.stock === 0 ? 0.6 : 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', margin: '5px 0' }}>${product.price}</p>
        <p style={{ color: product.stock > 0 ? 'green' : 'red', fontSize: '14px' }}>
          {product.stock > 0 ? `Stock: ${product.stock} un.` : '🚫 AGOTADO'}
        </p>
      </div>

      {product.stock > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
            <label style={{ fontSize: '12px' }}>Cant:</label>
            <input 
              type="number" 
              min="1" 
              max={product.stock} // No deja elegir más del stock real
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: '50px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <button 
            onClick={() => onBuy(product, quantity)}
            style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Comprar ({quantity})
          </button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: La Tienda ---
export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:3001/products');
    setProducts(await res.json());
  };

  const handleBuy = async (product: Product, quantity: number) => {
    // Validaciones extra por seguridad
    if (quantity <= 0) return alert('La cantidad debe ser al menos 1');
    if (quantity > product.stock) return alert('No hay suficiente stock');

    if (!confirm(`¿Confirmar compra de ${quantity} unidad(es) de ${product.name} por $${product.price * quantity}?`)) return;

    const orderData = {
      userId: user?.id,
      total: product.price * quantity,
      items: [
        { productId: product.id, quantity: quantity, price: product.price }
      ]
    };

    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ¡Compra realizada con éxito!');
        fetchProducts(); // Recargamos para ver bajar el stock
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f4f6f8', borderRadius: '8px' }}>
      <h2>🛍️ Tienda de Productos</h2>
      <p>Selecciona la cantidad que desees llevar.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {products.map(p => (
          <ProductCard key={p.id} product={p} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  );
}
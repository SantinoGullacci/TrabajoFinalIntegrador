import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

// --- SUB-COMPONENTE: Tarjeta Individual ---
const ProductCard = ({ product, onBuy, onImageClick }: { 
    product: Product, 
    onBuy: (p: Product, qty: number) => void,
    onImageClick: (url: string) => void
}) => {
  const [quantity, setQuantity] = useState(1);
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/1524/1524855.png";
  const finalImageUrl = product.imageUrl || defaultImage;

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '10px', 
      background: 'white', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      opacity: product.stock === 0 ? 0.6 : 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden', 
      transition: 'transform 0.2s'
    }}>
      
      {/* ZONA DE IMAGEN CON CLASES CSS NUEVAS */}
      <div 
        className="product-image-container"
        style={{ width: '100%', height: '180px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        onClick={() => onImageClick(finalImageUrl)}
      >
        <img 
            src={finalImageUrl} 
            alt={product.name} 
            className="product-card-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = defaultImage; }} 
        />
      </div>

      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
        <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#007bff', margin: '5px 0' }}>${product.price}</p>
        <p style={{ color: product.stock > 0 ? 'green' : 'red', fontSize: '14px', fontWeight: '500' }}>
          {product.stock > 0 ? `Stock: ${product.stock} un.` : '🚫 AGOTADO'}
        </p>
      
        {product.stock > 0 && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
              <label style={{ fontSize: '14px', color: '#555' }}>Cantidad:</label>
              <input 
                type="number" 
                min="1" 
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
              />
            </div>

            <button 
              onClick={() => onBuy(product, quantity)}
              style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              Comprar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: La Tienda ---
export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  
  // ESTADO PARA EL MODAL
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
        const res = await fetch('http://localhost:3001/products');
        setProducts(await res.json());
    } catch (error) { // <--- AQUÍ ESTABA EL ERROR, AHORA TIENE LLAVES {}
        console.error(error);
    }
  };

  const handleBuy = async (product: Product, quantity: number) => {
    if (quantity <= 0) return alert('La cantidad debe ser al menos 1');
    if (quantity > product.stock) return alert('No hay suficiente stock');
    if (!confirm(`¿Confirmar compra de ${quantity} unidad(es) de ${product.name} por $${product.price * quantity}?`)) return;

    const orderData = {
      userId: user?.id,
      total: product.price * quantity,
      items: [{ productId: product.id, quantity: quantity, price: product.price }]
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
        fetchProducts(); 
      } else {
        alert('❌ Error: ' + data.error);
      }
    } catch (error) { alert('Error de conexión'); }
  };

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h2 style={{borderBottom: '2px solid #ddd', paddingBottom: '10px', color: '#333'}}>🛍️ Tienda Online</h2>
      <p style={{marginBottom: '20px', color: '#666'}}>Encuentra los mejores productos para tu cuidado personal.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginTop: '20px' }}>
        {products.map(p => (
          <ProductCard 
            key={p.id} 
            product={p} 
            onBuy={handleBuy}
            onImageClick={(url) => setSelectedImage(url)} 
          />
        ))}
      </div>

      {/* --- MODAL DE PANTALLA COMPLETA --- */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full screen" className="image-modal-content" />
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
}

// --- SUB-COMPONENTE: Tarjeta Individual (Sin cambios) ---
const ProductCard = ({ product, onBuy, onImageClick }: { product: Product, onBuy: (p: Product, qty: number) => void, onImageClick: (url: string) => void }) => {
  const [quantity, setQuantity] = useState(1);
  const defaultImage = "https://cdn-icons-png.flaticon.com/512/1524/1524855.png";
  const finalImageUrl = product.imageUrl || defaultImage;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '10px', background: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', opacity: product.stock === 0 ? 0.6 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', transition: 'transform 0.2s' }}>
      <div className="product-image-container" style={{ width: '100%', height: '180px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }} onClick={() => onImageClick(finalImageUrl)}>
        <img src={finalImageUrl} alt={product.name} className="product-card-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = defaultImage; }} />
      </div>
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
        <div style={{display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '11px', background: '#eee', padding: '2px 6px', borderRadius: '4px'}}>{product.brand || 'Genérico'}</span>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>${product.price}</p>
        </div>
        <p style={{ color: product.stock > 0 ? 'green' : 'red', fontSize: '12px', fontWeight: '500', marginTop: '5px' }}>
          {product.stock > 0 ? `Stock: ${product.stock}` : 'AGOTADO'}
        </p>
        {product.stock > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
            <input type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: '50px', padding: '5px', textAlign: 'center' }} />
            <button onClick={() => onBuy(product, quantity)} style={{ flex: 1, background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Comprar</button>
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- ESTADOS PARA FILTROS ---
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  
  // Estados para inputs de precio (Texto que escribe el usuario)
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  // Estados para precio aplicado (Valores numéricos reales al filtrar)
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
        const res = await fetch('http://localhost:3001/products');
        const data = await res.json();
        setProducts(data);
    } catch (error) { console.error(error); }
  };

  // Listas únicas
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand).filter(Boolean))), [products]);

  // Lógica de filtrado
  const filteredProducts = products.filter(p => {
      // 1. Filtro Categoría
      const matchCat = filterCategory ? p.category === filterCategory : true;
      // 2. Filtro Marca
      const matchBrand = filterBrand ? p.brand === filterBrand : true;
      
      // 3. Filtro Precio (Estilo Mercado Libre)
      // Si hay un mínimo aplicado, el precio debe ser mayor o igual
      const matchMin = appliedMinPrice !== null ? p.price >= appliedMinPrice : true;
      // Si hay un máximo aplicado, el precio debe ser menor o igual
      const matchMax = appliedMaxPrice !== null ? p.price <= appliedMaxPrice : true;

      return matchCat && matchBrand && matchMin && matchMax;
  });

  // Función para aplicar el filtro de precio al hacer click en la flecha
  const applyPriceFilter = () => {
      const min = minPriceInput !== '' ? Number(minPriceInput) : null;
      const max = maxPriceInput !== '' ? Number(maxPriceInput) : null;
      setAppliedMinPrice(min);
      setAppliedMaxPrice(max);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
      setFilterCategory('');
      setFilterBrand('');
      setMinPriceInput('');
      setMaxPriceInput('');
      setAppliedMinPrice(null);
      setAppliedMaxPrice(null);
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
      if (res.ok) { alert('✅ Compra realizada'); fetchProducts(); } 
      else { alert('Error'); }
    } catch (error) { alert('Error de conexión'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* BARRA DE FILTROS SUPERIOR */}
      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <h3 style={{margin: 0, marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}}>
             🔍 Filtros
          </h3>
          
          {/* SELECTORES DE CATEGORÍA Y MARCA */}
          <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '2px'}}>Categoría</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{padding: '5px', borderColor: '#ddd', borderRadius: '4px'}}>
                  <option value="">Todas</option>
                  {categories.map(c => <option key={c} value={c as string}>{c}</option>)}
              </select>
          </div>

          <div>
              <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '2px'}}>Marca</label>
              <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{padding: '5px', borderColor: '#ddd', borderRadius: '4px'}}>
                  <option value="">Todas</option>
                  {brands.map(b => <option key={b} value={b as string}>{b}</option>)}
              </select>
          </div>

          {/* FILTRO DE PRECIO TIPO MERCADO LIBRE */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <label style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '2px'}}>Precio | $</label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                    type="number" 
                    placeholder="Mínimo" 
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    style={{ width: '80px', padding: '6px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                />
                <span style={{color: '#999'}}>-</span>
                <input 
                    type="number" 
                    placeholder="Máximo" 
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    style={{ width: '80px', padding: '6px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                />
                {/* BOTÓN FLECHA */}
                <button 
                    onClick={applyPriceFilter}
                    style={{
                        width: '26px', height: '26px', borderRadius: '50%', border: 'none',
                        background: '#e0e0e0', color: '#666', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}
                    title="Aplicar filtro de precio"
                >
                    {'>'}
                </button>
             </div>
          </div>
          
          <button onClick={clearFilters} style={{background: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline'}}>
              Limpiar filtros
          </button>
      </div>

      {/* GRILLA DE PRODUCTOS FILTRADOS */}
      <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h2 style={{borderBottom: '2px solid #ddd', paddingBottom: '10px', color: '#333'}}>
            🛍️ Tienda Online 
            <span style={{fontSize: '16px', color: '#666', marginLeft: '10px', fontWeight: 'normal'}}>
                ({filteredProducts.length} resultados)
            </span>
        </h2>
        
        {filteredProducts.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#888'}}>
                <p style={{fontSize: '50px', margin: 0}}>😕</p>
                <p>No hay publicaciones que coincidan con tu búsqueda.</p>
                <button onClick={clearFilters} style={{marginTop: '10px', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer'}}>Limpiar filtros</button>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginTop: '20px' }}>
                {filteredProducts.map(p => (
                <ProductCard 
                    key={p.id} 
                    product={p} 
                    onBuy={handleBuy}
                    onImageClick={(url) => setSelectedImage(url)} 
                />
                ))}
            </div>
        )}

        {selectedImage && (
            <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Full screen" className="image-modal-content" />
            </div>
        )}
      </div>
    </div>
  );
}
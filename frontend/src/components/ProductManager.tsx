import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string; // Nuevo
  brand?: string;    // Nuevo
}

export default function ProductManager({ onUpdate }: { onUpdate: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  // Agregamos category y brand al formulario
  const [formData, setFormData] = useState({ name: '', price: 0, stock: 0, imageUrl: '', category: '', brand: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Listas calculadas dinámicamente
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingBrands, setExistingBrands] = useState<string[]>([]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3001/products');
      const data = await res.json();
      setProducts(data);

      // Extraemos categorías y marcas únicas de los productos existentes
      const cats = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean))) as string[];
      const brands = Array.from(new Set(data.map((p: Product) => p.brand).filter(Boolean))) as string[];
      
      setExistingCategories(cats);
      setExistingBrands(brands);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) return alert('Datos inválidos');

    try {
      let url = 'http://localhost:3001/products';
      let method = 'POST';

      if (editingId !== null) {
        url = `http://localhost:3001/products/${editingId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(editingId !== null ? '✅ Producto actualizado' : '✅ Producto creado');
        resetForm();
        fetchProducts();
        onUpdate(); 
      } else {
        alert('Error al guardar');
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar este producto?')) return;
    await fetch(`http://localhost:3001/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    onUpdate();
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      brand: product.brand || ''
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, stock: 0, imageUrl: '', category: '', brand: '' });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#e3f2fd', marginBottom: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        📦 Administrar Productos
        {editingId !== null && <span style={{ fontSize: '14px', color: '#e67e22' }}>(Modo Edición)</span>}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', background: editingId ? '#fff3cd' : 'transparent', padding: editingId ? '15px' : '0', borderRadius: '5px' }}>
        
        <div style={{gridColumn: 'span 2'}}>
          <label style={{ display: 'block', fontSize: '12px' }}>Nombre del Producto:</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '8px', width: '100%' }}
            required
          />
        </div>

        <div style={{gridColumn: 'span 2'}}>
          <label style={{ display: 'block', fontSize: '12px' }}>URL Imagen:</label>
          <input 
            type="url" 
            value={formData.imageUrl}
            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            placeholder="https://..."
            style={{ padding: '8px', width: '100%' }}
          />
        </div>

        {/* --- SELECCIÓN DE CATEGORÍA (EXISTENTE O NUEVA) --- */}
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Categoría:</label>
          <input 
            list="category-list" 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            placeholder="Escribe o selecciona..."
            style={{ padding: '8px', width: '100%' }}
          />
          <datalist id="category-list">
            {existingCategories.map((cat, i) => <option key={i} value={cat} />)}
          </datalist>
        </div>

        {/* --- SELECCIÓN DE MARCA (EXISTENTE O NUEVA) --- */}
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Marca:</label>
          <input 
            list="brand-list" 
            value={formData.brand}
            onChange={e => setFormData({...formData, brand: e.target.value})}
            placeholder="Escribe o selecciona..."
            style={{ padding: '8px', width: '100%' }}
          />
          <datalist id="brand-list">
            {existingBrands.map((brand, i) => <option key={i} value={brand} />)}
          </datalist>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Precio ($):</label>
          <input 
            type="number" 
            className="no-spinner"
            value={formData.price === 0 ? '' : formData.price} 
            onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})}
            style={{ padding: '8px', width: '100%' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Stock:</label>
          <input 
            type="number" 
            value={formData.stock === 0 ? '' : formData.stock}
            onChange={e => setFormData({...formData, stock: e.target.value === '' ? 0 : Number(e.target.value)})}
            style={{ padding: '8px', width: '100%' }}
            required
          />
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
             <button type="submit" style={{ flex: 1, background: editingId ? '#32b119ff' : '#007bff', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}>
                {editingId ? '💾 Guardar Cambios' : '+ Crear Producto'}
             </button>
             {editingId && (
                <button type="button" onClick={resetForm} style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px' }}>
                    Cancelar
                </button>
             )}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Info</th>
            <th style={{ padding: '8px' }}>Producto</th>
            <th style={{ padding: '8px' }}>Datos</th>
            <th style={{ padding: '8px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd', background: editingId === p.id ? '#fff3cd' : 'transparent' }}>
              <td style={{ padding: '8px' }}>
                {p.imageUrl ? (
                    <img src={p.imageUrl} alt="mini" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                ) : '📦'}
              </td>
              <td style={{ padding: '8px' }}>
                  <strong>{p.name}</strong><br/>
                  <small style={{color: '#666'}}>{p.brand} - {p.category}</small>
              </td>
              <td style={{ padding: '8px' }}>
                  ${p.price}<br/>
                  <span style={{color: p.stock < 5 ? 'red' : 'green', fontSize: '12px'}}>{p.stock} un.</span>
              </td>
              <td style={{ padding: '8px' }}>
                <div style={{display: 'flex', gap: '5px'}}>
                    <button onClick={() => startEditing(p)} style={{ background: '#07eeffff', color: 'black', border: 'none', padding: '5px', borderRadius: '4px', fontSize: '18px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', fontSize: '18px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
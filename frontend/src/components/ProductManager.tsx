import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0 });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:3001/products');
    setProducts(await res.json());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      setNewProduct({ name: '', price: 0, stock: 0 });
      fetchProducts();
      alert('✅ Producto agregado');
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Borrar producto?')) return;
    await fetch(`http://localhost:3001/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#e3f2fd', marginBottom: '30px' }}>
      <h2>📦 Gestión de Stock y Productos</h2>
      
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Producto:</label>
          <input type="text" placeholder="Ej: Shampoo" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ padding: '5px' }} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Precio:</label>
          <input type="number" placeholder="$" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} style={{ padding: '5px', width: '80px' }} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Stock Inicial:</label>
          <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} style={{ padding: '5px', width: '60px' }} required />
        </div>
        <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>+ Crear</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}><th style={{padding:'8px'}}>Producto</th><th style={{padding:'8px'}}>Precio</th><th style={{padding:'8px'}}>Stock</th><th style={{padding:'8px'}}>Acción</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{p.name}</td>
              <td style={{ padding: '8px' }}>${p.price}</td>
              <td style={{ padding: '8px', fontWeight: 'bold', color: p.stock < 5 ? 'red' : 'green' }}>{p.stock} u.</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
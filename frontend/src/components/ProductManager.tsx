import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function ProductManager({ onUpdate }: { onUpdate: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({ name: '', price: 0, stock: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3001/products');
      const data = await res.json();
      setProducts(data);
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
      stock: product.stock
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, stock: 0 });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#e3f2fd', marginBottom: '30px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        📦 Administrar Productos
        {editingId !== null && <span style={{ fontSize: '14px', color: '#e67e22' }}>(Modo Edición)</span>}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap', background: editingId ? '#fff3cd' : 'transparent', padding: editingId ? '10px' : '0', borderRadius: '5px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Producto:</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ padding: '5px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Precio ($):</label>
          <input 
            type="number" 
            className="no-spinner" // <--- QUITA LAS FLECHAS
            value={formData.price === 0 ? '' : formData.price} // <--- QUITA EL 0 LOCO
            onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})}
            placeholder="0"
            style={{ padding: '5px', width: '80px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Stock:</label>
          <input 
            type="number" 
            // AQUÍ NO PONEMOS LA CLASE "no-spinner" PARA QUE CONSERVE LAS FLECHAS
            value={formData.stock === 0 ? '' : formData.stock} // <--- PERO SÍ QUITAMOS EL 0 LOCO
            onChange={e => setFormData({...formData, stock: e.target.value === '' ? 0 : Number(e.target.value)})}
            placeholder="0"
            style={{ padding: '5px', width: '60px' }}
            required
          />
        </div>

        <button type="submit" style={{ background: editingId ? '#32b119ff' : '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
          {editingId ? '✅ Guardar Cambios' : '+ Agregar'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
            Cancelar ❌
          </button>
        )}
      </form>

      {/* TABLA ... (Igual que antes) */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ background: '#eee', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Producto</th>
            <th style={{ padding: '8px' }}>Precio</th>
            <th style={{ padding: '8px' }}>Stock</th>
            <th style={{ padding: '8px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd', background: editingId === p.id ? '#fff3cd' : 'transparent' }}>
              <td style={{ padding: '8px' }}>{p.name}</td>
              <td style={{ padding: '8px' }}>${p.price}</td>
              <td style={{ padding: '8px', fontWeight: 'bold', color: p.stock < 5 ? 'red' : 'green' }}>{p.stock} u.</td>
              <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                <button onClick={() => startEditing(p)} style={{ background: '#07eeffff', color: 'black', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
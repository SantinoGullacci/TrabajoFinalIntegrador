import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

// 1. Definimos que el componente recibe la función "onUpdate"
export default function ProductManager({ onUpdate }: { onUpdate: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({ name: '', price: 0, stock: 0 });
  
  // Estado para saber si estamos editando
  const [editingId, setEditingId] = useState<number | null>(null);

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3001/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Función única para CREAR o EDITAR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) return alert('Datos inválidos');

    try {
      let url = 'http://localhost:3001/products';
      let method = 'POST';

      // SI ESTAMOS EDITANDO, CAMBIAMOS LA URL Y EL METODO
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
        
        onUpdate(); // <--- 2. ¡AVISAMOS AL PADRE QUE ALGO CAMBIÓ!
      } else {
        alert('Error al guardar');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Función para borrar
  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar este producto?')) return;
    await fetch(`http://localhost:3001/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    
    onUpdate(); // <--- 3. ¡AVISAMOS AQUÍ TAMBIÉN!
  };

  // Función para cargar los datos en el formulario (Modo Edición)
  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock
    });
  };

  // Función para cancelar edición y limpiar form
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
      
      {/* FORMULARIO HÍBRIDO */}
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
            value={formData.price}
            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            style={{ padding: '5px', width: '80px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px' }}>Stock Inicial:</label>
          <input 
            type="number" 
            value={formData.stock}
            onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
            style={{ padding: '5px', width: '60px' }}
            required
          />
        </div>

        {/* Botón Principal */}
        <button type="submit" style={{ background: editingId  ? '#32b119ff' : '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
          {editingId ? '✅ Guardar Cambios' : '+ Agregar'}
        </button>

        {/* Botón Cancelar */}
        {editingId && (
          <button type="button" onClick={resetForm} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>
            Cancelar ❌
          </button>
        )}
      </form>

      {/* LISTA DE PRODUCTOS */}
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
              <td style={{ padding: '8px', fontWeight: 'bold', color: p.stock < 5 ? 'red' : 'green' }}>
                {p.stock} u.
              </td>
              <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                
                {/* Botón EDITAR */}
                <button 
                  onClick={() => startEditing(p)}
                  style={{ background: '#07eeffff', color: 'black', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Editar
                </button>

                {/* Botón ELIMINAR */}
                <button 
                  onClick={() => handleDelete(p.id)}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
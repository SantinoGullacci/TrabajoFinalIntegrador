import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

// Definimos la forma de los datos (Interfaces)
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  Product?: { name: string };
}

interface Order {
  id: number;
  date: string;
  total: number;
  clientName?: string; // Para clientes "de paso"
  User?: { name: string; email: string }; // Para clientes registrados
  OrderItems: OrderItem[];
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si es cliente, enviamos su ID. Si es admin, no enviamos nada (trae todo)
    let url = `${API_URL}/orders`;
    if (user?.role === 'client') {
        url += `?userId=${user.id}`; // Con comillas invertidas (backticks)    
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [user]);

  if (loading) return <p>Cargando historial...</p>;

  return (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h2 style={{ borderLeft: '5px solid #28a745', paddingLeft: '10px' }}>
        🛍️ Historial de Compras
      </h2>

      {orders.length === 0 ? (
        <p style={{ color: '#666' }}>No hay compras registradas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', background: '#f9f9f9' }}>
              
              {/* CABECERA DE LA COMPRA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: '18px', color: '#28a745' }}>${order.total.toLocaleString()}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📅 {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Solo el Admin necesita ver QUIÉN compró */}
                {user?.role === 'admin' && (
                  <div style={{ textAlign: 'right' }}>
                    <strong>Cliente:</strong> {order.User?.name || order.clientName || 'Anónimo'}
                    <div style={{ fontSize: '12px', color: '#666' }}>{order.User?.email}</div>
                  </div>
                )}
              </div>

              {/* LISTA DE ITEMS */}
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {order.OrderItems.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '5px' }}>
                    <strong>{item.quantity}x</strong> {item.Product?.name || 'Producto eliminado'} 
                    <span style={{ color: '#666', fontSize: '12px' }}> (${item.price} c/u)</span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
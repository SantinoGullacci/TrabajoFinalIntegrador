// src/types/models.ts

// 1. USUARIO (Basado en User.js)
// El ID es string porque en tu modelo usas UUIDV4
export interface User {
  id: string; 
  name: string;
  email: string;
  role: 'admin' | 'client'; // Enum definido en el backend
  phone?: string;           // Es allowNull: true
  securityAnswer?: string;  // No solemos enviarla al front, pero existe en el modelo
}

// 2. SERVICIO (Basado en Service.js)
export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;         // En minutos
  description?: string;     // Es allowNull: true
}

// 3. PRODUCTO (Basado en Product.js)
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;        // Nuevos campos que agregaste
  brand?: string;           // Nuevos campos que agregaste
  description?: string;
}

// 4. TURNO / APPOINTMENT (Basado en Appointment.js)
export interface Appointment {
  id: number;
  date: string;             // Sequelize envía DATEONLY como string 'YYYY-MM-DD'
  time: string;             // Sequelize envía TIME como string 'HH:mm:ss'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; //
  clientName?: string;      // Opcional
  
  // Claves foráneas (Sequelize las agrega automáticamente en la respuesta JSON)
  UserId?: string;
  ServiceId?: number;

  // Relaciones (Cuando haces 'include' en el backend)
  User?: User;
  Service?: Service;
  
  // Timestamps (Appointment tiene timestamps: true)
  createdAt?: string;
  updatedAt?: string;
}

// 5. PEDIDO / ORDER (Basado en Order.js)
export interface Order {
  id: number;
  total: number;
  status: 'pending' | 'completed'; //
  date: string;
  clientName?: string;
  
  // Relación con los items
  OrderItems?: OrderItem[];
  User?: User;
}

// 6. ITEM DE PEDIDO (Basado en OrderItem.js)
export interface OrderItem {
  id: number;
  quantity: number;
  price: number;            // Precio histórico
  ProductId?: number;
  OrderId?: number;
  Product?: Product;        // Si incluyes el producto
}

// 7. INFO DEL NEGOCIO (Basado en BusinessInfo.js)
export interface BusinessInfo {
  id?: number;              // Sequelize crea ID aunque no lo definas
  name: string;
  description?: string;
  phone?: string;
  hours?: string;
  address?: string;
}
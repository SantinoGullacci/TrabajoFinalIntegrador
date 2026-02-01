export interface User {
  id: string; 
  name: string;
  email: string;
  role: 'admin' | 'client'; // Enum definido en el backend
  phone?: string;           // Es allowNull: true
  securityAnswer?: string;  
}

//  SERVICIO 
export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;         // En minutos
  description?: string;     // Es allowNull: true
}

//  PRODUCTO 
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;        
  brand?: string;           
  description?: string;
}

// TURNO 
export interface Appointment {
  id: number;
  date: string;             
  time: string;             
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; 
  clientName?: string;      
  
  // Claves foráneas 
  UserId?: string;
  ServiceId?: number;

  // Relaciones 
  User?: User;
  Service?: Service;
  
  // Timestamps 
  createdAt?: string;
  updatedAt?: string;
}

//  PEDIDO 
export interface Order {
  id: number;
  total: number;
  status: 'pending' | 'completed'; 
  date: string;
  clientName?: string;
  
  // Relación con los items
  OrderItems?: OrderItem[];
  User?: User;
}

// ITEM DE PEDIDO 
export interface OrderItem {
  id: number;
  quantity: number;
  price: number;            // Precio histórico
  ProductId?: number;
  OrderId?: number;
  Product?: Product;      
}

//INFO DEL NEGOCIO
export interface BusinessInfo {
  id?: number;              
  name: string;
  description?: string;
  phone?: string;
  hours?: string;
  address?: string;
}
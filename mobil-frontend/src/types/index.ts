export type UserRole = 'user' | 'admin';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  ad: string;
  soyad: string;
}

export interface AuthResponse {
  token: string;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  ad: string;
  soyad: string;
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  ad: string;
  soyad: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  ad?: string;
  soyad?: string;
}

export interface UserCategoryPreference {
  userId: string;
  categoryId: string;
}

export interface Category {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  children?: Category[];
}

export interface Product {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  desc?: string;
  price: number;
  stock: number;
  categoryId?: string;
  category?: string;
  imageUrl: string;
  images: string[];
  ratings?: number;
  numReviews?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ProductFilters {
  q?: string;
  categoryId?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type OrderStatus =
  | 'Onaylandı'
  | 'Hazırlanıyor'
  | 'Kargoya Verildi'
  | 'Teslim Edildi'
  | 'İptal Edildi';

export type PaymentMethod = 'Kredi Kartı' | 'Havale/EFT' | 'Kapıda Ödeme';

export interface OrderItem {
  itemId: string;
  productId: string;
  name?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  _id?: string;
  status: OrderStatus;
  total: number;
  address: string;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  address: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface Review {
  id?: string;
  _id?: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}

export interface ServerOrderItem {
  itemId: string;
  productId: string;
  name?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
}

export interface ServerOrder {
  id: string;
  status: OrderStatus;
  total: number;
  address: string;
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: string;
  items: ServerOrderItem[];
}

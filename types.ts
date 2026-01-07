
export enum UserRole {
  USER = 'USER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  rating: number;
  reviews: Review[];
}

export interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: (CartItem & { product: Product })[];
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  date: string;
  address: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
}

export interface Voucher {
  code: string;
  discount: number;
  type: 'PERCENTAGE' | 'FIXED';
  expiry: string;
}

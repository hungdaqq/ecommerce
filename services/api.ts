const API_BASE_URL = 'http://localhost:8080';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
}

interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

interface Order {
  id: number;
  user_id: number;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async register(data: RegisterData): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  }

  async login(data: LoginData): Promise<{ token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    const result = await response.json();
    this.setToken(result.token);
    return result;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request('/api/products');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart
  async getCart(): Promise<Cart> {
    return this.request('/api/cart');
  }

  async addToCart(productId: number, quantity: number): Promise<void> {
    return this.request('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<void> {
    return this.request(`/api/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number): Promise<void> {
    return this.request(`/api/cart/item/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async createOrder(): Promise<Order> {
    return this.request('/api/orders', {
      method: 'POST',
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request('/api/orders');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request(`/api/orders/${id}`);
  }
}

export const apiService = new ApiService();
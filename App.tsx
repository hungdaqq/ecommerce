
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  Heart, 
  Package, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  Settings,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_BLOGS, TEST_USERS } from './constants.tsx';
import { User, UserRole, Product, CartItem, Order, BlogPost } from './types.ts';
import { apiService } from './services/api.ts';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

// --- Helpers ---
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// --- Main App Component ---
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [view, setView] = useState<'HOME' | 'SHOP' | 'CART' | 'PROFILE' | 'ADMIN' | 'STAFF' | 'BLOG' | 'DETAIL' | 'CHECKOUT' | 'LOGIN'>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  
  // Shop filters
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [priceRange, setPriceRange] = useState([0, 20000000]);
  const [sortBy, setSortBy] = useState('Mới nhất');

  useEffect(() => {
  const fetchProducts = async (filters = {}) => {
    try {
      // For now, we'll keep client-side filtering since the backend filtering is more complex
      // In a production app, you'd want to move all filtering to the backend
      const fetchedProducts = await apiService.getProducts();
      setProducts(fetchedProducts.map(p => ({ 
        ...p, 
        id: p.id.toString(),
        image: p.image_url // Map image_url to image for frontend compatibility
      })));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Fallback to mock data
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };    fetchProducts();
    fetchBlogs();

    // Check for existing session
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const wishlistStr = localStorage.getItem('wishlist');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        // Set view based on user role
        if (user.role === 'ADMIN') {
          setView('ADMIN');
        }
        fetchCart();
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    // Load wishlist from localStorage
    if (wishlistStr) {
      try {
        setWishlist(JSON.parse(wishlistStr));
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  const fetchBlogs = async () => {
    try {
      const fetchedBlogs = await apiService.getPublishedBlogs();
      setBlogs(fetchedBlogs.map(b => ({
        id: b.id.toString(),
        title: b.title,
        excerpt: b.excerpt || b.content?.substring(0, 150) + '...',
        content: b.content,
        author: b.author,
        date: b.created_at,
        image: b.image_url || 'https://picsum.photos/seed/blog/800/400'
      })));
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      // Fallback to mock data
      setBlogs(MOCK_BLOGS);
    }
  };

  // --- Auth Handlers ---
  const handleLogin = (role: UserRole) => {
    const user = TEST_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      if (role === UserRole.ADMIN) setView('ADMIN');
      else if (role === UserRole.STAFF) setView('STAFF');
      else setView('HOME');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('HOME');
    setCart([]);
    setWishlist([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('wishlist');
  };

  // --- Cart Handlers ---
  const fetchCart = async () => {
    if (!currentUser) return;
    try {
      const cartData = await apiService.getCart();
      setCart(cartData.items.map((item: any) => ({
        id: item.id,
        productId: item.product_id.toString(),
        quantity: item.quantity,
        product: {
          id: item.product.id.toString(),
          name: item.product.name,
          price: item.product.price,
          image: item.product.image_url,
          category: item.product.category,
          stock: item.product.stock,
        }
      })));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!currentUser) {
      alert('Please login to add to cart');
      setView('LOGIN');
      return;
    }
    try {
      await apiService.addToCart(parseInt(product.id), 1);
      await fetchCart();
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await apiService.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      alert('Failed to remove from cart');
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  // Filtered and sorted products for shop
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      
      // Price range filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Giá tăng dần':
          return a.price - b.price;
        case 'Giá giảm dần':
          return b.price - a.price;
        case 'Tên A-Z':
          return a.name.localeCompare(b.name);
        case 'Mới nhất':
        default:
          // Assuming products have created_at, sort by newest first
          // For now, sort by ID descending as a proxy for newest
          return parseInt(b.id) - parseInt(a.id);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('Tất cả');
    setPriceRange([0, 20000000]);
    setSortBy('Mới nhất');
    setSearchQuery('');
  };
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newWishlist = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  // --- Views ---
  
  // 1. Navbar
  const Navbar = () => (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Package size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Ergolife</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setView('HOME')} className="text-gray-600 hover:text-emerald-600 font-medium">Trang chủ</button>
            <button onClick={() => setView('SHOP')} className="text-gray-600 hover:text-emerald-600 font-medium">Sản phẩm</button>
            <button onClick={() => setView('BLOG')} className="text-gray-600 hover:text-emerald-600 font-medium">Blog</button>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search size={22} />
            </button>
            
              <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-transparent focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Tìm sản phẩm..." 
                className="bg-transparent border-none outline-none ml-2 text-sm w-48"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // keep focus after state update
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }}
              />
            </div>
            <button onClick={() => currentUser ? setView('PROFILE') : setView('LOGIN')} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Heart size={22} fill={wishlist.length > 0 ? 'currentColor' : 'none'} className={wishlist.length > 0 ? 'text-red-500' : ''} />
              {wishlist.length > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{wishlist.length}</span>}
            </button>
            <button onClick={() => setView('CART')} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{cart.length}</span>}
            </button>
            {currentUser ? (
              <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-200">
                <button onClick={() => setView('PROFILE')} className="flex items-center gap-2">
                  <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">{currentUser.name}</span>
                </button>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setView('LOGIN')}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  // Mobile Search Overlay
  const MobileSearch = () => (
    isMenuOpen && (
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="flex items-center bg-gray-100 rounded-full px-3 py-2 border border-transparent focus-within:border-emerald-400 focus-within:bg-white transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Tìm sản phẩm..." 
            className="bg-transparent border-none outline-none ml-2 text-sm flex-1"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTimeout(() => searchInputRef.current?.focus(), 0);
            }}
            autoFocus
          />
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )
  );

  // 2. Footer
  const Footer = () => (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Ergolife</h3>
          <p className="text-sm">Giải pháp công thái học hàng đầu Việt Nam, giúp bạn làm việc hiệu quả và sống khỏe mỗi ngày.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Chính sách</h4>
          <ul className="space-y-2 text-sm">
            <li>Giao hàng & Lắp đặt</li>
            <li>Bảo hành 5 năm</li>
            <li>Đổi trả trong 30 ngày</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
          <ul className="space-y-2 text-sm">
            <li>Hotline: 1900 1234</li>
            <li>Email: support@ergolife.com</li>
            <li>Địa chỉ: 123 Đường Công Nghệ, Q.1, TP.HCM</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Đăng ký nhận tin</h4>
          <div className="flex gap-2">
            <input type="email" placeholder="Email của bạn" className="bg-gray-800 border-none rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:ring-1 focus:ring-emerald-500" />
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Gửi</button>
          </div>
        </div>
      </div>
    </footer>
  );

  // 3. Home View
  const HomeView = () => (
    <div>
      <section className="relative h-[600px] flex items-center bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://picsum.photos/seed/ergohero/1600/800" className="w-full h-full object-cover opacity-60" alt="hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-4 block">Setup chuẩn Ergonomic</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Nâng tầm trải nghiệm <br/><span className="text-emerald-600">Làm việc & Nghỉ ngơi</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Sản phẩm được nghiên cứu dựa trên chỉ số nhân trắc học người Việt, giúp loại bỏ đau mỏi vai gáy và cột sống.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setView('SHOP')} className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-xl transition-all transform hover:-translate-y-1">
                Mua ngay
              </button>
              <button onClick={() => setView('BLOG')} className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-emerald-600 hover:text-emerald-600 transition-all">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
            <div className="h-1 w-20 bg-emerald-600 mt-2"></div>
          </div>
          <button onClick={() => setView('SHOP')} className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map(product => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
              <div className="relative overflow-hidden aspect-square">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all ${
                    isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(product); setView('DETAIL'); }}>
                <span className="text-xs text-gray-400 font-medium mb-1">{product.category}</span>
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">{product.name}</h3>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-emerald-600 font-bold text-lg">{formatPrice(product.price)}</span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <span className="font-bold text-gray-700">{product.rating}</span>
                    <span className="text-[10px] text-gray-400">★</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // 4. Shop View
  const ShopView = () => (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-md mx-auto md:mx-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Danh mục</h3>
            <div className="space-y-2">
              {['Tất cả', 'Ghế', 'Bàn', 'Phụ kiện'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600" 
                  />
                  <span className="text-gray-600 group-hover:text-emerald-600 transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Khoảng giá</h3>
            <input 
              type="range" 
              className="w-full accent-emerald-600" 
              min="0" 
              max="20000000" 
              step="100000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="priceRange" 
                  checked={priceRange[0] === 0 && priceRange[1] === 20000000}
                  onChange={() => setPriceRange([0, 20000000])}
                />
                Tất cả
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="priceRange" 
                  checked={priceRange[0] === 0 && priceRange[1] === 5000000}
                  onChange={() => setPriceRange([0, 5000000])}
                />
                Dưới 5 triệu
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="priceRange" 
                  checked={priceRange[0] === 5000000 && priceRange[1] === 10000000}
                  onChange={() => setPriceRange([5000000, 10000000])}
                />
                5 - 10 triệu
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="radio" 
                  name="priceRange" 
                  checked={priceRange[0] === 10000000 && priceRange[1] === 20000000}
                  onChange={() => setPriceRange([10000000, 20000000])}
                />
                Trên 10 triệu
              </label>
            </div>
          </div>
          <button 
            onClick={clearFilters}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="flex-1">
          {/* Active Filters */}
          {(selectedCategory !== 'Tất cả' || priceRange[1] < 20000000 || searchQuery) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                {selectedCategory !== 'Tất cả' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    Danh mục: {selectedCategory}
                    <button onClick={() => setSelectedCategory('Tất cả')} className="ml-1 hover:text-emerald-900">×</button>
                  </span>
                )}
                {priceRange[1] < 20000000 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    Giá: ≤ {formatPrice(priceRange[1])}
                    <button onClick={() => setPriceRange([0, 20000000])} className="ml-1 hover:text-emerald-900">×</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    Tìm kiếm: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-emerald-900">×</button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline ml-2">
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Hiển thị {filteredProducts.length} sản phẩm</p>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-700"
            >
              <option>Mới nhất</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
              <option>Tên A-Z</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
                <div className="relative overflow-hidden aspect-square cursor-pointer" onClick={() => { setSelectedProduct(product); setView('DETAIL'); }}>
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs text-gray-400 font-medium mb-1">{product.category}</span>
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2 cursor-pointer" onClick={() => { setSelectedProduct(product); setView('DETAIL'); }}>{product.name}</h3>
                  <div className="mt-auto flex justify-between items-center mb-4">
                    <span className="text-emerald-600 font-bold text-lg">{formatPrice(product.price)}</span>
                    <span className="text-sm text-gray-400">Đã bán 100+</span>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full border-2 border-emerald-600 text-emerald-600 py-2.5 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 5. Product Detail View
  const ProductDetailView = () => {
    if (!selectedProduct) return null;
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => setView('SHOP')} className="text-gray-500 hover:text-emerald-600 flex items-center gap-1 mb-8">
          <ChevronRight size={18} className="rotate-180" /> Quay lại cửa hàng
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="rounded-2xl overflow-hidden">
            <img src={selectedProduct.image} className="w-full h-auto object-cover" alt={selectedProduct.name} />
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">{selectedProduct.category}</span>
                <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{selectedProduct.name}</h1>
              </div>
              <button 
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`p-3 bg-gray-50 rounded-full transition-colors ${
                  isInWishlist(selectedProduct.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart size={24} fill={isInWishlist(selectedProduct.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-400">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <span className="text-gray-400 text-sm">| 152 Đánh giá | 452 Đã bán</span>
            </div>
            <div className="text-4xl font-black text-emerald-600 mb-8">{formatPrice(selectedProduct.price)}</div>
            <p className="text-gray-600 leading-relaxed mb-8">{selectedProduct.description}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">✓</div>
                <span>Bảo hành chính hãng 5 năm</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">✓</div>
                <span>Giao hàng và lắp đặt tận nơi miễn phí</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => addToCart(selectedProduct)}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
              >
                Thêm vào giỏ hàng
              </button>
              <button className="flex-1 bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-bold text-lg hover:border-emerald-600 hover:text-emerald-600 transition-all">
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5.5. Blog Detail View
  const BlogDetailView = () => {
    if (!selectedBlog) return null;
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => { setSelectedBlog(null); setView('BLOG'); }} className="text-gray-500 hover:text-emerald-600 flex items-center gap-1 mb-8">
          <ChevronRight size={18} className="rotate-180" /> Quay lại Blog
        </button>
        
        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <img src={selectedBlog.image} className="w-full h-full object-cover" alt={selectedBlog.title} />
          </div>
          
          <div className="p-8 lg:p-12">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="font-medium">{selectedBlog.author}</span>
              <span>•</span>
              <span>{new Date(selectedBlog.date).toLocaleDateString('vi-VN')}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{selectedBlog.title}</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 leading-relaxed mb-8">{selectedBlog.excerpt}</p>
              
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedBlog.content}
              </div>
            </div>
            
            <div className="border-t border-gray-100 mt-12 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-lg">{selectedBlog.author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedBlog.author}</p>
                    <p className="text-sm text-gray-500">Tác giả</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedBlog(null); setView('BLOG'); }}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Đọc thêm bài viết
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  };

  // 6. Cart View
  const CartView = () => (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h2>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-8">Giỏ hàng đang trống</p>
          <button onClick={() => setView('SHOP')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold">Tiếp tục mua sắm</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <img src={product.image} className="w-24 h-24 object-cover rounded-xl" alt={product.name} />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                    <p className="text-emerald-600 font-bold">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button className="px-3 py-1 hover:bg-gray-50">-</button>
                        <span className="px-3 py-1 border-x font-medium">{item.quantity}</span>
                        <button className="px-3 py-1 hover:bg-gray-50">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm font-medium hover:underline">Xóa</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
            <h3 className="text-xl font-bold mb-6">Tổng cộng</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-medium text-emerald-600">Miễn phí</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-bold text-lg">Tổng tiền</span>
                <span className="font-bold text-lg text-emerald-600">{formatPrice(cartTotal)}</span>
              </div>
            </div>
            <button onClick={() => setView('CHECKOUT')} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">Thanh toán ngay</button>
          </div>
        </div>
      )}
    </div>
  );

  // 6.5. Checkout View
  const CheckoutView = () => {
    const handleCheckout = async () => {
      try {
        await apiService.createOrder();
        alert('Order placed successfully!');
        setCart([]);
        setView('HOME');
      } catch (error) {
        alert('Failed to place order');
      }
    };

    return (
      <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Thanh toán</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Thông tin giao hàng</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Họ tên" className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none" />
                <input type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none" />
                <input type="tel" placeholder="Số điện thoại" className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none" />
                <textarea placeholder="Địa chỉ" rows={3} className="w-full p-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none"></textarea>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">Phương thức thanh toán</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" className="w-4 h-4 text-emerald-600 accent-emerald-600" defaultChecked />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment" className="w-4 h-4 text-emerald-600 accent-emerald-600" />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
            <h3 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h3>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} className="w-12 h-12 object-cover rounded-lg" alt={item.product.name} />
                    <div>
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng</span>
                <span className="text-emerald-600">{formatPrice(cartTotal)}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg mt-6">
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 7. Login View
  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedName = name.trim();
      try {
        if (isRegister) {
          await apiService.register({ email: trimmedEmail, password: trimmedPassword, name: trimmedName });
          alert('Registration successful! Please login.');
          setIsRegister(false);
          setName('');
        } else {
          const result = await apiService.login({ email: trimmedEmail, password: trimmedPassword });
          // Use actual user data from backend
          const user = {
            id: result.user.id.toString(),
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.email}`,
          };
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          await fetchCart();
          // Set view based on role
          if (user.role === 'ADMIN') {
            setView('ADMIN');
          } else {
            setView('HOME');
          }
        }
      } catch (err) {
        setError('Authentication failed');
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
          <h2 className="text-3xl font-black text-center mb-2">
            {isRegister ? 'Đăng ký' : 'Đăng nhập'}
          </h2>
          <p className="text-gray-400 text-center mb-8">
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Họ tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none"
              required
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg"
            >
              {isRegister ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <span
              className="text-emerald-600 font-bold cursor-pointer ml-1"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký'}
            </span>
          </p>
        </div>
      </div>
    );
  };

  // 7.5. Blog View
  const BlogView = () => (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Ergolife</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá những bài viết hữu ích về công thái học, sức khỏe làm việc và mẹo hay để có một không gian làm việc hoàn hảo.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer group" onClick={() => { setSelectedBlog(blog); setView('DETAIL'); }}>
              <div className="aspect-video overflow-hidden">
                <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={blog.title} />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>{blog.author}</span>
                  <span>•</span>
                  <span>{new Date(blog.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">{blog.title}</h3>
                <p className="text-gray-600 line-clamp-3">{blog.excerpt}</p>
                <div className="mt-4 flex items-center text-emerald-600 font-medium">
                  <span>Đọc thêm</span>
                  <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 8. Admin View
  const AdminView = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState<any>({});
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showAddBlogModal, setShowAddBlogModal] = useState(false);
    const [showEditBlogModal, setShowEditBlogModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [newUser, setNewUser] = useState({
      name: '',
      email: '',
      role: 'USER'
    });
    const [newProduct, setNewProduct] = useState({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      stock: ''
    });
    const [newBlog, setNewBlog] = useState({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      image_url: '',
      published: false
    });

    useEffect(() => {
      if (activeTab === 'dashboard') {
        loadDashboard();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'products') {
        loadProducts();
      } else if (activeTab === 'vouchers') {
        loadVouchers();
      } else if (activeTab === 'blogs') {
        loadBlogs();
      }
    }, [activeTab]);

    const loadDashboard = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };

    const loadUsers = async () => {
      try {
        const data = await apiService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    const loadProducts = async () => {
      try {
        const data = await apiService.getAdminProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    const loadVouchers = async () => {
      try {
        const data = await apiService.getVouchers();
        setVouchers(data);
      } catch (error) {
        console.error('Failed to load vouchers:', error);
      }
    };

    const loadBlogs = async () => {
      try {
        const data = await apiService.getBlogs();
        setBlogs(data);
      } catch (error) {
        console.error('Failed to load blogs:', error);
      }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const productData = {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image_url: newProduct.image_url,
          category: newProduct.category,
          stock: parseInt(newProduct.stock)
        };
        await apiService.createAdminProduct(productData);
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          image_url: '',
          category: '',
          stock: ''
        });
        // Reload products
        loadProducts();
      } catch (error) {
        console.error('Failed to add product:', error);
        alert('Failed to add product');
      } finally {
        setLoading(false);
      }
    };

    const handleEditProduct = (product: any) => {
      setEditingProduct(product);
      setNewProduct({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image_url: product.image_url,
        category: product.category,
        stock: product.stock.toString()
      });
      setShowEditProductModal(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProduct) return;
      
      setLoading(true);
      try {
        const productData = {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image_url: newProduct.image_url,
          category: newProduct.category,
          stock: parseInt(newProduct.stock)
        };
        await apiService.updateAdminProduct(editingProduct.id, productData);
        setShowEditProductModal(false);
        setEditingProduct(null);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          image_url: '',
          category: '',
          stock: ''
        });
        // Reload products
        loadProducts();
      } catch (error) {
        console.error('Failed to update product:', error);
        alert('Failed to update product');
      } finally {
        setLoading(false);
      }
    };

    const handleEditUser = (user: any) => {
      setEditingUser(user);
      setNewUser({
        name: user.name,
        email: user.email,
        role: user.role
      });
      setShowEditUserModal(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;

      setLoading(true);
      try {
        const userData = {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        };
        await apiService.updateAdminUser(editingUser.id, userData);
        setShowEditUserModal(false);
        setEditingUser(null);
        setNewUser({
          name: '',
          email: '',
          role: 'USER'
        });
        // Reload users
        loadUsers();
      } catch (error) {
        console.error('Failed to update user:', error);
        alert('Failed to update user');
      } finally {
        setLoading(false);
      }
    };

    const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const userData = {
          name: newUser.name,
          email: newUser.email,
          password: 'password123', // Default password, admin can change later
          role: newUser.role
        };
        await apiService.createUser(userData);
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          role: 'USER'
        });
        // Reload users
        loadUsers();
      } catch (error) {
        console.error('Failed to add user:', error);
        alert('Failed to add user');
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteUser = async (userId: number) => {
      if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

      try {
        await apiService.deleteAdminUser(userId);
        // Reload users
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    };

    const handleEditBlog = (blog: any) => {
      setEditingBlog(blog);
      setNewBlog({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        author: blog.author,
        image_url: blog.image_url,
        published: blog.published
      });
      setShowEditBlogModal(true);
    };

    const handleUpdateBlog = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBlog) return;
      
      setLoading(true);
      try {
        const blogData = {
          title: newBlog.title,
          excerpt: newBlog.excerpt,
          content: newBlog.content,
          author: newBlog.author,
          image_url: newBlog.image_url,
          published: newBlog.published
        };
        await apiService.updateBlog(editingBlog.id, blogData);
        setShowEditBlogModal(false);
        setEditingBlog(null);
        setNewBlog({
          title: '',
          excerpt: '',
          content: '',
          author: '',
          image_url: '',
          published: false
        });
        // Reload blogs
        loadBlogs();
      } catch (error) {
        console.error('Failed to update blog:', error);
        alert('Failed to update blog');
      } finally {
        setLoading(false);
      }
    };

    const handleAddBlog = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const blogData = {
          title: newBlog.title,
          excerpt: newBlog.excerpt,
          content: newBlog.content,
          author: newBlog.author,
          image_url: newBlog.image_url,
          published: newBlog.published
        };
        await apiService.createBlog(blogData);
        setShowAddBlogModal(false);
        setNewBlog({
          title: '',
          excerpt: '',
          content: '',
          author: '',
          image_url: '',
          published: false
        });
        // Reload blogs
        loadBlogs();
      } catch (error) {
        console.error('Failed to add blog:', error);
        alert('Failed to add blog');
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteBlog = async (blogId: number) => {
      if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

      try {
        await apiService.deleteBlog(blogId);
        // Reload blogs
        loadBlogs();
      } catch (error) {
        console.error('Failed to delete blog:', error);
        alert('Failed to delete blog');
      }
    };

    const tabs = [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { id: 'users', label: 'Người dùng', icon: UserIcon },
      { id: 'products', label: 'Sản phẩm', icon: Package },
      { id: 'vouchers', label: 'Voucher', icon: FileText },
      { id: 'blogs', label: 'Blog', icon: MessageSquare },
    ];

    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-gray-900 text-gray-400 p-6 flex flex-col">
          <div className="flex items-center gap-2 text-white mb-10">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Package size={18}/></div>
            <span className="font-bold text-lg">Ergolife Admin</span>
          </div>
          <nav className="space-y-2 flex-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id ? 'bg-emerald-600 text-white' : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20}/> {tab.label}
                </button>
              );
            })}
          </nav>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all text-red-400">
            <LogOut size={20}/> Đăng xuất
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <>
              <header className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                  <p className="text-gray-500">Chào mừng trở lại, {currentUser?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg border border-gray-200"><Settings size={20} className="text-gray-400"/></div>
                  <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden"><img src={currentUser?.avatar} alt="avatar" /></div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Doanh thu</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{formatPrice(dashboardData.revenue || 0)}</h3>
                  <p className="text-xs mt-2 font-bold text-emerald-600">+12% so với tháng trước</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Đơn hàng</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{dashboardData.orders || 0}</h3>
                  <p className="text-xs mt-2 font-bold text-emerald-600">+5% so với tháng trước</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Khách hàng</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{dashboardData.users || 0}</h3>
                  <p className="text-xs mt-2 font-bold text-emerald-600">+8% so với tháng trước</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Sản phẩm</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900">{dashboardData.products || 0}</h3>
                  <p className="text-xs mt-2 font-bold text-emerald-600">+2% so với tháng trước</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  + Thêm người dùng
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tên</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Vai trò</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.role}</td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-emerald-600 hover:text-emerald-800 mr-2"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h2>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  + Thêm sản phẩm
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tên sản phẩm</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Danh mục</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giá</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tồn kho</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{product.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-emerald-600 hover:text-emerald-800 mr-2"
                          >
                            Sửa
                          </button>
                          <button className="text-red-600 hover:text-red-800">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Voucher</h2>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">+ Thêm Voucher</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mô tả</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giảm giá</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vouchers.map((voucher: any) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{voucher.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{voucher.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : formatPrice(voucher.discount_value)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            voucher.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {voucher.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-emerald-600 hover:text-emerald-800 mr-2">Sửa</button>
                          <button className="text-red-600 hover:text-red-800">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Blog</h2>
                <button onClick={() => setShowAddBlogModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">+ Thêm Blog</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tiêu đề</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tác giả</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ngày tạo</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogs.map((blog: any) => (
                      <tr key={blog.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{blog.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{blog.author}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            blog.published ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(blog.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <button 
                            onClick={() => handleEditBlog(blog)}
                            className="text-emerald-600 hover:text-emerald-800 mr-2"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Voucher</h2>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">+ Thêm Voucher</button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Mô tả</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Giảm giá</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vouchers.map((voucher: any) => (
                      <tr key={voucher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{voucher.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{voucher.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : formatPrice(voucher.discount_value)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            voucher.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {voucher.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-emerald-600 hover:text-emerald-800 mr-2">Sửa</button>
                          <button className="text-red-600 hover:text-red-800">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Thêm sản phẩm mới</h3>
                <button 
                  onClick={() => setShowAddProductModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h3>
                <button 
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      price: '',
                      image_url: '',
                      category: '',
                      stock: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProductModal(false);
                      setEditingProduct(null);
                      setNewProduct({
                        name: '',
                        description: '',
                        price: '',
                        image_url: '',
                        category: '',
                        stock: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa người dùng</h3>
                <button 
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                    setNewUser({
                      name: '',
                      email: '',
                      role: 'USER'
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="USER">USER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                      setNewUser({
                        name: '',
                        email: '',
                        role: 'USER'
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Thêm người dùng mới</h3>
                <button 
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({
                      name: '',
                      email: '',
                      role: 'USER'
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="USER">USER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Mật khẩu mặc định sẽ là "password123". Người dùng có thể thay đổi mật khẩu sau khi đăng nhập.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      setNewUser({
                        name: '',
                        email: '',
                        role: 'USER'
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang thêm...' : 'Thêm người dùng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Blog Modal */}
        {showAddBlogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Thêm bài viết mới</h3>
                <button 
                  onClick={() => setShowAddBlogModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
                  <textarea
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn về bài viết..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={8}
                    placeholder="Nội dung bài viết..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                  <input
                    type="text"
                    value={newBlog.author}
                    onChange={(e) => setNewBlog({...newBlog, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                  <input
                    type="url"
                    value={newBlog.image_url}
                    onChange={(e) => setNewBlog({...newBlog, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={newBlog.published}
                    onChange={(e) => setNewBlog({...newBlog, published: e.target.checked})}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Xuất bản ngay
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBlogModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang thêm...' : 'Thêm bài viết'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Blog Modal */}
        {showEditBlogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa bài viết</h3>
                <button 
                  onClick={() => {
                    setShowEditBlogModal(false);
                    setEditingBlog(null);
                    setNewBlog({
                      title: '',
                      excerpt: '',
                      content: '',
                      author: '',
                      image_url: '',
                      published: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({...newBlog, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
                  <textarea
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({...newBlog, excerpt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Tóm tắt ngắn gọn về bài viết..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({...newBlog, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={8}
                    placeholder="Nội dung bài viết..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                  <input
                    type="text"
                    value={newBlog.author}
                    onChange={(e) => setNewBlog({...newBlog, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                  <input
                    type="url"
                    value={newBlog.image_url}
                    onChange={(e) => setNewBlog({...newBlog, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-published"
                    checked={newBlog.published}
                    onChange={(e) => setNewBlog({...newBlog, published: e.target.checked})}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-published" className="ml-2 block text-sm text-gray-900">
                    Xuất bản
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditBlogModal(false);
                      setEditingBlog(null);
                      setNewBlog({
                        title: '',
                        excerpt: '',
                        content: '',
                        author: '',
                        image_url: '',
                        published: false
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {view !== 'ADMIN' && view !== 'STAFF' && <Navbar />}
      {view !== 'ADMIN' && view !== 'STAFF' && <MobileSearch />}
      
      <main className="flex-1">
        {view === 'HOME' && <HomeView />}
        {view === 'SHOP' && <ShopView />}
        {view === 'DETAIL' && (selectedProduct ? <ProductDetailView /> : selectedBlog ? <BlogDetailView /> : null)}
        {view === 'CART' && <CartView />}
        {view === 'CHECKOUT' && <CheckoutView />}
        {view === 'LOGIN' && <LoginView />}
        {view === 'BLOG' && <BlogView />}
        {view === 'ADMIN' && <AdminView />}
        {view === 'PROFILE' && (
          <div className="py-12 max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h2>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-6 mb-10">
                <img src={currentUser?.avatar} className="w-24 h-24 rounded-full border-4 border-emerald-50" alt="avatar" />
                <div>
                  <h3 className="text-2xl font-bold">{currentUser?.name}</h3>
                  <p className="text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentUser?.role === 'ADMIN' && (
                  <div className="md:col-span-2 mb-6">
                    <button 
                      onClick={() => setView('ADMIN')}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <Package size={20} /> Truy cập Admin Panel
                    </button>
                  </div>
                )}
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Package size={20} className="text-emerald-600"/> Đơn hàng gần đây</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                      <p className="text-sm font-bold">#ORD-12345</p>
                      <p className="text-xs text-gray-500">Đặt ngày 20/11/2023</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-emerald-600 font-bold">8.500.000đ</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Đã giao</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Heart size={20} className="text-red-500"/> Sản phẩm yêu thích</h4>
                  {wishlist.length === 0 ? (
                    <p className="text-sm text-gray-500">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
                  ) : (
                    <div className="space-y-4">
                      {products.filter(product => wishlist.includes(product.id)).map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                          <img src={product.image} className="w-16 h-16 object-cover rounded-xl" alt={product.name} />
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-900">{product.name}</h5>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <p className="text-emerald-600 font-bold">{formatPrice(product.price)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setSelectedProduct(product); setView('DETAIL'); }}
                              className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Xem
                            </button>
                            <button 
                              onClick={() => toggleWishlist(product.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {view !== 'ADMIN' && view !== 'STAFF' && <Footer />}
    </div>
  );
}

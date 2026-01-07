
import React, { useState, useEffect, useMemo } from 'react';
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [view, setView] = useState<'HOME' | 'SHOP' | 'CART' | 'PROFILE' | 'ADMIN' | 'STAFF' | 'BLOG' | 'DETAIL' | 'CHECKOUT' | 'LOGIN'>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  };

  // --- Cart Handlers ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
    alert('Đã thêm vào giỏ hàng!');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

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
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-transparent focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm sản phẩm..." 
                className="bg-transparent border-none outline-none ml-2 text-sm w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
          {MOCK_PRODUCTS.slice(0, 4).map(product => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
              <div className="relative overflow-hidden aspect-square">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                  <Heart size={20} />
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
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Danh mục</h3>
            <div className="space-y-2">
              {['Tất cả', 'Ghế', 'Bàn', 'Phụ kiện'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="cat" className="w-4 h-4 text-emerald-600 accent-emerald-600" defaultChecked={cat === 'Tất cả'} />
                  <span className="text-gray-600 group-hover:text-emerald-600 transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Khoảng giá</h3>
            <input type="range" className="w-full accent-emerald-600" min="0" max="20000000" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0đ</span>
              <span>20tr+</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Hiển thị {MOCK_PRODUCTS.length} sản phẩm</p>
            <select className="bg-transparent border-none outline-none text-sm font-medium text-gray-700">
              <option>Mới nhất</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
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
              <button className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                <Heart size={24} />
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
              const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={item.productId} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
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
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-500 text-sm font-medium hover:underline">Xóa</button>
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

  // 7. Login View
  const LoginView = () => (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-2">Chào mừng trở lại</h2>
        <p className="text-gray-400 text-center mb-8">Vui lòng chọn vai trò để tiếp tục demo</p>
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin(UserRole.USER)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <UserIcon size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold">Người dùng</p>
                <p className="text-xs text-gray-400">Mua sắm, quản lý đơn hàng</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-emerald-600" />
          </button>
          <button 
            onClick={() => handleLogin(UserRole.STAFF)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold">Nhân viên</p>
                <p className="text-xs text-gray-400">Quản lý kho, hỗ trợ khách hàng</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-emerald-600" />
          </button>
          <button 
            onClick={() => handleLogin(UserRole.ADMIN)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <LayoutDashboard size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold">Quản trị viên</p>
                <p className="text-xs text-gray-400">Quản trị hệ thống, thống kê</p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-emerald-600" />
          </button>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Chưa có tài khoản? <span className="text-emerald-600 font-bold cursor-pointer">Đăng ký ngay</span>
        </p>
      </div>
    </div>
  );

  // 8. Admin View
  const AdminView = () => (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 text-gray-400 p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-2 text-white mb-10">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Package size={18}/></div>
          <span className="font-bold text-lg">Ergolife Admin</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium"><LayoutDashboard size={20}/> Tổng quan</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all"><ShoppingCart size={20}/> Đơn hàng</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all"><Package size={20}/> Sản phẩm</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all"><UserIcon size={20}/> Khách hàng</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all"><TrendingUp size={20}/> Marketing</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all"><FileText size={20}/> Voucher</button>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-xl transition-all text-red-400">
          <LogOut size={20}/> Đăng xuất
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
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
          {[
            { label: 'Doanh thu', value: '1.280.000.000đ', trend: '+12%', color: 'bg-blue-500' },
            { label: 'Đơn hàng', value: '152', trend: '+5%', color: 'bg-emerald-500' },
            { label: 'Khách hàng', value: '1,240', trend: '+8%', color: 'bg-purple-500' },
            { label: 'Tỉ lệ chuyển đổi', value: '4.2%', trend: '-2%', color: 'bg-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</h3>
              <p className={`text-xs mt-2 font-bold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{stat.trend} so với tháng trước</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10 h-[400px]">
          <h3 className="font-bold text-gray-900 mb-6">Phân tích doanh thu</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { name: 'T1', rev: 400 }, { name: 'T2', rev: 300 }, { name: 'T3', rev: 500 },
              { name: 'T4', rev: 800 }, { name: 'T5', rev: 600 }, { name: 'T6', rev: 900 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Đơn hàng mới nhất</h3>
            <button className="text-emerald-600 text-sm font-bold">Xem tất cả</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Giá</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { id: '#ORD-001', user: 'Lê Văn B', product: 'Ghế ErgoMaster', price: '8.500.000đ', status: 'Đang giao' },
                { id: '#ORD-002', user: 'Trần Thị C', product: 'Bàn FlexiDesk', price: '12.500.000đ', status: 'Đã hoàn thành' },
                { id: '#ORD-003', user: 'Phạm Văn D', product: 'Chuột Vertical', price: '950.000đ', status: 'Đã hủy' },
              ].map((ord, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ord.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ord.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ord.product}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{ord.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      ord.status === 'Đã hoàn thành' ? 'bg-emerald-100 text-emerald-600' : 
                      ord.status === 'Đang giao' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                    }`}>{ord.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {view !== 'ADMIN' && view !== 'STAFF' && <Navbar />}
      
      <main className="flex-1">
        {view === 'HOME' && <HomeView />}
        {view === 'SHOP' && <ShopView />}
        {view === 'DETAIL' && <ProductDetailView />}
        {view === 'CART' && <CartView />}
        {view === 'LOGIN' && <LoginView />}
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
                  <p className="text-sm text-gray-500">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
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

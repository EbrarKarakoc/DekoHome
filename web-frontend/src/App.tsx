import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, Search, User, ShoppingBag, ChevronRight, Star, StarHalf, Edit, Trash2, Camera, Info, Truck, CheckCircle, CreditCard, Wallet, Banknote, Lock, Loader2, Sofa, Bed, Utensils, Briefcase, Package, Sparkles, Mail, Phone, History, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Product {
  _id?: string;
  id?: number;
  name: string;
  price: number;
  desc: string;
  category: string;
  imageUrl: string;
}

// --- Toast Context ---
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}
const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md",
                toast.type === 'error' ? "bg-red-50 border-red-200 text-red-800" :
                  toast.type === 'success' ? "bg-green-50 border-green-200 text-green-800" :
                    "bg-white border-slate-200 text-slate-800"
              )}
            >
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const handleAuthError = (res: Response, navigate: any, showToast: any) => {
  if (res.status === 401) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.dispatchEvent(new Event('authChange'));
    showToast('Oturumunuz sona erdi, lütfen tekrar giriş yapın.', 'error');
    navigate('/login');
    return true;
  }
  return false;
};

const Header = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<{name: string} | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    
    const fetchCartCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }
      try {
        const res = await fetch('/v1/cart', { headers: { 'Authorization': `Bearer ${token}` } });
        if (handleAuthError(res, navigate, showToast)) return;
        
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          setCartCount(items.reduce((acc: number, item: any) => acc + item.quantity, 0));
        }
      } catch (e) {}
    };

    checkAuth();
    fetchCartCount();
    
    const handleAuthChange = () => {
      checkAuth();
      fetchCartCount();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', checkAuth);
    window.addEventListener('cartUpdated', fetchCartCount);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-yellow-500/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-yellow-600">
            <Home className="w-8 h-8" />
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">DekoHome</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/categories" className="text-sm font-medium hover:text-yellow-600 transition-colors">Kategoriler</Link>
            <Link to="/cart" className="relative group text-sm font-medium hover:text-yellow-600 transition-colors flex items-center gap-1.5">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-slate-700 group-hover:text-yellow-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 border-[1.5px] border-white"></span>
                  </span>
                )}
              </div>
              <span>Sepetim</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/profile" className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              <span className="text-sm font-bold text-slate-700 hidden sm:block">{(user as any).ad} {(user as any).soyad}</span>
              <img src="https://picsum.photos/seed/avatar/200/200" alt="Profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-yellow-500/20" />
            </Link>
          ) : (
            <Link to="/login" className="flex items-center justify-center rounded-full bg-yellow-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-yellow-600/20 hover:bg-yellow-700 transition-all">
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-20 lg:px-40 mt-auto">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-white">
            <Home className="w-8 h-8 text-yellow-600" />
            <h2 className="text-2xl font-bold tracking-tight">DekoHome</h2>
          </div>
          <p className="text-sm leading-relaxed opacity-80 italic font-medium mt-2">
            "Evinizi Hikayeleştirin. Eviniz için akıllı ve şık çözümler. Hayatınızı kolaylaştıran modern tasarımları keşfedin."
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Hızlı Bağlantılar</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/" className="hover:text-yellow-600 transition-colors">Ana Sayfa</Link></li>
            <li><Link to="/categories" className="hover:text-white transition-colors">Tüm Ürünler</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Sepetim</Link></li>
            <li><Link to="/profile" className="hover:text-white transition-colors">Hesabım</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">DekoHome Üyesi Olun</h4>
          <p className="text-sm mb-4">Henüz bir hesabınız yok mu? Ailemize katılıp hemen alışverişe başlayın.</p>
          <Link to="/register" className="inline-flex items-center justify-center bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-yellow-700 transition-all text-sm shadow-md">
            Hemen Kayıt Ol
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2024 DekoHome. Tüm hakları saklıdır.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
          <a href="#" className="hover:text-white transition-colors">Hizmet Şartları</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Hero Slider Component ---
const HeroSlider = () => {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
      title: "Evinizdeki Konforu",
      subtitle: "Yeniden Tanımlayın",
      description: "Modern ve şık tasarımlarla yaşam alanlarınıza yeni bir soluk getirin. Kalite ve estetiğin mükemmel uyumu."
    },
    {
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
      title: "Huzurlu Uykular,",
      subtitle: "Modern Dokunuşlar",
      description: "Yatak odanızda İskandinav esintileriyle huzuru hissedin. Fonksiyonel ve göz alıcı çözümler sizi bekliyor."
    },
    {
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
      title: "Mutfakta Estetik ve",
      subtitle: "Fonksiyonellik",
      description: "Lezzetli anlarınıza eşlik edecek, her ayrıntısı özenle düşünülmüş mutfak ve yemek odası tasarımları."
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl lg:rounded-3xl h-[500px] md:h-[650px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.25)), url('${slides[current].image}')` }}
        >
          <div className="container mx-auto px-8 lg:px-16 h-full flex items-center">
            <div className="max-w-2xl space-y-6">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h1 className="text-5xl font-black leading-[1.1] text-white lg:text-7xl font-serif text-left">
                  {slides[current].title} <br />
                  <span className="text-yellow-500">{slides[current].subtitle}</span>
                </h1>
                <p className="text-lg text-slate-100 lg:text-xl font-medium max-w-lg mt-6 text-left">
                  {slides[current].description}
                </p>
                <div className="pt-8 flex gap-4">
                   <Link to="/categories" className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-yellow-600/30 flex items-center gap-2 group">
                      Koleksiyonu Keşfet <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "w-12 h-1.5 rounded-full transition-all duration-500",
              current === i ? "bg-yellow-500 w-20" : "bg-white/30 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/v1/products')
      .then(async res => {
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const products = Array.isArray(data) ? data : (data.products || data.data || []);
        setFeaturedProducts(products.slice(0, 4));
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        showToast('Ürünler yüklenirken bir ağ veya sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const navigate = useNavigate();
  const handleAddToCart = async (product: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Sepete ürün eklemek için giriş yapmalısınız.', 'error');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/v1/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: String(product._id || product.id),
          quantity: 1
        })
      });

      if (res.status === 401) {
        handleAuthError(res, navigate, showToast);
        return;
      }

      if (res.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
        showToast('Ürün sepete eklendi.', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Sepete eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/v1/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(e => console.error(e));
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sofa': return <Sofa className="w-8 h-8 transition-colors" />;
      case 'Bed': return <Bed className="w-8 h-8 transition-colors" />;
      case 'Utensils': return <Utensils className="w-8 h-8 transition-colors" />;
      case 'Briefcase': return <Briefcase className="w-8 h-8 transition-colors" />;
      case 'Package': return <Package className="w-8 h-8 transition-colors" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 transition-colors" />;
      default: return <Package className="w-8 h-8 transition-colors" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
      <section className="px-6 py-6 lg:px-10 max-w-7xl mx-auto">
        <HeroSlider />
      </section>

      <section className="container mx-auto px-6 py-12 lg:px-10 max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-serif">Kategoriler</h2>
            <p className="text-slate-500 mt-1">İhtiyacınıza uygun alanı seçin</p>
          </div>
          <Link to="/categories" className="text-yellow-600 font-semibold flex items-center gap-1 hover:underline">
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 border-t border-slate-100 pt-8">
          {[
            { name: 'Oturma Odası', icon: <Sofa className="w-8 h-8 group-hover:text-yellow-600 transition-colors" /> },
            { name: 'Yatak Odası', icon: <Bed className="w-8 h-8 group-hover:text-yellow-600 transition-colors" /> },
            { name: 'Mutfak', icon: <Utensils className="w-8 h-8 group-hover:text-yellow-600 transition-colors" /> },
            { name: 'Ofis', icon: <Briefcase className="w-8 h-8 group-hover:text-yellow-600 transition-colors" /> },
            { name: 'Depolama', icon: <Package className="w-8 h-8 group-hover:text-yellow-600 transition-colors" /> },
            { name: 'Dekorasyon', icon: <Sparkles className="w-8 h-8 group-hover:text-yellow-600 transition-colors" /> }
          ].map((cat) => (
            <Link to="/categories" key={cat.name} className="group flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-white rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-yellow-100 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md">
                {cat.icon}
              </div>
              <span className="font-bold text-slate-900 text-center tracking-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black tracking-tight font-serif">Öne Çıkan Ürünler</h2>
            <div className="mx-auto mt-2 h-1 w-20 bg-yellow-500 rounded-full"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((prod) => (
                <Link to={`/product/${prod._id || prod.id}`} key={prod._id || prod.id} className="group relative flex flex-col">
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-50">
                    <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-cover transition-opacity group-hover:opacity-90" referrerPolicy="no-referrer" />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{prod.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{prod.desc}</p>
                      <p className="mt-2 text-xl font-black text-slate-900">{prod.price.toLocaleString('tr-TR')} TL</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(prod);
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-600 py-3 text-sm font-bold text-white hover:bg-yellow-700 transition-colors"
                    >
                      <ShoppingBag className="w-5 h-5" /> Sepete Ekle
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/v1/products')
      .then(async res => {
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const products = Array.isArray(data) ? data : (data.products || data.data || []);
        setAllProducts(products);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        showToast('Ürünler yüklenirken bir ağ veya sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Sepete ürün eklemek için giriş yapmalısınız.', 'error');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/v1/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: String(product._id || product.id),
          quantity: 1
        })
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
        showToast('Ürün sepete eklendi.', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Sepete eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const categories = [
    { name: 'Oturma Odası', icon: <Sofa className="w-8 h-8 text-slate-700" /> },
    { name: 'Yatak Odası', icon: <Bed className="w-8 h-8 text-slate-700" /> },
    { name: 'Mutfak', icon: <Utensils className="w-8 h-8 text-slate-700" /> },
    { name: 'Ofis', icon: <Briefcase className="w-8 h-8 text-slate-700" /> },
    { name: 'Depolama', icon: <Package className="w-8 h-8 text-slate-700" /> },
    { name: 'Dekorasyon', icon: <Sparkles className="w-8 h-8 text-slate-700" /> }
  ];

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev =>
      prev.includes(catName)
        ? prev.filter(c => c !== catName)
        : [...prev, catName]
    );
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      <div className="flex items-center gap-2 mb-6 text-slate-500 text-sm">
        <Link to="/" className="hover:text-yellow-600"><Home className="w-4 h-4" /></Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-yellow-600 font-medium">Kategoriler & Ürünler</span>
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold tracking-tight font-serif text-slate-900 mb-2">Koleksiyonlar</h1>
          <p className="text-slate-600 text-xl max-w-2xl">Kategori tercihlerinizi yöneterek size en uygun dekorasyon önerilerini ve koleksiyonları listeleyin.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {categories.map((cat, i) => {
          const isSelected = selectedCategories.includes(cat.name);
          return (
            <button
              key={i}
              onClick={() => toggleCategory(cat.name)}
              className={cn(
                "group flex flex-col items-center justify-center gap-4 rounded-2xl p-6 transition-all duration-300 border",
                isSelected 
                  ? "bg-yellow-600 border-yellow-600 shadow-xl shadow-yellow-600/20 -translate-y-1" 
                  : "bg-white border-slate-100 hover:border-yellow-200 hover:shadow-lg"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                isSelected ? "bg-white/20 text-white" : "bg-slate-50 text-slate-700 group-hover:bg-yellow-50"
              )}>
                {getIcon(cat.icon || 'Package', isSelected)}
              </div>
              <span className={cn(
                "font-bold text-sm tracking-tight",
                isSelected ? "text-white" : "text-slate-900"
              )}>{cat.name}</span>
            </button>
          )
        })}
      </div>

      {(JSON.parse(localStorage.getItem('user') || '{}').role === 'admin') && (
        <div className="mb-8 flex justify-end">
          <button 
            onClick={() => {
              const name = prompt('Ürün Adı:');
              const price = prompt('Fiyat:');
              const desc = prompt('Açıklama:');
              const category = prompt('Kategori (Oturma Odası, Yatak Odası, Mutfak, Ofis, Depolama, Dekorasyon):');
              const imageUrl = prompt('Görsel URL (Boş bırakılabilir):');
              
              if (name && price && desc && category) {
                 const token = localStorage.getItem('token');
                 // First find categoryId
                 fetch('/v1/categories').then(r => r.json()).then(cats => {
                    const cat = cats.find((c: any) => c.name === category);
                    if (!cat) { alert('Hatalı kategori ismi!'); return; }
                    
                    fetch('/v1/products', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
                      body: JSON.stringify({ name, price: Number(price), description: desc, categoryId: cat._id, imageUrl })
                    }).then(res => {
                      if (res.ok) {
                        alert('Ürün başarıyla eklendi!');
                        window.location.reload();
                      } else {
                        alert('Ekleme başarısız!');
                      }
                    });
                 });
              }
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <Package className="w-5 h-5" /> Yeni Ürün Ekle (Admin)
          </button>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-slate-900">
          {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Tüm Ürünler'}
        </h2>
        <span className="text-slate-500 font-medium">{filteredProducts.length} Ürün</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-600" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 mb-24">
          {filteredProducts.map((prod, i) => (
            <Link to={`/product/${prod._id || prod.id}`} key={prod._id || prod.id} className="group relative flex flex-col">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-50 relative">
                <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  {prod.category}
                </div>
              </div>
              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">{prod.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{prod.desc}</p>
                  <p className="mt-2 text-xl font-black text-slate-900">{prod.price.toLocaleString('tr-TR')} TL</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(prod);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 text-slate-900 py-3 text-sm font-bold hover:bg-yellow-600 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" /> Sepete Ekle
                </button>
                {(JSON.parse(localStorage.getItem('user') || '{}').role === 'admin') && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
                        const token = localStorage.getItem('token');
                        fetch(`/v1/products/${prod._id || prod.id}`, {
                          method: 'DELETE',
                          headers: {'Authorization': `Bearer ${token}`}
                        }).then(res => {
                          if (res.ok) {
                            alert('Ürün silindi');
                            window.location.reload();
                          } else {
                            res.json().then(d => alert(d.message || 'Silinemedi'));
                          }
                        });
                      }
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 text-red-600 py-2 text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
                  >
                    <Trash2 className="w-4 h-4" /> Ürünü Sil
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 mb-24">
          <Search className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-slate-500 text-center max-w-md">Arama kriterlerinize uygun ürün bulamadık. Lütfen farklı anahtar kelimeler deneyin veya filtreleri temizleyin.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategories([]); }}
            className="mt-6 px-6 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </motion.div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'az' | 'za'>('newest');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    fetch(`/v1/products`)
      .then(async res => {
        if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const products = Array.isArray(data) ? data : (data.products || data.data || []);
        const found = products.find((p: any) => p._id === id || p.id === id || p.id === Number(id));
        if (found) {
          setProduct(found);
          // Fetch reviews
          fetch(`/v1/products/${found._id || found.id}/reviews`)
            .then(res => res.json())
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error fetching reviews:', err));
        } else {
          throw new Error('Ürün bulunamadı');
        }
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        showToast('Ürün detayları yüklenirken bir ağ veya sunucu hatası oluştu. Lütfen bağlantınızı kontrol edin.', 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">Ürün bulunamadı</h2>
        <Link to="/categories" className="text-yellow-600 hover:underline">Kategorilere dön</Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Sepete ürün eklemek için giriş yapmalısınız.', 'error');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/v1/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: String(product._id || product.id),
          quantity: 1
        })
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        window.dispatchEvent(new Event('cartUpdated'));
        showToast('Ürün sepete eklendi.', 'success');
        navigate('/cart');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Sepete eklenirken bir hata oluştu');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Yorum yapmak için giriş yapın.', 'info');
      navigate('/login');
      return;
    }
    try {
      if (reviewToEdit) {
        const res = await fetch(`/v1/reviews/${reviewToEdit.id || reviewToEdit._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ rating, comment })
        });
        if (handleAuthError(res, navigate, showToast)) return;
        if (res.ok) {
          showToast('Yorumunuz güncellendi.', 'success');
          setReviews(reviews.map(r => (r.id || r._id) === (reviewToEdit.id || reviewToEdit._id) ? { ...r, rating, comment } : r));
        } else {
          showToast('Yorum güncellenemedi.', 'error');
        }
      } else {
        const res = await fetch(`/v1/products/${product._id || product.id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ rating, comment })
        });
        if (handleAuthError(res, navigate, showToast)) return;
        if (res.ok) {
          const newReview = await res.json();
          showToast('Yorumunuz eklendi.', 'success');
          setReviews([newReview, ...reviews]);
        } else {
          const err = await res.json();
          showToast(err.message || 'Yorum eklenemedi.', 'error');
        }
      }
    } catch (error) {
      showToast('Bir hata oluştu.', 'error');
    } finally {
      setIsReviewModalOpen(false);
      setReviewToEdit(null);
    }
  };
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        showToast('Yorum başarıyla silindi.', 'success');
        setReviews(reviews.filter(r => r.id !== reviewId));
      } else {
        showToast('Yorum silinemedi.', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu.', 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 pt-8">
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-stone-500">
          <li><Link to="/" className="hover:text-yellow-600 transition-colors">Ana Sayfa</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li><Link to="/categories" className="hover:text-yellow-600 transition-colors">{product.category}</Link></li>
          <li><ChevronRight className="w-3 h-3" /></li>
          <li className="font-medium text-slate-900">{product.name}</li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-start">
        <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden mb-8 lg:mb-0">
          <img src={product.imageUrl || "https://picsum.photos/seed/chair1/800/800"} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>

        <div className="px-4">
          <h1 className="text-4xl font-serif text-slate-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-medium text-stone-900 mb-6">{product.price.toLocaleString('tr-TR')} TL</p>
          <div className="space-y-6 text-stone-700">
            <p className="leading-relaxed">
              {product.desc}
            </p>
            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Ürün Özellikleri</h3>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Kategori: {product.category}</li>
                <li>Montaj: Kurulu olarak gönderilir</li>
              </ul>
            </div>
          </div>
          <div className="mt-10">
            <button
              onClick={handleAddToCart}
              className="w-full bg-slate-900 text-white py-4 px-8 rounded-full font-medium hover:bg-stone-800 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5" /> Sepete Ekle
            </button>
          </div>
        </div>
      </div>

      <section className="mt-20 border-t border-stone-200 pt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Müşteri Deneyimleri</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, idx) => {
                  const avg = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
                  return (
                    idx + 1 <= avg ? <Star key={idx} className="w-6 h-6 fill-current" /> :
                    idx + 0.5 <= avg ? <StarHalf key={idx} className="w-6 h-6 fill-current" /> :
                    <Star key={idx} className="w-6 h-6 text-stone-300" />
                  );
                })}
              </div>
              <span className="text-xl font-bold">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
              <span className="text-stone-500 text-sm">({reviews.length} Değerlendirme)</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-lg border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-white"
            >
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="highest">En Yüksek Puan</option>
              <option value="lowest">En Düşük Puan</option>
              <option value="az">A-Z Sırala</option>
              <option value="za">Z-A Sırala</option>
            </select>
            <button onClick={() => { setReviewToEdit(null); setIsReviewModalOpen(true); }} className="bg-yellow-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-yellow-700 transition-all font-semibold text-sm">
              Yorum Yap
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {(() => {
            const sortedReviews = [...reviews].sort((a, b) => {
              switch (sortBy) {
                case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest': return b.rating - a.rating;
                case 'lowest': return a.rating - b.rating;
                case 'az': return (a.userName || '').localeCompare(b.userName || '');
                case 'za': return (b.userName || '').localeCompare(a.userName || '');
                case 'newest':
                default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }
            });
            return sortedReviews.length > 0 ? sortedReviews.map(review => (
            <article key={review.id} className="border-b border-stone-100 pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center font-bold text-stone-500 uppercase">
                    {review.userName ? review.userName.substring(0, 2) : 'A'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{review.userName || 'Anonim'}</h4>
                    <time className="text-xs text-stone-400">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex text-yellow-500 scale-75">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`w-6 h-6 ${idx < review.rating ? 'fill-current' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  {((currentUser?.role === 'admin') || (currentUser?.id === review.userId)) && (
                    <div className="flex items-center gap-1">
                      {currentUser?.id === review.userId && (
                        <button
                          onClick={() => { setReviewToEdit(review); setIsReviewModalOpen(true); }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors shrink-0"
                          title="Yorumu Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id || review._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                        title="Yorumu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-stone-600 italic">"{review.comment}"</p>
            </article>
          )) : (
            <p className="text-stone-500 italic">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          );
        })()}
        </div>
      </section>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSubmit={handleSubmitReview} 
        productName={product.name} 
        initialRating={reviewToEdit ? reviewToEdit.rating : 5}
        initialComment={reviewToEdit ? reviewToEdit.comment : ''}
      />
    </motion.div>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Sepetinizi görmek için giriş yapmalısınız.', 'info');
      navigate('/login');
      return;
    }

    const fetchCartAndProducts = async () => {
      try {
        // Fetch all products to get details (name, image, etc)
        const prodRes = await fetch('/v1/products');
        const prodData = await prodRes.json();
        const allProducts = Array.isArray(prodData) ? prodData : (prodData.products || prodData.data || []);
        setProducts(allProducts);

        // Fetch cart
        const cartRes = await fetch('/v1/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (handleAuthError(cartRes, navigate, showToast)) return;

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData.items || []);
          setTotal(cartData.total || 0);
        } else {
          throw new Error('Sepet yüklenemedi');
        }
      } catch (error: any) {
        console.error('Cart fetch error:', error);
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndProducts();
  }, [navigate]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/v1/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items);
        setTotal(data.total);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      showToast('Miktar güncellenemedi', 'error');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/v1/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.itemId !== itemId));
        window.dispatchEvent(new Event('cartUpdated'));
        // Re-fetch to get updated total, or calculate locally
        const cartRes = await fetch('/v1/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (handleAuthError(cartRes, navigate, showToast)) return;
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setTotal(cartData.total || 0);
        }
        showToast('Ürün sepetten silindi', 'success');
      }
    } catch (error) {
      showToast('Ürün silinemedi', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6 md:px-20 py-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-2 border-b border-stone-200 pb-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 font-serif">Alışveriş Sepeti</h1>
            <p className="text-stone-500 italic">
              {cartItems.length > 0 ? `Eviniz için ${cartItems.length} harika ekleme.` : 'Sepetiniz şu an boş.'}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-stone-900 mb-2">Sepetinizde ürün bulunmuyor</h3>
              <p className="text-stone-500 mb-6">Hemen alışverişe başlayarak sepetinizi doldurabilirsiniz.</p>
              <Link to="/categories" className="inline-flex items-center justify-center bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-700 transition-colors">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            cartItems.map((item, i) => {
              return (
                <div key={item.itemId} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                  <div className="w-full sm:w-32 aspect-square bg-stone-100 rounded-lg overflow-hidden shrink-0">
                    <img src={item.imageUrl || `https://picsum.photos/seed/cart${i}/200/200`} alt={item.name || 'Ürün'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900">{item.name || 'Bilinmeyen Ürün'}</h3>
                      </div>
                      <p className="text-lg font-bold text-stone-900">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-white">
                        <button onClick={() => handleUpdateQuantity(item.itemId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-stone-50">-</button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.itemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-stone-50">+</button>
                      </div>
                      <button onClick={() => handleRemoveItem(item.itemId)} className="text-stone-400 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition-colors"><Trash2 className="w-4 h-4" /> Sil</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="w-full lg:w-[350px]">
            <div className="sticky top-28 bg-stone-50 p-6 rounded-2xl border border-yellow-500/20">
              <h2 className="text-xl font-bold mb-6 text-stone-900 font-serif">Sipariş Özeti</h2>
              <div className="space-y-4 mb-8 text-sm">
                <div className="flex justify-between text-stone-600"><span>Ara Toplam</span><span>{total.toLocaleString('tr-TR')} TL</span></div>
                <div className="flex justify-between text-stone-600"><span>Kargo</span><span className="text-green-600 font-medium">Ücretsiz</span></div>
                <div className="pt-4 border-t border-stone-200 flex justify-between items-end">
                  <span className="text-base font-bold">Toplam</span>
                  <span className="text-2xl font-black text-yellow-600">{total.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
              <div className="space-y-3">
                <Link to="/checkout" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">Ödeme Yap <ChevronRight className="w-5 h-5" /></Link>
                <Link to="/categories" className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-900 font-medium py-3 rounded-xl flex justify-center transition-colors">Alışverişe Devam Et</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Kredi / Banka Kartı');
  const [paymentLast4, setPaymentLast4] = useState('4912');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Ödeme yapmak için giriş yapmalısınız.', 'info');
      navigate('/login');
      return;
    }

    const fetchCartAndProducts = async () => {
      try {
        const prodRes = await fetch('/v1/products');
        const prodData = await prodRes.json();
        const allProducts = Array.isArray(prodData) ? prodData : (prodData.products || prodData.data || []);
        setProducts(allProducts);

        const cartRes = await fetch('/v1/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (handleAuthError(cartRes, navigate, showToast)) return;

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          if (!cartData.items || cartData.items.length === 0) {
            showToast('Sepetiniz boş.', 'info');
            navigate('/cart');
            return;
          }
          setCartItems(cartData.items);
          setTotal(cartData.total);
        } else {
          throw new Error('Sepet yüklenemedi');
        }
      } catch (error: any) {
        showToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndProducts();
  }, [navigate]);

  const handleCheckout = async () => {
    if (!address.trim()) {
      showToast('Lütfen teslimat adresinizi girin.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    setSubmitting(true);

    try {
      const res = await fetch('/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address,
          note: 'Web üzerinden sipariş',
          paymentMethod,
          paymentLast4
        })
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        showToast('Siparişiniz başarıyla alındı!', 'success');
        navigate('/profile');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Sipariş oluşturulamadı');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-600" />
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 mb-8 text-sm text-slate-500">
        <Link to="/cart" className="hover:text-yellow-600">Sepetim</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 font-semibold">Ödeme & Teslimat</span>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold">1</span>
              <h2 className="text-2xl font-bold font-serif italic">Teslimat Bilgileri</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Ad Soyad</label><input defaultValue={`${user.ad || ''} ${user.soyad || ''}`} className="w-full rounded-lg border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500" placeholder="Mehmet Yılmaz" type="text" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">E-posta</label><input defaultValue={user.email} className="w-full rounded-lg border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500" placeholder="mehmet@örnek.com" type="email" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Adres</label><textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500" placeholder="Mahalle, Sokak, No, Daire..." rows={3}></textarea></div>
            </div>
          </section>
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold">2</span>
              <h2 className="text-2xl font-bold font-serif italic">Ödeme Yöntemi</h2>
            </div>
            <div className="space-y-4">
              <label className={cn(
                "flex items-center p-6 bg-white border-2 rounded-xl cursor-pointer transition-all",
                paymentMethod === 'Kredi / Banka Kartı' ? "border-yellow-600 shadow-lg shadow-yellow-600/10" : "border-slate-100"
              )}>
                <input 
                  checked={paymentMethod === 'Kredi / Banka Kartı'} 
                  onChange={() => setPaymentMethod('Kredi / Banka Kartı')}
                  className="text-yellow-600 focus:ring-yellow-500 h-5 w-5" 
                  name="payment" 
                  type="radio" 
                />
                <div className="ml-4 flex-1"><span className="block font-bold">Kredi / Banka Kartı</span><span className="text-sm text-slate-500">Tüm kartlara taksit imkanı</span></div>
                <CreditCard className="text-slate-400 w-6 h-6" />
              </label>
              {paymentMethod === 'Kredi / Banka Kartı' && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Kart Üzerindeki İsim</label><input className="w-full rounded-xl border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500 p-3" type="text" placeholder="AD SOYAD" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Kart Numarası</label><input onChange={(e) => setPaymentLast4(e.target.value.slice(-4))} className="w-full rounded-xl border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500 p-3" placeholder="0000 0000 0000 0000" type="text" /></div>
                    <div><label className="block text-sm font-medium mb-2">Son Kullanma (AA/YY)</label><input className="w-full rounded-xl border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500 p-3" placeholder="MM/YY" type="text" /></div>
                    <div><label className="block text-sm font-medium mb-2">CVV</label><input className="w-full rounded-xl border-slate-300 bg-transparent focus:ring-yellow-500 focus:border-yellow-500 p-3" placeholder="***" type="password" /></div>
                  </div>
                </div>
              )}
              <label className={cn(
                "flex items-center p-6 bg-white border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50",
                paymentMethod === 'Havale / EFT' ? "border-yellow-600 shadow-lg shadow-yellow-600/10" : "border-slate-100"
              )}>
                <input 
                  checked={paymentMethod === 'Havale / EFT'} 
                  onChange={() => setPaymentMethod('Havale / EFT')}
                  className="text-yellow-600 focus:ring-yellow-500 h-5 w-5" 
                  name="payment" 
                  type="radio" 
                />
                <div className="ml-4"><span className="block font-bold">Havale / EFT</span><span className="text-sm text-slate-500">Banka hesabına doğrudan transfer</span></div>
              </label>
            </div>
          </section>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-slate-50 p-8 rounded-2xl sticky top-28 border border-slate-200">
            <h3 className="text-xl font-bold mb-6 font-serif italic">Sipariş Özeti</h3>
            <div className="space-y-6 mb-8">
              {cartItems.map((item, i) => {
                return (
                  <div key={item.itemId} className="flex gap-4">
                    <div className="h-16 w-16 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-slate-100">
                      <img src={item.imageUrl || `https://picsum.photos/seed/checkout${i}/100/100`} alt={item.name || 'Ürün'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name || 'Bilinmeyen Ürün'} (x{item.quantity})</p>
                      <p className="font-bold mt-1">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-slate-200 pt-6 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600"><span>Ara Toplam</span><span>{total.toLocaleString('tr-TR')} TL</span></div>
              <div className="flex justify-between text-slate-600"><span>Kargo</span><span className="text-green-600 font-medium">Ücretsiz</span></div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-dashed border-slate-300"><span>Toplam</span><span>{total.toLocaleString('tr-TR')} TL</span></div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Siparişi Tamamla <Lock className="w-4 h-4" /></>}
              </button>
              <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest">256-bit SSL ile güvenli ödeme</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Review Modal Component ---
const ReviewModal = ({ isOpen, onClose, onSubmit, productName, initialRating = 5, initialComment = '' }: { isOpen: boolean, onClose: () => void, onSubmit: (rating: number, comment: string) => void, productName: string, initialRating?: number, initialComment?: string }) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
      setHover(0);
    }
  }, [isOpen, initialRating, initialComment]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif mb-1 text-left">Yorum Yap</h3>
              <p className="text-sm text-slate-500 font-medium text-left">{productName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hover || rating) >= star ? "fill-yellow-500 text-yellow-500" : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-slate-600">
              {rating === 1 ? 'Çok Kötü' : rating === 2 ? 'Kötü' : rating === 3 ? 'Normal' : rating === 4 ? 'İyi' : 'Harika!'}
            </p>
          </div>

          <div className="space-y-2 mb-8">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider text-left block">Yorumunuz</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors min-h-[120px] resize-none outline-none font-medium"
              placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button
            onClick={() => onSubmit(rating, comment)}
            disabled={!comment.trim()}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-600/20 disabled:opacity-50 disabled:shadow-none"
          >
            Değerlendirmeyi Gönder
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState('https://picsum.photos/seed/avatar/200/200');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{ ad: string; soyad: string; email: string; } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    // Profil sayfasına girildiğinde localStorage'dan kullanıcı bilgilerini al
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));

      // Siparişleri getir
      const fetchOrders = async () => {
        try {
          const res = await fetch('/v1/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (handleAuthError(res, navigate, showToast)) return;

          if (res.ok) {
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Siparişler yüklenirken hata oluştu:', error);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrders();
    } else {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      navigate('/login');
    }
  }, [navigate]);

  const handleCancelOrder = async (orderId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const res = await fetch(`/v1/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        showToast('Sipariş başarıyla iptal edildi.', 'success');
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'İptal Edildi' } : o));
      } else {
        const data = res.status !== 204 ? await res.json() : {};
        throw new Error(data.message || 'Sipariş iptal edilemedi');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedProductForReview) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/v1/products/${selectedProductForReview.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        showToast('Yorumunuz başarıyla gönderildi.', 'success');
        setIsReviewModalOpen(false);
        setSelectedProductForReview(null);
      } else {
        const data = await res.json();
        showToast(data.message || 'Yorum eklenemedi.', 'error');
      }
    } catch (error) {
      showToast('Yorum gönderilirken bir hata oluştu.', 'error');
    }
  };

  const [profileFormData, setProfileFormData] = useState({ ad: '', soyad: '' });
  
  useEffect(() => {
    if (user) {
      setProfileFormData({ ad: user.ad || '', soyad: user.soyad || '' });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      const res = await fetch(`/v1/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileFormData)
      });

      if (handleAuthError(res, navigate, showToast)) return;

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('authChange'));
        showToast('Profiliniz başarıyla güncellendi.', 'success');
      } else {
        const data = await res.json();
        showToast(data.message || 'Profil güncellenemedi.', 'error');
      }
    } catch (error) {
      showToast('Profil güncellenirken bir hata oluştu.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const totalTime = 2000; // 2 seconds
    const intervalTime = 100;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.round((currentStep / steps) * 100);
      setUploadProgress(progress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setIsUploading(false);
        setAvatarUrl(URL.createObjectURL(file));
      }
    }, intervalTime);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  if (!user) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 justify-center py-8 px-4 md:px-0">
      <div className="flex flex-col max-w-[1000px] flex-1">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 ring-4 ring-yellow-500/20 ring-offset-4 overflow-hidden relative" style={{ backgroundImage: `url("${avatarUrl}")` }}>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-yellow-500" />
                  <span className="text-xs font-bold">{uploadProgress}%</span>
                  <div className="w-20 h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-100 ease-linear" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              onClick={handleCameraClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-yellow-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-2xl font-bold mt-4 text-slate-900 font-serif">{user.ad} {user.soyad}</h1>
          <p className="text-slate-500 text-sm font-medium">DekoHome Üyesi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2 sticky top-28 h-fit">
            <button onClick={() => setActiveTab('profile')} className={clsx("w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all text-sm", activeTab === 'profile' ? "bg-yellow-600 text-white shadow-md shadow-yellow-600/20" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200")}>
              <User className="w-5 h-5" /> Profil Bilgileri
            </button>
            <button onClick={() => setActiveTab('orders')} className={clsx("w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all text-sm", activeTab === 'orders' ? "bg-yellow-600 text-white shadow-md shadow-yellow-600/20" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200")}>
              <Package className="w-5 h-5" /> Siparişlerim
            </button>
            <button onClick={() => setActiveTab('security')} className={clsx("w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all text-sm", activeTab === 'security' ? "bg-yellow-600 text-white shadow-md shadow-yellow-600/20" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200")}>
              <Lock className="w-5 h-5" /> Şifre ve Güvenlik
            </button>
            <div className="pt-6 mt-6 border-t border-slate-200">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm">
                Çıkış Yap
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
                    <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><User className="w-6 h-6" /></div>
                    <h2 className="text-3xl font-bold font-serif italic text-slate-900">Kişisel Bilgileri Güncelle</h2>
                  </div>
                  <form className="space-y-6 max-w-2xl" onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ad</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors font-medium text-slate-900" 
                            value={profileFormData.ad} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, ad: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Soyad</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors font-medium text-slate-900" 
                            value={profileFormData.soyad} 
                            onChange={(e) => setProfileFormData({ ...profileFormData, soyad: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">E-posta Adresi</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors cursor-not-allowed opacity-70 font-medium text-slate-900" defaultValue={user.email} disabled />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Info className="w-3 h-3" /> E-posta adresi sistem güvenliği sebebiyle değiştirilemez.</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 mt-8 flex justify-end">
                      <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-3.5 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-slate-900/20 flex items-center gap-2">
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
                    <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><Lock className="w-6 h-6" /></div>
                    <div className="space-y-1">
                      <h2 className="text-3xl font-bold font-serif italic text-slate-900">Şifre Değiştir</h2>
                      <p className="text-sm text-slate-500 font-medium">Hesabınızın güvenliği için güçlü bir şifre kullanın.</p>
                    </div>
                  </div>
                  <form className="space-y-6 max-w-2xl">
                    <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800/80 font-medium leading-relaxed">
                        Şifreniz en az 8 karakter uzunluğunda olmalı ve büyük harf, küçük harf ile rakam içermelidir. Güvenliğiniz için şifrenizi kimseyle paylaşmayın.
                      </p>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mevcut Şifre</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="password" placeholder="Mevcut şifrenizi girin" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors font-medium text-slate-900" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Yeni Şifre</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="password" placeholder="En az 8 karakter" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors font-medium text-slate-900" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Yeni Şifre Tekrar</label>
                        <div className="relative">
                          <History className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="password" placeholder="Yeni şifrenizi doğrulayın" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600 transition-colors font-medium text-slate-900" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 mt-8 flex justify-end">
                      <button type="button" onClick={() => showToast('Şifreniz başarıyla değiştirildi.', 'success')} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-10 py-3.5 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-yellow-600/20 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Şifreyi Güncelle
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-700"><Package className="w-6 h-6" /></div>
                    <h2 className="text-2xl font-bold font-serif italic text-slate-900">Siparişlerim</h2>
                  </div>

                  {loadingOrders ? (
                    <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <Loader2 className="w-10 h-10 animate-spin text-yellow-600" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900">Henüz siparişiniz bulunmuyor</h3>
                      <p className="text-slate-500 mb-8 max-w-sm mx-auto">Alışverişe başlayarak evinize değer katacak harika parçalar bulabilirsiniz.</p>
                      <Link to="/categories" className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-yellow-600/20">
                        Alışverişe Başla <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-6 xl:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className={clsx(
                                  "px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider",
                                  order.status === 'Hazırlanıyor' ? "bg-blue-100 text-blue-800" :
                                    order.status === 'Kargoya Verildi' ? "bg-purple-100 text-purple-800" :
                                      order.status === 'Teslim Edildi' ? "bg-green-100 text-green-800" :
                                        order.status === 'İptal Edildi' ? "bg-red-100 text-red-800" :
                                          "bg-yellow-100 text-yellow-800"
                                )}>
                                  {order.status}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-900 font-bold tracking-tight">#{order.id.substring(0, 8).toUpperCase()}</span>
                              </div>
                              <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                <History className="w-4 h-4" /> 
                                {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-left sm:text-right bg-slate-50 px-4 py-2 rounded-xl">
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Sipariş Tutarı</p>
                              <p className="text-xl font-black text-slate-900 flex items-baseline justify-end gap-1">
                                {order.total.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-500">TL</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                            <div className="flex flex-wrap gap-3">
                              {order.items.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                  <img src={item.imageUrl || `https://picsum.photos/seed/order${order.id}${idx}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              ))}
                              {order.items.length > 4 && (
                                <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 font-extrabold shadow-sm">
                                  <span className="text-xl">+{order.items.length - 4}</span>
                                  <span className="text-[10px] uppercase font-bold">Ürün</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3 w-full xl:w-auto">
                              <button 
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                className="flex-1 xl:flex-none justify-center px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm"
                              >
                                {expandedOrderId === order.id ? 'Detayları Gizle' : 'Detaylar'}
                              </button>
                              {(order.status === 'Hazırlanıyor' || order.status === 'Onaylandı' || order.status === 'Beklemede') && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="flex-1 xl:flex-none justify-center bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors border border-red-100 shadow-sm"
                                >
                                  İptal Et
                                </button>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedOrderId === order.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }} 
                                className="overflow-hidden"
                              >
                                <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col md:flex-row gap-8">
                                  <div className="flex-1 space-y-6">
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" /> Teslimat Bilgileri</h4>
                                      <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100 shadow-inner">
                                        <p className="font-bold text-slate-900 mb-1">{user?.ad} {user?.soyad}</p>
                                        <p>{order.address || 'Adres belirtilmemiş'}</p>
                                        <p className="text-slate-500 mt-2 font-medium flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Kargo: Yurtiçi Kargo</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-400" /> Ödeme Yöntemi</h4>
                                      <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 border border-slate-100 shadow-inner">
                                        <div className="w-10 h-6 bg-white rounded border border-slate-200 flex items-center justify-center">
                                          <div className="w-4 h-4 rounded-full bg-red-500 relative"><div className="w-4 h-4 rounded-full bg-orange-400 absolute left-2 mix-blend-multiply"></div></div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-slate-900">{order.paymentMethod || 'Kredi Kartı'}</p>
                                          <p className="text-xs text-slate-500 mt-0.5">**** **** **** {order.paymentLast4 || '4912'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-[1.5]">
                                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /> Sipariş İçeriği ({order.items.length} Ürün)</h4>
                                    <div className="space-y-3">
                                      {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors bg-white">
                                          <img src={item.imageUrl || `https://picsum.photos/seed/order${order.id}${idx}/100/100`} className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                                          <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start">
                                              <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.name || `Ürün ${idx + 1}`}</p>
                                              <p className="text-sm font-bold text-slate-900 ml-4 whitespace-nowrap">{(item.price * item.quantity).toLocaleString('tr-TR')} TL</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-1">
                                              <p className="text-xs text-slate-500 font-medium">Satıcı: DekoHome</p>
                                              <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Adet: {item.quantity}</p>
                                                <button
                                                  onClick={() => {
                                                    setSelectedProductForReview({ id: item.productId, name: item.name || `Ürün ${idx + 1}` });
                                                    setIsReviewModalOpen(true);
                                                  }}
                                                  className="text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-2 py-1 rounded border border-yellow-100 transition-colors flex items-center gap-1"
                                                >
                                                  <Edit className="w-3 h-3" /> Yorum Yap
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {isReviewModalOpen && selectedProductForReview && (
                <ReviewModal
                  isOpen={isReviewModalOpen}
                  productName={selectedProductForReview.name}
                  onClose={() => {
                    setIsReviewModalOpen(false);
                    setSelectedProductForReview(null);
                  }}
                  onSubmit={handleReviewSubmit}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        const decoded = parseJwt(data.token);
        
        if (decoded && decoded.userId) {
          localStorage.setItem('userId', decoded.userId);
          
          if (decoded.ad && decoded.soyad) {
            localStorage.setItem('user', JSON.stringify({
              id: decoded.userId,
              email: email,
              ad: decoded.ad,
              soyad: decoded.soyad
            }));
          }
        }

        window.dispatchEvent(new Event('authChange'));
        showToast('Başarıyla giriş yapıldı.', 'success');
        navigate('/');
      } else {
        throw new Error(data.message || 'Giriş başarısız');
      }
    } catch (error: any) {
      showToast(error.message || 'Giriş yapılırken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <section className="relative h-[30vh] md:h-auto md:w-1/2 overflow-hidden">
        <img src="/login-bg.png" alt="Modern Interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </section>
      <section className="px-6 py-10 -mt-6 md:mt-0 bg-white rounded-t-[32px] md:rounded-none relative z-10 md:w-1/2 md:flex md:flex-col md:justify-center md:px-16 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-serif">Giriş Yap</h2>
            <p className="text-slate-500 mt-2 text-sm">Hesabınıza giriş yaparak alışverişe devam edin.</p>
          </header>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">E-posta</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 text-sm"
                placeholder="ornek@mail.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Şifre</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 text-sm"
                placeholder="••••••••"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-600" />
                <span className="text-sm text-slate-600">Beni Hatırla</span>
              </label>
              <a href="#" className="text-sm font-medium text-yellow-600 hover:underline">Şifremi Unuttum</a>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-600/20 hover:bg-yellow-700 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
              </button>
            </div>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">Hesabınız yok mu? <Link to="/register" className="font-bold text-yellow-600 hover:underline">Kayıt Ol</Link></p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      showToast('Şifreler eşleşmiyor', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: formData.ad,
          soyad: formData.soyad,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Kayıt işlemi başarıyla tamamlanmıştır. Giriş sayfasına yönlendiriliyorsunuz.', 'success');

        // Giriş sayfasına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(data.message || 'Kayıt başarısız');
      }
    } catch (error: any) {
      showToast(error.message || 'Kayıt olunurken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <section className="relative h-[45vh] md:h-auto md:w-1/2 overflow-hidden bg-slate-100">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80" alt="Modern Interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-16">
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight font-serif">Hayalinizdeki Evi Yaratın.</h1>
          <p className="text-white/80 text-sm md:text-base max-w-sm">DekoHome ailesine katılarak size özel koleksiyonları keşfedin ve yaşam alanınızı dönüştürmeye hemen başlayın.</p>
        </div>
      </section>
      <section className="px-6 py-10 -mt-6 md:mt-0 bg-[#FAF8F4] rounded-t-[32px] md:rounded-none relative z-10 md:w-1/2 md:flex md:flex-col md:justify-center md:px-16 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 font-serif">Hesap Oluştur</h2>
            <p className="text-slate-500 mt-2 text-sm">DekoHome'a kaydolmak için bilgilerinizi girin</p>
          </header>
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ad</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-yellow-600 transition-colors">
                  <User className="text-slate-400 w-5 h-5" />
                  <input
                    className="w-full border-none focus:ring-0 text-sm p-0 ml-3 bg-transparent placeholder:text-slate-400"
                    placeholder="Ahmet"
                    required
                    type="text"
                    name="ad"
                    value={formData.ad}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Soyad</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-yellow-600 transition-colors">
                  <User className="text-slate-400 w-5 h-5" />
                  <input
                    className="w-full border-none focus:ring-0 text-sm p-0 ml-3 bg-transparent placeholder:text-slate-400"
                    placeholder="Yılmaz"
                    required
                    type="text"
                    name="soyad"
                    value={formData.soyad}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">E-posta</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-yellow-600 transition-colors">
                <Mail className="text-slate-400 w-5 h-5" />
                <input
                  className="w-full border-none focus:ring-0 text-sm p-0 ml-3 bg-transparent placeholder:text-slate-400"
                  placeholder="ornek@mail.com"
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Şifre</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-yellow-600 transition-colors">
                  <Lock className="text-slate-400 w-5 h-5" />
                  <input
                    className="w-full border-none focus:ring-0 text-sm p-0 ml-3 bg-transparent placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Şifre Tekrar</label>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-yellow-600 transition-colors">
                  <History className="text-slate-400 w-5 h-5" />
                  <input
                    className="w-full border-none focus:ring-0 text-sm p-0 ml-3 bg-transparent placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-600/20 hover:bg-yellow-700 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Şimdi Kaydol'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-[#FAF8F4] px-4 text-[10px] uppercase tracking-widest text-slate-400 font-bold absolute">Veya şununla kaydolun</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRAuo3zFOuAwtiocqBqmiCDN2wKNMTmGval352vc-qLob8gOqXpS1uLJH_7QllNCsMdRd8J3NT1reNOx8OyzPDYww7XW2faFpMmYVfCTFTGugbyagnYvp364mQfMo6ll14SQHxVyMbv-s1qq_ldI0IzpaiRcX82uABl_xQ6ofao1z04KGHrxtTuFPh_aYRYPYW6IWTD8MiC9YyN2_6MnTDfMvt8HXCXTwn6-us0hx5PSOYj_8HKylGKUgUZjp6t5JuxZ8iphLmhRw" />
                <span className="text-xs font-semibold text-slate-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <img alt="Facebook" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7bEULXSDwyrbyjiqmZ-185qK1M9d8WCxQKnNiKwjO980EQS5P48ngFfeVvkUocbun_kc1McGGkrX6H-4kbz8mjIAxsY8bxIzZFkFaI4TMbZpDC_07UF4kuB2kCsZRu4eyJg57s-N8j5XWDQPPITbFm1t5sPANraRZCZNrwpcQIytMSMmEw3GIVvus-cYDrWo00_qsElz_jcI_xKMtLlycgCMBiDsGyABrtQJHV27UbSqrRYeKEBTPTPSnTjDyP546u_x23WwqfCM" />
                <span className="text-xs font-semibold text-slate-700">Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">Zaten bir hesabınız var mı? <Link to="/login" className="font-bold text-yellow-600 hover:underline">Buradan giriş yapın</Link></p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAF8F4] font-sans flex flex-col text-slate-900">
        <Header />
        <AnimatePresence mode="wait">
          {/* @ts-ignore - framer-motion requires key on direct child */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </div>
    </ToastProvider>
  );
}


import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'FreshCart - Village Kirana Store',
  description: 'Fresh groceries delivered to your door. Cash on Delivery available.',
  manifest: '/manifest.json',
  themeColor: '#10B981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FreshCart'
  }
};

// Error Boundary Component (prevents app crashes)
class ErrorBoundary extends require('react').Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    // Could log to error tracking service here
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-xl shadow p-6 max-w-md text-center">
            <div className="text-4xl mb-4">😕</div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50 pb-10">
                {children}
              </main>
              <ToastContainer 
                position="bottom-right" 
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

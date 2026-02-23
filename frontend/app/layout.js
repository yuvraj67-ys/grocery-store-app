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
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen bg-gray-50 pb-10">
              {children}
            </main>
            <ToastContainer 
              position="bottom-right" 
              autoClose={3000}
              theme="light"
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

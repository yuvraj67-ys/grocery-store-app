import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav'; // 👈 NEW
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'FreshCart Kirana',
  description: 'Your local village grocery store',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#10B981',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              {/* Desktop Navbar */}
              <div className="hidden sm:block"><Navbar /></div>
              
              {/* Main Content (Added pb-20 so bottom nav doesn't hide content) */}
              <main className="min-h-screen pb-20 sm:pb-10">
                {children}
              </main>

              {/* Mobile Bottom Navigation */}
              <BottomNav />
              
              <ToastContainer position="top-center" autoClose={2000} hideProgressBar theme="colored" />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

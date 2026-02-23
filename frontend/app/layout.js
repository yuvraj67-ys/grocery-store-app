import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext'; // 👈 यह मिसिंग था!
import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'FreshCart Kirana',
  description: 'Your local village grocery store',
  manifest: '/manifest.json',
};

// 👈 Next.js 14 में themeColor को यहाँ ऐसे लिखते हैं (इससे लाल एरर चला जाएगा)
export const viewport = {
  themeColor: '#10B981',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* 👇 Language Provider ऐड कर दिया गया है */}
          <LanguageProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50 pb-10">
                {children}
              </main>
              <ToastContainer position="bottom-right" autoClose={3000} />
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

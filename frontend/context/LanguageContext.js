"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('hi'); // Default to Hindi

  useEffect(() => {
    const saved = localStorage.getItem('app_lang');
    if (saved) setLang(saved);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'hi' ? 'en' : 'hi';
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (keys) => {
    const dict = lang === 'hi' ? hi : en;
    if (!dict) return keys;
    
    const keysArray = keys.split('.');
    let value = dict;
    keysArray.forEach(k => { value = value ? value[k] : null; });
    return value || keys;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 👈 CRITICAL FIX: अगर Vercel build के समय context ना मिले, तो यह क्रैश होने से बचाएगा!
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context || { lang: 'hi', toggleLanguage: () => {}, t: (k) => k };
};

import { useState, useEffect } from 'react';

const translations = {
  en: {
    map: 'Map',
    list: 'List',
    addShed: 'Add Shed',
    admin: 'Admin',
    gasolin: 'Petrol',
    diesel: 'Diesel',
    available: 'Available',
    unavailable: 'Unavailable',
    queue: 'Queue length',
    short: 'Short',
    medium: 'Medium',
    long: 'Long',
    search: 'Search petrol stations...',
  },
  si: {
    map: 'සිතියම',
    list: 'ලැයිස්තුව',
    addShed: 'පිරවුම්හලක් එක් කරන්න',
    admin: 'පරිපාලක',
    gasolin: 'පෙට්‍රල්',
    diesel: 'ඩීසල්',
    available: 'ඇත',
    unavailable: 'නැත',
    queue: 'පෝලිමේ දිග',
    short: 'කෙටි',
    medium: 'මධ්‍යම',
    long: 'දිගු',
    search: 'පිරවුම්හල් සොයන්න...',
  },
  ta: {
    map: 'வரைபடம்',
    list: 'பட்டியல்',
    addShed: 'நிலையம் சேர்',
    admin: 'நிர்வாகி',
    gasolin: 'பெட்ரோல்',
    diesel: 'டீசல்',
    available: 'உள்ளது',
    unavailable: 'இல்லை',
    queue: 'வரிசை நீளம்',
    short: 'குறைவு',
    medium: 'நடுத்தரம்',
    long: 'நீண்ட',
    search: 'பெட்ரோல் நிலையங்களைத் தேடுக...',
  }
};

let currentLang = localStorage.getItem('lang') || 'en';
const listeners = new Set();

export const setLanguage = (lang) => {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  listeners.forEach(listener => listener(lang));
};

export const getTranslation = (key) => {
  return translations[currentLang][key] || key;
};

export function useTranslation() {
  const [lang, setLang] = useState(currentLang);

  useEffect(() => {
    listeners.add(setLang);
    return () => listeners.delete(setLang);
  }, []);

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;
  
  return { t, lang, setLanguage };
}

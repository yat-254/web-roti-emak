import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, XCircle,
  Clock, Package, ChefHat, Menu, X, ArrowRight, User, Lock, LogOut,
  LayoutDashboard, ShoppingCart, Tag, Store, Receipt, BarChart3, MapPin,
  ChevronRight, AlertTriangle, ExternalLink, Upload, Image as ImageIcon,
  Link2, Edit3, Eye, Printer, Download, Phone, ShieldCheck, Copy
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';

// ============================================================================
// 0. INISIALISASI DATABASE CLOUD (SINKRONISASI ANTAR PERANGKAT)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBZaYtj8g9b9v_KJ0_aI7MEomj4RuSgsbQ",
  authDomain: "roti-emak-penebal.firebaseapp.com",
  projectId: "roti-emak-penebal",
  storageBucket: "roti-emak-penebal.firebasestorage.app",
  messagingSenderId: "457163906285",
  appId: "1:457163906285:web:128899458de9f15fab80e4"
};

// ============================================================================
// 1. KONFIGURASI PENYIMPANAN PRODUKSI (MODE SIAP HOSTING) & ASET VISUAL
// ============================================================================
const STORAGE_KEYS = {
  CART: 'roti_emak_prod_cart_v1',
  MY_ORDER_IDS: 'roti_emak_my_order_ids_v1',
};

const DEFAULT_ADMIN_CREDS = {
  username: 'rotiemak_admin',
  password: 'Penebal2026!',
};

const BAKERY_ARTWORKS = {
  BUNDLING_POSTER:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="620" viewBox="0 0 800 620">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F6E6CF"/>
            <stop offset="100%" stop-color="#EAD1B0"/>
          </linearGradient>
        </defs>
        <rect width="800" height="620" fill="url(#bg)"/>
        <rect x="24" y="24" width="752" height="572" rx="28" fill="#FFF9F0" stroke="#C87D32" stroke-width="3"/>
        <rect x="52" y="48" width="220" height="34" rx="17" fill="#4A2C18"/>
        <text x="162" y="70" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FAF6F0" text-anchor="middle">♥ 100% HOMEMADE</text>
        <text x="52" y="146" font-family="Georgia, serif" font-size="60" font-weight="bold" fill="#4A2C18">Bundling</text>
        <text x="52" y="210" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#B83227">Hemat!</text>
        <rect x="52" y="228" width="330" height="36" rx="10" fill="#4A2C18"/>
        <text x="217" y="252" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#FFF9F0" text-anchor="middle">Homemade Roti Emak</text>
        <text x="52" y="294" font-family="sans-serif" font-size="18" font-weight="bold" fill="#6F4E37">Lembut ♥ Fresh ♥ Bikin Nagih</text>
        <text x="52" y="336" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#2C1A0E">Lebih Banyak, Lebih Hemat!</text>
        <rect x="52" y="362" width="190" height="130" rx="20" fill="#B83227"/>
        <text x="147" y="392" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFF9F0" text-anchor="middle">COCOK UNTUK:</text>
        <text x="76" y="418" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFF9F0">✓ Keluarga</text>
        <text x="76" y="440" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFF9F0">✓ Arisan</text>
        <text x="76" y="462" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFF9F0">✓ Acara &amp; Jualan</text>
        <rect x="256" y="362" width="185" height="130" rx="20" fill="#FFF" stroke="#E6D8C8" stroke-width="2"/>
        <text x="348" y="405" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#4A2C18" text-anchor="middle">Roti mini hangat,</text>
        <text x="348" y="430" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#4A2C18" text-anchor="middle">pas untuk semua</text>
        <text x="348" y="455" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#4A2C18" text-anchor="middle">momen! ♥</text>
        <g transform="translate(468, 56)">
          <rect x="0" y="0" width="280" height="175" rx="18" fill="#D5D9DE" stroke="#9AA1A9" stroke-width="3"/>
          <circle cx="52" cy="48" r="24" fill="#C97A32"/><circle cx="106" cy="48" r="24" fill="#C97A32"/><circle cx="160" cy="48" r="24" fill="#C97A32"/><circle cx="214" cy="48" r="24" fill="#C97A32"/>
          <circle cx="52" cy="96" r="24" fill="#D4843A"/><circle cx="106" cy="96" r="24" fill="#D4843A"/><circle cx="160" cy="96" r="24" fill="#D4843A"/><circle cx="214" cy="96" r="24" fill="#D4843A"/>
          <circle cx="52" cy="142" r="24" fill="#C97A32"/><circle cx="106" cy="142" r="24" fill="#C97A32"/><circle cx="160" cy="142" r="24" fill="#C97A32"/><circle cx="214" cy="142" r="24" fill="#C97A32"/>
          <circle cx="140" cy="285" r="95" fill="#D5D9DE" stroke="#9AA1A9" stroke-width="4"/>
          <circle cx="140" cy="222" r="26" fill="#C97A32"/><circle cx="195" cy="252" r="26" fill="#D4843A"/><circle cx="195" cy="315" r="26" fill="#C97A32"/>
          <circle cx="140" cy="348" r="26" fill="#D4843A"/><circle cx="85" cy="315" r="26" fill="#C97A32"/><circle cx="85" cy="252" r="26" fill="#D4843A"/>
          <circle cx="140" cy="285" r="24" fill="#FFF9F0"/>
        </g>
        <rect x="52" y="512" width="696" height="62" rx="18" fill="#4A2C18"/>
        <text x="400" y="540" font-family="sans-serif" font-size="13" font-weight="bold" fill="#F3EAE0" text-anchor="middle">PESAN SEKARANG! • SIAP ANTAR WILAYAH TERDEKAT SETIAP HARI</text>
        <text x="400" y="563" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFD28D" text-anchor="middle">WA: 0819-3356-4802 • Roti Emak, Cinta di Setiap Gigitan ♥</text>
      </svg>`
    ),
  ROTI_SOBEK_BUNGA:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <rect width="600" height="450" fill="#EAD7C3"/>
        <circle cx="300" cy="225" r="165" fill="#C9CFD6" stroke="#8F96A0" stroke-width="6"/>
        <circle cx="300" cy="135" r="52" fill="#C6762E"/><circle cx="378" cy="180" r="52" fill="#CE7E35"/><circle cx="378" cy="270" r="52" fill="#C6762E"/>
        <circle cx="300" cy="315" r="52" fill="#CE7E35"/><circle cx="222" cy="270" r="52" fill="#C6762E"/><circle cx="222" cy="180" r="52" fill="#CE7E35"/>
        <circle cx="300" cy="225" r="52" fill="#D4843B"/>
        <g fill="#3E200F" opacity="0.85">
          <rect x="285" y="125" width="28" height="14" rx="4"/><rect x="362" y="170" width="28" height="14" rx="4"/>
          <rect x="362" y="262" width="28" height="14" rx="4"/><rect x="285" y="306" width="28" height="14" rx="4"/>
          <rect x="208" y="262" width="28" height="14" rx="4"/><rect x="208" y="170" width="28" height="14" rx="4"/>
          <rect x="286" y="216" width="28" height="16" rx="4"/>
        </g>
        <rect x="20" y="392" width="560" height="40" rx="12" fill="#2C1A0E" opacity="0.88"/>
        <text x="300" y="417" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FAF6F0" text-anchor="middle">Roti Sobek Bunga Full Topping Cokelat &amp; Keju</text>
      </svg>`
    ),
  ROTI_ISI_NANAS:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <rect width="600" height="450" fill="#BFC5CC"/>
        <rect x="24" y="24" width="552" height="402" rx="18" fill="#D4D8DD" stroke="#8C939C" stroke-width="5"/>
        <g>
          <rect x="48" y="48" width="120" height="110" rx="28" fill="#B96824"/><circle cx="108" cy="103" r="14" fill="#F2B84B"/>
          <rect x="176" y="48" width="120" height="110" rx="28" fill="#C4712B"/><circle cx="236" cy="103" r="14" fill="#F2B84B"/>
          <rect x="304" y="48" width="120" height="110" rx="28" fill="#B96824"/><circle cx="364" cy="103" r="14" fill="#F2B84B"/>
          <rect x="432" y="48" width="120" height="110" rx="28" fill="#C4712B"/><circle cx="492" cy="103" r="14" fill="#F2B84B"/>
          <rect x="48" y="168" width="120" height="110" rx="28" fill="#C4712B"/><circle cx="108" cy="223" r="14" fill="#F2B84B"/>
          <rect x="176" y="168" width="120" height="110" rx="28" fill="#B96824"/><circle cx="236" cy="223" r="14" fill="#F2B84B"/>
          <rect x="304" y="168" width="120" height="110" rx="28" fill="#C4712B"/><circle cx="364" cy="223" r="14" fill="#F2B84B"/>
          <rect x="432" y="168" width="120" height="110" rx="28" fill="#B96824"/><circle cx="492" cy="223" r="14" fill="#F2B84B"/>
          <rect x="48" y="288" width="120" height="100" rx="28" fill="#B96824"/><circle cx="108" cy="338" r="14" fill="#F2B84B"/>
          <rect x="176" y="288" width="120" height="100" rx="28" fill="#C4712B"/><circle cx="236" cy="338" r="14" fill="#F2B84B"/>
          <rect x="304" y="288" width="120" height="100" rx="28" fill="#B96824"/><circle cx="364" cy="338" r="14" fill="#F2B84B"/>
          <rect x="432" y="288" width="120" height="100" rx="28" fill="#C4712B"/><circle cx="492" cy="338" r="14" fill="#F2B84B"/>
        </g>
        <rect x="20" y="392" width="560" height="40" rx="12" fill="#2C1A0E" opacity="0.88"/>
        <text x="300" y="417" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FAF6F0" text-anchor="middle">Roti Isi Selai Nanas Hangat Satu Loyang</text>
      </svg>`
    ),
  ROTI_ABON:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <rect width="600" height="450" fill="#7D838A"/>
        <g>
          <circle cx="175" cy="130" r="82" fill="#F3E6D3"/><circle cx="175" cy="122" r="46" fill="#B97A45"/>
          <path d="M125 108 Q175 95 225 112 Q175 128 128 135 Q185 145 225 152" fill="none" stroke="#C85A17" stroke-width="8" stroke-linecap="round"/>
          <circle cx="425" cy="130" r="82" fill="#F3E6D3"/><circle cx="425" cy="122" r="46" fill="#B97A45"/>
          <path d="M375 108 Q425 95 475 112 Q425 128 378 135 Q435 145 475 152" fill="none" stroke="#C85A17" stroke-width="8" stroke-linecap="round"/>
          <circle cx="175" cy="310" r="82" fill="#F3E6D3"/><circle cx="175" cy="302" r="46" fill="#B97A45"/>
          <path d="M125 288 Q175 275 225 292 Q175 308 128 315 Q185 325 225 332" fill="none" stroke="#C85A17" stroke-width="8" stroke-linecap="round"/>
          <circle cx="425" cy="310" r="82" fill="#F3E6D3"/><circle cx="425" cy="302" r="46" fill="#B97A45"/>
          <path d="M375 288 Q425 275 475 292 Q425 308 378 315 Q435 325 475 332" fill="none" stroke="#C85A17" stroke-width="8" stroke-linecap="round"/>
        </g>
        <rect x="20" y="392" width="560" height="40" rx="12" fill="#2C1A0E" opacity="0.88"/>
        <text x="300" y="417" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FAF6F0" text-anchor="middle">Roti Abon Sapi Saus Spesial Gurih Lembut</text>
      </svg>`
    ),
  ROTI_ISI_COKLAT:
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
        <rect width="600" height="450" fill="#C4C9D0"/>
        <g>
          <rect x="44" y="44" width="162" height="165" rx="46" fill="#BD6D28"/>
          <circle cx="115" cy="112" r="7" fill="#361B0C"/><circle cx="135" cy="122" r="7" fill="#361B0C"/><circle cx="122" cy="134" r="7" fill="#361B0C"/>
          <rect x="219" y="44" width="162" height="165" rx="46" fill="#C87730"/>
          <circle cx="290" cy="112" r="7" fill="#361B0C"/><circle cx="310" cy="122" r="7" fill="#361B0C"/><circle cx="297" cy="134" r="7" fill="#361B0C"/>
          <rect x="394" y="44" width="162" height="165" rx="46" fill="#BD6D28"/>
          <circle cx="465" cy="112" r="7" fill="#361B0C"/><circle cx="485" cy="122" r="7" fill="#361B0C"/><circle cx="472" cy="134" r="7" fill="#361B0C"/>
          <rect x="44" y="220" width="162" height="165" rx="46" fill="#C87730"/>
          <circle cx="115" cy="288" r="7" fill="#361B0C"/><circle cx="135" cy="298" r="7" fill="#361B0C"/><circle cx="122" cy="310" r="7" fill="#361B0C"/>
          <rect x="219" y="220" width="162" height="165" rx="46" fill="#BD6D28"/>
          <circle cx="290" cy="288" r="7" fill="#361B0C"/><circle cx="310" cy="298" r="7" fill="#361B0C"/><circle cx="297" cy="310" r="7" fill="#361B0C"/>
          <rect x="394" y="220" width="162" height="165" rx="46" fill="#C87730"/>
          <circle cx="465" cy="288" r="7" fill="#361B0C"/><circle cx="485" cy="298" r="7" fill="#361B0C"/><circle cx="472" cy="310" r="7" fill="#361B0C"/>
        </g>
        <rect x="20" y="392" width="560" height="40" rx="12" fill="#2C1A0E" opacity="0.88"/>
        <text x="300" y="417" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FAF6F0" text-anchor="middle">Roti Isi Cokelat Lumer Tabur Choco Chips</text>
      </svg>`
    ),
};

const DEFAULT_GALLERY_SLOTS = [
  {
    id: 'GAL-1',
    title: 'Roti Manis Full Topping',
    subtitle: 'Roti sobek bunga cokelat & keju baru keluar dari loyang',
    tag: 'Favorit Keluarga',
    image: BAKERY_ARTWORKS.ROTI_SOBEK_BUNGA,
  },
  {
    id: 'GAL-2',
    title: 'Roti Isi Nanas',
    subtitle: 'Dipanggang hangat dalam loyang untuk keluarga, arisan & acara',
    tag: 'Fresh Loyang',
    image: BAKERY_ARTWORKS.ROTI_ISI_NANAS,
  },
  {
    id: 'GAL-3',
    title: 'Roti Abon Saus Spesial',
    subtitle: 'Gurih lembut dengan taburan abon & saus khas Roti Emak',
    tag: 'Best Seller',
    image: BAKERY_ARTWORKS.ROTI_ABON,
  },
  {
    id: 'GAL-4',
    title: 'Roti Isi Cokelat',
    subtitle: 'Empuk hangat dengan isian cokelat lumer & topping choco chips',
    tag: 'Homemade',
    image: BAKERY_ARTWORKS.ROTI_ISI_COKLAT,
  },
];

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#F3EAE0"/>
      <circle cx="300" cy="185" r="70" fill="#C87D32" opacity="0.25"/>
      <text x="300" y="200" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#4A2C18" text-anchor="middle">ROTI EMAK</text>
      <text x="300" y="232" font-family="sans-serif" font-size="14" fill="#6F4E37" text-anchor="middle">Homemade dengan Cinta • Desa Penebal</text>
    </svg>`
  );

const PRESET_BREAD_IMAGES = [
  { label: 'Roti Sobek Bunga', url: BAKERY_ARTWORKS.ROTI_SOBEK_BUNGA },
  { label: 'Roti Isi Nanas', url: BAKERY_ARTWORKS.ROTI_ISI_NANAS },
  { label: 'Roti Abon Saus', url: BAKERY_ARTWORKS.ROTI_ABON },
  { label: 'Roti Isi Cokelat', url: BAKERY_ARTWORKS.ROTI_ISI_COKLAT },
];

const ORDER_STATUS_OPTIONS = [
  'Menunggu Konfirmasi',
  'Diproses',
  'Siap Dikirim',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
];

const INITIAL_PRODUCTS = [];

const INITIAL_PROMOS = [
  {
    id: 'PRM-001',
    title: 'Bundling Hemat! Roti Mini Hangat — Lebih Banyak, Lebih Hemat!',
    description:
      'Roti mini hangat, pas untuk semua momen! Cocok untuk keluarga, arisan, acara, maupun titip jualan. 100% Homemade, tanpa bahan pengawet, dibuat dengan cinta & siap antar wilayah terdekat setiap hari.',
    period: 'Bundling Spesial • WA 0819-3356-4802',
    image: BAKERY_ARTWORKS.BUNDLING_POSTER,
    active: true,
  },
  {
    id: 'PRM-002',
    title: 'Paket Hemat: Bolu Kemojo Pandan — Hanya Rp 10.000',
    description:
      'Menu spesial Bolu Kemojo khas Homemade Roti Emak. Wangi pandan khas, lembut di mulut, manisnya pas! Lezat, lembut, dan hemat di kantong. Fresh everyday!',
    period: 'Promo Spesial • Homemade Fresh Everyday',
    image: BAKERY_ARTWORKS.ROTI_SOBEK_BUNGA,
    active: true,
  },
];

// Bersih dari data warung & setoran simulasi (Siap Hosting)
const INITIAL_PARTNERS = [];

const INITIAL_PARTNER_SALES = [];

const INITIAL_SHIPPING = [
  {
    id: 'SHP-001',
    area: 'Desa Penebal (Sekitar Dapur Roti Emak)',
    fee: 0,
    active: true,
  },
  {
    id: 'SHP-002',
    area: 'Sungai Alam & Kota Bengkalis',
    fee: 8000,
    active: true,
  },
  {
    id: 'SHP-003',
    area: 'Pangkalan Batang & Bantan / Selat Baru',
    fee: 15000,
    active: true,
  },
];

const INITIAL_ORDERS = [];

const INITIAL_ACTIVITIES = [];

// ============================================================================
// 2. FUNGSI UTILITAS & KOMPONEN PENDUKUNG
// ============================================================================
const formatRupiah = (amount) => 'Rp ' + (Number(amount) || 0).toLocaleString('id-ID');

const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const copyTextSafely = async (text) => {
  const str = String(text);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch {
    // Fallback jika Clipboard API diblokir permissions policy iframe
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = str;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, str.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

const getOrderStatusStyle = (status) => {
  switch (status) {
    case 'Menunggu Konfirmasi':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Diproses':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Siap Dikirim':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'Dikirim':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'Selesai':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Dibatalkan':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
};

const compressImageFile = (file, maxWidth = 720, quality = 0.72) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, WEBP).'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

const SafeImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
      }}
      loading="lazy"
    />
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`bg-white w-full ${maxWidth} rounded-3xl border border-[#E6D8C8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="px-6 py-4 border-b border-[#E6D8C8] flex items-center justify-between bg-[#FAF6F0]">
          <h3 className="font-serif text-lg font-bold text-[#2C1A0E]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6F4E37] hover:bg-[#EFE5D8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl border border-[#E6D8C8] shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-amber-600">
          <div className="p-2.5 rounded-xl bg-amber-50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C1A0E]">{title}</h3>
        </div>
        <p className="text-sm text-[#6F4E37] leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FAF6F0] hover:bg-[#EFE5D8] text-[#6F4E37]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

const RotiEmakQrisPoster = ({ customImage }) => {
  if (customImage) {
    return (
      <div className="w-full max-w-[270px] mx-auto bg-white rounded-2xl border-2 border-[#E6D8C8] overflow-hidden shadow-md">
        <img src={customImage} alt="QRIS Resmi Roti Emak" className="w-full h-auto block" />
      </div>
    );
  }

  const qrPattern = [
    '11111110101101001111111',
    '10000010010110101000001',
    '10111010111001001011101',
    '10111010010111101011101',
    '10111010101100101011101',
    '10000010011010001000001',
    '11111110101010101111111',
    '00000000110101100000000',
    '10110111011010111011010',
    '01011000100111000101101',
    '11101110111001110110110',
    '00110010010110011001001',
    '11011111101101110111101',
    '01100010010011001000110',
    '10111011101110111110101',
    '00000000110100101001011',
    '11111110101111011011100',
    '10000010010010100101011',
    '10111010111011111010110',
    '10111010010100101111001',
    '10111010101111010010111',
    '10000010011001001101000',
    '11111110110110111011111',
  ];

  return (
    <div className="w-full max-w-[275px] mx-auto bg-white rounded-2xl border-2 border-[#E6D8C8] overflow-hidden shadow-md relative select-none text-[#1A1A1A]">
      <div
        className="absolute left-0 top-16 w-12 h-32 bg-[#E31E24] pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
      />
      <div
        className="absolute right-0 bottom-0 w-36 h-24 bg-[#E31E24] pointer-events-none"
        style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
      />

      <div className="px-4 pt-3.5 pb-1 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-base tracking-tighter text-[#1A1A1A] border-l-2 border-t-2 border-b-2 border-[#1A1A1A] px-1 leading-none">
            QRIS
          </span>
          <span className="text-[7px] font-bold leading-tight text-left text-stone-700">
            QR Code Standar
            <br />
            Pembayaran Nasional
          </span>
        </div>
        <span className="text-[10px] font-black text-[#E31E24] tracking-wider">GPN</span>
      </div>

      <div className="text-center px-3 pt-1 pb-2 relative z-10">
        <p className="font-bold text-base tracking-tight text-black leading-tight">roti emak</p>
        <p className="text-[11px] font-semibold text-stone-700 mt-0.5">NMID : ID1026600899573</p>
        <p className="text-[10px] font-bold text-stone-600">A01</p>
      </div>

      <div className="px-6 py-1 flex justify-center relative z-10">
        <div className="p-2 bg-white border border-stone-200 rounded-lg shadow-2xs">
          <svg viewBox="0 0 23 23" className="w-36 h-36 block">
            <rect width="23" height="23" fill="#FFFFFF" />
            {qrPattern.map((row, rIdx) =>
              row.split('').map((cell, cIdx) =>
                cell === '1' ? (
                  <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width="1" height="1" fill="#111111" />
                ) : null
              )
            )}
          </svg>
        </div>
      </div>

      <div className="px-4 pt-2 pb-3 text-center relative z-10">
        <p className="text-[10px] font-bold tracking-wide text-stone-800">SATU QRIS UNTUK SEMUA</p>
        <p className="text-[8px] text-stone-600 mt-0.5">
          Cek aplikasi penyelenggara di: www.aspi-qris.id
        </p>
        <div className="mt-2.5 flex items-end justify-between text-left">
          <div className="text-[7px] text-stone-600 leading-tight">
            <p className="font-semibold">Dicetak oleh: 93600915</p>
            <p>Versi cetak: 1.0.19.11.26</p>
          </div>
          <span className="text-[7px] font-bold text-white pr-1">Scan &amp; Bayar</span>
        </div>
      </div>
    </div>
  );
};

const ImageUploaderField = ({ label, value, onChange, presets = [], onNotify }) => {
  const [mode, setMode] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 850, 0.8);
      onChange(compressedBase64);
      if (onNotify) onNotify('Foto berhasil diunggah!', 'success');
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Gagal mengunggah foto.', 'error');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2.5 bg-[#FAF6F0]/70 p-3.5 rounded-2xl border border-[#E6D8C8]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-[#6F4E37] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#C87D32]" />
          <span>{label}</span>
        </label>
        <div className="inline-flex rounded-xl bg-white p-0.5 border border-[#E6D8C8]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
              mode === 'upload' ? 'bg-[#4A2C18] text-white' : 'text-[#6F4E37]'
            }`}
          >
            <Upload className="w-3 h-3" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
              mode === 'url' ? 'bg-[#4A2C18] text-white' : 'text-[#6F4E37]'
            }`}
          >
            <Link2 className="w-3 h-3" /> URL / Preset
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3.5">
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
          <SafeImage src={value} alt="Pratinjau" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 w-full">
          {mode === 'upload' ? (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#C87D32]/60 hover:border-[#4A2C18] rounded-xl bg-white hover:bg-[#FAF6F0] cursor-pointer transition-colors p-3 text-center">
              <Upload className="w-5 h-5 text-[#C87D32] mb-1" />
              <span className="text-xs font-bold text-[#4A2C18]">
                {isProcessing ? 'Memproses foto...' : 'Pilih foto dari HP / Laptop'}
              </span>
              <span className="text-[10px] text-[#6F4E37] mt-0.5">Format JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={value?.startsWith('data:image') ? '' : value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Tempel URL gambar (https://...)"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6D8C8] text-xs"
              />
              {presets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {presets.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onChange(img.url)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-[#EFE5D8] border border-[#E6D8C8] text-[#4A2C18] font-medium"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MonthlySalesChart = ({ onlineTotal, partnerTotal }) => {
  const chartData = [
    { month: 'Jun', online: 0, partner: 0 },
    { month: 'Jul', online: 0, partner: 0 },
    { month: 'Agu', online: 0, partner: 0 },
    { month: 'Sep', online: 0, partner: 0 },
    { month: 'Okt', online: 0, partner: 0 },
    { month: 'Bulan Ini', online: onlineTotal, partner: partnerTotal },
  ];

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.online, d.partner)), 500000);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#4A2C18] inline-block" />
            <span className="font-medium text-[#2C1A0E]">Penjualan Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#C87D32] inline-block" />
            <span className="font-medium text-[#2C1A0E]">Setoran Mitra Warung</span>
          </div>
        </div>
        <span className="text-xs text-[#6F4E37] bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#E6D8C8]">
          6 Bulan Terakhir (2026)
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2 px-2 bg-[#FAF6F0]/70 rounded-xl border border-[#E6D8C8]">
        {chartData.map((item, idx) => {
          const onlineHeight = Math.max(Math.round((item.online / maxVal) * 100), 4);
          const partnerHeight = Math.max(Math.round((item.partner / maxVal) * 100), 4);
          return (
            <div key={idx} className="flex flex-col items-center h-full justify-end group">
              <div className="flex items-end justify-center gap-1 sm:gap-2 w-full h-40">
                <div className="relative flex flex-col items-center w-4 sm:w-7 h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 z-10 bg-[#2C1A0E] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none shadow-md">
                    Online: {formatRupiah(item.online)}
                  </div>
                  <div
                    style={{ height: `${onlineHeight}%` }}
                    className="w-full bg-[#4A2C18] hover:bg-[#6F4E37] rounded-t-md transition-all duration-500"
                  />
                </div>
                <div className="relative flex flex-col items-center w-4 sm:w-7 h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 z-10 bg-[#C87D32] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none shadow-md">
                    Warung: {formatRupiah(item.partner)}
                  </div>
                  <div
                    style={{ height: `${partnerHeight}%` }}
                    className="w-full bg-[#C87D32] hover:bg-[#D98E43] rounded-t-md transition-all duration-500"
                  />
                </div>
              </div>
              <span className="mt-2.5 text-[11px] sm:text-xs font-semibold text-[#6F4E37] text-center">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 3. KOMPONEN UTAMA APLIKASI ROTI EMAK
// ============================================================================
export default function App() {
  const loadCartLocal = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const loadMyOrderIdsLocal = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MY_ORDER_IDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // State Autentikasi & Status Cloud
  const [cloudUser, setCloudUser] = useState(null);

  // State Navigasi, Autentikasi Admin & Notifikasi
  const [viewMode, setViewMode] = useState('store');
  const [storePage, setStorePage] = useState('home');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // State Bisnis Terpadu (Tersinkronisasi Online Antar Perangkat)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [partnerSales, setPartnerSales] = useState(INITIAL_PARTNER_SALES);
  const [shippingRates, setShippingRates] = useState(INITIAL_SHIPPING);
  const [cart, setCart] = useState(loadCartLocal);
  const [myOrderIds, setMyOrderIds] = useState(loadMyOrderIdsLocal);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [customQrisImage, setCustomQrisImage] = useState('');
  const [customHeroImage, setCustomHeroImage] = useState(BAKERY_ARTWORKS.BUNDLING_POSTER);
  const [gallerySlots, setGallerySlots] = useState(DEFAULT_GALLERY_SLOTS);
  const [adminCreds, setAdminCreds] = useState(DEFAULT_ADMIN_CREDS);
  const [credsForm, setCredsForm] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
  });
  // Simpan keranjang belanja & daftar ID pesanan pribadi di perangkat pembeli
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // Abaikan jika penuh
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MY_ORDER_IDS, JSON.stringify(myOrderIds));
    } catch {
      // Abaikan jika penuh
    }
  }, [myOrderIds]);

  // 1. Autentikasi Cloud Otomatis (Wajib sebelum baca/tulis database)
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Gagal autentikasi cloud:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCloudUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listener Real-Time dari Cloud Database (Antar HP & Laptop)
  useEffect(() => {
    if (!db || !cloudUser) return;

    const publicCol = (colName) => collection(db, 'artifacts', appId, 'public', 'data', colName);
    const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'store_settings', 'main');

    const unsubProducts = onSnapshot(
      publicCol('products'),
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('Sync products error:', err)
    );

    const unsubOrders = onSnapshot(
      publicCol('orders'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setOrders(list);
      },
      (err) => console.error('Sync orders error:', err)
    );

    const unsubPromos = onSnapshot(
      publicCol('promos'),
      (snap) => {
        if (!snap.empty) {
          setPromos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error('Sync promos error:', err)
    );

    const unsubPartners = onSnapshot(
      publicCol('partners'),
      (snap) => {
        setPartners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('Sync partners error:', err)
    );

    const unsubPartnerSales = onSnapshot(
      publicCol('partner_sales'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.date < b.date ? 1 : -1));
        setPartnerSales(list);
      },
      (err) => console.error('Sync partner sales error:', err)
    );

    const unsubShipping = onSnapshot(
      publicCol('shipping_rates'),
      (snap) => {
        if (!snap.empty) {
          setShippingRates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (err) => console.error('Sync shipping error:', err)
    );

    const unsubActivities = onSnapshot(
      publicCol('activities'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setActivities(list.slice(0, 20));
      },
      (err) => console.error('Sync activities error:', err)
    );

    const unsubSettings = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.customQrisImage === 'string') setCustomQrisImage(data.customQrisImage);
          if (typeof data.customHeroImage === 'string') setCustomHeroImage(data.customHeroImage);
          if (Array.isArray(data.gallerySlots)) setGallerySlots(data.gallerySlots);
          if (data.adminCreds?.username && data.adminCreds?.password) {
            setAdminCreds(data.adminCreds);
          }
        }
      },
      (err) => console.error('Sync settings error:', err)
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubPromos();
      unsubPartners();
      unsubPartnerSales();
      unsubShipping();
      unsubActivities();
      unsubSettings();
    };
  }, [cloudUser]);

  // Helper Simpan & Hapus Dokumen ke Cloud
  const saveCloudDoc = async (colName, docId, payload) => {
    if (!db || !cloudUser) return;
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId), payload, {
        merge: true,
      });
    } catch (err) {
      console.error(`Gagal menyimpan ${colName}/${docId}:`, err);
      showToast('Gagal menyinkronkan ke server online. Periksa koneksi internet.', 'error');
    }
  };

  const deleteCloudDoc = async (colName, docId) => {
    if (!db || !cloudUser) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, docId));
    } catch (err) {
      console.error(`Gagal menghapus ${colName}/${docId}:`, err);
    }
  };

  const saveStoreSettingsCloud = async (partialSettings) => {
    if (!db || !cloudUser) return;
    try {
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'store_settings', 'main'),
        partialSettings,
        { merge: true }
      );
    } catch (err) {
      console.error('Gagal menyimpan pengaturan toko:', err);
      showToast('Ukuran foto terlalu besar untuk server. Coba pilih foto lain.', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addActivity = (text, type = 'info') => {
    const actId = `ACT-${Date.now()}`;
    const newAct = { id: actId, text, time: 'Baru saja', type, createdAt: Date.now() };
    setActivities((prev) => [newAct, ...prev.slice(0, 19)]);
    saveCloudDoc('activities', actId, newAct);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (
      loginForm.username.trim() === adminCreds.username &&
      loginForm.password === adminCreds.password
    ) {
      setIsAdminAuthenticated(true);
      setLoginError('');
      setCredsForm({ username: adminCreds.username, newPassword: '', confirmPassword: '' });
      setViewMode('admin');
      showToast('Selamat datang kembali, Admin Homemade Roti Emak!');
    } else {
      setLoginError('Username atau kata sandi Admin tidak sesuai.');
    }
  };

  const handleUpdateAdminCredentials = (e) => {
    e.preventDefault();
    const nextUser = credsForm.username.trim();
    if (!nextUser) {
      showToast('Username admin tidak boleh kosong.', 'error');
      return;
    }
    if (credsForm.newPassword && credsForm.newPassword.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }
    if (credsForm.newPassword !== credsForm.confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }
    const updated = {
      username: nextUser,
      password: credsForm.newPassword ? credsForm.newPassword : adminCreds.password,
    };
    setAdminCreds(updated);
    saveStoreSettingsCloud({ adminCreds: updated });
    setCredsForm({ username: updated.username, newPassword: '', confirmPassword: '' });
    showToast('Username & kata sandi Admin berhasil diperbarui & disinkronkan!');
  };

  // --- LOGIKA PELANGGAN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [trackForm, setTrackForm] = useState({ code: '', phoneLast4: '' });
  const [trackError, setTrackError] = useState('');

  const handleTrackOrderSubmit = (e) => {
    e.preventDefault();
    const code = trackForm.code.trim().toUpperCase();
    const last4 = trackForm.phoneLast4.replace(/\D/g, '').slice(-4);

    if (!code || last4.length < 4) {
      setTrackError('Masukkan Kode Pesanan (contoh: RE-2026...) dan 4 digit terakhir No. HP.');
      return;
    }

    const found = orders.find((o) => {
      const orderPhoneDigits = String(o.phone || '').replace(/\D/g, '');
      return o.id.toUpperCase() === code && orderPhoneDigits.endsWith(last4);
    });

    if (!found) {
      setTrackError(
        'Pesanan tidak ditemukan atau 4 digit terakhir No. HP tidak cocok. Periksa kembali data Anda.'
      );
      return;
    }

    setTrackError('');
    if (!myOrderIds.includes(found.id)) {
      setMyOrderIds((prev) => [found.id, ...prev]);
    }
    setTrackForm({ code: '', phoneLast4: '' });
    showToast(`Pesanan #${found.id} berhasil ditemukan dan ditambahkan ke daftar Anda!`);
  };

  const categories = useMemo(() => {
    const base = ['Roti Manis', 'Roti Tawar & Gandum', 'Pastry & Croissant', 'Bolu & Kue', 'Paket Hemat'];
    const dynamic = products.map((p) => p.category).filter(Boolean);
    return ['Semua', ...Array.from(new Set([...base, ...dynamic]))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const handleAddToCart = (product, qty = 1) => {
    if (!product || product.stock <= 0) {
      showToast('Maaf, stok produk sedang habis.', 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: Math.min(product.stock, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: Math.min(product.stock, qty),
        },
      ];
    });
    showToast(`${qty}x ${product.name} ditambahkan ke keranjang!`);
  };

  const handleUpdateCartQty = (productId, delta) => {
    const prod = products.find((p) => p.id === productId);
    const maxStock = prod ? prod.stock : 999;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.qty + delta;
          if (nextQty <= 0) return null;
          return { ...item, qty: Math.min(maxStock, nextQty) };
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    showToast('Produk dihapus dari keranjang.');
  };

  // --- LOGIKA CHECKOUT & QRIS / DP 50% / COD ---
  const activeShippingAreas = useMemo(() => shippingRates.filter((s) => s.active), [shippingRates]);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    shippingId: shippingRates[0]?.id || 'SHP-001',
    deliveryDate: getTodayString(),
    paymentMethod: 'QRIS',
    notes: '',
  });
  const [qrisModalOpen, setQrisModalOpen] = useState(false);
  const [pendingOrderDraft, setPendingOrderDraft] = useState(null);
  const [paymentProofDraft, setPaymentProofDraft] = useState('');
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState(null);

  const selectedShippingObj = useMemo(
    () =>
      activeShippingAreas.find((s) => s.id === checkoutForm.shippingId) ||
      activeShippingAreas[0] || { id: 'SHP-001', area: 'Desa Penebal', fee: 0 },
    [activeShippingAreas, checkoutForm.shippingId]
  );

  const checkoutTotalAmount = cartSubtotal + (selectedShippingObj ? selectedShippingObj.fee : 0);
  const isBulkOrEventOrder = checkoutTotalAmount >= 500000 || cartItemCount >= 30;
  const checkoutDpAmount = Math.ceil(checkoutTotalAmount * 0.5);
  const checkoutRemainingBalance = Math.max(0, checkoutTotalAmount - checkoutDpAmount);

  useEffect(() => {
    if (isBulkOrEventOrder && checkoutForm.paymentMethod === 'COD') {
      setCheckoutForm((prev) => ({ ...prev, paymentMethod: 'QRIS_DP' }));
    }
  }, [isBulkOrEventOrder, checkoutForm.paymentMethod]);

  const finalizeOrderCreation = (draftOrder, isQrisPaid = false, proofImage = '') => {
    const finalOrder = {
      ...draftOrder,
      createdAt: Date.now(),
      paymentProof: proofImage || '',
      paymentStatus:
        draftOrder.paymentMethod === 'QRIS_DP'
          ? isQrisPaid
            ? `DP 50% Terkirim (${formatRupiah(draftOrder.amountDueNow)}) • Sisa ${formatRupiah(
                draftOrder.remainingBalance
              )}`
            : 'Menunggu DP 50% QRIS'
          : draftOrder.paymentMethod === 'QRIS'
          ? isQrisPaid
            ? 'Bukti Bayar QRIS Terunggah (Menunggu Verifikasi)'
            : 'Menunggu Pembayaran QRIS'
          : 'Bayar di Tempat (COD)',
    };

    setOrders((prev) => [finalOrder, ...prev]);
    setMyOrderIds((prev) => (prev.includes(finalOrder.id) ? prev : [finalOrder.id, ...prev]));
    saveCloudDoc('orders', finalOrder.id, finalOrder);

    setProducts((prev) =>
      prev.map((p) => {
        const bought = finalOrder.items.find((it) => it.productId === p.id);
        if (!bought) return p;
        const updatedProd = { ...p, stock: Math.max(0, p.stock - bought.qty) };
        saveCloudDoc('products', p.id, updatedProd);
        return updatedProd;
      })
    );
    setCart([]);
    setQrisModalOpen(false);
    setPendingOrderDraft(null);
    setPaymentProofDraft('');
    setCheckoutSuccessOrder(finalOrder);
    addActivity(
      `Pesanan baru #${finalOrder.id} (${finalOrder.paymentMethodLabel}) dari ${
        finalOrder.customerName
      } (${formatRupiah(finalOrder.total)})`,
      'order'
    );
    showToast(`Pesanan #${finalOrder.id} berhasil terkirim ke dapur Roti Emak!`);
  };

  const handleUploadExistingOrderProof = async (orderId, file) => {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 720, 0.72);
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const updatedOrder = {
            ...o,
            paymentProof: compressed,
            paymentStatus:
              o.paymentMethod === 'QRIS_DP'
                ? `DP 50% Terkirim (${formatRupiah(o.amountDueNow || Math.ceil(o.total * 0.5))})`
                : 'Bukti Bayar QRIS Terunggah (Menunggu Verifikasi)',
          };
          saveCloudDoc('orders', orderId, updatedOrder);
          return updatedOrder;
        })
      );
      showToast(`Bukti pembayaran untuk pesanan #${orderId} berhasil diunggah!`);
      addActivity(`Pelanggan mengunggah bukti pembayaran untuk #${orderId}`, 'order');
    } catch (err) {
      showToast(err.message || 'Gagal mengunggah bukti pembayaran.', 'error');
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Keranjang belanja masih kosong.', 'error');
      return;
    }
    if (checkoutForm.deliveryDate < getTodayString()) {
      showToast('Tanggal pengiriman tidak boleh tanggal yang sudah lewat.', 'error');
      return;
    }

    const orderCode = `RE-${getTodayString().replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;
    const isDp = checkoutForm.paymentMethod === 'QRIS_DP';
    const draft = {
      id: orderCode,
      customerName: checkoutForm.customerName.trim(),
      phone: checkoutForm.phone.trim(),
      address: checkoutForm.address.trim(),
      area: selectedShippingObj.area,
      orderDate: getTodayString(),
      deliveryDate: checkoutForm.deliveryDate,
      paymentMethod: checkoutForm.paymentMethod,
      paymentMethodLabel:
        checkoutForm.paymentMethod === 'QRIS_DP'
          ? 'DP 50% (via QRIS)'
          : checkoutForm.paymentMethod === 'QRIS'
          ? 'QRIS (Lunas)'
          : 'COD (Bayar di Tempat)',
      amountDueNow: isDp ? checkoutDpAmount : checkoutTotalAmount,
      remainingBalance: isDp ? checkoutRemainingBalance : 0,
      notes: checkoutForm.notes.trim() || '-',
      items: cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        price: c.price,
        qty: c.qty,
      })),
      subtotal: cartSubtotal,
      shippingFee: selectedShippingObj.fee,
      total: checkoutTotalAmount,
      status: 'Menunggu Konfirmasi',
    };

    if (checkoutForm.paymentMethod === 'QRIS' || checkoutForm.paymentMethod === 'QRIS_DP') {
      setPendingOrderDraft(draft);
      setPaymentProofDraft('');
      setQrisModalOpen(true);
    } else {
      finalizeOrderCreation(draft, false, '');
    }
  };

  // --- STATISTIK DASHBOARD & LAPORAN ---
  const validOnlineOrders = useMemo(
    () => orders.filter((o) => o.status !== 'Dibatalkan'),
    [orders]
  );
  const totalOnlineSales = useMemo(
    () => validOnlineOrders.reduce((sum, o) => sum + o.total, 0),
    [validOnlineOrders]
  );
  const totalPartnerSalesAmount = useMemo(
    () => partnerSales.reduce((sum, s) => sum + Number(s.amount || 0), 0),
    [partnerSales]
  );
  const grandTotalSales = totalOnlineSales + totalPartnerSalesAmount;

  const currentMonthPrefix = getTodayString().slice(0, 7);
  const thisMonthOnlineSales = useMemo(
    () =>
      validOnlineOrders
        .filter((o) => o.orderDate.startsWith(currentMonthPrefix))
        .reduce((sum, o) => sum + o.total, 0),
    [validOnlineOrders, currentMonthPrefix]
  );
  const thisMonthPartnerSales = useMemo(
    () =>
      partnerSales
        .filter((s) => s.date.startsWith(currentMonthPrefix))
        .reduce((sum, s) => sum + Number(s.amount || 0), 0),
    [partnerSales, currentMonthPrefix]
  );
  const thisMonthTotalSales = thisMonthOnlineSales + thisMonthPartnerSales;
  const thisMonthTransactionCount =
    validOnlineOrders.filter((o) => o.orderDate.startsWith(currentMonthPrefix)).length +
    partnerSales.filter((s) => s.date.startsWith(currentMonthPrefix)).length;

  // --- CRUD STATES ADMIN ---
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Roti Manis',
    stock: 15,
    shortDesc: '',
    fullDesc: '',
    image: BAKERY_ARTWORKS.ROTI_SOBEK_BUNGA,
    featured: false,
    isBestSeller: false,
  });
  const [adminProductSearch, setAdminProductSearch] = useState('');

  const openProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({ isBestSeller: false, ...prod });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        category: 'Roti Manis',
        stock: 15,
        shortDesc: '',
        fullDesc: '',
        image: BAKERY_ARTWORKS.ROTI_SOBEK_BUNGA,
        featured: false,
        isBestSeller: false,
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0,
      fullDesc: productForm.fullDesc || productForm.shortDesc,
      isBestSeller: Boolean(productForm.isBestSeller),
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === editingProduct.id) {
            const updated = { ...payload, id: p.id };
            saveCloudDoc('products', p.id, updated);
            return updated;
          }
          if (payload.isBestSeller && p.isBestSeller) {
            const cleared = { ...p, isBestSeller: false };
            saveCloudDoc('products', p.id, cleared);
            return cleared;
          }
          return p;
        })
      );
      showToast(`Produk "${payload.name}" berhasil diperbarui.`);
    } else {
      const newId = `PRD-${String(Date.now()).slice(-4)}`;
      const newProd = { ...payload, id: newId };
      saveCloudDoc('products', newId, newProd);
      setProducts((prev) => [
        newProd,
        ...prev.map((p) => {
          if (payload.isBestSeller && p.isBestSeller) {
            const cleared = { ...p, isBestSeller: false };
            saveCloudDoc('products', p.id, cleared);
            return cleared;
          }
          return p;
        }),
      ]);
      showToast(`Produk baru "${payload.name}" berhasil ditambahkan.`);
      addActivity(`Produk baru "${payload.name}" ditambahkan ke katalog`, 'product');
    }
    setProductModalOpen(false);
  };

  const [orderFilterStatus, setOrderFilterStatus] = useState('Semua');
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updated = { ...o, status: newStatus };
        saveCloudDoc('orders', orderId, updated);
        return updated;
      })
    );
    if (selectedAdminOrder && selectedAdminOrder.id === orderId) {
      setSelectedAdminOrder((prev) => ({ ...prev, status: newStatus }));
    }
    showToast(`Status pesanan #${orderId} diubah menjadi "${newStatus}".`);
    addActivity(`Status pesanan #${orderId} diperbarui menjadi ${newStatus}`, 'status');
  };

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState({
    title: '',
    description: '',
    period: '',
    image: BAKERY_ARTWORKS.BUNDLING_POSTER,
    active: true,
  });

  const openPromoModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setPromoForm({ ...promo });
    } else {
      setEditingPromo(null);
      setPromoForm({
        title: '',
        description: '',
        period: 'Berlaku Bulan Ini',
        image: BAKERY_ARTWORKS.BUNDLING_POSTER,
        active: true,
      });
    }
    setPromoModalOpen(true);
  };

  const handleSavePromo = (e) => {
    e.preventDefault();
    if (editingPromo) {
      const updated = { ...promoForm, id: editingPromo.id };
      setPromos((prev) => prev.map((p) => (p.id === editingPromo.id ? updated : p)));
      saveCloudDoc('promos', editingPromo.id, updated);
      showToast('Data promosi berhasil diperbarui.');
    } else {
      const newId = `PRM-${String(Date.now()).slice(-4)}`;
      const created = { ...promoForm, id: newId };
      setPromos((prev) => [created, ...prev]);
      saveCloudDoc('promos', newId, created);
      showToast('Promosi baru berhasil ditambahkan.');
    }
    setPromoModalOpen(false);
  };

  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    status: 'Aktif',
  });

  const openPartnerModal = (prt = null) => {
    if (prt) {
      setEditingPartner(prt);
      setPartnerForm({ notes: '', ...prt });
    } else {
      setEditingPartner(null);
      setPartnerForm({ name: '', phone: '', address: '', notes: '', status: 'Aktif' });
    }
    setPartnerModalOpen(true);
  };

  const handleSavePartner = (e) => {
    e.preventDefault();
    if (editingPartner) {
      const updated = { ...partnerForm, id: editingPartner.id };
      setPartners((prev) => prev.map((p) => (p.id === editingPartner.id ? updated : p)));
      saveCloudDoc('partners', editingPartner.id, updated);
      showToast('Data mitra warung berhasil diperbarui.');
    } else {
      const newId = `PRT-${String(Date.now()).slice(-4)}`;
      const created = { ...partnerForm, id: newId };
      setPartners((prev) => [created, ...prev]);
      saveCloudDoc('partners', newId, created);
      showToast('Mitra warung baru berhasil ditambahkan.');
    }
    setPartnerModalOpen(false);
  };

  const [partnerSaleModalOpen, setPartnerSaleModalOpen] = useState(false);
  const [editingPartnerSale, setEditingPartnerSale] = useState(null);
  const [partnerSaleForm, setPartnerSaleForm] = useState({
    partnerId: partners[0]?.id || '',
    date: getTodayString(),
    amount: '',
    notes: '',
  });

  const openPartnerSaleModal = (sale = null) => {
    if (sale) {
      setEditingPartnerSale(sale);
      setPartnerSaleForm({
        partnerId: sale.partnerId,
        date: sale.date,
        amount: sale.amount,
        notes: sale.notes,
      });
    } else {
      setEditingPartnerSale(null);
      setPartnerSaleForm({
        partnerId: partners[0]?.id || '',
        date: getTodayString(),
        amount: '',
        notes: '',
      });
    }
    setPartnerSaleModalOpen(true);
  };

  const handleSavePartnerSale = (e) => {
    e.preventDefault();
    const partnerObj = partners.find((p) => p.id === partnerSaleForm.partnerId);
    const partnerName = partnerObj ? partnerObj.name : 'Mitra Warung';
    const payload = {
      partnerId: partnerSaleForm.partnerId,
      partnerName,
      date: partnerSaleForm.date,
      amount: Number(partnerSaleForm.amount) || 0,
      notes: partnerSaleForm.notes,
    };

    if (editingPartnerSale) {
      const updated = { ...payload, id: editingPartnerSale.id };
      setPartnerSales((prev) => prev.map((s) => (s.id === editingPartnerSale.id ? updated : s)));
      saveCloudDoc('partner_sales', editingPartnerSale.id, updated);
      showToast('Catatan setoran warung berhasil diperbarui.');
    } else {
      const newId = `PSL-${String(Date.now()).slice(-4)}`;
      const created = { ...payload, id: newId };
      setPartnerSales((prev) => [created, ...prev]);
      saveCloudDoc('partner_sales', newId, created);
      showToast('Setoran warung berhasil dicatat!');
      addActivity(
        `Setoran warung ${partnerName} dicatat sebesar ${formatRupiah(payload.amount)}`,
        'partner'
      );
    }
    setPartnerSaleModalOpen(false);
  };

  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [editingShipping, setEditingShipping] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    area: '',
    fee: '',
    active: true,
  });

  const openShippingModal = (shp = null) => {
    if (shp) {
      setEditingShipping(shp);
      setShippingForm({ ...shp });
    } else {
      setEditingShipping(null);
      setShippingForm({ area: '', fee: 8000, active: true });
    }
    setShippingModalOpen(true);
  };

  const handleSaveShipping = (e) => {
    e.preventDefault();
    const payload = { ...shippingForm, fee: Number(shippingForm.fee) || 0 };
    if (editingShipping) {
      const updated = { ...payload, id: editingShipping.id };
      setShippingRates((prev) => prev.map((s) => (s.id === editingShipping.id ? updated : s)));
      saveCloudDoc('shipping_rates', editingShipping.id, updated);
      showToast('Tarif ongkos kirim berhasil diperbarui.');
    } else {
      const newId = `SHP-${String(Date.now()).slice(-4)}`;
      const created = { ...payload, id: newId };
      setShippingRates((prev) => [created, ...prev]);
      saveCloudDoc('shipping_rates', newId, created);
      showToast('Wilayah pengiriman baru berhasil ditambahkan.');
    }
    setShippingModalOpen(false);
  };

  const [reportFilterSource, setReportFilterSource] = useState('Semua');
  const [reportStartDate, setReportStartDate] = useState('2026-11-01');
  const [reportEndDate, setReportEndDate] = useState('2026-11-30');

  const combinedReportRows = useMemo(() => {
    const onlineRows = validOnlineOrders.map((o) => ({
      id: o.id,
      date: o.orderDate,
      source: 'Online',
      description: `Pesanan Online: ${o.customerName} (${o.items.length} jenis produk)`,
      amount: o.total,
    }));

    const partnerRows = partnerSales.map((s) => ({
      id: s.id,
      date: s.date,
      source: 'Mitra',
      description: `Setoran Warung: ${s.partnerName}${s.notes ? ` - ${s.notes}` : ''}`,
      amount: Number(s.amount || 0),
    }));

    return [...onlineRows, ...partnerRows]
      .filter((row) => {
        const matchSource = reportFilterSource === 'Semua' || row.source === reportFilterSource;
        const matchStart = !reportStartDate || row.date >= reportStartDate;
        const matchEnd = !reportEndDate || row.date <= reportEndDate;
        return matchSource && matchStart && matchEnd;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [validOnlineOrders, partnerSales, reportFilterSource, reportStartDate, reportEndDate]);

  const reportSummary = useMemo(() => {
    const online = combinedReportRows
      .filter((r) => r.source === 'Online')
      .reduce((acc, r) => acc + r.amount, 0);
    const mitra = combinedReportRows
      .filter((r) => r.source === 'Mitra')
      .reduce((acc, r) => acc + r.amount, 0);
    return {
      online,
      mitra,
      total: online + mitra,
      count: combinedReportRows.length,
    };
  }, [combinedReportRows]);

  const handleExportCSV = () => {
    if (combinedReportRows.length === 0) {
      showToast('Tidak ada data laporan untuk diekspor.', 'error');
      return;
    }
    const headers = ['Kode Referensi', 'Tanggal Transaksi', 'Sumber Penjualan', 'Keterangan', 'Nominal (Rp)'];
    const csvRows = [
      headers.join(','),
      ...combinedReportRows.map((r) =>
        [
          `"${r.id}"`,
          `"${r.date}"`,
          `"${r.source}"`,
          `"${r.description.replace(/"/g, '""')}"`,
          r.amount,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Penjualan_Roti_Emak_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File CSV laporan penjualan berhasil diunduh!');
  };

  const handleUploadGallerySlot = async (slotId, file) => {
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 720, 0.74);
      const nextSlots = gallerySlots.map((slot) =>
        slot.id === slotId ? { ...slot, image: compressed } : slot
      );
      setGallerySlots(nextSlots);
      await saveStoreSettingsCloud({ gallerySlots: nextSlots });
      showToast('Foto galeri Beranda berhasil diperbarui & tersimpan online!');
    } catch (err) {
      showToast(err.message || 'Gagal mengunggah foto.', 'error');
    }
  };

  // ============================================================================
  // 4. TAMPILAN LOGIN ADMIN
  // ============================================================================
  if (viewMode === 'admin-login') {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C1A0E] flex flex-col justify-center items-center p-4 font-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .font-serif { font-family: 'Playfair Display', Georgia, serif; }
          .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        `}</style>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E6D8C8] overflow-hidden">
          <div className="bg-[#4A2C18] text-white p-8 text-center">
            <div className="w-16 h-16 bg-[#C87D32] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 rotate-3">
              <ChefHat className="w-9 h-9 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-wide">ROTI EMAK</h1>
            <p className="text-[#F3EAE0]/85 text-sm mt-1">Portal Manajemen &amp; Dapur Desa Penebal</p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-2">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6F4E37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F4E37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-xs text-[#6F4E37] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4A2C18] shrink-0 mt-0.5" />
              <p>
                Akses khusus pengelola dapur <strong>Homemade Roti Emak</strong>. Anda dapat
                mengubah username &amp; kata sandi setelah masuk ke Dashboard Admin.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white font-semibold text-sm shadow-md transition-all"
            >
              Masuk ke Dashboard Admin
            </button>

            <button
              type="button"
              onClick={() => setViewMode('store')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#6F4E37] hover:bg-[#FAF6F0]"
            >
              ← Kembali ke Halaman Toko Pelanggan
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 5. TAMPILAN DASHBOARD ADMIN
  // ============================================================================
  if (viewMode === 'admin' && isAdminAuthenticated) {
    const adminNavItems = [
      { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
      { id: 'products', label: 'Manajemen Produk', icon: Package },
      { id: 'orders', label: 'Manajemen Pesanan', icon: ShoppingCart },
      { id: 'promos', label: 'Manajemen Promosi', icon: Tag },
      { id: 'partners', label: 'Mitra Warung (Titip Jual)', icon: Store },
      { id: 'partner-sales', label: 'Setoran Warung', icon: Receipt },
      { id: 'reports', label: 'Laporan Penjualan', icon: BarChart3 },
      { id: 'shipping', label: 'Ongkos Kirim, Foto & QRIS', icon: MapPin },
    ];

    const filteredAdminProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(adminProductSearch.toLowerCase())
    );

    const filteredAdminOrders = orders.filter(
      (o) => orderFilterStatus === 'Semua' || o.status === orderFilterStatus
    );

    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2C1A0E] flex font-sans">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          .font-serif { font-family: 'Playfair Display', Georgia, serif; }
          .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
          @media print { .no-print { display: none !important; } body { background: white !important; } }
        `}</style>

        {toast && (
          <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#2C1A0E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C87D32]/40 flex items-center gap-3">
            {toast.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={() => {
            if (confirmState.onConfirm) confirmState.onConfirm();
            setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null });
          }}
          onCancel={() =>
            setConfirmState({ isOpen: false, title: '', message: '', onConfirm: null })
          }
        />

        {adminSidebarOpen && (
          <div
            onClick={() => setAdminSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden no-print"
          />
        )}

        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-68 bg-[#2C1A0E] text-[#FAF6F0] flex flex-col transition-transform duration-300 no-print ${
            adminSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C87D32] flex items-center justify-center text-white shadow">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold tracking-wide text-white">ROTI EMAK</h2>
                <p className="text-[11px] text-[#F3EAE0]/70">Admin Desa Penebal</p>
              </div>
            </div>
            <button
              onClick={() => setAdminSidebarOpen(false)}
              className="lg:hidden p-1.5 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    setAdminSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#C87D32] text-white shadow-md font-semibold'
                      : 'text-[#F3EAE0]/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                setViewMode('store');
                setStorePage('home');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              <ExternalLink className="w-4 h-4" />
              Lihat Toko Pelanggan
            </button>
            <button
              onClick={() => {
                setIsAdminAuthenticated(false);
                setViewMode('store');
                showToast('Anda telah keluar dari Panel Admin.', 'info');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs font-semibold text-white"
            >
              <LogOut className="w-4 h-4" />
              Keluar (Logout)
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-[#E6D8C8] px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 no-print">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdminSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#FAF6F0] text-[#4A2C18] border border-[#E6D8C8]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-serif text-lg sm:text-xl font-bold text-[#2C1A0E]">
                  {adminNavItems.find((i) => i.id === adminTab)?.label}
                </h1>
                <p className="text-xs text-[#6F4E37] hidden sm:block">
                  Homemade Roti Emak Desa Penebal • Kelola Produk, Pesanan &amp; Warung
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF6F0] text-[#4A2C18] border border-[#E6D8C8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C87D32]" />
                Admin Aktif
              </span>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* A. DASHBOARD UTAMA */}
            {adminTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#E6D8C8] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6F4E37]">Total Produk</span>
                      <div className="p-2.5 rounded-xl bg-amber-50 text-[#C87D32]">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2C1A0E] mt-3">{products.length} Menu</p>
                    <p className="text-xs text-[#6F4E37] mt-1">
                      Stok total: {products.reduce((s, p) => s + Number(p.stock || 0), 0)} pcs
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E6D8C8] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6F4E37]">Pesanan Online</span>
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2C1A0E] mt-3">{orders.length} Pesanan</p>
                    <p className="text-xs text-[#6F4E37] mt-1">
                      Omzet online: {formatRupiah(totalOnlineSales)}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E6D8C8] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6F4E37]">Mitra Warung Aktif</span>
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                        <Store className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2C1A0E] mt-3">
                      {partners.filter((p) => p.status === 'Aktif').length} Warung
                    </p>
                    <p className="text-xs text-[#6F4E37] mt-1">
                      Dari total {partners.length} warung langganan
                    </p>
                  </div>

                  <div className="bg-[#4A2C18] text-white p-5 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F3EAE0]/80">
                        Total Penjualan Gabungan
                      </span>
                      <BarChart3 className="w-5 h-5 text-[#FFD28D]" />
                    </div>
                    <p className="text-2xl font-bold mt-3">{formatRupiah(grandTotalSales)}</p>
                    <p className="text-xs text-[#F3EAE0]/80 mt-1">
                      Bulan ini: {formatRupiah(thisMonthTotalSales)} ({thisMonthTransactionCount}{' '}
                      transaksi)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E6D8C8] shadow-xs">
                    <h3 className="font-serif text-lg font-bold text-[#2C1A0E] mb-4">
                      Grafik Perbandingan Penjualan Bulanan
                    </h3>
                    <MonthlySalesChart
                      onlineTotal={thisMonthOnlineSales}
                      partnerTotal={thisMonthPartnerSales}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-[#E6D8C8] shadow-xs flex flex-col">
                    <h3 className="font-serif text-lg font-bold text-[#2C1A0E] mb-4">
                      Aktivitas Terbaru
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-64 pr-1">
                      {activities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-start gap-3 pb-3 border-b border-[#FAF6F0] last:border-0"
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#C87D32] mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-[#2C1A0E] leading-relaxed">
                              {act.text}
                            </p>
                            <span className="text-[11px] text-[#6F4E37]">{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E6D8C8] flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#2C1A0E]">
                      Pesanan Terbaru Masuk
                    </h3>
                    <button
                      onClick={() => setAdminTab('orders')}
                      className="text-xs font-bold text-[#C87D32] hover:underline flex items-center gap-1"
                    >
                      Kelola Semua Pesanan <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                        <tr>
                          <th className="px-6 py-3.5">Kode Pesanan</th>
                          <th className="px-6 py-3.5">Pelanggan</th>
                          <th className="px-6 py-3.5">Tgl Kirim</th>
                          <th className="px-6 py-3.5">Total</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF6F0]">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#FAF6F0]/50">
                            <td className="px-6 py-3.5 font-bold text-[#4A2C18]">{ord.id}</td>
                            <td className="px-6 py-3.5">{ord.customerName}</td>
                            <td className="px-6 py-3.5 text-[#6F4E37]">{ord.deliveryDate}</td>
                            <td className="px-6 py-3.5 font-semibold">{formatRupiah(ord.total)}</td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getOrderStatusStyle(
                                  ord.status
                                )}`}
                              >
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* B. MANAJEMEN PRODUK */}
            {adminTab === 'products' && (
              <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E6D8C8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#6F4E37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminProductSearch}
                      onChange={(e) => setAdminProductSearch(e.target.value)}
                      placeholder="Cari nama roti atau kategori..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                    />
                  </div>
                  <button
                    onClick={() => openProductModal()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Tambah Produk Baru
                  </button>
                </div>

                {filteredAdminProducts.length === 0 ? (
                  <div className="p-12 text-center text-[#6F4E37] space-y-2">
                    <Package className="w-12 h-12 mx-auto text-[#C87D32]/50" />
                    <p className="font-semibold">Belum ada produk di katalog.</p>
                    <p className="text-xs">
                      Klik tombol <strong>Tambah Produk Baru</strong> di atas untuk mulai mengisi
                      menu &amp; foto roti asli Anda (harga mulai dari Rp 500).
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                        <tr>
                          <th className="px-6 py-3.5">Produk</th>
                          <th className="px-6 py-3.5">Kategori</th>
                          <th className="px-6 py-3.5">Harga</th>
                          <th className="px-6 py-3.5">Stok</th>
                          <th className="px-6 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF6F0]">
                        {filteredAdminProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAF6F0]/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3.5">
                                <SafeImage
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-[#E6D8C8] shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-[#2C1A0E]">{p.name}</p>
                                    {p.isBestSeller && (
                                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                        Best Seller
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#6F4E37] line-clamp-1 max-w-xs">
                                    {p.shortDesc}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#E6D8C8] text-xs font-medium text-[#6F4E37]">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#4A2C18]">
                              {formatRupiah(p.price)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  p.stock === 0
                                    ? 'bg-rose-100 text-rose-700'
                                    : p.stock <= 8
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {p.stock === 0 ? 'Habis' : `${p.stock} pcs`}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => openProductModal(p)}
                                className="p-2 rounded-lg bg-amber-50 text-[#C87D32] hover:bg-amber-100"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmState({
                                    isOpen: true,
                                    title: 'Hapus Produk?',
                                    message: `Yakin ingin menghapus "${p.name}" dari katalog?`,
                                    onConfirm: () => {
                                      setProducts((prev) =>
                                        prev.filter((item) => item.id !== p.id)
                                      );
                                      deleteCloudDoc('products', p.id);
                                      showToast(`Produk "${p.name}" berhasil dihapus.`);
                                    },
                                  })
                                }
                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Modal
                  isOpen={productModalOpen}
                  onClose={() => setProductModalOpen(false)}
                  title={editingProduct ? 'Edit Produk Roti' : 'Tambah Produk Baru'}
                >
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Nama Produk *
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Contoh: Bolu Kemojo Pandan"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Harga (Rp) *
                        </label>
                        <input
                          type="number"
                          required
                          min="500"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({ ...productForm, price: e.target.value })
                          }
                          placeholder="Min. 500"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Stok *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({ ...productForm, stock: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Kategori *
                        </label>
                        <select
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm({ ...productForm, category: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        >
                          {categories
                            .filter((c) => c !== 'Semua')
                            .map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Deskripsi Singkat *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={productForm.shortDesc}
                        onChange={(e) =>
                          setProductForm({ ...productForm, shortDesc: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <ImageUploaderField
                      label="Foto Produk *"
                      value={productForm.image}
                      onChange={(newImg) => setProductForm({ ...productForm, image: newImg })}
                      presets={PRESET_BREAD_IMAGES}
                      onNotify={showToast}
                    />
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.isBestSeller}
                          onChange={(e) =>
                            setProductForm({ ...productForm, isBestSeller: e.target.checked })
                          }
                        />
                        <span className="font-medium text-[#2C1A0E]">
                          Tandai sebagai Produk Best Seller
                        </span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(e) =>
                            setProductForm({ ...productForm, featured: e.target.checked })
                          }
                        />
                        <span>Tampilkan di Menu Pilihan Beranda</span>
                      </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-[#E6D8C8]">
                      <button
                        type="button"
                        onClick={() => setProductModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF6F0] text-[#6F4E37]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A2C18] text-white"
                      >
                        Simpan Produk
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            )}

            {/* C. MANAJEMEN PESANAN */}
            {adminTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E6D8C8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#2C1A0E]">Daftar Pesanan Pelanggan</h3>
                    <p className="text-xs text-[#6F4E37]">
                      Perbarui status pesanan agar langsung tampil di halaman Pesanan Saya.
                    </p>
                  </div>
                  <select
                    value={orderFilterStatus}
                    onChange={(e) => setOrderFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm font-medium"
                  >
                    <option value="Semua">Semua Status</option>
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredAdminOrders.length === 0 ? (
                  <div className="p-12 text-center text-[#6F4E37]">
                    <ShoppingCart className="w-12 h-12 mx-auto text-[#C87D32]/50 mb-3" />
                    <p className="font-semibold">Belum ada pesanan dengan status ini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                        <tr>
                          <th className="px-6 py-3.5">Kode &amp; Tgl</th>
                          <th className="px-6 py-3.5">Pelanggan</th>
                          <th className="px-6 py-3.5">Tgl Kirim</th>
                          <th className="px-6 py-3.5">Total &amp; Bayar</th>
                          <th className="px-6 py-3.5">Ubah Status</th>
                          <th className="px-6 py-3.5 text-right">Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF6F0]">
                        {filteredAdminOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#FAF6F0]/50">
                            <td className="px-6 py-4">
                              <p className="font-mono font-bold text-[#4A2C18] text-xs">{ord.id}</p>
                              <p className="text-[11px] text-[#6F4E37]">{ord.orderDate}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#2C1A0E]">{ord.customerName}</p>
                              <p className="text-xs text-[#6F4E37]">{ord.phone}</p>
                            </td>
                            <td className="px-6 py-4 text-[#6F4E37] font-medium">
                              {ord.deliveryDate}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#2C1A0E]">{formatRupiah(ord.total)}</p>
                              <p className="text-[11px] text-[#6F4E37]">
                                {ord.paymentMethodLabel || ord.paymentMethod || 'COD'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getOrderStatusStyle(
                                  ord.status
                                )}`}
                              >
                                {ORDER_STATUS_OPTIONS.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedAdminOrder(ord)}
                                className="p-2 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE5D8] text-[#4A2C18]"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Modal
                  isOpen={Boolean(selectedAdminOrder)}
                  onClose={() => setSelectedAdminOrder(null)}
                  title={`Detail Pesanan ${selectedAdminOrder?.id || ''}`}
                  maxWidth="max-w-xl"
                >
                  {selectedAdminOrder && (
                    <div className="space-y-4 text-sm">
                      <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6D8C8] space-y-1.5 text-xs">
                        <p>
                          <strong>Pelanggan:</strong> {selectedAdminOrder.customerName} (
                          {selectedAdminOrder.phone})
                        </p>
                        <p>
                          <strong>Alamat:</strong> {selectedAdminOrder.address} (
                          {selectedAdminOrder.area})
                        </p>
                        <p>
                          <strong>Jadwal Kirim:</strong> {selectedAdminOrder.deliveryDate}
                        </p>
                        <p>
                          <strong>Pembayaran:</strong>{' '}
                          {selectedAdminOrder.paymentMethodLabel || selectedAdminOrder.paymentMethod}{' '}
                          — {selectedAdminOrder.paymentStatus}
                        </p>
                        <p>
                          <strong>Catatan:</strong> {selectedAdminOrder.notes || '-'}
                        </p>
                      </div>

                      {selectedAdminOrder.paymentProof && (
                        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                          <p className="font-bold text-xs uppercase text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Bukti Pembayaran Pelanggan</span>
                          </p>
                          <div className="rounded-xl overflow-hidden border border-emerald-200 bg-white max-h-72 flex justify-center">
                            <img
                              src={selectedAdminOrder.paymentProof}
                              alt="Bukti Pembayaran"
                              className="max-h-72 w-auto object-contain"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="font-bold text-xs uppercase text-[#6F4E37]">Rincian Item</p>
                        {selectedAdminOrder.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between py-1.5 border-b border-[#FAF6F0] text-xs"
                          >
                            <span>
                              {it.qty}x {it.name}
                            </span>
                            <span className="font-bold">{formatRupiah(it.price * it.qty)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs text-[#6F4E37] pt-1">
                          <span>Ongkos Kirim</span>
                          <span>{formatRupiah(selectedAdminOrder.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-[#4A2C18] pt-1">
                          <span>Total Pembayaran</span>
                          <span>{formatRupiah(selectedAdminOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Modal>
              </div>
            )}

            {/* D. MANAJEMEN PROMOSI */}
            {adminTab === 'promos' && (
              <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E6D8C8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#2C1A0E]">Daftar Promosi &amp; Paket Hemat</h3>
                    <p className="text-xs text-[#6F4E37]">
                      Unggah poster promo asli Roti Emak (misalnya Paket Hemat Bolu Kemojo) di sini.
                    </p>
                  </div>
                  <button
                    onClick={() => openPromoModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Tambah Promosi
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {promos.map((prm) => (
                    <div
                      key={prm.id}
                      className="rounded-2xl border border-[#E6D8C8] overflow-hidden flex flex-col bg-[#FAF6F0]/40"
                    >
                      <div className="h-44 relative bg-[#FAF6F0]">
                        <SafeImage
                          src={prm.image}
                          alt={prm.title}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                            prm.active ? 'bg-emerald-600 text-white' : 'bg-stone-600 text-white'
                          }`}
                        >
                          {prm.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-[#C87D32]">{prm.period}</p>
                          <h4 className="font-serif text-lg font-bold text-[#2C1A0E] mt-0.5">
                            {prm.title}
                          </h4>
                          <p className="text-xs text-[#6F4E37] mt-1.5 leading-relaxed">
                            {prm.description}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 pt-3 border-t border-[#E6D8C8]">
                          <button
                            onClick={() => openPromoModal(prm)}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 text-[#C87D32] hover:bg-amber-100 text-xs font-bold flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit / Ganti Poster
                          </button>
                          <button
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                title: 'Hapus Promosi?',
                                message: `Yakin ingin menghapus promo "${prm.title}"?`,
                                onConfirm: () => {
                                  setPromos((prev) => prev.filter((item) => item.id !== prm.id));
                                  deleteCloudDoc('promos', prm.id);
                                  showToast('Promosi berhasil dihapus.');
                                },
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Modal
                  isOpen={promoModalOpen}
                  onClose={() => setPromoModalOpen(false)}
                  title={editingPromo ? 'Edit Promosi' : 'Tambah Promosi Baru'}
                >
                  <form onSubmit={handleSavePromo} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Nama Promosi *
                      </label>
                      <input
                        type="text"
                        required
                        value={promoForm.title}
                        onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Periode Promosi *
                      </label>
                      <input
                        type="text"
                        required
                        value={promoForm.period}
                        onChange={(e) => setPromoForm({ ...promoForm, period: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Deskripsi Promosi *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={promoForm.description}
                        onChange={(e) =>
                          setPromoForm({ ...promoForm, description: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <ImageUploaderField
                      label="Poster / Gambar Promosi *"
                      value={promoForm.image}
                      onChange={(newImg) => setPromoForm({ ...promoForm, image: newImg })}
                      presets={PRESET_BREAD_IMAGES}
                      onNotify={showToast}
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promoForm.active}
                        onChange={(e) => setPromoForm({ ...promoForm, active: e.target.checked })}
                      />
                      <span>Promosi Aktif (Tampilkan di Halaman Pelanggan)</span>
                    </label>
                    <div className="flex justify-end gap-3 pt-3 border-t border-[#E6D8C8]">
                      <button
                        type="button"
                        onClick={() => setPromoModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF6F0] text-[#6F4E37]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A2C18] text-white"
                      >
                        Simpan Promosi
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            )}

            {/* E. MITRA WARUNG (TITIP JUAL HARIAN) */}
            {adminTab === 'partners' && (
              <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E6D8C8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#2C1A0E]">
                      Daftar Mitra Warung &amp; Pelanggan Tetap (Titip Jual Harian)
                    </h3>
                    <p className="text-xs text-[#6F4E37]">
                      Kelola warung/kedai langganan yang rutin diantar roti setiap hari.
                    </p>
                  </div>
                  <button
                    onClick={() => openPartnerModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Tambah Mitra Warung
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                      <tr>
                        <th className="px-6 py-3.5">Nama Warung / Mitra</th>
                        <th className="px-6 py-3.5">Telepon</th>
                        <th className="px-6 py-3.5">Alamat &amp; Catatan Antar Harian</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF6F0]">
                      {partners.map((prt) => (
                        <tr key={prt.id} className="hover:bg-[#FAF6F0]/50">
                          <td className="px-6 py-4 font-bold text-[#2C1A0E]">{prt.name}</td>
                          <td className="px-6 py-4 text-[#6F4E37]">{prt.phone}</td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-[#2C1A0E]">{prt.address}</p>
                            {prt.notes && (
                              <p className="text-[11px] text-[#8B5A2B] mt-0.5">{prt.notes}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                prt.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {prt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openPartnerModal(prt)}
                              className="p-2 rounded-lg bg-amber-50 text-[#C87D32] hover:bg-amber-100"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmState({
                                  isOpen: true,
                                  title: 'Hapus Mitra Warung?',
                                  message: `Yakin ingin menghapus "${prt.name}" dari daftar mitra warung?`,
                                  onConfirm: () => {
                                    setPartners((prev) =>
                                      prev.filter((item) => item.id !== prt.id)
                                    );
                                    deleteCloudDoc('partners', prt.id);
                                    showToast('Mitra warung berhasil dihapus.');
                                  },
                                })
                              }
                              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Modal
                  isOpen={partnerModalOpen}
                  onClose={() => setPartnerModalOpen(false)}
                  title={editingPartner ? 'Edit Mitra Warung' : 'Tambah Mitra Warung Baru'}
                >
                  <form onSubmit={handleSavePartner} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Nama Warung / Mitra *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerForm.name}
                        onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Nomor Telepon *
                        </label>
                        <input
                          type="tel"
                          required
                          value={partnerForm.phone}
                          onChange={(e) =>
                            setPartnerForm({ ...partnerForm, phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Status Kerja Sama
                        </label>
                        <select
                          value={partnerForm.status}
                          onChange={(e) =>
                            setPartnerForm({ ...partnerForm, status: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Alamat Warung *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerForm.address}
                        onChange={(e) =>
                          setPartnerForm({ ...partnerForm, address: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Jadwal &amp; Catatan Antar Harian
                      </label>
                      <textarea
                        rows={2}
                        value={partnerForm.notes}
                        onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })}
                        placeholder="Contoh: Antar tiap jam 07.00 pagi, 25 pcs roti manis & bolu kemojo"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-[#E6D8C8]">
                      <button
                        type="button"
                        onClick={() => setPartnerModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF6F0] text-[#6F4E37]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A2C18] text-white"
                      >
                        Simpan Warung
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            )}

            {/* F. SETORAN WARUNG */}
            {adminTab === 'partner-sales' && (
              <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E6D8C8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#2C1A0E]">Pencatatan Setoran Mitra Warung</h3>
                    <p className="text-xs text-[#6F4E37]">
                      Total setoran warung tercatat:{' '}
                      <strong className="text-[#4A2C18]">
                        {formatRupiah(totalPartnerSalesAmount)}
                      </strong>
                    </p>
                  </div>
                  <button
                    onClick={() => openPartnerSaleModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Catat Setoran Warung
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                      <tr>
                        <th className="px-6 py-3.5">Tanggal</th>
                        <th className="px-6 py-3.5">Nama Warung</th>
                        <th className="px-6 py-3.5">Jumlah Setoran</th>
                        <th className="px-6 py-3.5">Keterangan</th>
                        <th className="px-6 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF6F0]">
                      {partnerSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-[#FAF6F0]/50">
                          <td className="px-6 py-4 font-medium text-[#6F4E37]">{sale.date}</td>
                          <td className="px-6 py-4 font-bold text-[#2C1A0E]">{sale.partnerName}</td>
                          <td className="px-6 py-4 font-bold text-emerald-700">
                            {formatRupiah(sale.amount)}
                          </td>
                          <td className="px-6 py-4 text-xs text-[#6F4E37] max-w-xs">{sale.notes}</td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openPartnerSaleModal(sale)}
                              className="p-2 rounded-lg bg-amber-50 text-[#C87D32] hover:bg-amber-100"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmState({
                                  isOpen: true,
                                  title: 'Hapus Catatan Setoran?',
                                  message: `Hapus catatan setoran dari "${sale.partnerName}" sebesar ${formatRupiah(
                                    sale.amount
                                  )}?`,
                                  onConfirm: () => {
                                    setPartnerSales((prev) =>
                                      prev.filter((item) => item.id !== sale.id)
                                    );
                                    deleteCloudDoc('partner_sales', sale.id);
                                    showToast('Catatan setoran warung dihapus.');
                                  },
                                })
                              }
                              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Modal
                  isOpen={partnerSaleModalOpen}
                  onClose={() => setPartnerSaleModalOpen(false)}
                  title={editingPartnerSale ? 'Edit Setoran Warung' : 'Catat Setoran Mitra Warung'}
                >
                  <form onSubmit={handleSavePartnerSale} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Pilih Mitra Warung *
                      </label>
                      <select
                        required
                        value={partnerSaleForm.partnerId}
                        onChange={(e) =>
                          setPartnerSaleForm({ ...partnerSaleForm, partnerId: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      >
                        {partners.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.status})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Tanggal Setoran *
                        </label>
                        <input
                          type="date"
                          required
                          value={partnerSaleForm.date}
                          onChange={(e) =>
                            setPartnerSaleForm({ ...partnerSaleForm, date: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Jumlah Penghasilan (Rp) *
                        </label>
                        <input
                          type="number"
                          required
                          min="500"
                          value={partnerSaleForm.amount}
                          onChange={(e) =>
                            setPartnerSaleForm({ ...partnerSaleForm, amount: e.target.value })
                          }
                          placeholder="Min. 500"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Keterangan Rincian
                      </label>
                      <textarea
                        rows={2}
                        value={partnerSaleForm.notes}
                        onChange={(e) =>
                          setPartnerSaleForm({ ...partnerSaleForm, notes: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-[#E6D8C8]">
                      <button
                        type="button"
                        onClick={() => setPartnerSaleModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF6F0] text-[#6F4E37]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A2C18] text-white"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </form>
                </Modal>
              </div>
            )}

            {/* G. LAPORAN PENJUALAN */}
            {adminTab === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E6D8C8] shadow-xs flex flex-col lg:flex-row lg:items-end justify-between gap-4 no-print">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Dari Tanggal
                      </label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Sumber Penjualan
                      </label>
                      <select
                        value={reportFilterSource}
                        onChange={(e) => setReportFilterSource(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      >
                        <option value="Semua">Semua Sumber (Online &amp; Warung)</option>
                        <option value="Online">Penjualan Online Saja</option>
                        <option value="Mitra">Setoran Warung Saja</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] border border-[#E6D8C8] text-xs font-bold text-[#4A2C18]"
                    >
                      <Printer className="w-4 h-4" /> Cetak Laporan
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-xs font-bold text-white"
                    >
                      <Download className="w-4 h-4" /> Ekspor CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#E6D8C8]">
                    <span className="text-xs font-semibold text-[#6F4E37]">
                      Total Penjualan Online
                    </span>
                    <p className="text-xl font-bold text-[#4A2C18] mt-2">
                      {formatRupiah(reportSummary.online)}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-[#E6D8C8]">
                    <span className="text-xs font-semibold text-[#6F4E37]">
                      Total Setoran Warung
                    </span>
                    <p className="text-xl font-bold text-[#C87D32] mt-2">
                      {formatRupiah(reportSummary.mitra)}
                    </p>
                  </div>
                  <div className="bg-[#4A2C18] text-white p-5 rounded-2xl">
                    <span className="text-xs font-semibold text-[#F3EAE0]/80">
                      Total Keseluruhan (Terfilter)
                    </span>
                    <p className="text-xl font-bold mt-2">{formatRupiah(reportSummary.total)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-[#E6D8C8]">
                    <span className="text-xs font-semibold text-[#6F4E37]">Jumlah Transaksi</span>
                    <p className="text-xl font-bold text-[#2C1A0E] mt-2">
                      {reportSummary.count} Transaksi
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E6D8C8] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E6D8C8]">
                    <h4 className="font-serif text-base font-bold text-[#2C1A0E]">
                      Rincian Riwayat Transaksi Terpadu
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                        <tr>
                          <th className="px-6 py-3.5">Kode Referensi</th>
                          <th className="px-6 py-3.5">Tanggal</th>
                          <th className="px-6 py-3.5">Sumber</th>
                          <th className="px-6 py-3.5">Keterangan</th>
                          <th className="px-6 py-3.5 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF6F0]">
                        {combinedReportRows.map((row) => (
                          <tr key={`${row.source}-${row.id}`} className="hover:bg-[#FAF6F0]/50">
                            <td className="px-6 py-3.5 font-mono text-xs font-bold text-[#4A2C18]">
                              {row.id}
                            </td>
                            <td className="px-6 py-3.5 text-[#6F4E37]">{row.date}</td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  row.source === 'Online'
                                    ? 'bg-[#4A2C18] text-white'
                                    : 'bg-[#C87D32] text-white'
                                }`}
                              >
                                {row.source}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-xs text-[#2C1A0E]">
                              {row.description}
                            </td>
                            <td className="px-6 py-3.5 text-right font-bold text-[#2C1A0E]">
                              {formatRupiah(row.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* H. PENGATURAN ONGKOS KIRIM, FOTO BERANDA & QRIS */}
            {adminTab === 'shipping' && (
              <div className="space-y-6">
                {/* Keamanan Akun Admin */}
                <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs p-6">
                  <form onSubmit={handleUpdateAdminCredentials} className="space-y-3.5 max-w-xl">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#4A2C18] border border-[#E6D8C8] text-xs font-bold">
                        <Lock className="w-3.5 h-3.5 text-[#C87D32]" /> Keamanan Login Admin
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#2C1A0E] mt-2">
                        Ubah Username &amp; Kata Sandi Admin
                      </h3>
                      <p className="text-xs text-[#6F4E37]">
                        Login awal saat ini: <strong>{adminCreds.username}</strong> (sandi awal:{' '}
                        <code>Penebal2026!</code> — segera ganti sesuai keinginan Anda).
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                        Username Admin *
                      </label>
                      <input
                        type="text"
                        required
                        value={credsForm.username}
                        onChange={(e) =>
                          setCredsForm({ ...credsForm, username: e.target.value })
                        }
                        placeholder={adminCreds.username}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Kata Sandi Baru
                        </label>
                        <input
                          type="password"
                          value={credsForm.newPassword}
                          onChange={(e) =>
                            setCredsForm({ ...credsForm, newPassword: e.target.value })
                          }
                          placeholder="Min. 6 karakter"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Ulangi Kata Sandi Baru
                        </label>
                        <input
                          type="password"
                          value={credsForm.confirmPassword}
                          onChange={(e) =>
                            setCredsForm({ ...credsForm, confirmPassword: e.target.value })
                          }
                          placeholder="Ulangi kata sandi"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-xs font-bold"
                    >
                      Simpan Username &amp; Kata Sandi
                    </button>
                  </form>
                </div>

                {/* Pengaturan Foto Beranda (Terkunci bagi Pelanggan) */}
                <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs p-6 space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#4A2C18] border border-[#E6D8C8] text-xs font-bold">
                        <ImageIcon className="w-3.5 h-3.5 text-[#C87D32]" /> Pengaturan Foto Beranda
                        (Khusus Admin)
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#2C1A0E]">
                        Foto / Poster Utama Halaman Beranda
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6F4E37] leading-relaxed">
                        Pelanggan hanya bisa melihat tampilan Beranda dan tidak dapat mengubah foto
                        apa pun. Anda dapat mengganti poster utama maupun 4 foto varian produksi di
                        bawah ini kapan saja.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-xs font-bold cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Upload Foto / Poster Beranda</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const compressed = await compressImageFile(file, 780, 0.75);
                                setCustomHeroImage(compressed);
                                await saveStoreSettingsCloud({ customHeroImage: compressed });
                                showToast('Foto utama Beranda berhasil diperbarui & tersimpan online!');
                              } catch (err) {
                                showToast(err.message || 'Gagal mengunggah foto.', 'error');
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {customHeroImage !== BAKERY_ARTWORKS.BUNDLING_POSTER && (
                          <button
                            type="button"
                            onClick={async () => {
                              setCustomHeroImage(BAKERY_ARTWORKS.BUNDLING_POSTER);
                              await saveStoreSettingsCloud({
                                customHeroImage: BAKERY_ARTWORKS.BUNDLING_POSTER,
                              });
                              showToast('Dikembalikan ke poster Bundling Hemat Roti Emak.');
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] border border-[#E6D8C8] text-xs font-bold text-[#6F4E37]"
                          >
                            Kembalikan Poster Bundling
                          </button>
                        )}
                      </div>
                    </div>

                    {customHeroImage && (
                      <div className="w-full max-w-[240px] rounded-2xl overflow-hidden border border-[#E6D8C8] bg-[#FAF6F0] shrink-0 mx-auto md:mx-0">
                        <img
                          src={customHeroImage}
                          alt="Pratinjau Foto Beranda"
                          className="w-full h-auto object-contain block"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4 Foto Galeri Produksi */}
                  <div className="pt-5 border-t border-[#E6D8C8]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-3">
                      4 Kartu Foto Varian Produksi di Beranda (Khusus Admin)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {gallerySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="rounded-xl border border-[#E6D8C8] bg-[#FAF6F0]/60 p-3 space-y-2.5"
                        >
                          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white border border-[#E6D8C8]">
                            <SafeImage
                              src={slot.image}
                              alt={slot.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#2C1A0E]">{slot.title}</p>
                            <p className="text-[11px] text-[#6F4E37] line-clamp-1">
                              {slot.subtitle}
                            </p>
                          </div>
                          <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-[11px] font-bold cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Ganti Foto Asli</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleUploadGallerySlot(slot.id, e.target.files?.[0]);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pengaturan QRIS */}
                <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> QRIS Resmi Terpasang
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#2C1A0E]">
                        Pengaturan QRIS Pembayaran Toko ("roti emak")
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6F4E37] leading-relaxed">
                        Poster QRIS resmi <strong>roti emak (NMID: ID1026600899573)</strong> sudah
                        aktif dan otomatis tampil saat pelanggan memilih metode pembayaran{' '}
                        <strong>QRIS</strong> di halaman Checkout.
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-xs font-bold cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Ganti / Upload File Gambar QRIS</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const compressed = await compressImageFile(file, 720, 0.75);
                                setCustomQrisImage(compressed);
                                await saveStoreSettingsCloud({ customQrisImage: compressed });
                                showToast('Gambar QRIS toko berhasil diperbarui & tersimpan online!');
                              } catch (err) {
                                showToast(err.message || 'Gagal mengunggah QRIS.', 'error');
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {customQrisImage && (
                          <button
                            type="button"
                            onClick={async () => {
                              setCustomQrisImage('');
                              await saveStoreSettingsCloud({ customQrisImage: '' });
                              showToast('Dikembalikan ke poster QRIS resmi roti emak.');
                            }}
                            className="px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] border border-[#E6D8C8] text-xs font-bold text-[#6F4E37]"
                          >
                            Gunakan QRIS Default Roti Emak
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 mx-auto md:mx-0">
                      <RotiEmakQrisPoster customImage={customQrisImage} />
                    </div>
                  </div>
                </div>

                {/* Tabel Wilayah & Ongkos Kirim */}
                <div className="bg-white rounded-2xl border border-[#E6D8C8] shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-[#E6D8C8] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#2C1A0E]">Pengaturan Wilayah &amp; Ongkos Kirim</h3>
                      <p className="text-xs text-[#6F4E37]">
                        Wilayah aktif otomatis muncul pada pilihan pengiriman di halaman Checkout.
                      </p>
                    </div>
                    <button
                      onClick={() => openShippingModal()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Tambah Wilayah
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF6F0] text-xs uppercase text-[#6F4E37]">
                        <tr>
                          <th className="px-6 py-3.5">Nama Wilayah Pengiriman</th>
                          <th className="px-6 py-3.5">Biaya Pengiriman</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF6F0]">
                        {shippingRates.map((shp) => (
                          <tr key={shp.id} className="hover:bg-[#FAF6F0]/50">
                            <td className="px-6 py-4 font-bold text-[#2C1A0E]">{shp.area}</td>
                            <td className="px-6 py-4 font-bold text-[#4A2C18]">
                              {shp.fee === 0 ? 'Gratis (Rp 0)' : formatRupiah(shp.fee)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  shp.active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {shp.active ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => openShippingModal(shp)}
                                className="p-2 rounded-lg bg-amber-50 text-[#C87D32] hover:bg-amber-100"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmState({
                                    isOpen: true,
                                    title: 'Hapus Wilayah Pengiriman?',
                                    message: `Hapus wilayah "${shp.area}"?`,
                                    onConfirm: () => {
                                      setShippingRates((prev) =>
                                        prev.filter((item) => item.id !== shp.id)
                                      );
                                      deleteCloudDoc('shipping_rates', shp.id);
                                      showToast('Wilayah pengiriman berhasil dihapus.');
                                    },
                                  })
                                }
                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Modal
                    isOpen={shippingModalOpen}
                    onClose={() => setShippingModalOpen(false)}
                    title={editingShipping ? 'Edit Ongkos Kirim' : 'Tambah Wilayah Pengiriman'}
                  >
                    <form onSubmit={handleSaveShipping} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Nama Wilayah *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingForm.area}
                          onChange={(e) => setShippingForm({ ...shippingForm, area: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1">
                          Biaya Pengiriman (Rp) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={shippingForm.fee}
                          onChange={(e) => setShippingForm({ ...shippingForm, fee: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shippingForm.active}
                          onChange={(e) =>
                            setShippingForm({ ...shippingForm, active: e.target.checked })
                          }
                        />
                        <span>Wilayah Aktif</span>
                      </label>
                      <div className="flex justify-end gap-3 pt-3 border-t border-[#E6D8C8]">
                        <button
                          type="button"
                          onClick={() => setShippingModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF6F0] text-[#6F4E37]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#4A2C18] text-white"
                        >
                          Simpan Wilayah
                        </button>
                      </div>
                    </form>
                  </Modal>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 6. TAMPILAN HALAMAN PELANGGAN (STOREFRONT)
  // ============================================================================
  const activePromos = promos.filter((p) => p.active);
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const homeShowcaseProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  // Hanya tampilkan pesanan milik perangkat ini (atau yang sudah diverifikasi lewat Kode + 4 digit No. HP)
  const myPrivateCustomerOrders = orders.filter((o) => myOrderIds.includes(o.id));

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1A0E] flex flex-col font-sans selection:bg-[#C87D32] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      `}</style>

      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm bg-[#2C1A0E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C87D32]/40 flex items-center gap-3">
          {toast.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* NAVBAR PELANGGAN */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6D8C8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button
            onClick={() => {
              setStorePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#4A2C18] group-hover:bg-[#C87D32] transition-colors flex items-center justify-center text-white shadow-md">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#4A2C18] block leading-none">
                ROTI EMAK
              </span>
              <span className="text-[11px] font-medium text-[#6F4E37] tracking-wide">
                Homemade dengan cinta • Desa Penebal
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'home', label: 'Beranda' },
              { id: 'products', label: 'Produk' },
              { id: 'promos', label: 'Promosi' },
              { id: 'orders', label: 'Pesanan Saya' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  setStorePage(nav.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  storePage === nav.id
                    ? 'bg-[#FAF6F0] text-[#4A2C18] border border-[#E6D8C8]'
                    : 'text-[#6F4E37] hover:text-[#4A2C18] hover:bg-[#FAF6F0]/60'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setStorePage('cart');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] border border-[#E6D8C8] text-[#4A2C18] font-semibold text-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#C87D32]" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartItemCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#C87D32] text-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode(isAdminAuthenticated ? 'admin' : 'admin-login')}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-semibold shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdminAuthenticated ? 'Dashboard Admin' : 'Login Admin'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-[#4A2C18]"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E6D8C8] px-4 py-4 space-y-2 shadow-lg">
            {[
              { id: 'home', label: 'Beranda' },
              { id: 'products', label: 'Produk' },
              { id: 'promos', label: 'Promosi' },
              { id: 'orders', label: 'Pesanan Saya' },
              { id: 'cart', label: `Keranjang (${cartItemCount})` },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  setStorePage(nav.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  storePage === nav.id ? 'bg-[#FAF6F0] text-[#4A2C18]' : 'text-[#6F4E37]'
                }`}
              >
                {nav.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setViewMode(isAdminAuthenticated ? 'admin' : 'admin-login');
              }}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#4A2C18] text-white"
            >
              {isAdminAuthenticated ? 'Dashboard Admin' : 'Login Admin'}
            </button>
          </div>
        )}
      </header>

      {/* KONTEN UTAMA PELANGGAN */}
      <main className="flex-1">
        {/* A. BERANDA */}
        {storePage === 'home' && (
          <div className="space-y-16 pb-16">
            <section className="border-b border-[#E6D8C8] bg-[#FAF6F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6 space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#8B5A2B]">
                    Dapur Rumahan Desa Penebal • Bengkalis
                  </p>
                  <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2C1A0E] leading-[1.18]">
                    Kelezatan Roti, Dibuat dengan Sepenuh Hati
                  </h1>
                  <p className="text-sm sm:text-base text-[#5C4033] leading-relaxed max-w-lg">
                    Setiap pagi dapur Homemade Roti Emak memanggang roti lembut tanpa bahan
                    pengawet untuk sarapan keluarga, titip jual warung harian, hingga pesanan acara
                    di sekitar Desa Penebal dan Bengkalis.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setStorePage('products')}
                      className="px-6 py-3.5 rounded-xl bg-[#4A2C18] hover:bg-[#3A2212] text-white font-semibold text-sm transition-colors flex items-center gap-2"
                    >
                      <span>Lihat Produk</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setStorePage('promos')}
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F3EAE0] text-[#4A2C18] border border-[#E6D8C8] font-semibold text-sm transition-colors"
                    >
                      Info &amp; Promo
                    </button>
                  </div>
                  <p className="text-xs text-[#6F4E37] pt-1">
                    Buka setiap hari 08.00 – 12.00 WIB • WhatsApp: 0819-3356-4802 / 0813-6229-0710
                  </p>
                </div>

                {/* Sisi Kanan Hero (Terkunci untuk Pelanggan) */}
                <div className="lg:col-span-6">
                  <div className="rounded-3xl overflow-hidden border border-[#E6D8C8] bg-white shadow-sm">
                    <SafeImage
                      src={customHeroImage}
                      alt="Homemade Roti Emak Desa Penebal"
                      className="w-full h-auto max-h-[500px] object-contain bg-[#FAF6F0] block mx-auto"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Kartu Varian Produksi (Terkunci untuk Pelanggan) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-6 border-b border-[#E6D8C8]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
                    Langsung dari Loyang Dapur Kami
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1A0E] mt-1">
                    Varian Produksi Homemade Roti Emak
                  </h2>
                </div>
                <p className="text-xs text-[#6F4E37]">
                  Roti manis full topping, roti isi nanas, roti abon &amp; roti isi cokelat
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {gallerySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-white rounded-2xl border border-[#E6D8C8] overflow-hidden flex flex-col shadow-2xs"
                  >
                    <div className="relative aspect-[4/3] bg-[#FAF6F0] overflow-hidden">
                      <SafeImage
                        src={slot.image}
                        alt={slot.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-white/95 border border-[#E6D8C8] text-[10px] font-bold text-[#4A2C18]">
                        {slot.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-base font-bold text-[#2C1A0E]">{slot.title}</h3>
                      <p className="text-xs text-[#6F4E37] mt-0.5">{slot.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Menu Pilihan Hari Ini */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-6 border-b border-[#E6D8C8]">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1A0E]">
                    Menu Pilihan Hari Ini
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6F4E37] mt-1">
                    Varian roti yang siap dipesan langsung dari dapur Roti Emak
                  </p>
                </div>
                <button
                  onClick={() => setStorePage('products')}
                  className="text-sm font-semibold text-[#4A2C18] hover:text-[#8B5A2B] flex items-center gap-1"
                >
                  Lihat Semua Produk <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {homeShowcaseProducts.length === 0 ? (
                <div className="mt-6 bg-white rounded-2xl border border-[#E6D8C8] p-8 text-center space-y-2">
                  <p className="font-serif text-lg font-bold text-[#2C1A0E]">
                    Katalog Produk Sedang Diperbarui Dapur
                  </p>
                  <p className="text-xs sm:text-sm text-[#6F4E37] max-w-md mx-auto">
                    Hubungi WhatsApp <strong>0819-3356-4802</strong> untuk pemesanan harian atau masuk
                    ke Dashboard Admin untuk menambahkan daftar menu &amp; harga terbaru.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {homeShowcaseProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#E6D8C8] overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-[#FAF6F0] overflow-hidden">
                        <SafeImage
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#2C1A0E]">
                            {prod.name}
                          </h3>
                          <p className="text-sm font-bold text-[#8B5A2B] mt-0.5">
                            {formatRupiah(prod.price)}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#FAF6F0]">
                          <button
                            onClick={() => {
                              setDetailProduct(prod);
                              setDetailQty(1);
                            }}
                            className="py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] border border-[#E6D8C8] text-[#4A2C18] text-xs font-bold"
                          >
                            Detail
                          </button>
                          <button
                            disabled={prod.stock <= 0}
                            onClick={() => handleAddToCart(prod, 1)}
                            className="py-2 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] disabled:bg-stone-300 text-white text-xs font-bold"
                          >
                            {prod.stock > 0 ? '+ Keranjang' : 'Habis'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Info & Promo Terbaru */}
            {activePromos.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-6">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1A0E]">
                    Info &amp; Promo Terbaru
                  </h2>
                  <button
                    onClick={() => setStorePage('promos')}
                    className="text-sm font-semibold text-[#4A2C18] hover:text-[#8B5A2B] flex items-center gap-1"
                  >
                    Semua Promo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activePromos.slice(0, 2).map((prm) => (
                    <div
                      key={prm.id}
                      className="bg-white border border-[#E6D8C8] rounded-2xl overflow-hidden flex flex-col sm:flex-row"
                    >
                      {prm.image && (
                        <SafeImage
                          src={prm.image}
                          alt={prm.title}
                          className="w-full sm:w-44 h-44 sm:h-auto object-cover shrink-0"
                        />
                      )}
                      <div className="p-5 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#8B5A2B]">{prm.period}</p>
                          <h3 className="font-serif text-lg font-bold text-[#2C1A0E] mt-1">
                            {prm.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#6F4E37] mt-2 leading-relaxed">
                            {prm.description}
                          </p>
                        </div>
                        <button
                          onClick={() => setStorePage('products')}
                          className="mt-4 self-start text-xs font-bold text-[#4A2C18] hover:underline"
                        >
                          Lihat Produk →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* B. KATALOG PRODUK */}
        {storePage === 'products' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6D8C8] shadow-2xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-[#2C1A0E]">
                    Katalog Homemade Roti Emak
                  </h1>
                  <p className="text-sm text-[#6F4E37] mt-1">
                    Pilih aneka roti segar yang dipanggang setiap pagi dari dapur Desa Penebal.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#6F4E37] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama roti..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#4A2C18] text-white shadow-xs'
                        : 'bg-[#FAF6F0] text-[#6F4E37] hover:bg-[#EFE5D8] border border-[#E6D8C8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E6D8C8] p-14 text-center space-y-2">
                <Package className="w-12 h-12 mx-auto text-[#C87D32]/50 mb-2" />
                <h3 className="font-serif text-xl font-bold text-[#2C1A0E]">
                  Belum ada produk yang tampil
                </h3>
                <p className="text-sm text-[#6F4E37] max-w-md mx-auto">
                  Silakan reset filter pencarian atau tambahkan produk baru melalui Dashboard Admin.
                </p>
                {(searchQuery || selectedCategory !== 'Semua') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Semua');
                    }}
                    className="mt-3 px-5 py-2.5 rounded-xl bg-[#4A2C18] text-white text-xs font-bold"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= 8;
                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#E6D8C8] overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col group"
                    >
                      <div className="relative h-52 overflow-hidden bg-[#FAF6F0]">
                        <SafeImage
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[11px] font-bold text-[#4A2C18]">
                          {prod.category}
                        </span>
                        <span
                          className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs ${
                            isOutOfStock
                              ? 'bg-rose-600 text-white'
                              : isLowStock
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isOutOfStock
                            ? 'Stok Habis'
                            : isLowStock
                            ? `Sisa ${prod.stock} pcs`
                            : `Tersedia (${prod.stock})`}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-serif text-lg font-bold text-[#2C1A0E]">{prod.name}</h3>
                        <p className="text-lg font-bold text-[#C87D32] mt-1">
                          {formatRupiah(prod.price)}
                        </p>
                        <p className="text-xs text-[#6F4E37] mt-2 leading-relaxed line-clamp-2 flex-1">
                          {prod.shortDesc}
                        </p>

                        <div className="grid grid-cols-2 gap-2.5 mt-5 pt-3 border-t border-[#FAF6F0]">
                          <button
                            onClick={() => {
                              setDetailProduct(prod);
                              setDetailQty(1);
                            }}
                            className="py-2.5 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] border border-[#E6D8C8] text-[#4A2C18] text-xs font-bold"
                          >
                            Detail Produk
                          </button>
                          <button
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(prod, 1)}
                            className="py-2.5 px-3 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] disabled:bg-stone-300 text-white text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? 'Habis' : 'Keranjang'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* C. PROMOSI */}
        {storePage === 'promos' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C87D32]">
                Penawaran Spesial
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C1A0E] mt-2">
                Promosi &amp; Paket Hemat Roti Emak
              </h1>
              <p className="text-sm text-[#6F4E37] mt-2">
                Nikmati paket hemat harian untuk keluarga, arisan, acara, maupun titip jual warung.
              </p>
            </div>

            {activePromos.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E6D8C8] p-12 text-center">
                <Tag className="w-12 h-12 mx-auto text-[#C87D32]/50 mb-3" />
                <p className="font-bold text-[#2C1A0E]">Belum ada promo aktif saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activePromos.map((prm) => (
                  <div
                    key={prm.id}
                    className="bg-white rounded-3xl border border-[#E6D8C8] overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="h-60 relative">
                      <SafeImage
                        src={prm.image}
                        alt={prm.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#4A2C18] text-white text-xs font-bold shadow">
                        {prm.period}
                      </span>
                    </div>
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      <h2 className="font-serif text-2xl font-bold text-[#2C1A0E]">{prm.title}</h2>
                      <p className="text-sm text-[#6F4E37] mt-3 leading-relaxed flex-1">
                        {prm.description}
                      </p>
                      <button
                        onClick={() => setStorePage('products')}
                        className="mt-6 w-full py-3.5 rounded-2xl bg-[#C87D32] hover:bg-[#b56d25] text-white font-bold text-sm"
                      >
                        Belanja Produk Sekarang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* D. KERANJANG */}
        {storePage === 'cart' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="font-serif text-3xl font-bold text-[#2C1A0E] mb-6">
              Keranjang Belanja Anda
            </h1>

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E6D8C8] p-14 text-center space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-[#C87D32]/50" />
                <h2 className="font-serif text-2xl font-bold text-[#2C1A0E]">
                  Keranjang Belanja Masih Kosong
                </h2>
                <p className="text-sm text-[#6F4E37] max-w-md mx-auto">
                  Yuk pilih roti favorit Anda yang baru keluar dari panggangan Roti Emak!
                </p>
                <button
                  onClick={() => setStorePage('products')}
                  className="px-6 py-3.5 rounded-2xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-sm font-bold"
                >
                  Jelajahi Katalog Produk
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6D8C8] flex items-center gap-4"
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover border border-[#E6D8C8] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C1A0E] truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm font-bold text-[#C87D32]">
                          {formatRupiah(item.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center rounded-xl bg-[#FAF6F0] border border-[#E6D8C8]">
                            <button
                              onClick={() => handleUpdateCartQty(item.productId, -1)}
                              className="p-2 text-[#4A2C18] hover:bg-[#EFE5D8] rounded-l-xl"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 text-sm font-bold">{item.qty}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.productId, 1)}
                              className="p-2 text-[#4A2C18] hover:bg-[#EFE5D8] rounded-r-xl"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm sm:text-base text-[#2C1A0E]">
                              {formatRupiah(item.price * item.qty)}
                            </span>
                            <button
                              onClick={() => handleRemoveFromCart(item.productId)}
                              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#E6D8C8] h-fit space-y-4 shadow-2xs">
                  <h3 className="font-serif text-xl font-bold text-[#2C1A0E]">Ringkasan Belanja</h3>
                  <div className="space-y-2.5 text-sm border-y border-[#FAF6F0] py-4">
                    <div className="flex justify-between text-[#6F4E37]">
                      <span>Total Item</span>
                      <span className="font-semibold text-[#2C1A0E]">{cartItemCount} pcs</span>
                    </div>
                    <div className="flex justify-between text-[#6F4E37]">
                      <span>Subtotal Produk</span>
                      <span className="font-bold text-[#2C1A0E]">{formatRupiah(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6F4E37]">
                      <span>Ongkos Kirim</span>
                      <span>Dihitung saat checkout</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-[#4A2C18]">
                    <span>Estimasi Total</span>
                    <span>{formatRupiah(cartSubtotal)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCheckoutSuccessOrder(null);
                      setStorePage('checkout');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Lanjut ke Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* E. CHECKOUT */}
        {storePage === 'checkout' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {checkoutSuccessOrder ? (
              <div className="bg-white rounded-3xl border border-[#E6D8C8] p-8 sm:p-12 max-w-2xl mx-auto text-center shadow-lg space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-11 h-11" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                    Pesanan Diterima
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-[#2C1A0E] mt-1">
                    Terima Kasih, {checkoutSuccessOrder.customerName}!
                  </h1>
                  <p className="text-sm text-[#6F4E37] mt-2">
                    Pesanan roti Anda telah masuk ke dapur Homemade Roti Emak Desa Penebal.
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#E6D8C8] text-left space-y-3 text-sm">
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-[#E6D8C8]">
                    <span className="text-[#6F4E37]">Kode Pesanan Unik:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-[#4A2C18] bg-white px-3 py-1 rounded-lg border border-[#E6D8C8]">
                        {checkoutSuccessOrder.id}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await copyTextSafely(checkoutSuccessOrder.id);
                          showToast(
                            ok
                              ? `Kode pesanan ${checkoutSuccessOrder.id} berhasil disalin!`
                              : `Catat kode pesanan: ${checkoutSuccessOrder.id}`,
                            ok ? 'success' : 'info'
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-xs font-bold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6F4E37] bg-white px-3 py-2 rounded-xl border border-[#E6D8C8]">
                    🔒 Pesanan ini otomatis tersimpan di <strong>Pesanan Saya</strong> pada HP/perangkat ini. Simpan juga kode di atas bila ingin melacak dari HP lain.
                  </p>
                  <div className="flex justify-between">
                    <span className="text-[#6F4E37]">Tanggal Pengiriman:</span>
                    <span className="font-bold">{checkoutSuccessOrder.deliveryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F4E37]">Wilayah Tujuan:</span>
                    <span className="font-semibold">{checkoutSuccessOrder.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F4E37]">Metode Pembayaran:</span>
                    <span className="font-bold text-[#4A2C18]">
                      {checkoutSuccessOrder.paymentMethodLabel} — {checkoutSuccessOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F4E37]">Total Pembayaran:</span>
                    <span className="font-bold text-lg text-[#C87D32]">
                      {formatRupiah(checkoutSuccessOrder.total)}
                    </span>
                  </div>
                  {checkoutSuccessOrder.paymentProof && (
                    <div className="pt-2 border-t border-[#E6D8C8] flex items-center justify-between">
                      <span className="text-[#6F4E37]">Bukti Transfer / QRIS:</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terlampir
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      setCheckoutSuccessOrder(null);
                      setStorePage('orders');
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-[#4A2C18] text-white font-bold text-sm"
                  >
                    Lihat di Pesanan Saya
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutSuccessOrder(null);
                      setStorePage('products');
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-[#FAF6F0] text-[#4A2C18] border border-[#E6D8C8] font-bold text-sm"
                  >
                    Pesan Lagi
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setStorePage('cart')}
                  className="text-xs font-bold text-[#6F4E37] hover:text-[#4A2C18] mb-4 inline-block"
                >
                  ← Kembali ke Keranjang
                </button>
                <h1 className="font-serif text-3xl font-bold text-[#2C1A0E] mb-6">
                  Formulir Pengiriman &amp; Checkout
                </h1>

                <form
                  onSubmit={handleCheckoutSubmit}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6D8C8] space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                          Nama Lengkap Pelanggan *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.customerName}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, customerName: e.target.value })
                          }
                          placeholder="Contoh: Siti Aminah"
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                          Nomor Telepon / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={checkoutForm.phone}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                          }
                          placeholder="Contoh: 081234567890"
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                        Alamat Lengkap Pengiriman *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={checkoutForm.address}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, address: e.target.value })
                        }
                        placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, atau patokan alamat..."
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                          Wilayah Pengiriman (Ongkir Otomatis) *
                        </label>
                        <select
                          required
                          value={checkoutForm.shippingId}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, shippingId: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        >
                          {activeShippingAreas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.area} — {area.fee === 0 ? 'Gratis (Rp 0)' : formatRupiah(area.fee)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                          Tanggal Pengiriman *
                        </label>
                        <input
                          type="date"
                          required
                          min={getTodayString()}
                          value={checkoutForm.deliveryDate}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, deliveryDate: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                        Metode Pembayaran *
                      </label>

                      {isBulkOrEventOrder && (
                        <div className="mb-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-900">
                              Pesanan Jumlah Besar / Acara ({cartItemCount} pcs •{' '}
                              {formatRupiah(checkoutTotalAmount)})
                            </p>
                            <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                              Untuk pesanan acara atau total ≥ Rp 500.000 / ≥ 30 pcs, metode{' '}
                              <strong>COD tidak tersedia</strong>. Silakan pilih{' '}
                              <strong>DP 50% via QRIS</strong> atau{' '}
                              <strong>Lunas via QRIS</strong> terlebih dahulu.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutForm({ ...checkoutForm, paymentMethod: 'QRIS' })
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            checkoutForm.paymentMethod === 'QRIS'
                              ? 'bg-[#4A2C18] text-white border-[#4A2C18] shadow-xs'
                              : 'bg-[#FAF6F0] text-[#2C1A0E] border-[#E6D8C8] hover:bg-[#EFE5D8]'
                          }`}
                        >
                          <p className="text-xs font-bold">QRIS (Lunas 100%)</p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              checkoutForm.paymentMethod === 'QRIS'
                                ? 'text-[#F3EAE0]/80'
                                : 'text-[#6F4E37]'
                            }`}
                          >
                            DANA, OVO, GoPay, Bank
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setCheckoutForm({ ...checkoutForm, paymentMethod: 'QRIS_DP' })
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            checkoutForm.paymentMethod === 'QRIS_DP'
                              ? 'bg-[#4A2C18] text-white border-[#4A2C18] shadow-xs'
                              : 'bg-[#FAF6F0] text-[#2C1A0E] border-[#E6D8C8] hover:bg-[#EFE5D8]'
                          }`}
                        >
                          <p className="text-xs font-bold">DP 50% (via QRIS)</p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              checkoutForm.paymentMethod === 'QRIS_DP'
                                ? 'text-[#F3EAE0]/80'
                                : 'text-[#6F4E37]'
                            }`}
                          >
                            Cocok untuk pesanan acara
                          </p>
                        </button>

                        <button
                          type="button"
                          disabled={isBulkOrEventOrder}
                          onClick={() =>
                            setCheckoutForm({ ...checkoutForm, paymentMethod: 'COD' })
                          }
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isBulkOrEventOrder
                              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-70'
                              : checkoutForm.paymentMethod === 'COD'
                              ? 'bg-[#4A2C18] text-white border-[#4A2C18] shadow-xs'
                              : 'bg-[#FAF6F0] text-[#2C1A0E] border-[#E6D8C8] hover:bg-[#EFE5D8]'
                          }`}
                        >
                          <p className="text-xs font-bold flex items-center gap-1">
                            {isBulkOrEventOrder && <Lock className="w-3 h-3" />}
                            <span>COD (Bayar di Tempat)</span>
                          </p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              isBulkOrEventOrder
                                ? 'text-stone-400'
                                : checkoutForm.paymentMethod === 'COD'
                                ? 'text-[#F3EAE0]/80'
                                : 'text-[#6F4E37]'
                            }`}
                          >
                            {isBulkOrEventOrder ? 'Khusus pesanan < Rp 500rb' : 'Tunai saat roti tiba'}
                          </p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#6F4E37] mb-1.5">
                        Catatan Pesanan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.notes}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                        }
                        placeholder="Contoh: Kirim pagi jam 08.00..."
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-[#E6D8C8] h-fit space-y-4">
                    <h3 className="font-serif text-xl font-bold text-[#2C1A0E]">
                      Ringkasan Pesanan
                    </h3>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-sm">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex justify-between gap-2">
                          <span className="text-[#6F4E37]">
                            {item.qty}x {item.name}
                          </span>
                          <span className="font-semibold shrink-0">
                            {formatRupiah(item.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#E6D8C8] pt-3 space-y-2 text-sm">
                      <div className="flex justify-between text-[#6F4E37]">
                        <span>Subtotal</span>
                        <span className="font-semibold text-[#2C1A0E]">
                          {formatRupiah(cartSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#6F4E37]">
                        <span>Ongkos Kirim</span>
                        <span className="font-semibold text-[#2C1A0E]">
                          {formatRupiah(selectedShippingObj ? selectedShippingObj.fee : 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-[#4A2C18] pt-2 border-t border-[#FAF6F0]">
                        <span>Total Pesanan</span>
                        <span>{formatRupiah(checkoutTotalAmount)}</span>
                      </div>

                      {checkoutForm.paymentMethod === 'QRIS_DP' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1 text-xs">
                          <div className="flex justify-between font-bold text-amber-900">
                            <span>Bayar Sekarang (DP 50%):</span>
                            <span>{formatRupiah(checkoutDpAmount)}</span>
                          </div>
                          <div className="flex justify-between text-amber-800">
                            <span>Sisa Pelunasan (saat tiba):</span>
                            <span>{formatRupiah(checkoutRemainingBalance)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white font-bold text-sm shadow-lg"
                    >
                      {checkoutForm.paymentMethod === 'QRIS_DP'
                        ? `Bayar DP 50% via QRIS (${formatRupiah(checkoutDpAmount)})`
                        : checkoutForm.paymentMethod === 'QRIS'
                        ? `Lanjut Bayar Lunas via QRIS (${formatRupiah(checkoutTotalAmount)})`
                        : 'Konfirmasi Pesanan (COD)'}
                    </button>
                  </div>
                </form>

                {/* Modal QRIS */}
                <Modal
                  isOpen={qrisModalOpen}
                  onClose={() => {
                    setQrisModalOpen(false);
                    setPendingOrderDraft(null);
                    setPaymentProofDraft('');
                  }}
                  title={
                    pendingOrderDraft?.paymentMethod === 'QRIS_DP'
                      ? 'Pembayaran DP 50% via QRIS — ROTI EMAK'
                      : 'Pembayaran QRIS — ROTI EMAK'
                  }
                  maxWidth="max-w-md"
                >
                  {pendingOrderDraft && (
                    <div className="space-y-4 text-center">
                      <div className="bg-[#FAF6F0] border border-[#E6D8C8] rounded-2xl p-4 space-y-3">
                        <RotiEmakQrisPoster customImage={customQrisImage} />

                        <div className="pt-1">
                          {pendingOrderDraft.paymentMethod === 'QRIS_DP' && (
                            <span className="inline-block mb-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                              Pembayaran DP 50% • Total Pesanan{' '}
                              {formatRupiah(pendingOrderDraft.total)}
                            </span>
                          )}
                          <p className="text-xs text-[#6F4E37]">
                            Scan QRIS di atas lalu masukkan nominal persis:
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <p className="text-2xl font-bold text-[#C87D32]">
                              {formatRupiah(
                                pendingOrderDraft.amountDueNow ?? pendingOrderDraft.total
                              )}
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                const nominalToCopy =
                                  pendingOrderDraft.amountDueNow ?? pendingOrderDraft.total;
                                const success = await copyTextSafely(nominalToCopy);
                                if (success) {
                                  showToast(`Nominal ${formatRupiah(nominalToCopy)} berhasil disalin!`);
                                } else {
                                  showToast(
                                    `Salin manual nominal: ${nominalToCopy}`,
                                    'info'
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EFE5D8] border border-[#E6D8C8] text-[11px] font-bold text-[#4A2C18]"
                            >
                              Salin Nominal
                            </button>
                          </div>
                          {pendingOrderDraft.remainingBalance > 0 && (
                            <p className="text-xs font-semibold text-[#4A2C18] mt-1">
                              Sisa pelunasan saat pesanan tiba:{' '}
                              <span className="text-amber-700">
                                {formatRupiah(pendingOrderDraft.remainingBalance)}
                              </span>
                            </p>
                          )}
                          <p className="text-[11px] text-[#6F4E37] font-mono mt-1">
                            Kode Pesanan: {pendingOrderDraft.id}
                          </p>
                        </div>
                      </div>

                      {/* Upload Bukti Pembayaran QRIS */}
                      <div className="bg-white border-2 border-dashed border-[#C87D32]/60 rounded-2xl p-3.5 text-left space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2C1A0E] flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-[#C87D32]" />
                            <span>Upload Bukti Pembayaran (Screenshot) *</span>
                          </span>
                          {paymentProofDraft && (
                            <span className="text-[11px] font-bold text-emerald-700">
                              ✓ Terlampir
                            </span>
                          )}
                        </div>

                        {paymentProofDraft ? (
                          <div className="flex items-center gap-3 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#E6D8C8]">
                            <img
                              src={paymentProofDraft}
                              alt="Pratinjau Bukti Bayar"
                              className="w-16 h-16 rounded-lg object-cover border border-[#E6D8C8] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#2C1A0E]">
                                Bukti pembayaran siap dikirim
                              </p>
                              <label className="inline-block mt-1 text-[11px] font-bold text-[#C87D32] hover:underline cursor-pointer">
                                Ganti foto bukti
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const compressed = await compressImageFile(file, 850, 0.82);
                                      setPaymentProofDraft(compressed);
                                      showToast('Foto bukti pembayaran diperbarui!');
                                    } catch (err) {
                                      showToast(err.message || 'Gagal membaca gambar.', 'error');
                                    }
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center py-4 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE5D8] cursor-pointer transition-colors text-center">
                            <ImageIcon className="w-6 h-6 text-[#C87D32] mb-1" />
                            <span className="text-xs font-bold text-[#4A2C18]">
                              Pilih Screenshot Bukti Transfer / QRIS
                            </span>
                            <span className="text-[10px] text-[#6F4E37] mt-0.5">
                              Wajib dilampirkan sebelum konfirmasi pembayaran
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const compressed = await compressImageFile(file, 850, 0.82);
                                  setPaymentProofDraft(compressed);
                                  showToast('Bukti pembayaran berhasil diunggah!');
                                } catch (err) {
                                  showToast(err.message || 'Gagal membaca gambar.', 'error');
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-left text-xs text-amber-950 space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5 text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Penting: Mohon Bayar dengan Nominal Pas</span>
                        </p>
                        <ul className="list-disc pl-4 text-[11px] text-amber-900/90 space-y-0.5">
                          <li>
                            <strong>Kurang bayar:</strong> Pesanan ditahan &amp; admin menghubungi
                            Anda untuk pelunasan selisihnya.
                          </li>
                          <li>
                            <strong>Lebih bayar:</strong> Kelebihan dana dikonfirmasi admin untuk
                            dikembalikan atau jadi saldo pesanan berikutnya.
                          </li>
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQrisModalOpen(false);
                            setPendingOrderDraft(null);
                            setPaymentProofDraft('');
                          }}
                          className="flex-1 py-3 rounded-xl text-xs font-bold bg-[#FAF6F0] hover:bg-[#EFE5D8] text-[#6F4E37]"
                        >
                          Batalkan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!paymentProofDraft) {
                              showToast(
                                'Silakan unggah screenshot bukti pembayaran terlebih dahulu.',
                                'error'
                              );
                              return;
                            }
                            finalizeOrderCreation(pendingOrderDraft, true, paymentProofDraft);
                          }}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-colors ${
                            paymentProofDraft
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-stone-400 hover:bg-stone-500'
                          }`}
                        >
                          {pendingOrderDraft.paymentMethod === 'QRIS_DP'
                            ? 'Kirim Bukti & Konfirmasi DP 50%'
                            : 'Kirim Bukti & Konfirmasi Bayar'}
                        </button>
                      </div>
                    </div>
                  )}
                </Modal>
              </>
            )}
          </div>
        )}

        {/* F. PESANAN SAYA (PRIVASI TERJAGA PER PERANGKAT + LACAK KODE & 4 DIGIT NO. HP) */}
        {storePage === 'orders' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Riwayat Pesanan Pribadi &amp; Terlindungi</span>
                </div>
                <h1 className="font-serif text-3xl font-bold text-[#2C1A0E]">Pesanan Saya</h1>
                <p className="text-sm text-[#6F4E37] mt-1">
                  Hanya menampilkan pesanan yang dibuat dari HP/perangkat ini atau pesanan yang Anda
                  lacak menggunakan Kode Pesanan &amp; 4 digit terakhir No. HP.
                </p>
              </div>
            </div>

            {/* Form Lacak Pesanan dari HP Lain / Pesanan WhatsApp */}
            <form
              onSubmit={handleTrackOrderSubmit}
              className="bg-white rounded-2xl border border-[#E6D8C8] p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A2C18]">
                <Search className="w-4 h-4 text-[#C87D32]" />
                <span>Pesan dari HP lain? Lacak dengan Kode Pesanan &amp; 4 Digit Terakhir No. HP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={trackForm.code}
                    onChange={(e) => setTrackForm({ ...trackForm, code: e.target.value })}
                    placeholder="Kode Pesanan (cth: RE-20261125-482)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm font-mono uppercase"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={trackForm.phoneLast4}
                    onChange={(e) =>
                      setTrackForm({
                        ...trackForm,
                        phoneLast4: e.target.value.replace(/\D/g, '').slice(0, 4),
                      })
                    }
                    placeholder="4 digit terakhir No. HP (cth: 7890)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6D8C8] text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full h-full py-2.5 px-4 rounded-xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-xs font-bold transition-colors"
                  >
                    Tampilkan Pesanan
                  </button>
                </div>
              </div>

              {trackError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{trackError}</span>
                </p>
              )}
            </form>

            {myPrivateCustomerOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E6D8C8] p-12 text-center space-y-3">
                <Receipt className="w-12 h-12 mx-auto text-[#C87D32]/50" />
                <h2 className="font-serif text-xl font-bold text-[#2C1A0E]">
                  Belum Ada Riwayat Pesanan di Perangkat Ini
                </h2>
                <p className="text-xs sm:text-sm text-[#6F4E37] max-w-md mx-auto leading-relaxed">
                  Demi menjaga privasi pelanggan, riwayat transaksi pelanggan lain tidak ditampilkan
                  secara publik. Pesanan baru Anda akan otomatis muncul di sini, atau masukkan{' '}
                  <strong>Kode Pesanan + 4 digit terakhir No. HP</strong> di kolom atas.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setStorePage('products')}
                    className="px-6 py-3 rounded-2xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white text-xs font-bold"
                  >
                    Mulai Pesan Roti Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {myPrivateCustomerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-[#E6D8C8] p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#FAF6F0]">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-base text-[#4A2C18]">
                            {ord.id}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getOrderStatusStyle(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6F4E37] mt-1">
                          Pemesan: <strong>{ord.customerName}</strong> • Dipesan: {ord.orderDate} •
                          Jadwal Kirim: <strong>{ord.deliveryDate}</strong> • Bayar:{' '}
                          <strong>
                            {ord.paymentMethodLabel || ord.paymentMethod || 'COD'} (
                            {ord.paymentStatus || 'Bayar di Tempat (COD)'})
                          </strong>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-[#6F4E37]">Total Pembayaran</p>
                        <p className="text-lg font-bold text-[#C87D32]">
                          {formatRupiah(ord.total)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="font-bold text-[#2C1A0E] mb-1.5">Daftar Roti Dipesan:</p>
                        <ul className="space-y-1 text-[#6F4E37]">
                          {ord.items.map((it, idx) => (
                            <li key={idx}>
                              • {it.qty}x {it.name} ({formatRupiah(it.price * it.qty)})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E6D8C8]">
                        <p className="font-bold text-[#2C1A0E] text-xs">Tujuan Pengiriman:</p>
                        <p className="text-xs text-[#6F4E37] mt-1">
                          {ord.address} ({ord.area})
                        </p>
                        {ord.notes && ord.notes !== '-' && (
                          <p className="text-xs text-[#4A2C18] italic mt-1.5">
                            Catatan: "{ord.notes}"
                          </p>
                        )}
                        {ord.paymentMethod !== 'COD' && (
                          <div className="mt-2.5 pt-2 border-t border-[#E6D8C8] flex items-center justify-between gap-2">
                            {ord.paymentProof ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Bukti bayar terlampir
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-amber-700">
                                Belum ada bukti bayar
                              </span>
                            )}
                            <label className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EFE5D8] border border-[#E6D8C8] text-[11px] font-bold text-[#4A2C18] cursor-pointer">
                              {ord.paymentProof ? 'Ganti Bukti' : 'Upload Bukti Bayar'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleUploadExistingOrderProof(ord.id, e.target.files?.[0]);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DETAIL PRODUK */}
      <Modal
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        title="Detail Produk Roti Emak"
        maxWidth="max-w-2xl"
      >
        {detailProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border border-[#E6D8C8] h-64 md:h-auto">
              <SafeImage
                src={detailProduct.image}
                alt={detailProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#E6D8C8] text-xs font-bold text-[#C87D32]">
                  {detailProduct.category}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#2C1A0E] mt-2">
                  {detailProduct.name}
                </h2>
                <p className="text-2xl font-bold text-[#4A2C18] mt-1">
                  {formatRupiah(detailProduct.price)}
                </p>

                <div className="mt-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      detailProduct.stock > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {detailProduct.stock > 0
                      ? `Stok Tersedia: ${detailProduct.stock} pcs`
                      : 'Stok Sedang Habis'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#6F4E37] mt-4 leading-relaxed">
                  {detailProduct.fullDesc}
                </p>
              </div>

              {detailProduct.stock > 0 && (
                <div className="pt-4 border-t border-[#E6D8C8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6F4E37]">Jumlah Pesan:</span>
                    <div className="inline-flex items-center rounded-xl bg-[#FAF6F0] border border-[#E6D8C8]">
                      <button
                        type="button"
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                        className="p-2 text-[#4A2C18] hover:bg-[#EFE5D8] rounded-l-xl"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-sm">{detailQty}</span>
                      <button
                        type="button"
                        onClick={() => setDetailQty(Math.min(detailProduct.stock, detailQty + 1))}
                        className="p-2 text-[#4A2C18] hover:bg-[#EFE5D8] rounded-r-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(detailProduct, detailQty);
                      setDetailProduct(null);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#4A2C18] hover:bg-[#6F4E37] text-white font-bold text-sm shadow-md"
                  >
                    + Tambah ke Keranjang ({formatRupiah(detailProduct.price * detailQty)})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* FOOTER */}
      <footer className="bg-[#2C1A0E] text-[#F3EAE0] border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C87D32] flex items-center justify-center text-white">
                <ChefHat className="w-6 h-6" />
              </div>
              <span className="font-serif text-xl font-bold text-white">ROTI EMAK</span>
            </div>
            <p className="text-xs sm:text-sm text-[#F3EAE0]/80 leading-relaxed">
              "Kelezatan Roti, Dibuat dengan Sepenuh Hati." UMKM produksi roti rumahan Desa Penebal
              yang mengutamakan kelembutan rasa, tanpa bahan pengawet, dan selalu hangat setiap hari.
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-serif text-base font-bold text-white mb-3">
              Dapur &amp; Jam Operasional
            </h4>
            <p className="text-[#F3EAE0]/80 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C87D32] shrink-0 mt-0.5" />
              <span>Jl. Utama, Desa Penebal, Kec. Bengkalis, Kab. Bengkalis, Riau 28711</span>
            </p>
            <p className="text-[#F3EAE0]/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C87D32] shrink-0" />
              <span>Buka Setiap Hari: 08.00 – 12.00 WIB (Pemesanan Online 24 Jam)</span>
            </p>
            <p className="text-[#F3EAE0]/80 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C87D32] shrink-0" />
              <span>WhatsApp: 0819-3356-4802 / 0813-6229-0710</span>
            </p>
            <p className="text-[#F3EAE0]/80 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#C87D32] shrink-0" />
              <span>TikTok: @homemade.roti.ema</span>
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-serif text-base font-bold text-white mb-3">Navigasi Cepat</h4>
            <div className="flex flex-col items-start space-y-2">
              <button
                onClick={() => setStorePage('home')}
                className="text-[#F3EAE0]/80 hover:text-[#C87D32]"
              >
                Beranda
              </button>
              <button
                onClick={() => setStorePage('products')}
                className="text-[#F3EAE0]/80 hover:text-[#C87D32]"
              >
                Katalog Produk
              </button>
              <button
                onClick={() => setStorePage('promos')}
                className="text-[#F3EAE0]/80 hover:text-[#C87D32]"
              >
                Promosi &amp; Paket
              </button>
              <button
                onClick={() => setStorePage('orders')}
                className="text-[#F3EAE0]/80 hover:text-[#C87D32]"
              >
                Lacak Pesanan Saya
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-[#F3EAE0]/60">
          © 2026 Homemade ROTI EMAK Desa Penebal • Homemade dengan cinta.
        </div>
      </footer>
    </div>
  );
}
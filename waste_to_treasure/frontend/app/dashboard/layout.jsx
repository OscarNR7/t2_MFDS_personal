'use client';

import { useState } from 'react';
// import { usePathname } from 'next/navigation'; // Mockeado para preview
// import { useAuth } from '@/context/AuthContext'; // Mockeado para preview
import {
  LayoutDashboard,
  User,
  Package,
  ShoppingCart,
  DollarSign,
  CreditCard,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react'; // Asumo que tienes lucide-react instalado

// --- Componente de Item de la Barra Lateral ---
function SidebarItem({ href, icon: Icon, label, isActive, isLogout }) {
  const activeClasses = 'bg-[#396530] text-white';
  const inactiveClasses =
    'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700';
  const logoutClasses =
    'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20';

  // Usamos <a> en lugar de <Link> de Next.js para el preview
  return (
    <a
      href={href}
      className={`
        flex items-center w-full px-4 py-3 rounded-lg transition-colors
        font-inter font-semibold text-base
        ${
          isLogout
            ? logoutClasses
            : isActive
              ? activeClasses
              : inactiveClasses
        }
      `}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </a>
  );
}

// --- Componente de Barra Lateral ---
function DashboardSidebar() {
  // Mockeamos pathname para el preview
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Mockeamos useAuth para el preview
  const logout = () => {
    console.log('Simulando logout...');
    // No uses alert() en producción real
    // alert('Cerrando sesión...');
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Mi Panel',
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: 'Gestión de perfil',
    },
    {
      href: '/dashboard/listings', // Ruta para VER publicaciones
      icon: Package,
      label: 'Mis Publicaciones',
    },
    {
      href: '/dashboard/purchases',
      icon: ShoppingCart,
      label: 'Mis Compras',
    },
    {
      href: '/dashboard/sales',
      icon: DollarSign,
      label: 'Mis Ventas',
    },
    {
      href: '/dashboard/subscription',
      icon: CreditCard,
      label: 'Gestión de Suscripciones',
    },
  ];

  return (
    <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            // Marcamos como activo si la ruta EMPIEZA con el href
            // así /dashboard/publish también marca "Mis Publicaciones"
            isActive={pathname.startsWith(item.href) || (item.href === '/dashboard/listings' && pathname === '/dashboard/publish')}
          />
        ))}
        {/* Botón de Cerrar Sesión */}
        <button
          onClick={logout}
          className={`
            flex items-center w-full px-4 py-3 rounded-lg transition-colors
            font-inter font-semibold text-base text-left
            text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20
          `}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
}

// --- Layout Principal del Dashboard ---
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mockeamos useAuth para el preview
  const user = {
    name: 'Usuario (Mock)',
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900">
      {/* 1. Cabecera Verde del Panel */}
      <header className="bg-[#396530] shadow-md -mt-px">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28">
            <h1 className="text-white text-4xl md:text-5xl font-poppins font-bold">
              Mi Panel
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-white hover:bg-white/20"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Contenido Principal (Sidebar + Children) */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- Sidebar para Desktop --- */}
          <div className="hidden lg:block">
            <DashboardSidebar />
          </div>

          {/* --- Contenido de la Página --- */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>

      {/* --- Sidebar para Móvil (Modal) --- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed left-0 top-0 z-50 w-80 h-full bg-white dark:bg-gray-800 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <DashboardSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
// src/admin/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (href) => {
    if (!href) return false;
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Always visible on desktop */}
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Navbar with mobile sidebar toggle */}
        <Navbar 
          setSidebarOpen={setMobileSidebarOpen} 
          mobileSidebarOpen={mobileSidebarOpen}
        />
        
        <main className="h-full overflow-y-auto">
          <div className="container px-6 mx-auto grid">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 flex items-center bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        ></div>
      )}
      
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-72 max-w-[85vw] bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden
        shadow-2xl will-change-transform
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-shrink-0 items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 mr-2 bg-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Yeshigabcha
            </span>
          </div>
          
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {[
              { id: 'dashboard', name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'users', name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'bookings', name: 'Bookings', href: '/admin/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'events', name: 'Events', href: '/admin/events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'payments', name: 'Payments', href: '/admin/payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'pricing-payments', name: 'Pricing', href: '/admin/pricing-payments', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v-2' },
              { id: 'services', name: 'Services', href: '/admin/services', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'gallery', name: 'Gallery', href: '/admin/gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'reports', name: 'Reports', href: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
              ,{ id: 'profile', name: 'Profile', href: '/admin/profile', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c3.915 0 7.248-.506 10.602-1.514A11.091 11.091 0 0117 9.236c0-3.178-2.674-5.801-6-6.607z' }
              ,{ id: 'settings', name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
            ].map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActivePath(item.href)
                      ? 'text-purple-700 bg-purple-100 dark:bg-purple-600 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                  </svg>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
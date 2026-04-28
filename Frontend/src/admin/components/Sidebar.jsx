// src/admin/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAdminDashboardMetrics } from '../../api/reports.js';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [quickStats, setQuickStats] = useState({
    users: 0,
    bookings: 0,
    services: 0,
  });

  // Navigation structure
  const navigation = [
    {
      id: 'dashboard',
      name: t('dashboard'),
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      )
    },
    {
      id: 'users',
      name: t('users'),
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      )
    },
    {
      id: 'bookings',
      name: t('bookings'),
      href: '/admin/bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'events',
      name: t('events') || 'Events',
      href: '/admin/events',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'payments',
      name: t('payments') || 'Payments',
      href: '/admin/payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      id: 'pricing-payments',
      name: t('pricing') || 'Pricing',
      href: '/admin/pricing-payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v-2"></path>
        </svg>
      )
    },
    {
      id: 'services',
      name: t('services'),
      href: '/admin/services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      id: 'gallery',
      name: t('gallery'),
      href: '/admin/gallery',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'reports',
      name: t('reports'),
      href: '/admin/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    }
  ];

  // Determine active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    
    // Check for exact matches
    const exactMatch = navigation.find(item => item.href === path);
    if (exactMatch) {
      setActiveMenu(exactMatch.id);
      return;
    }
    
    // Set dashboard as default active
    if (path === '/admin') {
      setActiveMenu('dashboard');
    }
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    const loadQuickStats = async () => {
      try {
        const metrics = await getAdminDashboardMetrics();
        const totals = metrics?.totals || {};
        if (!active) return;
        setQuickStats({
          users: Number(totals.users || 0),
          bookings: Number(totals.bookings || 0),
          services: Number(totals.services || 0),
        });
      } catch {
        if (!active) return;
        setQuickStats({ users: 0, bookings: 0, services: 0 });
      }
    };

    if (!isCollapsed) {
      loadQuickStats();
    }

    return () => {
      active = false;
    };
  }, [isCollapsed]);

  return (
    <div className={`
      hidden lg:flex lg:flex-shrink-0
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      <div className="flex flex-col w-full bg-white border-r dark:bg-gray-800 dark:border-gray-700">
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between flex-shrink-0 p-4 border-b dark:border-gray-700">
          <div className="flex items-center">
            {!isCollapsed && (
              <span className="text-xl font-semibold text-violet-800 dark:text-violet-400">
                EventManagment
              </span>
            )}
          </div>
          
          {/* Collapse button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg
                    ${activeMenu === item.id 
                      ? 'text-purple-700 bg-purple-100 dark:bg-purple-600 dark:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick Stats Section - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="mt-8 pt-4 border-t dark:border-gray-700">
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                {t('quick_stats')}
              </h3>
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm bg-gray-100 rounded-lg dark:bg-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('total_users')}</span>
                    <span className="font-medium text-green-600">{quickStats.users.toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-4 py-2 text-sm bg-gray-100 rounded-lg dark:bg-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('total_bookings')}</span>
                    <span className="font-medium text-yellow-600">{quickStats.bookings.toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-4 py-2 text-sm bg-gray-100 rounded-lg dark:bg-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">{t('total_services')}</span>
                    <span className="font-medium text-blue-600">{quickStats.services.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer - Only show when not collapsed */}
        
      </div>
    </div>
  );
};
export default Sidebar;
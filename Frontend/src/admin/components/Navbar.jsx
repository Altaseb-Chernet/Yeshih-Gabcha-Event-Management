// src/admin/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
 import ThemeToggle from '../../components/ThemeToggle';
import { getAdminNotifications, getAdminUnreadCount, markAllAdminNotificationsAsRead } from '../../api/adminNotifications';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ setSidebarOpen, mobileSidebarOpen, onLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const mapNotification = (n) => {
    const typeMap = {
      booking_created: 'booking',
      payment_completed: 'payment',
      booking_confirmed: 'booking',
      booking_cancelled: 'booking',
      promotional: 'support',
      system: 'user',
    };

    return {
      id: n.id,
      title: n.title,
      description: n.message,
      time: formatTimeAgo(n.createdAt),
      read: Boolean(n.read),
      type: typeMap[n.type] || 'support',
    };
  };

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const data = await getAdminNotifications({ limit: 10 });
      const rows = data?.notifications || [];
      setNotifications(rows.map(mapNotification));
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await getAdminUnreadCount();
      setUnreadCount(data?.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  // Load notifications and unread count on mount and when dropdown opens
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Poll unread count every 30 seconds to keep badge in sync
  useEffect(() => {
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setMessagesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen);
    setNotificationsOpen(false);
    setMessagesOpen(false);
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileOpen(false);
    setMessagesOpen(false);
  };

  useEffect(() => {
    if (notificationsOpen) {
      loadNotifications();
      // Auto-mark all as read when dropdown opens
      if (unreadCount > 0) {
        handleMarkAllAsRead();
      }
    }
  }, [notificationsOpen]);

  const handleMessagesClick = () => {
    setMessagesOpen(!messagesOpen);
    setProfileOpen(false);
    setNotificationsOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setProfileOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout prop is not provided
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/admin/login');
    }
    setProfileOpen(false);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));

    api.patch(`/notifications/${id}/read`).catch(() => {
      setNotifications(notifications);
    });
  };

  const markAllNotificationsAsRead = () => {
    const previous = notifications;
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));

    api.patch('/notifications/read-all')
      .then(() => setNotificationsOpen(false))
      .catch(() => {
        setNotifications(previous);
        setNotificationsOpen(false);
      });
  };

  const markMessageAsRead = (id) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, read: true } : message
    ));
  };

  const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL
  const resolveAvatarUrl = (raw) => {
    if (!raw) return ''
    const s = String(raw)
    if (/^https?:\/\//i.test(s)) return s
    if (s.startsWith('data:')) return s
    if (/^uploads\//i.test(s)) return `/${s}`
    if (s.startsWith('/')) {
      try {
        if (typeof apiBaseUrl === 'string' && /^https?:\/\//i.test(apiBaseUrl)) {
          const url = new URL(apiBaseUrl)
          return `${url.origin}${s}`
        }
      } catch {
        // ignore
      }
      return s
    }
    return s
  }

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] || ''
    const b = parts[1]?.[0] || ''
    return (a + b).toUpperCase() || 'A'
  }

  const storageUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  const userData = authUser || storageUser
  const displayName =
    (userData?.firstName || userData?.lastName)
      ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
      : (userData?.name || userData?.email || 'Admin')

  const avatarUrl = resolveAvatarUrl(userData?.profileImage || userData?.avatar)

  // Count unread notifications and messages
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* Mobile hamburger */}
        <button
          className="p-1 -ml-1 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-purple-300"
          onClick={() => setSidebarOpen(!mobileSidebarOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>

        {/* Search bar */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="relative w-full max-w-xl mr-6 focus-within:text-purple-500">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <svg className="w-4 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              className="w-full pl-8 pr-2 text-sm text-gray-700 placeholder-gray-600 bg-gray-100 border-0 rounded-md dark:placeholder-gray-500 dark:focus:shadow-outline-gray dark:focus:placeholder-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:placeholder-gray-500 focus:bg-white focus:border-purple-300 focus:outline-none focus:shadow-outline-purple focus:ring focus:ring-purple-300 focus:ring-opacity-40"
              type="text"
              placeholder={t('search')}
              aria-label="Search"
            />
          </div>
        </div>

        <ul className="flex items-center flex-shrink-0 space-x-6">
          <li>
            <ThemeToggle />
          </li>
          {/* Notifications */}
          <li className="relative" ref={notificationsRef}>
            <button
              className="relative p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Notifications"
              onClick={handleNotificationsClick}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 w-80 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4 border-b dark:border-gray-600 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('notifications')}</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      {t('mark_all_read')}
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">{t('no_notifications')}</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className={`p-2 rounded-full mr-3 ${
                            notification.type === 'booking' ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300' :
                            notification.type === 'payment' ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' :
                            notification.type === 'user' ? 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300' :
                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-300'
                          }`}>
                            {notification.type === 'booking' && '📅'}
                            {notification.type === 'payment' && '💰'}
                            {notification.type === 'user' && '👤'}
                            {notification.type === 'support' && '❓'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notification.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{notification.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-2 border-t dark:border-gray-600">
                  <button
                    onClick={() => handleNavigation('/admin/notifications')}
                    className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t('view_all_notifications')}
                  </button>
                </div>
              </div>
            )}
          </li>
          {/* Profile menu */}
          <li className="relative" ref={profileRef}>
            <button
              className="align-middle rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              onClick={handleProfileClick}
              aria-label="Account"
              aria-haspopup="true"
            >
              {avatarUrl ? (
                <img
                  className="object-cover w-8 h-8 rounded-full"
                  src={avatarUrl}
                  alt="Admin"
                  aria-hidden="true"
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-600 text-white text-xs font-semibold">
                  {getInitials(displayName)}
                </div>
              )}
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2 border-b dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.email || ''}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => handleNavigation('/admin/profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5.121 17.804A13.937 13.937 0 0112 16c3.915 0 7.248-.506 10.602-1.514A11.091 11.091 0 0117 9.236c0-3.178-2.674-5.801-6-6.607z"
                      ></path>
                    </svg>
                    <span>{t('profile')}</span>
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/admin/settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      ></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{t('settings')}</span>
                  </button>
                </div>
                
                <div className="py-1 border-t dark:border-gray-600">
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
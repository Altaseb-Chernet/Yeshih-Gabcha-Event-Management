// src/admin/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfileImage, refreshMe } = useAuth();
  const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    refreshMe?.().catch(() => null)
  }, [refreshMe])

  // Load user data from AuthContext
  useEffect(() => {
    if (!user) return;
    const displayName =
      (user?.firstName || user?.lastName)
        ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
        : (user?.name || user?.email || '');

    setUserData({
      name: displayName,
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.profileImage || user.avatar || '',
      role: user.role || '',
      bio: user.bio || ''
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadProfileImage(file);
    if (result?.success) {
      setUserData(prev => ({
        ...prev,
        avatar: result.profileImage
      }));
      await refreshMe?.().catch(() => null)
    }
  };

  const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] || ''
    const b = parts[1]?.[0] || ''
    return (a + b).toUpperCase() || 'A'
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.name.trim()) {
      newErrors.name = t('name_required');
    }
    
    if (!userData.email.trim()) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = t('valid_email_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const nameParts = (userData.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await updateProfile({ firstName, lastName });

    if (result?.success !== false) {
      await refreshMe?.().catch(() => null)
      setIsEditing(false);
      alert(t('profile_updated'));
    }
  };

  const handleCancel = () => {
    if (user) {
      const displayName =
        (user?.firstName || user?.lastName)
          ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
          : (user?.name || 'Admin User');
      setUserData({
        name: displayName,
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.profileImage || user.avatar || '',
        role: user.role || '',
        bio: user.bio || ''
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="container px-6 mx-auto grid">
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('profile')}
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            {t('edit_profile')}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition-colors duration-150 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 active:bg-gray-100 hover:bg-gray-50 focus:outline-none focus:shadow-outline-gray"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
            >
              {t('save_changes')}
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-col md:flex-row">
          {/* Avatar Section */}
          <div className="md:w-1/3 p-4">
            <div className="text-center">
              <div className="relative inline-block">
                {resolveAvatarUrl(userData.avatar) ? (
                  <img
                    className="w-32 h-32 rounded-full mx-auto object-cover"
                    src={resolveAvatarUrl(userData.avatar)}
                    alt="Profile"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center bg-purple-600 text-white text-3xl font-semibold">
                    {getInitials(userData.name)}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleAvatarChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                {userData.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{userData.role}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="md:w-2/3 p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t('personal_information')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('name')}
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                        errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{userData.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('email')}
                </label>
                <p className="text-gray-800 dark:text-gray-200">{userData.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('phone')}
                </label>
                <p className="text-gray-800 dark:text-gray-200">{userData.phone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('role')}
                </label>
                <p className="text-gray-800 dark:text-gray-200">{userData.role}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('bio')}
              </label>
              <p className="text-gray-800 dark:text-gray-200">{userData.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
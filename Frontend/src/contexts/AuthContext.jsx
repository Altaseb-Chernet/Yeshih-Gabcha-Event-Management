
// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const freshUser = await api.get('/users/me')
    if (freshUser && freshUser.id && freshUser.email) {
      setUser(freshUser)
      sessionStorage.setItem('user', JSON.stringify(freshUser))
    }
    return freshUser
  }

  useEffect(() => {
    // Check for stored authentication data on app load
    // Clear legacy persistent auth from previous versions
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');

    const bootstrap = async () => {
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate the stored user data has required fields
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setToken(storedToken);
            setUser(parsedUser);

            // Refresh from backend so profileImage persists after refresh
            try {
              const freshUser = await api.get('/users/me');
              if (freshUser && freshUser.id && freshUser.email) {
                setUser(freshUser);
                sessionStorage.setItem('user', JSON.stringify(freshUser));
              }
            } catch (e) {
              // If token is invalid/expired, clear auth state
              if (e?.status === 401) {
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
            }
          } else {
            // Clear invalid data
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear corrupted data
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    bootstrap();
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (!response?.accessToken || !response?.user) {
        throw new Error('Invalid response received from server');
      }

      const userWithRole = {
        ...response.user,
        role: response.user.role || 'user'
      };

      setUser(userWithRole);
      setToken(response.accessToken);

      sessionStorage.setItem('authToken', response.accessToken);
      sessionStorage.setItem('user', JSON.stringify(userWithRole));

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message, status: error.status };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      // 2FA flow: backend returns { twoFactorRequired, twoFactorToken } with HTTP 202
      if (response?.twoFactorRequired && response?.twoFactorToken) {
        return {
          success: false,
          twoFactorRequired: true,
          twoFactorToken: response.twoFactorToken,
          status: 202,
        }
      }

      if (!response?.accessToken || !response?.user) {
        throw new Error('Invalid response received from server');
      }

      const userWithRole = {
        ...response.user,
        role: response.user.role || 'user'
      };

      setUser(userWithRole);
      setToken(response.accessToken);

      sessionStorage.setItem('authToken', response.accessToken);
      sessionStorage.setItem('user', JSON.stringify(userWithRole));

      return { success: true, user: userWithRole };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message, status: error.status };
    }
  };

  const verifyTwoFactorLogin = async ({ twoFactorToken, otp }) => {
    try {
      const response = await api.post('/auth/2fa/verify', { twoFactorToken, otp })

      if (!response?.accessToken || !response?.user) {
        throw new Error('Invalid response received from server')
      }

      const userWithRole = {
        ...response.user,
        role: response.user.role || 'user',
      }

      setUser(userWithRole)
      setToken(response.accessToken)
      sessionStorage.setItem('authToken', response.accessToken)
      sessionStorage.setItem('user', JSON.stringify(userWithRole))

      return { success: true, user: userWithRole }
    } catch (error) {
      console.error('Verify 2FA error:', error)
      return { success: false, error: error.message, status: error.status }
    }
  }

  const resendVerificationEmail = async () => {
    const data = await api.post('/auth/resend-verification')
    await refreshMe().catch(() => null)
    return data
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    const data = await api.post('/auth/change-password', { currentPassword, newPassword })
    return data
  }

  const enableTwoFactor = async () => {
    const data = await api.post('/auth/2fa/enable')
    await refreshMe().catch(() => null)
    return data
  }

  const disableTwoFactor = async () => {
    const data = await api.post('/auth/2fa/disable')
    await refreshMe().catch(() => null)
    return data
  }

  const logout = () => {
    console.log('Logout functionality will be implemented in the future');
    // Clear state
    setUser(null);
    setToken(null);
    
    // Remove from sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  };

  const updateProfile = async (updatedUserData) => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const data = await api.put('/users/me', updatedUserData);

      const updatedUser = { ...user, ...(data || {}), ...updatedUserData };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!(file instanceof File)) {
        throw new Error('Invalid file');
      }

      const formData = new FormData();
      formData.append('profileImage', file);

      const data = await api.put('/users/me/profile-image-upload', formData);

      const profileImage = data?.profileImage;
      if (!profileImage) {
        throw new Error('Invalid response received from server');
      }

      const updatedUser = { ...user, profileImage };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true, profileImage };
    } catch (error) {
      console.error('Upload profile image error:', error);
      return { success: false, error: error.message, status: error.status };
    }
  };

  const updateUser = updateProfile;

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const refreshToken = async () => {
    console.log('Token refresh functionality will be implemented in the future');
    return { success: false, error: 'Token refresh not implemented yet' };
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    verifyTwoFactorLogin,
    logout,
    updateProfile,
    updateUser,
    uploadProfileImage,
    resendVerificationEmail,
    changePassword,
    enableTwoFactor,
    disableTwoFactor,
    refreshMe,
    isAuthenticated,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// src/admin/pages/Users.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';


const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    ;(async () => {
      try {
        const data = await api.get('/users/admin/users?limit=200')
        const rows = data?.users || []
        const mapped = rows.map((u) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          joined: u.createdAt,
          lastLogin: u.updatedAt,
          avatar:
            u.profileImage ||
            'https://images.unsplash.com/photo-1502378735452-bc7d86632805?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=aa3a807e1bbdfd4364d1f449eaa96d82',
        }))
        setUsers(mapped)
        setFilteredUsers(mapped)
      } catch {
        setUsers([])
        setFilteredUsers([])
      }
    })()
  }, [])

  // Filter users based on search and filters
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result = result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, roleFilter, statusFilter, users, sortConfig]);

  // Sort users
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleUserStatus = async (id) => {
    const current = users.find((u) => u.id === id);
    if (!current) return;

    const nextStatus = current.status === 'active' ? 'inactive' : 'active';
    try {
      const resp = await api.put(`/users/admin/users/${id}`, { status: nextStatus });
      const updated = resp?.data || resp;
      const statusFromServer = updated?.status || nextStatus;

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: statusFromServer } : u))
      );
    } catch (e) {
      window.alert(e?.message || 'Failed to update user status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'user': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('users')}
        </h2>
        <div className="flex space-x-2"></div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid gap-6 md:grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder={t('search users')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          />
        </div>
        
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all roles')}</option>
            <option value="user">{t('user')}</option>
            <option value="admin">{t('admin')}</option>
          </select>
        </div>
        
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all statuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="suspended">{t('suspended')}</option>
          </select>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total_users')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {users.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-green-500 bg-green-100 rounded-full dark:text-green-100 dark:bg-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('active_users')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('admins') || 'Admins'}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-red-500 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('suspended_users')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {users.filter(u => u.status === 'suspended').length}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                  {t('name')} 
                  {sortConfig.key === 'name' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('email')}>
                  {t('email')}
                  {sortConfig.key === 'email' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('role')}>
                  {t('role')}
                  {sortConfig.key === 'role' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                  {t('status')}
                  {sortConfig.key === 'status' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('joined')}>
                  {t('joined')}
                  {sortConfig.key === 'joined' && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th className="px-4 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-400">
                    {t('no_users_found')}
                  </td>
                </tr>
              ) : (
                currentUsers.map(user => (
                  <tr key={user.id} className="text-gray-700 dark:text-gray-400">
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm">
                        <div className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                          <img
                            className="object-cover w-full h-full rounded-full"
                            src={user.avatar}
                            alt={user.name}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></div>
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getRoleColor(user.role)}`}>
                        {t(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusColor(user.status)}`}>
                        {t(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.joined).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 rounded-lg focus:outline-none focus:shadow-outline-gray ${
                            user.status === 'active' 
                              ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300' 
                              : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                          aria-label={user.status === 'active' ? t('deactivate') : t('activate')}
                        >
                          {user.status === 'active' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="grid px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase border-t dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800 sm:grid-cols-9">
            <span className="flex items-center col-span-3">
              {t('showing')} {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} {t('of')} {filteredUsers.length}
            </span>
            <span className="col-span-2"></span>
            <span className="flex col-span-4 mt-2 sm:mt-auto sm:justify-end">
              <nav aria-label="Table navigation">
                <ul className="inline-flex items-center">
                  <li>
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md rounded-l-lg focus:outline-none focus:shadow-outline-purple"
                      aria-label="Previous"
                    >
                      <svg className="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
                        <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page}>
                      <button
                        onClick={() => paginate(page)}
                        className={`px-3 py-1 rounded-md focus:outline-none focus:shadow-outline-purple ${
                          currentPage === page ? 'text-white bg-purple-600' : ''
                        }`}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md rounded-r-lg focus:outline-none focus:shadow-outline-purple"
                      aria-label="Next"
                    >
                      <svg className="w-4 h-4 fill-current" aria-hidden="true" viewBox="0 0 20 20">
                        <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
            </span>
          </div>
        )}
      </div>

    </>
  );
};

export default Users;
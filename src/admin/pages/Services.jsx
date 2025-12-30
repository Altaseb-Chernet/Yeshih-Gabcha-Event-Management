// src/admin/pages/Services.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceModal from '../components/ServiceModal';
import { createService, deleteService, getServices, updateService } from '../../api/services.js';

const Services = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [categories] = useState([
    'venue', 'catering', 'photography', 'decoration',
    'entertainment', 'other'
  ]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getServices({ limit: 100 });
      const list = Array.isArray(data?.services) ? data.services : [];
      setServices(list);
      setFilteredServices(list);
    } catch (e) {
      setError(e?.message || 'Failed to load services');
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Filter services based on search and filters
  useEffect(() => {
    let result = services;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(service => service.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(service => service.status === statusFilter);
    }
    
    setFilteredServices(result);
  }, [searchTerm, categoryFilter, statusFilter, services]);

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = (id) => {
    if (window.confirm(t('confirm_delete_service'))) {
      (async () => {
        try {
          await deleteService(id);
          await loadServices();
        } catch (e) {
          setError(e?.message || 'Failed to delete service');
        }
      })();
    }
  };

  const handleSaveService = (serviceData) => {
    (async () => {
      try {
        setError('');
        if (serviceData.id) {
          await updateService(serviceData.id, serviceData);
        } else {
          await createService(serviceData);
        }
        setIsModalOpen(false);
        setEditingService(null);
        await loadServices();
      } catch (e) {
        setError(e?.message || 'Failed to save service');
      }
    })();
  };

  const toggleServiceStatus = (id) => {
    const target = services.find((s) => s.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    (async () => {
      try {
        setError('');
        await updateService(id, { status: nextStatus });
        await loadServices();
      } catch (e) {
        setError(e?.message || 'Failed to update status');
      }
    })();
  };

  const toggleFeatured = (id) => {
    const target = services.find((s) => s.id === id);
    if (!target) return;
    (async () => {
      try {
        setError('');
        await updateService(id, { featured: !target.featured });
        await loadServices();
      } catch (e) {
        setError(e?.message || 'Failed to update featured flag');
      }
    })();
  };

  return (
    <>
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('services')}
        </h2>
        <button 
          onClick={handleAddService}
          className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
        >
          {t('add_service')}
        </button>
      </div>

      {/* Filters and Search */}
      {error && (
        <div className="w-full p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-200 dark:border-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <input
            type="text"
            placeholder={t('search_services')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          />
        </div>
        
        <div className="lg:col-span-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all_categories')}</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="lg:col-span-1">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all_statuses')}</option>
            <option value="active">{t('active')}</option>
            <option value='inactive'>{t('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="w-full p-6 text-center bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="w-full p-6 text-center bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">{t('no_services_found')}</p>
        </div>
      ) : (
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map(service => (
            <div key={service.id} className="flex flex-col bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
              {/* Service Image */}
              <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                {service.images && service.images.length > 0 ? (
                  <img 
                    src={service.images[0]} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                  {service.status === 'active' ? t('active') : t('inactive')}
                </div>
                
                {/* Featured Badge */}
                {service.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    {t('featured')}
                  </div>
                )}
              </div>
              
              {/* Service Details */}
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {service.category}
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {service.price}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between">
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className={`px-3 py-1 text-sm rounded-md ${service.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:text-green-100 dark:hover:bg-green-600'}`}
                >
                  {service.status === 'active' ? t('deactivate') : t('activate')}
                </button>
                
                <button
                  onClick={() => toggleFeatured(service.id)}
                  className={`px-3 py-1 text-sm rounded-md ${service.featured ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-700 dark:text-yellow-100 dark:hover:bg-yellow-600'}`}
                >
                  {service.featured ? t('unfeature') : t('feature')}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600"
                  >
                    {t('edit')}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Modal */}
      {isModalOpen && (
        <ServiceModal
          service={editingService}
          categories={categories}
          onSave={handleSaveService}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
        />
      )}
    </>
  );
};

export default Services;
// src/admin/components/ServiceModal.jsx
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ServiceModal = ({ service, categories, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
    featured: false,
    images: []
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        category: service.category || '',
        status: service.status || 'active',
        featured: service.featured || false,
        images: []
      });
      setImagePreviews(service.images || []);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        status: 'active',
        featured: false,
        images: []
      });
      setImagePreviews([]);
    }
    setErrors({});
  }, [service]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (!file.type.match('image.*')) {
        alert(t('only_images_allowed'));
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setImagePreviews(prev => [...prev, objectUrl]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, file]
      }));
    });
    
    // Reset the file input
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('description_required');
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = t('valid_price_required');
    }
    
    if (!formData.category) {
      newErrors.category = t('category_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        id: service ? service.id : null,
        price: parseFloat(formData.price)
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh]">
        <div className="relative flex flex-col w-full max-h-[90vh] bg-white/95 dark:bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {service ? t('edit_service') : t('add_service')}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t('Fill Service Details') || (service ? 'Update service details and save changes.' : 'Create a new service and upload images.')}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 focus:outline-none"
              aria-label="Close"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form id="service-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('service name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border rounded-xl dark:bg-white/5 dark:text-gray-100 focus:outline-none focus:ring ${
                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('description')} *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border rounded-xl dark:bg-white/5 dark:text-gray-100 focus:outline-none focus:ring ${
                    errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                  }`}
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('price')} *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-3 text-sm text-gray-900 bg-white/70 border rounded-xl dark:bg-white/5 dark:text-gray-100 focus:outline-none focus:ring ${
                        errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                      }`}
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('category')} *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border rounded-xl dark:bg-white dark:text-black focus:outline-none focus:ring ${
                      errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  >
                    <option value="">{t('select_category')}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm text-white bg-white/70 border border-gray-200 rounded-xl dark:bg-white dark:text-black dark:border-white/10 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
                  >
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                  </select>
                </div>
                
                <div className="flex items-center mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t('featured service')}
                    </span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('images')}
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 mb-4"
                >
                  {t('upload_images')}
                </button>
                
                {imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('image_previews')}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
          
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10 bg-white/70 dark:bg-white/5">
            <button
              className="px-5 py-2.5 text-sm font-semibold text-gray-800 transition-all duration-150 ease-linear bg-transparent border border-gray-300 rounded-xl outline-none dark:text-gray-200 dark:border-white/10 hover:shadow-lg focus:outline-none"
              type="button"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
            <button
              className="px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 ease-linear bg-purple-600 rounded-xl shadow outline-none hover:bg-purple-700 hover:shadow-lg focus:outline-none"
              type="submit"
              form="service-form"
            >
              {service ? t('update_service') : t('create service')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
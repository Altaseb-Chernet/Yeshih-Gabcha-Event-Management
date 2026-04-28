// src/admin/components/BookingModal.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const BookingModal = ({ booking, services, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    service: '',
    date: '',
    time: '',
    guests: '',
    status: 'pending',
    amount: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName || '',
        customerEmail: booking.customerEmail || '',
        customerPhone: booking.customerPhone || '',
        service: booking.service || '',
        date: booking.date || '',
        time: booking.time || '',
        guests: booking.guests || '',
        status: booking.status || 'pending',
        amount: booking.amount || '',
        notes: booking.notes || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        service: '',
        date: today,
        time: '10:00',
        guests: '',
        status: 'pending',
        amount: '',
        notes: ''
      });
    }
    setErrors({});
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = t('name_required');
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = t('valid_email_required');
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = t('phone_required');
    }
    
    if (!formData.service) {
      newErrors.service = t('service_required');
    }
    
    if (!formData.date) {
      newErrors.date = t('date_required');
    }
    
    if (!formData.time) {
      newErrors.time = t('time_required');
    }
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('valid_amount_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        id: booking ? booking.id : null,
        amount: parseFloat(formData.amount),
        guests: formData.guests ? parseInt(formData.guests) : null
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-white/10">
      <div className="relative w-full max-w-2xl mx-4 my-6">
        {/* Modal Content */}
        <div className="relative flex flex-col w-full max-h-[90vh] overflow-y-auto bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-800 focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-gray-300 dark:border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {booking ? t('edit_booking') : t('add_booking')}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-300 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="bg-transparent h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          
          {/* Body */}
          <div className="relative p-6 flex-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer_name')} *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                      errors.customerName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  />
                  {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer_email')} *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                      errors.customerEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  />
                  {errors.customerEmail && <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('customer_phone')} *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                      errors.customerPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  />
                  {errors.customerPhone && <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('service')} *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                      errors.service ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  >
                    <option value="">{t('select_service')}</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('date')} *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                      errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('time')} *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                      errors.time ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                    }`}
                  />
                  {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('guests')}
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('amount')} *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-8 pr-4 py-2 text-sm text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring ${
                        errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300'
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
                  >
                    <option value="pending">{t('pending')}</option>
                    <option value="confirmed">{t('confirmed')}</option>
                    <option value="completed">{t('completed')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('notes')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
                ></textarea>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-gray-300 dark:border-gray-700">
            <button
              className="px-6 py-2 mb-1 mr-4 text-sm font-bold text-gray-800 uppercase transition-all duration-150 ease-linear bg-transparent border border-gray-300 rounded outline-none dark:text-gray-200 dark:border-gray-600 hover:shadow-lg focus:outline-none"
              type="button"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
            <button
              className="px-6 py-2 mb-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear bg-purple-600 rounded shadow outline-none hover:bg-purple-700 hover:shadow-lg focus:outline-none"
              type="button"
              onClick={handleSubmit}
            >
              {booking ? t('update_booking') : t('create_booking')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
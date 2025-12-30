// src/admin/pages/Bookings.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { createBooking, getAdminBookings, updateAdminBookingStatus } from '../../api/bookings';
import { getAdminEventPayments } from '../../api/eventPayments';
import { getServices } from '../../api/services';
import BookingModal from '../components/BookingModal';

const Bookings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [services, setServices] = useState([]);
  const [serviceIdByName, setServiceIdByName] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'event-tickets'
  const [eventPayments, setEventPayments] = useState([]);
  const [filteredEventPayments, setFilteredEventPayments] = useState([]);
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventSortConfig, setEventSortConfig] = useState({ key: null, direction: 'ascending' });

  const loadBookings = async () => {
    setLoading(true)
    try {
      const data = await getAdminBookings({ limit: 200 })
      const rows = data?.bookings || []
      const mapped = rows.map((b) => ({
        id: b.id,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        service: b?.service?.name || b?.serviceSnapshot?.name || (b.serviceId ? 'Service' : 'Custom'),
        date: b.eventDate,
        time: b.eventTime,
        guests: b.guestCount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        amount: b.priceCalculated,
        notes: b.message,
        createdAt: b.createdAt,
        payment: b.payment,
        qrCodeUrl: b.qrCodeUrl,
        transactionId: b.transactionId,
      }))
      setBookings(mapped)
      setFilteredBookings(mapped)
    } catch {
      setBookings([])
      setFilteredBookings([])
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      const data = await getServices({ limit: 200 })
      const rows = Array.isArray(data?.services) ? data.services : Array.isArray(data) ? data : []
      const nameToId = {}
      const names = []
      rows.forEach((s) => {
        const name = String(s?.name || '').trim()
        const id = s?.id
        if (!name || !id) return
        if (!nameToId[name]) names.push(name)
        nameToId[name] = id
      })
      setServices(names)
      setServiceIdByName(nameToId)
    } catch {
      setServices([])
      setServiceIdByName({})
    }
  }

  const loadEventPayments = async () => {
    setLoading(true)
    try {
      const data = await getAdminEventPayments({ limit: 200 })
      const rows = data?.payments || []
      const mapped = rows.map((p) => ({
        id: p.id,
        transactionId: p.transactionId,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.paymentMethod,
        phoneNumber: p.phoneNumber,
        proofImageUrl: p.proofImageUrl,
        proofUploadedAt: p.proofUploadedAt,
        qrCodeUrl: p.qrCodeUrl,
        createdAt: p.createdAt,
        user: p.user,
        event: p.event,
      }))
      setEventPayments(mapped)
      setFilteredEventPayments(mapped)
    } catch {
      setEventPayments([])
      setFilteredEventPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
    loadServices()
  }, [])

  useEffect(() => {
    if (!isModalOpen) return undefined

    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [isModalOpen])

  useEffect(() => {
    if (activeTab === 'event-tickets') {
      loadEventPayments()
    }
  }, [activeTab])

  // Poll event payments every 15 seconds when Event Tickets tab is active
  useEffect(() => {
    if (activeTab !== 'event-tickets') return undefined
    const interval = setInterval(loadEventPayments, 15000)
    return () => clearInterval(interval)
  }, [activeTab])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const incoming = params.get('search')
    if (incoming) setSearchTerm(incoming)
  }, [location.search])

  // Filter bookings based on search and filters
  useEffect(() => {
    let result = bookings;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(booking => 
        String(booking.id || '').toLowerCase().includes(term) ||
        booking.customerName.toLowerCase().includes(term) ||
        booking.customerEmail.toLowerCase().includes(term) ||
        booking.customerPhone.includes(term) ||
        String(booking.service || '').toLowerCase().includes(term) ||
        String(booking.transactionId || '').toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Apply service filter
    if (serviceFilter !== 'all') {
      result = result.filter(booking => booking.service === serviceFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === 'today') {
        result = result.filter(booking => booking.date === today);
      } else if (dateFilter === 'upcoming') {
        result = result.filter(booking => booking.date >= today);
      } else if (dateFilter === 'past') {
        result = result.filter(booking => booking.date < today);
      }
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
    
    setFilteredBookings(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, serviceFilter, dateFilter, bookings, sortConfig]);

  // Filter event payments based on search and filters
  useEffect(() => {
    let result = eventPayments;

    // Apply search filter
    if (eventSearchTerm) {
      const term = eventSearchTerm.toLowerCase();
      result = result.filter(p =>
        String(p.id || '').toLowerCase().includes(term) ||
        p.event?.title?.toLowerCase().includes(term) ||
        p.user?.firstName?.toLowerCase().includes(term) ||
        p.user?.lastName?.toLowerCase().includes(term) ||
        p.user?.email?.toLowerCase().includes(term) ||
        p.transactionId?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (eventStatusFilter !== 'all') {
      result = result.filter(p => p.status === eventStatusFilter);
    }

    // Apply sorting
    if (eventSortConfig.key) {
      result = result.sort((a, b) => {
        const aVal = a[eventSortConfig.key];
        const bVal = b[eventSortConfig.key];
        if (aVal < bVal) return eventSortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return eventSortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    setFilteredEventPayments(result);
  }, [eventSearchTerm, eventStatusFilter, eventPayments, eventSortConfig]);

  // Sort bookings
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEventSort = (key) => {
    let direction = 'ascending';
    if (eventSortConfig.key === key && eventSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setEventSortConfig({ key, direction });
  };

  const processEventPayment = async (paymentId, simulateSuccess = true) => {
    // Optimistically update the UI immediately
    setEventPayments(prev => prev.map(p =>
      p.id === paymentId ? { ...p, status: simulateSuccess ? 'completed' : 'failed' } : p
    ));
    try {
      await api.post(`/payments/${paymentId}/process`, { simulateSuccess });
      // Reload to ensure consistency
      await loadEventPayments();
    } catch {
      // Revert optimistic update on error and reload
      await loadEventPayments();
    }
  };

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddBooking = () => {
    setEditingBooking(null)
    setIsModalOpen(true)
  };

  const handleEditBooking = () => {
    // Not supported in admin UI yet (backend endpoint not implemented)
  };

  const handleDeleteBooking = () => {
    // Not supported in admin UI yet (backend endpoint not implemented)
  };

  const handleDeleteSelected = () => {
    // Not supported in admin UI yet (backend endpoint not implemented)
  };

  const handleSaveBooking = async (form) => {
    setLoading(true)
    try {
      const serviceId = form?.service ? serviceIdByName[String(form.service)] : undefined
      const payload = {
        serviceId,
        customerName: String(form?.customerName || '').trim(),
        customerEmail: String(form?.customerEmail || '').trim(),
        customerPhone: String(form?.customerPhone || '').trim(),
        eventType: 'other',
        eventDate: form?.date,
        eventTime: form?.time,
        guestCount: Number(form?.guests || 1),
        durationHours: 5,
        message: form?.notes,
      }

      await createBooking(payload)
      await loadBookings()
      setIsModalOpen(false)
      setEditingBooking(null)
    } catch (e) {
      alert(e?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  };

  const updateBookingStatus = async (id, status) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
    try {
      await updateAdminBookingStatus(id, status)
      await loadBookings()
    } catch {
      await loadBookings()
    }
  };

  const handleSelectBooking = (id) => {
    if (selectedBookings.includes(id)) {
      setSelectedBookings(selectedBookings.filter(bookingId => bookingId !== id));
    } else {
      setSelectedBookings([...selectedBookings, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === currentBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(currentBookings.map(booking => booking.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏱';
      case 'completed': return '✓';
      case 'cancelled': return '✕';
      default: return '';
    }
  };

  // Get bookings for calendar view
  const getBookingsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateString);
  };

  // Calendar tile content
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateBookings = getBookingsForDate(date);
      if (dateBookings.length > 0) {
        return (
          <div className="flex justify-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          </div>
        );
      }
    }
    return null;
  };

  // Calendar tile className
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      if (dateString === today) {
        return 'bg-purple-100 text-purple-800';
      }
      
      const dateBookings = getBookingsForDate(date);
      if (dateBookings.length > 0) {
        return 'border border-purple-500';
      }
    }
    return '';
  };

  // Booking Modal Component
  const BookingModal = ({ booking, services, onSave, onClose }) => {
    const [formData, setFormData] = useState({
      id: booking?.id || null,
      customerName: booking?.customerName || '',
      customerEmail: booking?.customerEmail || '',
      customerPhone: booking?.customerPhone || '',
      service: booking?.service || services[0],
      date: booking?.date || '',
      time: booking?.time || '',
      guests: booking?.guests || '',
      status: booking?.status || 'pending',
      amount: booking?.amount || '',
      notes: booking?.notes || ''
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
        <div className="relative w-full max-w-2xl mx-auto my-6">
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none dark:bg-gray-800 focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-gray-300 dark:border-gray-600">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                {booking ? t('edit booking') : t('add booking')}
              </h3>
              <button
                className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-gray-800 bg-transparent border-0 outline-none dark:text-gray-200 focus:outline-none"
                onClick={onClose}
              >
                <span className="block w-6 h-6 text-2xl text-gray-800 dark:text-gray-200">×</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="relative p-6 flex-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customer_name')}
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customer email')}
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('customer phone')}
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('service')}
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('date')}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('time')}
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('guests')} ({t('optional')})
                    </label>
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('status')}
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="confirmed">{t('confirmed')}</option>
                      <option value="completed">{t('completed')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('amount')} ($)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('notes')} ({t('optional')})
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-gray-300 dark:border-gray-600">
                <button
                  type="button"
                  className="px-6 py-2 mb-1 mr-2 text-sm font-bold text-gray-800 uppercase transition-all duration-150 ease-linear bg-transparent border border-gray-300 rounded outline-none dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                  onClick={onClose}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 mb-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear bg-purple-600 rounded shadow outline-none hover:bg-purple-700 hover:shadow-lg focus:outline-none"
                >
                  {booking ? t('update booking') : t('add booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center my-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            {t('bookings')}
          </h2>
          <div className="mt-2 flex space-x-1 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              {t('bookings') || 'Bookings'}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'event-tickets'
                  ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
                  : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('event-tickets')}
            >
              {t('event_tickets') || 'Event Tickets'}
            </button>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleAddBooking}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
          >
            {t('add booking')}
          </button>
          <button
            onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
            className="px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition-colors duration-150 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 active:bg-gray-100 hover:bg-gray-50 focus:outline-none focus:shadow-outline-gray"
          >
            {view === 'list' ? t('calendar_view') : t('list_view')}
          </button>
          {selectedBookings.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-red-600 border border-transparent rounded-lg active:bg-red-600 hover:bg-red-700 focus:outline-none focus:shadow-outline-red"
            >
              {t('delete selected')} ({selectedBookings.length})
            </button>
          )}
        </div>
      </div>

      {activeTab === 'bookings' && (
        <>
          {/* Filters and Search */}
          <div className="mb-6 grid gap-6 md:grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder={t('search bookings')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          />
        </div>
        
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all_statuses')}</option>
            <option value="confirmed">{t('confirmed')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="cancelled">{t('cancelled')}</option>
          </select>
        </div>
        
        <div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all services')}</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
          >
            <option value="all">{t('all dates')}</option>
            <option value="today">{t('today')}</option>
            <option value="upcoming">{t('upcoming')}</option>
            <option value="past">{t('past')}</option>
          </select>
        </div>
      </div>

      {/* Bookings Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full dark:text-blue-100 dark:bg-blue-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('total bookings')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {bookings.length}
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
              {t('confirmed_bookings')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-yellow-500 bg-yellow-100 rounded-full dark:text-yellow-100 dark:bg-yellow-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('pending bookings')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <div className="p-3 mr-4 text-red-500 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('cancelled bookings')}
            </p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {bookings.filter(b => b.status === 'cancelled').length}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t('booking calendar')}
          </h3>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="w-full border-0"
              />
            </div>
            <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
                {t('bookings on')} {selectedDate.toLocaleDateString()}
              </h4>
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">{t('no_bookings_on_date')}</p>
              ) : (
                <div className="space-y-3">
                  {getBookingsForDate(selectedDate).map(booking => (
                    <div key={booking.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">{booking.customerName}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service} • {booking.time}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {t(booking.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      {view === 'list' && (
        <div className="w-full overflow-hidden rounded-lg shadow-xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-no-wrap">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                  <th className="px-4 py-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBookings.length === currentBookings.length && currentBookings.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      />
                    </label>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('customerName')}>
                    {t('customer')} 
                    {sortConfig.key === 'customerName' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('service')}>
                    {t('service')}
                    {sortConfig.key === 'service' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('date')}>
                    {t('date_time')}
                    {sortConfig.key === 'date' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                    {t('status')}
                    {sortConfig.key === 'status' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('paymentStatus')}>
                    {t('payment') || 'Payment'}
                    {sortConfig.key === 'paymentStatus' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('amount')}>
                    {t('amount')}
                    {sortConfig.key === 'amount' && (
                      <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-400">
                      {t('no bookings found')}
                    </td>
                  </tr>
                ) : (
                  currentBookings.map(booking => (
                    <tr key={booking.id} className="text-gray-700 dark:text-gray-400">
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={() => handleSelectBooking(booking.id)}
                            className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                          />
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm">
                          <div>
                            <p className="font-semibold">{booking.customerName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{booking.customerEmail}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{booking.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {booking.service}
                        {booking.guests && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {booking.guests} {t('guests')}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(booking.date).toLocaleDateString()}
                        <p className="text-xs text-gray-600 dark:text-gray-400">{booking.time}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)} {t(booking.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                          booking.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : booking.paymentStatus === 'processing'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              : booking.paymentStatus === 'failed'
                                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {booking.paymentStatus || 'unpaid'}
                        </span>
                        {booking.transactionId ? (
                          <p className="text-xs text-gray-600 dark:text-gray-400">{booking.transactionId}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {booking.amount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className={`text-xs rounded-md focus:outline-none focus:shadow-outline ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                              'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}
                          >
                            <option value="pending">{t('pending')}</option>
                            <option value="confirmed">{t('confirmed')}</option>
                            <option value="completed">{t('completed')}</option>
                            <option value="cancelled">{t('cancelled')}</option>
                          </select>
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
                {t('showing')} {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} {t('of')} {filteredBookings.length}
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
      )}
        </>
      )}

      {isModalOpen && (
        <BookingModal
          booking={editingBooking}
          services={services}
          onSave={handleSaveBooking}
          onClose={() => {
            setIsModalOpen(false)
            setEditingBooking(null)
          }}
        />
      )}

      {activeTab === 'event-tickets' && (
        <>
          {/* Event Tickets Filters */}
          <div className="mb-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder={t('search event tickets') || 'Search by event name, user, or transaction ID'}
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 dark:focus:border-purple-300 focus:outline-none focus:ring"
              >
                <option value="all">{t('all_statuses') || 'All Statuses'}</option>
                <option value="pending">{t('pending') || 'Pending'}</option>
                <option value="completed">{t('completed') || 'Completed'}</option>
                <option value="failed">{t('failed') || 'Failed'}</option>
              </select>
            </div>
          </div>

          {/* Event Payments Table */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      onClick={() => handleEventSort('event.title')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('event') || 'Event'}
                      {eventSortConfig.key === 'event.title' && (eventSortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      onClick={() => handleEventSort('user.firstName')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('customer') || 'Customer'}
                      {eventSortConfig.key === 'user.firstName' && (eventSortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      onClick={() => handleEventSort('amount')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('amount') || 'Amount'}
                      {eventSortConfig.key === 'amount' && (eventSortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      onClick={() => handleEventSort('transactionId')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('transaction_id') || 'Transaction ID'}
                      {eventSortConfig.key === 'transactionId' && (eventSortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('qr_code') || 'QR Code'}
                    </th>
                    <th
                      onClick={() => handleEventSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('status') || 'Status'}
                      {eventSortConfig.key === 'status' && (eventSortConfig.direction === 'ascending' ? ' ↑' : ' ↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredEventPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>
                          <div className="font-medium">{p.event?.title || '-'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{p.event?.eventDate} {p.event?.eventTime?.slice?.(0,5)||''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>
                          <div className="font-medium">{p.user?.firstName} {p.user?.lastName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{p.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ETB {Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {p.transactionId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {p.status === 'completed' && p.qrCodeUrl ? (
                          <a href={p.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            QR
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {p.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => processEventPayment(p.id, true)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title={t('approve') || 'Approve'}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => processEventPayment(p.id, false)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('reject') || 'Reject'}
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <BookingModal
          booking={editingBooking}
          services={services}
          onSave={handleSaveBooking}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBooking(null);
          }}
        />
      )}
    </>
  );
};

export default Bookings;
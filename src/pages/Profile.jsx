import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Edit, LogOut, 
  Camera, Save, X, Calendar, Heart, CreditCard,
  Bell, Shield, Download, Eye, EyeOff, Key
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getBookingById, getMyBookings } from '../api/bookings.js'
import { getMyPayments } from '../api/payments.js'

const Profile = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { user, logout, updateProfile, uploadProfileImage } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [loadingData, setLoadingData] = useState(false)
  const [dataError, setDataError] = useState('')
  const [myBookings, setMyBookings] = useState([])
  const [myPayments, setMyPayments] = useState([])
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false)
  const [bookingDetailsLoading, setBookingDetailsLoading] = useState(false)
  const [bookingDetailsError, setBookingDetailsError] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || user?.dob || '',
    profileImage: user?.profileImage || ''
  })
  const [saveStatus, setSaveStatus] = useState('') // '', 'saving', 'success', 'error'

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || user?.dob || '',
      profileImage: user?.profileImage || prev.profileImage || ''
    }))
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        dob: formData.dateOfBirth || undefined,
      })
      setSaveStatus('success')
      setIsEditing(false)
      // Clear success message after 2 seconds
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Error updating profile:', error)
      // Clear error message after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth || user?.dob || '',
      profileImage: user?.profileImage || ''
    })
    setIsEditing(false)
    setSaveStatus('')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaveStatus('saving')
    const result = await uploadProfileImage(file)
    if (result?.success) {
      setFormData((prev) => ({ ...prev, profileImage: result.profileImage }))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(''), 2000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    i18n.changeLanguage(newLanguage)
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoadingData(true)
        setDataError('')

        const [bookingsData, paymentsData] = await Promise.all([
          getMyBookings({ limit: 50 }),
          getMyPayments({ limit: 50 }),
        ])

        if (!active) return
        setMyBookings(Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : [])
        setMyPayments(Array.isArray(paymentsData?.payments) ? paymentsData.payments : [])
      } catch (e) {
        if (!active) return
        setDataError(e?.message || 'Failed to load dashboard data')
        setMyBookings([])
        setMyPayments([])
      } finally {
        if (!active) return
        setLoadingData(false)
      }
    }

    run()
    return () => {
      active = false
    }
  }, [])

  const formatETB = (amount) => `${Number(amount || 0).toLocaleString()} Birr`

  const openBookingDetails = async (bookingId) => {
    setBookingDetailsOpen(true)
    setBookingDetailsLoading(true)
    setBookingDetailsError('')
    setSelectedBooking(null)
    try {
      const data = await getBookingById(bookingId)
      setSelectedBooking(data)
    } catch (e) {
      setBookingDetailsError(e?.message || 'Failed to load booking details')
    } finally {
      setBookingDetailsLoading(false)
    }
  }

  const closeBookingDetails = () => {
    setBookingDetailsOpen(false)
    setBookingDetailsLoading(false)
    setBookingDetailsError('')
    setSelectedBooking(null)
  }

  const buildReceiptHtml = ({ payment, booking }) => {
    const safe = (v) => (v === undefined || v === null ? '' : String(v))
    const createdAt = payment?.createdAt ? new Date(payment.createdAt).toLocaleString() : ''
    const eventDate = booking?.eventDate ? new Date(booking.eventDate).toLocaleDateString() : ''

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111827; }
      .card { max-width: 820px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; }
      .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
      .title { font-size: 20px; font-weight: 700; margin: 0; }
      .muted { color: #6B7280; font-size: 12px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
      .row { border: 1px solid #F3F4F6; border-radius: 10px; padding: 12px; }
      .label { color: #6B7280; font-size: 12px; margin-bottom: 4px; }
      .value { font-size: 14px; font-weight: 600; }
      .divider { height: 1px; background: #E5E7EB; margin: 16px 0; }
      .footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      @media print { .no-print { display: none; } body { padding: 0; } .card { border: none; } }
      .btn { display: inline-block; background: #111827; color: #fff; border: 0; padding: 10px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="top">
        <div>
          <p class="title">Payment Receipt</p>
          <div class="muted">Generated: ${new Date().toLocaleString()}</div>
        </div>
        <div class="no-print">
          <button class="btn" onclick="window.print()">Download / Print</button>
        </div>
      </div>
      <div class="divider"></div>
      <div class="grid">
        <div class="row">
          <div class="label">Amount</div>
          <div class="value">${safe(formatETB(payment?.amount))}</div>
        </div>
        <div class="row">
          <div class="label">Status</div>
          <div class="value">${safe(payment?.status)}</div>
        </div>
        <div class="row">
          <div class="label">Payment Method</div>
          <div class="value">${safe(payment?.paymentMethod)}</div>
        </div>
        <div class="row">
          <div class="label">Transaction ID</div>
          <div class="value">${safe(payment?.transactionId || booking?.transactionId || payment?.id)}</div>
        </div>
        <div class="row">
          <div class="label">Payment Date</div>
          <div class="value">${safe(createdAt)}</div>
        </div>
        <div class="row">
          <div class="label">Booking ID</div>
          <div class="value">${safe(booking?.id || payment?.bookingId || payment?.booking?.id)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid">
        <div class="row">
          <div class="label">Event Type</div>
          <div class="value">${safe(booking?.eventType || payment?.booking?.eventType)}</div>
        </div>
        <div class="row">
          <div class="label">Event Date</div>
          <div class="value">${safe(eventDate || (payment?.booking?.eventDate ? new Date(payment.booking.eventDate).toLocaleDateString() : ''))}</div>
        </div>
        <div class="row">
          <div class="label">Customer</div>
          <div class="value">${safe(booking?.customerName || booking?.user?.firstName || '')} ${safe(booking?.user?.lastName || '')}</div>
        </div>
        <div class="row">
          <div class="label">Service</div>
          <div class="value">${safe(booking?.service?.name || booking?.serviceSnapshot?.name || '')}</div>
        </div>
      </div>

      <div class="divider"></div>
      <div class="footer">
        <div class="muted">Thank you for your payment.</div>
        <div class="muted">Currency: ETB</div>
      </div>
    </div>
  </body>
</html>`
  }

  const downloadReceipt = async (payment) => {
    try {
      if (payment?.status !== 'completed') {
        window.alert(isAmharic ? 'ሰርተፍኬት ለማውረድ ክፍያው መጨረሱ አለበት (Completed)' : 'Receipt is available only after payment is completed.')
        return
      }

      const bookingId = payment?.booking?.id || payment?.bookingId
      const booking = bookingId ? await getBookingById(bookingId) : null
      const paymentForReceipt = booking?.payment || payment
      const html = buildReceiptHtml({ payment: paymentForReceipt, booking })

      const win = window.open('', '_blank')
      if (!win) {
        window.alert('Popup blocked. Please allow popups to download the receipt.')
        return
      }
      win.document.open()
      win.document.write(html)
      win.document.close()
      win.focus()
    } catch (e) {
      window.alert(e?.message || 'Failed to generate receipt')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Save Status Messages */}
        {saveStatus === 'saving' && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-neutral-200/70 dark:border-white/10 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-blue-700 dark:text-blue-300 font-medium">{isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving...'}</p>
          </div>
        )}
        {saveStatus === 'success' && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-neutral-200/70 dark:border-white/10 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-green-700 dark:text-green-300 font-medium">{isAmharic ? 'በተሳካ ሁኔታ ተቀምጧል!' : 'Successfully saved!'}</p>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-neutral-200/70 dark:border-white/10 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-red-700 dark:text-red-300 font-medium">{isAmharic ? 'ስህተት ተፈጥሯል! እባክዎ ደግመው ይሞክሩ' : 'Error occurred! Please try again'}</p>
          </div>
        )}

        {dataError && (
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-neutral-200/70 dark:border-white/10 rounded-xl p-4 mb-6 shadow-sm">
            <p className="text-red-700 dark:text-red-300 font-medium">{dataError}</p>
          </div>
        )}

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3 font-display">
            {isAmharic ? 'የተጠቃሚ ሳጥን' : 'User Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300/90 max-w-2xl mx-auto">
            {isAmharic 
              ? 'የግል መረጃዎን ያስተዳድሩ እና የበዓሎችዎን ዝርዝር ይመልከቱ' 
              : 'Manage your personal information and view your event details'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 border border-neutral-200/70 dark:border-white/10">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-primary-100/80 dark:bg-white/10 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    {formData.profileImage ? (
                      <img 
                        src={formData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-primary-600" />
                    )}
                  </div>
                  {/* Always show image upload button */}
                  <label className="absolute bottom-0 right-0 bg-white/80 dark:bg-white/10 backdrop-blur-xl text-white p-2 rounded-full cursor-pointer hover:bg-white/90 dark:hover:bg-white/15 ring-1 ring-black/5 dark:ring-white/10">
                    <Camera size={16} className='text-black' />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300/90 text-sm">
                  {user?.email}
                </p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-100/80 dark:bg-white/10 text-primary-800 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300/90 hover:bg-white/60 dark:hover:bg-white/5'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  {isAmharic ? 'ፕሮፋይል' : 'Profile'}
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'events'
                      ? 'bg-primary-100/80 dark:bg-white/10 text-primary-800 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300/90 hover:bg-white/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Calendar size={18} className="mr-3" />
                  {isAmharic ? 'የበዓላት' : 'My Events'}
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'payments'
                      ? 'bg-primary-100/80 dark:bg-white/10 text-primary-800 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300/90 hover:bg-white/60 dark:hover:bg-white/5'
                  }`}
                >
                  <CreditCard size={18} className="mr-3" />
                  {isAmharic ? 'ክፍያዎች' : 'Payments'}
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors text-neutral-700 dark:text-neutral-300/90 hover:bg-white/60 dark:hover:bg-white/5"
                >
                  <Shield size={18} className="mr-3" />
                  {isAmharic ? 'ማስተካከያ' : 'Settings'}
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-neutral-200/70 dark:border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-2 px-4 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 font-medium"
                >
                  <LogOut size={18} className="mr-2" />
                  {isAmharic ? 'ውጣ' : 'Sign Out'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 border border-neutral-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                    {isAmharic ? 'የግል መረጃ' : 'Personal Information'}
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 font-medium"
                    >
                      <Edit size={18} className="mr-2" />
                      {isAmharic ? 'አርትዕ' : 'Edit'}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className="flex items-center bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={18} className="mr-2" />
                        {saveStatus === 'saving' 
                          ? (isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving...') 
                          : (isAmharic ? 'አስቀምጥ' : 'Save')
                        }
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saveStatus === 'saving'}
                        className="flex items-center text-neutral-600 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-200 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        <X size={18} className="mr-2" />
                        {isAmharic ? 'አትቀምጥ' : 'Cancel'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                      {isAmharic ? 'ስም' : 'First Name'} *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-neutral-300/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/60 bg-white/60 dark:bg-white/5 dark:text-neutral-100 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                      {isAmharic ? 'የአባት ስም' : 'Last Name'}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-neutral-300/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/60 bg-white/60 dark:bg-white/5 dark:text-neutral-100 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-neutral-300/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/60 bg-white/60 dark:bg-white/5 dark:text-neutral-100 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                      {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-neutral-300/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/60 bg-white/60 dark:bg-white/5 dark:text-neutral-100 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                      {isAmharic ? 'የልደት ቀን' : 'Date of Birth'}
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-neutral-300/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/60 bg-white/60 dark:bg-white/5 dark:text-neutral-100 disabled:opacity-50"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                      {isAmharic ? 'አድራሻ' : 'Address'}
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="3"
                      className="w-full px-4 py-3 border border-neutral-300/80 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/60 bg-white/60 dark:bg-white/5 dark:text-neutral-100 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 border border-neutral-200/70 dark:border-white/10">
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight">
                  {isAmharic ? 'የበዓላቴ' : 'My Events'}
                </h2>

                {loadingData ? (
                  <div className="text-neutral-600 dark:text-neutral-300">{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</div>
                ) : myBookings.length === 0 ? (
                  <div className="text-neutral-600 dark:text-neutral-300">{isAmharic ? 'ምንም ቦታ መያዣ አልተገኘም' : 'No bookings found'}</div>
                ) : (
                  <div className="space-y-4">
                    {myBookings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-4 border border-neutral-200/70 dark:border-white/10 rounded-xl bg-white/60 dark:bg-white/5">
                        <div className="flex items-center">
                          <div className="p-3 bg-primary-100/80 dark:bg-white/10 rounded-xl mr-4 ring-1 ring-black/5 dark:ring-white/10">
                            <Calendar className="text-primary-700 dark:text-primary-200" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {b.eventType}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-300/90 text-sm">
                              {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : ''} • {b.status}
                            </p>
                            <p className="text-neutral-600 dark:text-neutral-300/90 text-xs mt-1">
                              {isAmharic ? 'ክፍያ: ' : 'Payment: '}{b.paymentStatus || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {b.qrCodeUrl ? (
                            <a
                              href={b.qrCodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 text-sm font-medium"
                            >
                              {isAmharic ? 'QR ኮድ' : 'QR Code'}
                            </a>
                          ) : null}
                          <button
                            onClick={() => openBookingDetails(b.id)}
                            className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 text-sm font-medium"
                          >
                            {isAmharic ? 'ዝርዝሮች' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-neutral-200/70 dark:border-white/10 shadow-sm">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    {isAmharic ? 'አዲስ በዓል ያስያዙ' : 'Book a New Event'}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-300/90 text-sm mb-4">
                    {isAmharic 
                      ? 'አዲስ የጋብቻ ወይም የበዓል አገልግሎት ይያዙ' 
                      : 'Schedule a new wedding or event service'}
                  </p>
                  <button 
                    onClick={() => navigate('/booking')}
                    className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white/10 dark:hover:bg-white/15 text-white px-4 py-2 rounded-xl text-sm font-medium ring-1 ring-black/5 dark:ring-white/10"
                  >
                    {isAmharic ? 'አሁን ያስያዙ' : 'Book Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 border border-neutral-200/70 dark:border-white/10">
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight">
                  {isAmharic ? 'የክፍያ ታሪክ' : 'Payment History'}
                </h2>

                {loadingData ? (
                  <div className="text-neutral-600 dark:text-neutral-300">{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</div>
                ) : myPayments.length === 0 ? (
                  <div className="text-neutral-600 dark:text-neutral-300">{isAmharic ? 'ምንም ክፍያ አልተገኘም' : 'No payments found'}</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200/70 dark:border-white/10">
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300/90">
                            {isAmharic ? 'ቀን' : 'Date'}
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300/90">
                            {isAmharic ? 'መጠን' : 'Amount'}
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300/90">
                            {isAmharic ? 'ዘዴ' : 'Method'}
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300/90">
                            {isAmharic ? 'ሁኔታ' : 'Status'}
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300/90">
                            {isAmharic ? 'ድርጊቶች' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {myPayments.map((p) => (
                          <tr key={p.id} className="border-b border-neutral-100 dark:border-white/10">
                            <td className="py-4 px-4 text-sm text-neutral-600 dark:text-neutral-300/90">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                            </td>
                            <td className="py-4 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {Number(p.amount || 0).toLocaleString()} Birr
                            </td>
                            <td className="py-4 px-4 text-sm text-neutral-600 dark:text-neutral-300/90">
                              {p.paymentMethod}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-900/5 text-neutral-800 dark:bg-white/10 dark:text-neutral-100 ring-1 ring-black/5 dark:ring-white/10">
                                {p.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="inline-flex flex-col items-end">
                                <button
                                  onClick={() => downloadReceipt(p)}
                                  disabled={p.status !== 'completed'}
                                  className={`text-sm font-medium inline-flex items-center ${
                                    p.status === 'completed'
                                      ? 'text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200'
                                      : 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                                  }`}
                                >
                                  <Download size={16} className="inline mr-1" />
                                  {isAmharic ? 'ሰርተፍኬት' : 'Receipt'}
                                </button>
                                {p.status !== 'completed' ? (
                                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    {isAmharic ? 'ከማረጋገጫ በኋላ ይገኛል' : 'Available after approval'}
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {bookingDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeBookingDetails} />
          <div className="relative w-full max-w-2xl bg-white/75 dark:bg-neutral-950/60 backdrop-blur-xl rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] border border-neutral-200/70 dark:border-white/10 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {isAmharic ? 'የቦታ መያዣ ዝርዝር' : 'Booking Details'}
              </h3>
              <button
                type="button"
                onClick={closeBookingDetails}
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300/90 dark:hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {bookingDetailsLoading ? (
              <div className="text-neutral-600 dark:text-neutral-300">
                {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
              </div>
            ) : bookingDetailsError ? (
              <div className="text-red-600 dark:text-red-400">{bookingDetailsError}</div>
            ) : !selectedBooking ? (
              <div className="text-neutral-600 dark:text-neutral-300">
                {isAmharic ? 'ዝርዝር አልተገኘም' : 'No details found'}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'የበዓል አይነት' : 'Event Type'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {selectedBooking.eventType}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'ቀን' : 'Event Date'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {selectedBooking.eventDate ? new Date(selectedBooking.eventDate).toLocaleDateString() : ''}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'ሰዓት' : 'Event Time'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedBooking.eventTime || ''}</div>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'ሰዓታት' : 'Duration Hours'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedBooking.durationHours || 5}</div>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'እንግዶች' : 'Guest Count'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedBooking.guestCount || ''}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'የቦታ መያዣ ሁኔታ' : 'Booking Status'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedBooking.status}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'የክፍያ ሁኔታ' : 'Payment Status'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">{selectedBooking.paymentStatus}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'ዋጋ' : 'Price'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">{formatETB(selectedBooking.priceCalculated)}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'አገልግሎት' : 'Service'}</div>
                    <div className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {selectedBooking.service?.name || selectedBooking.serviceSnapshot?.name || ''}
                    </div>
                  </div>
                </div>

                {selectedBooking.qrCodeUrl ? (
                  <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                    <div className="text-xs text-neutral-500 mb-2">{isAmharic ? 'QR ኮድ' : 'QR Code'}</div>
                    <a
                      href={selectedBooking.qrCodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 text-sm font-medium"
                    >
                      {isAmharic ? 'QR ኮድ ክፈት' : 'Open QR Code'}
                    </a>
                  </div>
                ) : selectedBooking.paymentStatus === 'processing' ? (
                  <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200">
                    {isAmharic ? 'ክፍያዎ ተልኳል። የአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ...' : 'Your proof was submitted. Waiting for admin approval...'}
                  </div>
                ) : null}

                <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5">
                  <div className="text-xs text-neutral-500">{isAmharic ? 'ደንበኛ' : 'Customer'}</div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-100">
                    {selectedBooking.customerName || `${selectedBooking.user?.firstName || ''} ${selectedBooking.user?.lastName || ''}`.trim()}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    {selectedBooking.customerEmail || selectedBooking.user?.email || ''}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    {selectedBooking.customerPhone || selectedBooking.user?.phone || ''}
                  </div>
                </div>

                {selectedBooking.message ? (
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="text-xs text-neutral-500">{isAmharic ? 'መልእክት' : 'Message'}</div>
                    <div className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap">{selectedBooking.message}</div>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeBookingDetails}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-black/5 dark:ring-white/10"
                  >
                    {isAmharic ? 'ዝጋ' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
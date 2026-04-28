import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const RegisterEventForm = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: '',
    guestCount: '',
    eventDate: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('Event registration submitted:', formData)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {isAmharic ? 'ለበዓል ይመዝገቡ' : 'Register for an Event'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {isAmharic ? 'የበዓል አይነት' : 'Event Type'}
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">{isAmharic ? 'ምረጥ' : 'Select'}</option>
              <option value="wedding">{isAmharic ? 'ጋብቻ' : 'Wedding'}</option>
              <option value="engagement">{isAmharic ? 'የጋብቻ ስምምነት' : 'Engagement'}</option>
              <option value="reception">{isAmharic ? 'ተቀባይ' : 'Reception'}</option>
              <option value="other">{isAmharic ? 'ሌላ' : 'Other'}</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {isAmharic ? 'የእንግዶች ብዛት' : 'Guest Count'}
            </label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {isAmharic ? 'የበዓል ቀን' : 'Event Date'}
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            {isAmharic ? 'ተጨማሪ መልዕክት' : 'Additional Message'}
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-semibold transition-colors"
        >
          {isAmharic ? 'ይመዝገቡ' : 'Register Now'}
        </button>
      </form>
    </div>
  )
}

export default RegisterEventForm
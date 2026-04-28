import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

const MyEventTickets = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        console.log('Fetching my event tickets...')
        console.log('User:', user)
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken')
        console.log('Token exists:', !!token)
        const data = await api.get('/payments/my-event-tickets')
        console.log('Received data:', data)
        setTickets(Array.isArray(data?.payments) ? data.payments : [])
      } catch (e) {
        console.error('Error loading tickets:', e)
        console.error('Error status:', e.status)
        console.error('Error data:', e.data)
        setError(e?.message || 'Failed to load tickets')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      load()
    } else {
      setError('Please log in to view your tickets')
    }
  }, [user])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 font-display">
            {isAmharic ? 'የእኔ የኢቨንት ቲኬቶች' : 'My Event Tickets'}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            {isAmharic ? 'ያገዙዉትን የኢቨንት ቲኬቶችን ይመልከቱ' : 'View your purchased event tickets'}
          </p>
        </div>

        {error ? (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-center text-neutral-600 dark:text-neutral-300">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-300">
            {isAmharic ? 'ምንም የኢቨንት ቲኬት አልገዘም' : 'No event tickets found'}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      {isAmharic ? 'ኢቨንት' : 'Event'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      {isAmharic ? 'ቀን' : 'Date'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      {isAmharic ? 'ዋጋ' : 'Amount'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      {isAmharic ? 'የግቢያው መለሪያ' : 'Transaction ID'}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      {isAmharic ? 'ቅደሚያ ኮድ' : 'QR Code'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      {isAmharic ? 'ሁኔታ' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{ticket.event?.title || '-'}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{ticket.event?.eventType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {ticket.event?.eventDate} {ticket.event?.eventTime?.slice?.(0,5)||''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        ETB {Number(ticket.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                        {ticket.transactionId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {ticket.status === 'completed' && ticket.qrCodeUrl ? (
                          <a href={ticket.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            {isAmharic ? 'ቅደሚያ' : 'QR'}
                          </a>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyEventTickets

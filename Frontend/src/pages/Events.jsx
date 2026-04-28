import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { getEvents } from '../api/events.js'
import { useAuth } from '../contexts/AuthContext'

const Events = () => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState([])

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getEvents({ limit: 100, status: 'published' })
        if (!active) return
        setEvents(Array.isArray(data?.events) ? data.events : [])
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Failed to load events')
        setEvents([])
      } finally {
        if (!active) return
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 font-display">
            {isAmharic ? 'ኢቨንቶች' : 'Events'}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-4">
            {isAmharic ? 'አስተዳዳሪ ያስቀመጣቸውን ኢቨንቶች ይመልከቱ እና ቲኬት ይግዙ' : 'See upcoming events posted by admin and buy tickets'}
          </p>
          {isAuthenticated() && (
            <Link
              to="/my-event-tickets"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              <Ticket size={18} />
              {isAmharic ? 'የእኔ የኢቨንት ቲኬቶች' : 'My Event Tickets'}
            </Link>
          )}
        </div>

        {error ? (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-center text-neutral-600 dark:text-neutral-300">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-300">
            {isAmharic ? 'ምንም ኢቨንት አልተገኘም' : 'No events found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                <div className="h-44 bg-neutral-200 dark:bg-neutral-700">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">
                    {ev.eventType}
                  </div>
                  <h3 className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {ev.eventDate} {String(ev.eventTime || '').slice(0, 5)}
                  </h3>
                  <h3 className="mt-1 text-sm font-medium text-purple-600 dark:text-purple-400">ETB {Number(ev.ticketPrice || 0).toLocaleString()}</h3>
                  {ev.totalTickets != null && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {isAmharic ? 'የቀረው ቲኬት' : 'Remaining'}: {typeof ev.remainingTickets === 'number' ? ev.remainingTickets : '-'} / {ev.totalTickets}
                    </div>
                  )}
                  <h3 className="mt-2 text-xl font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2">
                    {ev.title}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{ev.eventDate} {ev.eventTime?.slice?.(0, 5) || ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{ev.location || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">
                        ETB {Number(ev.ticketPrice || 0).toLocaleString()}
                      </div>
                      <Link
                        to={`/events/${ev.id}`}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        {isAmharic ? 'ዝርዝር' : 'Details'}
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated()) {
                        navigate('/login', { state: { from: { pathname: `/events/${ev.id}` } } })
                        return
                      }
                      navigate(`/events/${ev.id}/buy`)
                    }}
                    disabled={ev.totalTickets != null && typeof ev.remainingTickets === 'number' && ev.remainingTickets <= 0}
                    className={`mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg font-semibold ${
                      ev.totalTickets != null && typeof ev.remainingTickets === 'number' && ev.remainingTickets <= 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Ticket size={18} />
                    {ev.totalTickets != null && typeof ev.remainingTickets === 'number' && ev.remainingTickets <= 0
                      ? (isAmharic ? 'ቲኬት አልተለቀለም' : 'Sold Out')
                      : (isAmharic ? 'ቲኬት ግዛ' : 'Buy Ticket')
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events

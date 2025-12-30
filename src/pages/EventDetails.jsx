import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { getEventById } from '../api/events.js'
import { useAuth } from '../contexts/AuthContext'

const EventDetails = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [event, setEvent] = useState(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getEventById(id)
        if (!active) return
        setEvent(data)
      } catch (e) {
        if (!active) return
        setError(e?.message || 'Failed to load event')
        setEvent(null)
      } finally {
        if (!active) return
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-neutral-700 dark:text-neutral-200">{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
          {event.imageUrl ? (
            <div className="h-64 bg-neutral-200 dark:bg-neutral-700">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          ) : null}

          <div className="p-6">
            <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">
              {event.eventType}
            </div>
            <h1 className="mt-2 text-3xl font-bold text-neutral-800 dark:text-neutral-100">
              {event.title}
            </h1>

            <div className="mt-6 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{event.eventDate} {event.eventTime?.slice?.(0, 5) || ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <div className="flex flex-col">
                  <span>{event.location || '-'}</span>
                  {typeof event.latitude === 'number' && typeof event.longitude === 'number' ? (
                    <a
                      href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      {isAmharic ? 'ካርታ ላይ ክፈት' : 'Open in Maps'}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
              {event.description || ''}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                  ETB {Number(event.ticketPrice || 0).toLocaleString()}
                </div>
                {event.totalTickets != null && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isAmharic ? 'የቀረው ቲኬት' : 'Remaining'}: {typeof event.remainingTickets === 'number' ? event.remainingTickets : '-'} / {event.totalTickets}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated()) {
                    navigate('/login', { state: { from: { pathname: `/events/${event.id}` } } })
                    return
                  }
                  navigate(`/events/${event.id}/buy`)
                }}
                disabled={event.totalTickets != null && typeof event.remainingTickets === 'number' && event.remainingTickets <= 0}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold ${
                  event.totalTickets != null && typeof event.remainingTickets === 'number' && event.remainingTickets <= 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Ticket size={18} />
                {event.totalTickets != null && typeof event.remainingTickets === 'number' && event.remainingTickets <= 0
                  ? (isAmharic ? 'ቲኬት አልተለቀለም' : 'Sold Out')
                  : (isAmharic ? 'ቲኬት ግዛ' : 'Buy Ticket')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

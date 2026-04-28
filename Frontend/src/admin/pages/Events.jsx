// src/admin/pages/Events.jsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createEvent, deleteEvent, getEvents, updateEvent } from '../../api/events.js'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const MapRecenter = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    if (!center) return
    map.setView(center, map.getZoom() || 13)
  }, [center, map])
  return null
}

const MapClickCapture = ({ onPick }) => {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    const handler = (e) => {
      const lat = e?.latlng?.lat
      const lon = e?.latlng?.lng
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
      onPick(lat, lon)
    }
    map.on('click', handler)
    return () => {
      map.off('click', handler)
    }
  }, [map, onPick])
  return null
}

const Events = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [events, setEvents] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: 'other',
    location: '',
    latitude: '',
    longitude: '',
    eventDate: '',
    eventTime: '',
    ticketPrice: '',
    totalTickets: '',
    status: 'draft',
    imageFile: null,
  })

  const [placeQuery, setPlaceQuery] = useState('')
  const [placeResults, setPlaceResults] = useState([])
  const [placeSearching, setPlaceSearching] = useState(false)

  const mapCenter = useMemo(() => {
    const lat = Number(form.latitude)
    const lng = Number(form.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]
    return [9.03, 38.74]
  }, [form.latitude, form.longitude])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getEvents({ limit: 200 })
      const list = Array.isArray(data?.events) ? data.events : []
      setEvents(list)
    } catch (e) {
      setError(e?.message || 'Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      description: '',
      eventType: 'other',
      location: '',
      latitude: '',
      longitude: '',
      eventDate: '',
      eventTime: '',
      ticketPrice: '',
      totalTickets: '',
      status: 'draft',
      imageFile: null,
    })
    setPlaceQuery('')
    setPlaceResults([])
    setModalOpen(true)
  }

  const openEdit = (ev) => {
    setEditing(ev)
    setForm({
      title: ev?.title || '',
      description: ev?.description || '',
      eventType: ev?.eventType || 'other',
      location: ev?.location || '',
      latitude: ev?.latitude == null ? '' : String(ev.latitude),
      longitude: ev?.longitude == null ? '' : String(ev.longitude),
      eventDate: ev?.eventDate || '',
      eventTime: (ev?.eventTime || '').slice?.(0, 5) || '',
      ticketPrice: String(ev?.ticketPrice ?? ''),
      totalTickets: ev?.totalTickets == null ? '' : String(ev.totalTickets),
      status: ev?.status || 'published',
      imageFile: null,
    })
    setPlaceQuery('')
    setPlaceResults([])
    setModalOpen(true)
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        eventType: form.eventType,
        location: form.location || undefined,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        ticketPrice: Number(form.ticketPrice || 0),
        totalTickets: form.totalTickets === '' ? null : Number(form.totalTickets),
        status: form.status,
        imageFile: form.imageFile || undefined,
      }

      if (editing?.id) {
        await updateEvent(editing.id, payload)
      } else {
        await createEvent(payload)
      }

      setModalOpen(false)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err?.message || 'Failed to save event')
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm(t('confirm_delete') || 'Delete this event?')) return
    setError('')
    try {
      await deleteEvent(id)
      await load()
    } catch (e) {
      setError(e?.message || 'Failed to delete event')
    }
  }

  return (
    <div className="container px-6 mx-auto grid">
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{t('events') || 'Events'}</h2>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-gray-600 border border-transparent rounded-lg active:bg-gray-600 hover:bg-gray-700 focus:outline-none"
          >
            {t('refresh') || 'Refresh'}
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none"
          >
            {t('add_event') || 'Add Event'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="w-full p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-200 dark:border-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="w-full p-6 text-center bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="w-full p-6 text-center bg-white rounded-lg shadow-xs dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">{t('no_events_found') || 'No events found'}</p>
        </div>
      ) : (
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
          {events.map((ev) => (
            <div key={ev.id} className="flex flex-col bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
              <div className="h-44 bg-gray-200 dark:bg-gray-700">
                {ev.imageUrl ? <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="p-4 flex-grow">
                <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">{ev.eventType}</div>
                <div className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-200">{ev.title}</div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {ev.eventDate} {String(ev.eventTime || '').slice(0, 5)}
                </div>
                <div className="mt-2 text-sm font-bold text-purple-600 dark:text-purple-400">ETB {Number(ev.ticketPrice || 0).toLocaleString()}</div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between">
                <button
                  onClick={() => openEdit(ev)}
                  className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600"
                >
                  {t('edit') || 'Edit'}
                </button>
                <button
                  onClick={() => onDelete(ev.id)}
                  className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600"
                >
                  {t('delete') || 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {editing ? (t('edit_event') || 'Edit Event') : (t('add_event') || 'Add Event')}
              </div>
              <button
                onClick={() => {
                  setModalOpen(false)
                  setEditing(null)
                }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSave} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm((p) => ({ ...p, eventType: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                  >
                    {['wedding', 'birthday', 'corporate', 'decoration', 'catering', 'other'].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                  >
                    {['draft', 'published'].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Name</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Addis Ababa, Bole"
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Location From Map</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={placeQuery}
                      onChange={(e) => setPlaceQuery(e.target.value)}
                      placeholder="Search place (example: Bole Addis Ababa)"
                      className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const q = String(placeQuery || '').trim()
                        if (!q) return
                        try {
                          setPlaceSearching(true)
                          const resp = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`
                          )
                          const json = await resp.json()
                          setPlaceResults(Array.isArray(json) ? json : [])
                        } catch {
                          setPlaceResults([])
                        } finally {
                          setPlaceSearching(false)
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                      disabled={placeSearching}
                    >
                      {placeSearching ? (t('loading') || 'Loading...') : (t('search') || 'Search')}
                    </button>
                  </div>

                  {placeResults.length ? (
                    <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      {placeResults.map((r) => (
                        <button
                          key={r.place_id}
                          type="button"
                          onClick={() => {
                            const lat = Number(r.lat)
                            const lon = Number(r.lon)
                            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return
                            setForm((p) => ({
                              ...p,
                              latitude: String(lat),
                              longitude: String(lon),
                              location: p.location || r.display_name,
                            }))
                            setPlaceResults([])
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          {r.display_name}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapRecenter center={mapCenter} />
                      {Number.isFinite(Number(form.latitude)) && Number.isFinite(Number(form.longitude)) ? (
                        <Marker position={[Number(form.latitude), Number(form.longitude)]} />
                      ) : null}
                      <MapClickCapture
                        onPick={(lat, lon) => {
                          setForm((p) => ({ ...p, latitude: String(lat), longitude: String(lon) }))
                        }}
                      />
                    </MapContainer>
                  </div>

                  {Number.isFinite(Number(form.latitude)) && Number.isFinite(Number(form.longitude)) ? (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Selected: {Number(form.latitude).toFixed(6)}, {Number(form.longitude).toFixed(6)}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Search a place or click on the map to choose the location.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={form.eventTime}
                    onChange={(e) => setForm((p) => ({ ...p, eventTime: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticket Price (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.ticketPrice}
                    onChange={(e) => setForm((p) => ({ ...p, ticketPrice: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Tickets</label>
                  <input
                    type="number"
                    min="0"
                    value={form.totalTickets}
                    onChange={(e) => setForm((p) => ({ ...p, totalTickets: e.target.value }))}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))}
                    className="block w-full text-sm text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false)
                    setEditing(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  {t('save') || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Events

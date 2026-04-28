import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { approvePayment, getAdminPayments } from '../../api/payments'

const Payments = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payments, setPayments] = useState([])
  const [approvingId, setApprovingId] = useState(null)

  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pending'), [payments])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminPayments({ limit: 50 })
      setPayments(data?.payments || [])
    } catch (e) {
      setError(e?.message || 'Failed to load payments')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onApprove = async (paymentId) => {
    setApprovingId(paymentId)
    setError('')
    try {
      await approvePayment(paymentId)
      await load()
    } catch (e) {
      setError(e?.message || 'Failed to approve payment')
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">{t('payments') || 'Payments'}</h2>
        <button
          onClick={load}
          className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
        >
          {t('refresh') || 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">{error}</div>
      ) : null}

      <div className="w-full overflow-hidden rounded-lg shadow-xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3">{t('id') || 'ID'}</th>
                <th className="px-4 py-3">{t('booking') || 'Booking'}</th>
                <th className="px-4 py-3">{t('customer') || 'Customer'}</th>
                <th className="px-4 py-3">{t('amount') || 'Amount'}</th>
                <th className="px-4 py-3">{t('method') || 'Method'}</th>
                <th className="px-4 py-3">{t('proof') || 'Proof'}</th>
                <th className="px-4 py-3">{t('status') || 'Status'}</th>
                <th className="px-4 py-3">{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-400">
                    {t('no_payments_found') || 'No pending payments'}
                  </td>
                </tr>
              ) : (
                pendingPayments.map((p) => (
                  <tr key={p.id} className="text-gray-700 dark:text-gray-400">
                    <td className="px-4 py-3 text-sm">{String(p.id).slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm">{p.bookingId || p?.booking?.id || ''}</td>
                    <td className="px-4 py-3 text-sm">{p?.booking?.customerName || ''}</td>
                    <td className="px-4 py-3 text-sm">{p.amount?.toLocaleString?.() || p.amount} {p.currency || 'ETB'}</td>
                    <td className="px-4 py-3 text-sm">{p.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm">
                      {p.proofImageUrl ? (
                        <a href={p.proofImageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={p.proofImageUrl}
                            alt="proof"
                            className="w-14 h-14 object-cover rounded border border-gray-200 dark:border-gray-600"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('no_proof') || 'No proof'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{p.status}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const bookingId = p.bookingId || p?.booking?.id
                            if (!bookingId) return
                            navigate(`/admin/bookings?search=${encodeURIComponent(String(bookingId))}`)
                          }}
                          className="px-3 py-2 text-sm font-medium leading-5 text-gray-700 transition-colors duration-150 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:shadow-outline-gray"
                        >
                          {t('view_booking') || 'View Booking'}
                        </button>

                        <button
                          onClick={() => onApprove(p.id)}
                          disabled={approvingId === p.id || !p.proofImageUrl}
                          className="px-3 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg active:bg-green-600 hover:bg-green-700 focus:outline-none focus:shadow-outline-green disabled:opacity-60"
                        >
                          {approvingId === p.id ? (t('approving') || 'Approving...') : (t('approve') || 'Approve')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Payments

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, Ticket } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PaymentForm from '../components/PaymentForm'
import { getEventById, proceedEventPayment } from '../api/events.js'
import { uploadPaymentProof } from '../api/payments.js'

const EventBuyTicket = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [event, setEvent] = useState(null)
  const [paymentInit, setPaymentInit] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofUploading, setProofUploading] = useState(false)
  const [proofUploaded, setProofUploaded] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true })
      return
    }
  }, [isAuthenticated, navigate])

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
      } finally {
        if (!active) return
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  const amount = useMemo(() => Number(event?.ticketPrice || 0), [event])

  const handlePaymentSuccess = (data) => {
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const init = await proceedEventPayment(id, {
          paymentMethod: data.method,
          phoneNumber: data.method === 'telebirr' || data.method === 'cbe' ? data.phone : undefined,
        })
        setPaymentInit(init)
        setProofFile(null)
        setProofUploaded(false)
      } catch (e) {
        setError(e?.message || 'Failed to initiate payment')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-neutral-100">
            {isAmharic ? 'ቲኬት ክፍያ' : 'Ticket Payment'}
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            {event?.title || ''}
          </p>
        </div>

        {error ? (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {paymentInit?.payment ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-center mb-6">
              <Ticket className="text-emerald-600 dark:text-emerald-400 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                {isAmharic ? 'ክፍያ ተጀምሯል (ማረጋገጫ ይፈልጋል)' : 'Payment Initiated (Admin approval required)'}
              </h2>
            </div>

            {paymentInit?.receiver ? (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 mb-4">
                <div className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                  {isAmharic ? 'የመቀበያ መረጃ' : 'Receiver Information'}
                </div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                  {paymentInit.receiver.receiverName ? <div>{paymentInit.receiver.receiverName}</div> : null}
                  {paymentInit.receiver.receiverPhone ? <div>{paymentInit.receiver.receiverPhone}</div> : null}
                  {paymentInit.receiver.receiverAccountNumber ? <div>{paymentInit.receiver.receiverAccountNumber}</div> : null}
                  {paymentInit.receiver.note ? <div>{paymentInit.receiver.note}</div> : null}
                </div>
              </div>
            ) : null}

            {paymentInit?.instructions?.steps?.length ? (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 mb-4">
                <div className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                  {paymentInit.instructions.title || (isAmharic ? 'መመሪያ' : 'Instructions')}
                </div>
                <ol className="list-decimal pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
                  {paymentInit.instructions.steps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
                {paymentInit.instructions.note ? (
                  <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">{paymentInit.instructions.note}</div>
                ) : null}
              </div>
            ) : null}

            <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                {isAmharic ? 'የክፍያ ማስረጃ (ስክሪንሾት) ያስገቡ' : 'Upload Payment Proof (Screenshot)'}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  setProofFile(f || null)
                  setProofUploaded(false)
                }}
                className="block w-full text-sm text-neutral-700 dark:text-neutral-200"
              />

              <button
                type="button"
                disabled={!paymentInit?.payment?.id || !proofFile || proofUploading}
                onClick={async () => {
                  if (!paymentInit?.payment?.id || !proofFile) return
                  try {
                    setProofUploading(true)
                    await uploadPaymentProof(paymentInit.payment.id, proofFile)
                    setProofUploaded(true)
                  } catch (e) {
                    setError(e?.message || 'Failed to upload proof')
                    setProofUploaded(false)
                  } finally {
                    setProofUploading(false)
                  }
                }}
                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {proofUploading ? (isAmharic ? 'በመላክ ላይ...' : 'Uploading...') : (isAmharic ? 'ማስረጃ ላክ' : 'Submit Proof')}
              </button>

              {proofUploaded ? (
                <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                  {isAmharic ? 'ተልኳል። እባክዎ የአስተዳዳሪ ማረጋገጫ ይጠብቁ።' : 'Uploaded. Please wait for admin approval.'}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="mt-3 w-full text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
              >
                {isAmharic ? 'ወደ መገልገያ ሂድ' : 'Go to Dashboard'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-center mb-6">
              <CreditCard className="text-emerald-600 dark:text-emerald-400 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                {isAmharic ? 'ክፍያ ይፈጽሙ' : 'Complete Payment'}
              </h2>
            </div>

            <div className="bg-emerald-50 dark:bg-neutral-700/50 p-4 rounded-lg mb-6 border border-emerald-100 dark:border-neutral-600">
              <div className="flex justify-between font-bold">
                <span className="text-neutral-800 dark:text-neutral-100">{isAmharic ? 'ጠቅላላ' : 'Total'}</span>
                <span className="text-emerald-700 dark:text-emerald-400">{amount.toLocaleString()} Birr</span>
              </div>
            </div>

            <PaymentForm
              onSuccess={handlePaymentSuccess}
              amount={amount}
              initialData={{
                customerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                phone: user?.phone || '',
                email: user?.email || '',
                serviceName: event?.title || 'Event Ticket',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default EventBuyTicket

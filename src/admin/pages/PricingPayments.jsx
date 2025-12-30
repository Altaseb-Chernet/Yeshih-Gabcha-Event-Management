import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../contexts/ToastContext'
import {
  getAdminPricingRules,
  upsertAdminPricingRule,
  getAdminPaymentMethods,
  upsertAdminPaymentMethod,
} from '../../api/adminConfig'

const PricingPayments = () => {
  const { t } = useTranslation()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [savingKey, setSavingKey] = useState('')
  const [error, setError] = useState('')

  const [pricing, setPricing] = useState({})
  const [methods, setMethods] = useState({})

  const eventTypes = useMemo(
    () => [
      { id: 'wedding', label: t('wedding') || 'Wedding' },
      { id: 'birthday', label: t('birthday') || 'Birthday' },
      { id: 'corporate', label: t('corporate') || 'Corporate' },
      { id: 'other', label: t('other') || 'Other' },
    ],
    [t]
  )

  const paymentMethods = useMemo(
    () => [
      { id: 'telebirr', label: 'Telebirr' },
      { id: 'cbe', label: 'CBE' },
      { id: 'commercial', label: 'Commercial Bank' },
      { id: 'abyssinia', label: 'Abyssinia Bank' },
    ],
    []
  )

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [pricingRes, methodsRes] = await Promise.all([
        getAdminPricingRules(),
        getAdminPaymentMethods(),
      ])

      const pricingMap = {}
      ;(pricingRes?.rules || []).forEach((r) => {
        pricingMap[r.eventType] = {
          basePrice: String(r.basePrice ?? ''),
          perGuest: String(r.perGuest ?? ''),
          perHour: String(r.perHour ?? ''),
          defaultHours: String(r.defaultHours ?? 5),
        }
      })

      const methodMap = {}
      ;(methodsRes?.configs || []).forEach((m) => {
        methodMap[m.method] = {
          receiverName: m.receiverName || '',
          receiverPhone: m.receiverPhone || '',
          receiverAccountNumber: m.receiverAccountNumber || '',
          note: m.note || '',
          active: !!m.active,
        }
      })

      setPricing(pricingMap)
      setMethods(methodMap)
    } catch (e) {
      setError(e?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSavePricing = async (eventType) => {
    setSavingKey(`pricing:${eventType}`)
    setError('')
    try {
      const cur = pricing[eventType] || {}
      const payload = {
        basePrice: Number(cur.basePrice || 0),
        perGuest: Number(cur.perGuest || 0),
        perHour: Number(cur.perHour || 0),
        defaultHours: Number(cur.defaultHours || 5),
      }
      await upsertAdminPricingRule(eventType, payload)
      showToast('Saved', 'success')
      await load()
    } catch (e) {
      setError(e?.message || 'Failed to save pricing')
      showToast(e?.message || 'Failed', 'error')
    } finally {
      setSavingKey('')
    }
  }

  const onSaveMethod = async (methodId) => {
    setSavingKey(`method:${methodId}`)
    setError('')
    try {
      const normalized = methodId === 'abyssinia' ? 'abyssinia' : methodId
      const cur = methods[methodId] || methods[normalized] || {}
      const payload = {
        receiverName: cur.receiverName || '',
        receiverPhone: cur.receiverPhone || '',
        receiverAccountNumber: cur.receiverAccountNumber || '',
        note: cur.note || '',
        active: !!cur.active,
      }
      await upsertAdminPaymentMethod(normalized, payload)
      showToast('Saved', 'success')
      await load()
    } catch (e) {
      setError(e?.message || 'Failed to save payment method')
      showToast(e?.message || 'Failed', 'error')
    } finally {
      setSavingKey('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('pricing') || 'Pricing'} & {t('payments') || 'Payments'}
        </h2>
        <button
          onClick={load}
          className="px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
        >
          {t('refresh') || 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t('pricing') || 'Pricing'}
          </h3>

          {loading ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">Loading...</div>
          ) : (
            <div className="space-y-4">
              {eventTypes.map((et) => {
                const cur = pricing[et.id] || { basePrice: '', perGuest: '', perHour: '', defaultHours: '5' }
                const isSaving = savingKey === `pricing:${et.id}`

                return (
                  <div key={et.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{et.label}</div>
                      <button
                        onClick={() => onSavePricing(et.id)}
                        disabled={isSaving}
                        className="px-3 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-60"
                      >
                        {isSaving ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Base (Birr)</div>
                        <input
                          value={cur.basePrice}
                          onChange={(e) =>
                            setPricing((p) => ({ ...p, [et.id]: { ...cur, basePrice: e.target.value.replace(/\D/g, '') } }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Per Guest (Birr)</div>
                        <input
                          value={cur.perGuest}
                          onChange={(e) =>
                            setPricing((p) => ({ ...p, [et.id]: { ...cur, perGuest: e.target.value.replace(/\D/g, '') } }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Per Hour (Birr)</div>
                        <input
                          value={cur.perHour}
                          onChange={(e) =>
                            setPricing((p) => ({ ...p, [et.id]: { ...cur, perHour: e.target.value.replace(/\D/g, '') } }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Default Hours</div>
                        <input
                          value={cur.defaultHours}
                          onChange={(e) =>
                            setPricing((p) => ({ ...p, [et.id]: { ...cur, defaultHours: e.target.value.replace(/\D/g, '') } }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t('payments') || 'Payments'}
          </h3>

          {loading ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">Loading...</div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((m) => {
                const cur = methods[m.id] || methods[m.id === 'abyssinia' ? 'abisiniya' : m.id] || {
                  receiverName: '',
                  receiverPhone: '',
                  receiverAccountNumber: '',
                  note: '',
                  active: true,
                }

                const isSaving = savingKey === `method:${m.id}`

                return (
                  <div key={m.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{m.label}</div>
                      <button
                        onClick={() => onSaveMethod(m.id)}
                        disabled={isSaving}
                        className="px-3 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-60"
                      >
                        {isSaving ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Receiver Name</div>
                        <input
                          value={cur.receiverName}
                          onChange={(e) => setMethods((p) => ({ ...p, [m.id]: { ...cur, receiverName: e.target.value } }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Receiver Phone</div>
                        <input
                          value={cur.receiverPhone}
                          onChange={(e) => setMethods((p) => ({ ...p, [m.id]: { ...cur, receiverPhone: e.target.value } }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Receiver Account</div>
                        <input
                          value={cur.receiverAccountNumber}
                          onChange={(e) =>
                            setMethods((p) => ({ ...p, [m.id]: { ...cur, receiverAccountNumber: e.target.value } }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Note</div>
                        <input
                          value={cur.note}
                          onChange={(e) => setMethods((p) => ({ ...p, [m.id]: { ...cur, note: e.target.value } }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={!!cur.active}
                          onChange={(e) => setMethods((p) => ({ ...p, [m.id]: { ...cur, active: e.target.checked } }))}
                        />
                        Active
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PricingPayments

import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { verifyEmailToken } from '../api/security.js'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const token = searchParams.get('token')
        if (!token) {
          showToast('Verification token is missing', 'error')
          return
        }

        await verifyEmailToken(token)
        showToast('Email verified successfully. Please login.', 'success')
        navigate('/login', { replace: true })
      } catch (e) {
        showToast(e?.message || 'Email verification failed', 'error')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    run()
    return () => {
      active = false
    }
  }, [navigate, searchParams, showToast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700 w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Verify Email</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
          {loading ? 'Verifying...' : 'You can close this page.'}
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail

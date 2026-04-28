import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../utils/api.js'
import { useToast } from '../contexts/ToastContext'

const resetSchema = (isAmharic) =>
  z
    .object({
      newPassword: z
        .string()
        .min(1, { message: isAmharic ? 'አዲስ የይለፍ ቃል ያስፈልጋል' : 'New password is required' })
        .min(6, { message: isAmharic ? 'ቢያንስ 6 ቁምፊ ያስፈልጋል' : 'Password must be at least 6 characters' }),
      confirmPassword: z
        .string()
        .min(1, { message: isAmharic ? 'ማረጋገጫ ያስፈልጋል' : 'Confirmation is required' }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: isAmharic ? 'የይለፍ ቃሎች አይጣጣሙም' : 'Passwords do not match',
      path: ['confirmPassword'],
    })

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { showToast } = useToast()

  const token = searchParams.get('token') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema(isAmharic)),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const [loading, setLoading] = useState(false)

  const onSubmit = async (values) => {
    if (!token) {
      showToast(isAmharic ? 'ቶክን ጎድሏል' : 'Reset token is missing', 'error')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: values.newPassword })
      showToast(
        isAmharic ? 'የይለፍ ቃል ተቀይሯል። እባክዎ ይግቡ።' : 'Password reset successfully. Please login.',
        'success'
      )
      navigate('/login', { replace: true })
    } catch (e) {
      showToast(e?.message || (isAmharic ? 'ማደስ አልተሳካም' : 'Reset failed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg dark:shadow-neutral-900/50 p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
              {isAmharic ? 'የይለፍ ቃል አድስ' : 'Reset Password'}
            </h1>
            <Link
              to="/login"
              className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              {isAmharic ? 'ግባ' : 'Login'}
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                {isAmharic ? 'አዲስ የይለፍ ቃል' : 'New Password'}
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.newPassword ? 'text-red-500' : 'text-neutral-400'}`}
                />
                <input
                  type="password"
                  {...register('newPassword')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-200 ${
                    errors.newPassword ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                />
              </div>
              {errors.newPassword && (
                <div className="flex items-center mt-1">
                  <AlertCircle size={14} className="text-red-500 mr-1" />
                  <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                {isAmharic ? 'ያረጋግጡ' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-500' : 'text-neutral-400'}`}
                />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 dark:bg-neutral-700 dark:text-neutral-100 transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center mt-1">
                  <AlertCircle size={14} className="text-red-500 mr-1" />
                  <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isAmharic ? 'በመቀየር ላይ...' : 'Updating...') : (isAmharic ? 'አድስ' : 'Reset Password')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword

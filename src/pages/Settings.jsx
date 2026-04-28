import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const Settings = () => {
  const { i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const { user, resendVerificationEmail, enableTwoFactor, disableTwoFactor, changePassword, refreshMe } = useAuth()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    i18n.changeLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  const handleResendVerification = async () => {
    setSaving(true)
    try {
      await resendVerificationEmail()
      showToast(isAmharic ? 'የማረጋገጫ ኢሜይል ተልኳል' : 'Verification email sent', 'success')
    } catch (e) {
      showToast(e?.message || (isAmharic ? 'ኢሜይል መላክ አልተሳካም' : 'Failed to send verification email'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle2FA = async (checked) => {
    setSaving(true)
    try {
      if (checked) {
        await enableTwoFactor()
        showToast(isAmharic ? '2FA ተከፍቷል' : '2FA enabled', 'success')
      } else {
        await disableTwoFactor()
        showToast(isAmharic ? '2FA ተዘግቷል' : '2FA disabled', 'success')
      }
      await refreshMe().catch(() => null)
    } catch (e) {
      showToast(e?.message || (isAmharic ? '2FA መቀየር አልተሳካም' : 'Failed to update 2FA'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwd.currentPassword || !pwd.newPassword) {
      showToast(isAmharic ? 'እባክዎ ሁሉንም መስኮች ይሙሉ' : 'Please fill all fields', 'error')
      return
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      showToast(isAmharic ? 'የይለፍ ቃሎች አይጣጣሙም' : 'Passwords do not match', 'error')
      return
    }

    setSaving(true)
    try {
      await changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      showToast(isAmharic ? 'የይለፍ ቃል ተቀይሯል' : 'Password changed successfully', 'success')
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e2) {
      showToast(e2?.message || (isAmharic ? 'የይለፍ ቃል መቀየር አልተሳካም' : 'Failed to change password'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700"
        >
          <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">
            {isAmharic ? 'ማስተካከያ' : 'Settings'}
          </h1>

          <div>
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
              {isAmharic ? 'ቋንቋ' : 'Language'}
            </h2>
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="w-full md:w-64 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
            </select>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
              {isAmharic ? 'ደህንነት' : 'Security'}
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {isAmharic ? 'ኢሜይል ማረጋገጫ' : 'Email Verification'}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {user?.emailVerified ? (isAmharic ? 'ተረጋግጧል' : 'Verified') : (isAmharic ? 'አልተረጋገጠም' : 'Not verified')}
                  </p>
                </div>
                {!user?.emailVerified && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isAmharic ? 'እንደገና ላክ' : 'Resend'}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {isAmharic ? 'ሁለት ደረጃ ማረጋገጫ (2FA)' : 'Two-factor authentication (2FA)'}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {isAmharic ? 'በመግባት ጊዜ OTP ይፈልጋል' : 'Requires OTP at login'}
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!user?.twoFactorEnabled}
                    onChange={(e) => handleToggle2FA(e.target.checked)}
                    disabled={saving || !user?.emailVerified}
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-200">
                    {user?.twoFactorEnabled ? (isAmharic ? 'ክፈት' : 'On') : (isAmharic ? 'ዝጋ' : 'Off')}
                  </span>
                </label>
              </div>

              {!user?.emailVerified && (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {isAmharic ? '2FA ለማንቃት ኢሜይልዎን ማረጋገጥ አለብዎት' : 'Verify your email before enabling 2FA.'}
                </p>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <p className="font-medium text-neutral-800 dark:text-neutral-100">
                  {isAmharic ? 'የይለፍ ቃል ቀይር' : 'Change Password'}
                </p>
                <input
                  type="password"
                  value={pwd.currentPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder={isAmharic ? 'አሁን ያለው የይለፍ ቃል' : 'Current password'}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-neutral-100"
                />
                <input
                  type="password"
                  value={pwd.newPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder={isAmharic ? 'አዲስ የይለፍ ቃል' : 'New password'}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-neutral-100"
                />
                <input
                  type="password"
                  value={pwd.confirmPassword}
                  onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder={isAmharic ? 'አዲስ የይለፍ ቃል አረጋግጥ' : 'Confirm new password'}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-neutral-100"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {isAmharic ? 'ቀይር' : 'Change'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings

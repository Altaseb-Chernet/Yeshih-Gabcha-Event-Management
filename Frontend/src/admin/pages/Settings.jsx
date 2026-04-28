import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const Settings = () => {
  const { i18n, t } = useTranslation()
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
      showToast('Verification email sent', 'success')
    } catch (e) {
      showToast(e?.message || 'Failed to send verification email', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle2FA = async (checked) => {
    setSaving(true)
    try {
      if (checked) {
        await enableTwoFactor()
        showToast('2FA enabled', 'success')
      } else {
        await disableTwoFactor()
        showToast('2FA disabled', 'success')
      }
      await refreshMe().catch(() => null)
    } catch (e) {
      showToast(e?.message || 'Failed to update 2FA', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pwd.currentPassword || !pwd.newPassword) {
      showToast('Please fill all fields', 'error')
      return
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setSaving(true)
    try {
      await changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      showToast('Password changed successfully', 'success')
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e2) {
      showToast(e2?.message || 'Failed to change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container px-6 mx-auto grid">
      <div className="my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('settings')}
        </h2>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t('language') || 'Language'}
          </h3>
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <option value="en">English</option>
            <option value="am">Amharic</option>
          </select>
        </div>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t('security') || 'Security'}
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Email Verification</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.emailVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
              {!user?.emailVerified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  Resend
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">2FA (OTP via Email)</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Requires OTP at login</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!user?.twoFactorEnabled}
                  onChange={(e) => handleToggle2FA(e.target.checked)}
                  disabled={saving || !user?.emailVerified}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {user?.twoFactorEnabled ? 'On' : 'Off'}
                </span>
              </label>
            </div>

            {!user?.emailVerified && (
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Verify your email before enabling 2FA.</p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <p className="font-medium text-gray-800 dark:text-gray-200">Change Password</p>
              <input
                type="password"
                value={pwd.currentPassword}
                onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Current password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
              <input
                type="password"
                value={pwd.newPassword}
                onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="New password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
              <input
                type="password"
                value={pwd.confirmPassword}
                onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Change
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

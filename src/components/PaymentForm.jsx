import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const PaymentForm = ({ onSuccess, amount, initialData = {} }) => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'
  const [selectedMethod, setSelectedMethod] = useState('')
  const [accountInfo, setAccountInfo] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(initialData.phone || '')
  const [email, setEmail] = useState(initialData.email || '')
  const [customerName, setCustomerName] = useState(initialData.customerName || '')

  const paymentMethods = [
    { 
      id: 'telebirr', 
      name: 'Telebirr', 
      icon: TelebirrIcon, 
      inputType: 'phone',
      color: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-300 dark:border-green-600',
      textColor: 'text-green-700 dark:text-green-300'
    },
    { 
      id: 'cbe', 
      name: 'CBE', 
      icon: CBEIcon, 
      inputType: 'phone',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-600',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    { 
      id: 'commercial', 
      name: 'Commercial Bank', 
      icon: CommercialBankIcon, 
      inputType: 'account',
      color: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-300 dark:border-purple-600',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
    { 
      id: 'abyssinia', 
      name: 'Abyssinia Bank', 
      icon: AbyssiniaBankIcon, 
      inputType: 'account',
      color: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-300 dark:border-red-600',
      textColor: 'text-red-700 dark:text-red-300'
    },
  ]

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId)
    setAccountInfo('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const transactionId = `TXN-${Date.now().toString().slice(-8)}`
    const currentDate = new Date().toLocaleDateString()
    
    const paymentData = {
      amount: amount,
      method: selectedMethod,
      accountInfo: accountInfo,
      phone: phoneNumber,
      email: email,
      customerName: customerName,
      infoType: paymentMethods.find(m => m.id === selectedMethod)?.inputType || 'phone',
      transactionId: transactionId,
      date: currentDate,
      serviceName: initialData.serviceName || 'Wedding Service'
    }
    onSuccess(paymentData)
  }

  const getInputLabel = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod)
    if (!method) return isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'
    
    return method.inputType === 'account' 
      ? (isAmharic ? 'መለያ ቁጥር' : 'Account Number')
      : (isAmharic ? 'ስልክ ቁጥር' : 'Phone Number')
  }

  const getInputPlaceholder = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod)
    if (!method) return isAmharic ? '09XXXXXXXX' : '09XXXXXXXX'
    
    return method.inputType === 'account' 
      ? (isAmharic ? 'መለያ ቁጥር ያስገቡ' : 'Enter account number')
      : (isAmharic ? '09XXXXXXXX' : '09XXXXXXXX')
  }

  const getInputPattern = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod)
    if (!method) return '[0-9]{10}'
    
    return method.inputType === 'account' 
      ? '[0-9]{8,16}'
      : '[0-9]{10}'
  }

  const getInputTitle = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod)
    if (!method) return isAmharic ? '10-ዲጂት ስልክ ቁጥር' : '10-digit phone number'
    
    return method.inputType === 'account' 
      ? (isAmharic ? '8-16 ዲጂት መለያ ቁጥር' : '8-16 digit account number')
      : (isAmharic ? '10-ዲጂት ስልክ ቁጥር' : '10-digit phone number')
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="mb-6 bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-3">
            {isAmharic ? 'የደንበኛ መረጃ' : 'Customer Information'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                {isAmharic ? 'ሙሉ ስም' : 'Full Name'} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100 text-sm"
                placeholder={isAmharic ? 'ሙሉ ስም ያስገቡ' : 'Enter your full name'}
                required
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100 text-sm"
                placeholder="0911223344"
                pattern="[0-9]{10}"
                title={isAmharic ? '10-ዲጂት ስልክ ቁጥር' : '10-digit phone number'}
                required
              />
            </div>
            
            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 mb-2 text-sm font-medium">
                {isAmharic ? 'ኢሜይል' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100 text-sm"
                placeholder={isAmharic ? 'ኢሜይል ያስገቡ' : 'Enter your email'}
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-neutral-700 mb-2 font-medium">
            {isAmharic ? 'የክፍያ ዘዴ ይምረጡ' : 'Select Payment Method'} *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center justify-center h-full min-h-[120px] ${
                    selectedMethod === method.id
                      ? `${method.borderColor} ${method.color} ${method.textColor}`
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-300 text-neutral-700 dark:text-neutral-300'
                  }`}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <div className="mb-3">
                    <Icon />
                  </div>
                  <div className="text-sm font-medium">{method.name}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {method.inputType === 'account' 
                      ? (isAmharic ? 'መለያ ቁጥር' : 'Account') 
                      : (isAmharic ? 'ስልክ' : 'Phone')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Amount Display */}
        <div className="mb-6">
          <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
            {isAmharic ? 'መጠን' : 'Amount'}
          </label>
          <div className="relative">
            <div className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium">
              {amount.toLocaleString()} Birr
            </div>
          </div>
        </div>

        {/* Account/Phone Input */}
        {selectedMethod && (
          <div className="mb-6">
            <label className="block text-neutral-700 dark:text-neutral-300 mb-2 font-medium">
              {getInputLabel()} *
            </label>
            <input
              type="text"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-neutral-100"
              placeholder={getInputPlaceholder()}
              pattern={getInputPattern()}
              title={getInputTitle()}
              required
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {getInputTitle()}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-black hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedMethod || !accountInfo || !customerName || !phoneNumber}
        >
          {isAmharic ? 'ክፍያ ይፈጽሙ' : 'Process Payment'}
        </button>
      </form>

      {/* Payment Method Instructions */}
      {selectedMethod && (
        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
            {isAmharic ? 'መግለጫ' : 'Instructions'}
          </h3>
          {selectedMethod === 'telebirr' && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isAmharic 
                ? 'የTelebirr ስልክ ቁጥርዎን ያስገቡ። ክፍያው በTelebirr መተግበሪያዎ ውስጥ ይፈጸማል።'
                : 'Enter your Telebirr phone number. Payment will be processed through your Telebirr app.'}
            </p>
          )}
          {selectedMethod === 'cbe' && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isAmharic 
                ? 'የCBE ብርሀን ባንክ ስልክ ቁጥርዎን ያስገቡ።'
                : 'Enter your CBE Birhan Bank phone number.'}
            </p>
          )}
          {selectedMethod === 'commercial' && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isAmharic 
                ? 'የንግድ ባንክ መለያ ቁጥርዎን ያስገቡ። የስልክ ቁጥርዎን ከላይ በደንበኛ መረጃ ይግቡ።'
                : 'Enter your Commercial Bank account number. Your phone number should be entered in the customer information section above.'}
            </p>
          )}
          {selectedMethod === 'abyssinia' && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {isAmharic 
                ? 'የአቢሲኒያ ባንክ መለያ ቁጥርዎን ያስገቡ። የስልክ ቁጥርዎን ከላይ በደንበኛ መረጃ ይግቡ።'
                : 'Enter your Abyssinia Bank account number. Your phone number should be entered in the customer information section above.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// SVG Icon Components
const TelebirrIcon = () => (
  <div className="w-10 h-10 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#34D399"/>
      <path d="M20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28Z" fill="white"/>
      <path d="M20 24C22.2091 24 24 22.2091 24 20C24 17.7909 22.2091 16 20 16C17.7909 16 16 17.7909 16 20C16 22.2091 17.7909 24 20 24Z" fill="#34D399"/>
      <path d="M20 21C20.5523 21 21 20.5523 21 20C21 19.4477 20.5523 19 20 19C19.4477 19 19 19.4477 19 20C19 20.5523 19.4477 21 20 21Z" fill="white"/>
    </svg>
  </div>
)

const CBEIcon = () => (
  <div className="w-10 h-10 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#3B82F6"/>
      <path d="M12 20H28M20 12V28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="6" fill="white"/>
      <circle cx="20" cy="20" r="3" fill="#3B82F6"/>
    </svg>
  </div>
)

const CommercialBankIcon = () => (
  <div className="w-10 h-10 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#8B5CF6"/>
      <rect x="12" y="16" width="16" height="8" rx="2" fill="white"/>
      <rect x="12" y="12" width="2" height="12" fill="white"/>
      <rect x="26" y="12" width="2" height="12" fill="white"/>
      <path d="M16 20H24" stroke="#8B5CF6" strokeWidth="1.5"/>
    </svg>
  </div>
)

const AbyssiniaBankIcon = () => (
  <div className="w-10 h-10 flex items-center justify-center">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#EF4444"/>
      <path d="M20 28L14 20H26L20 28Z" fill="white"/>
      <path d="M20 12L26 20H14L20 12Z" fill="white"/>
      <circle cx="20" cy="20" r="3" fill="#EF4444"/>
    </svg>
  </div>
)

export default PaymentForm
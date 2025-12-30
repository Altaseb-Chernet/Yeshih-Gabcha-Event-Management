import { useState } from 'react'
import PaymentForm from '../components/PaymentForm'
import QRCodeDisplay from '../components/QRCodeDisplay'

const Payment = () => {
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentData, setPaymentData] = useState(null)

  const handlePaymentSuccess = (data) => {
    setPaymentData({
      amount: data.amount,
      method: data.method,
      transactionId: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleDateString()
    })
    setPaymentComplete(true)
  }

  return (
    <div className="min-h-screen py-12 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Payment
        </h1>
        
        {paymentComplete ? (
          <QRCodeDisplay paymentData={paymentData} />
        ) : (
          <PaymentForm onSuccess={handlePaymentSuccess} />
        )}
      </div>
    </div>
  )
}

export default Payment
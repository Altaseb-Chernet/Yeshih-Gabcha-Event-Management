import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { Download, CheckCircle } from 'lucide-react'

const QRCodeDisplay = ({ paymentData }) => {
  const { t, i18n } = useTranslation()
  const isAmharic = i18n.language === 'am'

  // Function to create human-readable QR code content with ALL information
  const getQRCodeContent = () => {
    if (!paymentData) return "No payment data available";
    
    // Default values for all fields
    const data = {
      date: paymentData.date || new Date().toLocaleDateString(),
      transactionId: paymentData.transactionId || 'N/A',
      amount: paymentData.amount ? paymentData.amount.toLocaleString() : '0',
      method: paymentData.method || 'N/A',
      infoType: paymentData.infoType || 'phone',
      accountInfo: paymentData.accountInfo || 'N/A',
      customerName: paymentData.customerName || 'N/A',
      serviceName: paymentData.serviceName || 'Wedding Service',
      phone: paymentData.phone || '+251 911 223344', // Ensure phone is included
      email: paymentData.email || 'info@yeshigabcha.com'
    };
    
    const content = `
=== YESHI GABCHA PAYMENT ===
Date: ${data.date}
Transaction ID: ${data.transactionId}

PAYMENT DETAILS:
Amount: ${data.amount} Birr
Payment Method: ${data.method}
${data.infoType === 'account' ? 'Account Number:' : 'Phone Number:'} ${data.accountInfo}
Customer Phone: ${data.phone}

CUSTOMER INFORMATION:
Customer Name: ${data.customerName}
Service: ${data.serviceName}
Customer Email: ${data.email}

STATUS: PAYMENT SUCCESSFUL
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

=== THANK YOU ===
For verification, please contact:
Phone: +251 123 456 789
Email: info@yeshigabcha.com
Website: www.yeshigabcha.com
    `.trim();
    
    return content;
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qrcode')
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = 'yeshi-gabcha-payment.svg'
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  const getInfoLabel = () => {
    if (!paymentData?.infoType) return isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'
    
    return paymentData.infoType === 'account' 
      ? (isAmharic ? 'መለያ ቁጥር' : 'Account Number')
      : (isAmharic ? 'ስልክ ቁጥር' : 'Phone Number')
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-md dark:shadow-neutral-900/50 p-6 text-center border border-neutral-200 dark:border-neutral-700">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-primary-600 dark:text-primary-400" size={48} />
      </div>
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 font-display">
        {isAmharic ? 'ክፍያ ተጀምሯል (አስተዳዳሪ ማረጋገጫ ይፈልጋል)' : 'Payment Initiated (Admin approval required)'}
      </h2>
      
      <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600">
        <div className="flex justify-center mb-4">
          <QRCodeSVG
            id="qrcode"
            value={getQRCodeContent()} // Now includes phone number
            size={200}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
            className="border rounded-lg border-neutral-200 dark:border-neutral-600"
          />
        </div>
        
        <div className="text-left space-y-2 text-sm">
          <p className="text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'የገንዘብ መጠን:' : 'Amount:'}</span> {paymentData?.amount?.toLocaleString() || 0} Birr
          </p>
          <p className="text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'የክፍያ ዘዴ:' : 'Payment Method:'}</span> {paymentData?.method || ''}
          </p>
          <p className="text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{getInfoLabel()}:</span> {paymentData?.accountInfo || ''}
          </p>
          <p className="text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'የታሪክ ቁጥር:' : 'Transaction ID:'}</span> {paymentData?.transactionId || ''}
          </p>
          <p className="text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'ቀን:' : 'Date:'}</span> {paymentData?.date || ''}
          </p>
          
          {/* Phone number display */}
          {paymentData?.phone && (
            <p className="text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'ስልክ:' : 'Phone:'}</span> {paymentData.phone}
            </p>
          )}
          
          {paymentData?.customerName && (
            <p className="text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'ደንበኛ:' : 'Customer:'}</span> {paymentData.customerName}
            </p>
          )}
          
          {paymentData?.serviceName && (
            <p className="text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'አገልግሎት:' : 'Service:'}</span> {paymentData.serviceName}
            </p>
          )}
          
          {paymentData?.email && (
            <p className="text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{isAmharic ? 'ኢሜይል:' : 'Email:'}</span> {paymentData.email}
            </p>
          )}
        </div>
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        {isAmharic 
          ? 'ይህንን የQR ኮድ ይቆጥቡ። ክፍያው ከተፈጸመ በኋላ አስተዳዳሪው ያረጋግጣል።'
          : 'Keep this QR code. After you pay, the admin will approve your payment.'}
      </p>

      <button
        onClick={downloadQRCode}
        className="flex items-center justify-center w-full bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg dark:shadow-neutral-900/50"
      >
        <Download size={20} className="mr-2" />
        {isAmharic ? 'QR ኮድ አውርድ' : 'Download QR Code'}
      </button>
    </div>
  )
}

export default QRCodeDisplay
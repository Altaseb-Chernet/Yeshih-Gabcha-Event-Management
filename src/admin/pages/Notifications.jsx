// src/admin/pages/Notifications.jsx
import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container px-6 mx-auto grid">
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {t('notifications')}
        </h2>
      </div>
      
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Notifications management page will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default Notifications;
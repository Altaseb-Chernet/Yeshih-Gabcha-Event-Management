// src/admin/pages/GalleryModal.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const GalleryModal = ({ mode, image, categories, onClose, onUpload, onUpdate, uploading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: mode === 'edit' ? image?.title || '' : '',
    description: mode === 'edit' ? image?.description || '' : '',
    category: mode === 'edit' ? image?.category || '' : '',
    location: mode === 'edit' ? image?.location || '' : '',
    date: mode === 'edit' ? image?.date || '' : '',
    imageFile: null
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'upload') {
      onUpload(formData);
    } else if (mode === 'edit') {
      onUpdate(formData);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return t('view_image');
      case 'upload':
        return t('upload_gallery');
      case 'edit':
        return t('edit_image');
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full ${mode === 'view' ? 'max-w-5xl' : 'max-w-xl'} max-h-[90vh]`}>
        <div className="relative flex flex-col w-full max-h-[90vh] bg-white/95 dark:bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {getTitle()}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {mode === 'view'
                  ? (t('view_image_help') || 'Review image details and metadata.')
                  : (t('upload_gallery_help') || 'Fill the details and upload an image.')}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-black/5 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 focus:outline-none"
              aria-label="Close"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>

          {mode === 'view' ? (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/5 dark:bg-white/5">
                    <img
                      src={image?.url}
                      alt={image?.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="space-y-3">
                    {[ 
                      { k: t('title'), v: image?.title },
                      { k: t('description'), v: image?.description },
                      { k: t('category'), v: image?.category },
                      { k: t('location'), v: image?.location },
                      { k: t('date'), v: image?.date },
                      { k: t('uploaded'), v: image?.uploadedAt },
                    ].map((row, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-white/70 dark:bg-white/5">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{row.k}</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{row.v || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('title')} *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border border-gray-200 rounded-xl dark:bg-white/5 dark:text-gray-100 dark:border-white/10 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('description')}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border border-gray-200 rounded-xl dark:bg-white/5 dark:text-gray-100 dark:border-white/10 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('category')} *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border border-gray-200 rounded-xl dark:bg-white/5 dark:text-gray-100 dark:border-white/10 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                        required
                      >
                        <option value="">{t('select_category')}</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('date')}
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border border-gray-200 rounded-xl dark:bg-white/5 dark:text-gray-100 dark:border-white/10 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('location')}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 text-sm text-gray-900 bg-white/70 border border-gray-200 rounded-xl dark:bg-white/5 dark:text-gray-100 dark:border-white/10 focus:border-purple-400 focus:ring-purple-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                    />
                  </div>
                  {mode === 'upload' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('image')} *
                      </label>
                      <input
                        type="file"
                        name="imageFile"
                        onChange={handleFormChange}
                        className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        accept="image/*"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10 bg-white/70 dark:bg-white/5">
                <button
                  className="px-5 py-2.5 text-sm font-semibold text-gray-800 transition-all duration-150 ease-linear bg-transparent border border-gray-300 rounded-xl outline-none dark:text-gray-200 dark:border-white/10 hover:shadow-lg focus:outline-none"
                  type="button"
                  onClick={onClose}
                >
                  {t('cancel')}
                </button>
                <button
                  className="px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 ease-linear bg-purple-600 rounded-xl shadow outline-none hover:bg-purple-700 hover:shadow-lg focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={uploading}
                >
                  {uploading ? t('uploading') : (mode === 'upload' ? t('upload') : t('save_changes'))}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
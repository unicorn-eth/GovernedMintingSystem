import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X } from 'lucide-react';
import { compressImage } from '../lib/compressImage';

export default function PhotoCapture({ photo, setPhoto, photoPreview, setPhotoPreview }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert(t('form.fileTooLarge'));
      return;
    }

    setCompressing(true);
    try {
      const compressedBlob = await compressImage(file, 2, 2048);
      setPhoto(compressedBlob);
      setPhotoPreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Compression failed:', err);
      alert(t('form.compressionFailed'));
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  return (
    <div className="space-y-3">
      {photoPreview ? (
        <div className="relative">
          <img src={photoPreview} alt="Preview" className="w-full rounded-xl max-h-48 sm:max-h-64 object-cover" />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-8 text-center">
          <Camera size={36} className="sm:hidden mx-auto text-gray-400 mb-2" />
          <Camera size={48} className="hidden sm:block mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{t('photo.takeOrUpload')}</p>
        </div>
      )}

      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {!photoPreview && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="bg-indigo-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Camera size={20} /> {t('photo.takePhoto')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <Upload size={20} /> {t('photo.upload')}
          </button>
        </div>
      )}

      {compressing && <p className="text-sm text-gray-500 text-center animate-pulse">{t('form.compressing')}</p>}
    </div>
  );
}

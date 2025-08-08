import { useState, useRef, ChangeEvent } from 'react';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
  initialImageUrl?: string;
  uploadPreset: string;
  cloudName: string;
}

const ImageUploader = ({
  onUploadSuccess,
  initialImageUrl = '',
  uploadPreset,
  cloudName,
}: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('فقط فایل‌های تصویری مجاز هستند');
      resetFileInput();
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم فایل باید کمتر از 2 مگابایت باشد');
      resetFileInput();
      return;
    }

    setIsUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        onUploadSuccess(data.secure_url);
        toast.success('تصویر با موفقیت آپلود شد');
      } else {
        throw new Error(data.message || 'خطا در آپلود تصویر');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'خطا در آپلود تصویر');
      setPreviewUrl(initialImageUrl);
    } finally {
      setIsUploading(false);
      resetFileInput();
    }
  };

  const resetFileInput = () => {
    setInputKey(Date.now()); // تغییر key برای رندر مجدد
  };

  return (
    <div className={styles.imageUploadSection}>
      <label className={styles.uploadLabel}>
        <span>تصویر محصول</span>
        <div 
          className={styles.uploadBox}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className={styles.uploadPlaceholder}>
              <p>در حال آپلود...</p>
            </div>
          ) : previewUrl ? (
            <div className={styles.imagePreview}>
              <img 
                src={previewUrl} 
                alt="پیش‌نمایش محصول"
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : (
            <div className={styles.uploadPlaceholder}>
              <FiUpload size={24} />
              <p>برای آپلود کلیک کنید</p>
            </div>
          )}
          <input
            key={inputKey}
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            hidden
            disabled={isUploading}
          />
        </div>
      </label>
    </div>
  );
};

export default ImageUploader;
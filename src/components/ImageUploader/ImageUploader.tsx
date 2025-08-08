import { useState, useRef, ChangeEvent } from 'react';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // بررسی نوع فایل
    if (!file.type.match('image.*')) {
      toast.error('فقط فایل‌های تصویری مجاز هستند');
      return;
    }

    // بررسی حجم فایل (حداکثر 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم فایل باید کمتر از 2 مگابایت باشد');
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
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={isUploading}
        hidden
      />
      
      <div 
        className="upload-container"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="image-preview">
            <img
              src={previewUrl}
              alt="پیش‌نمایش تصویر"
              className="preview-image"
            />
            {isUploading ? (
              <div className="upload-overlay">
                <span>در حال آپلود...</span>
              </div>
            ) : (
              <div className="change-image">
                <FiUpload />
                <span>تغییر تصویر</span>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <FiUpload size={24} />
            <span>{isUploading ? 'در حال آپلود...' : 'انتخاب تصویر'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
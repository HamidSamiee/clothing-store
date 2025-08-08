import { useState, useRef, ChangeEvent } from 'react';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ImageUploader = ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputKey, setInputKey] = useState(Date.now());

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // اعتبارسنجی فایل
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
      formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
      formData.append('cloud_name', 'YOUR_CLOUD_NAME');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('خطا در ارتباط با سرور آپلود');
      }

      const data = await response.json();
      onUploadSuccess(data.secure_url);
      toast.success('تصویر با موفقیت آپلود شد');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('خطا در آپلود تصویر. لطفاً مجدداً تلاش کنید');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      resetFileInput();
    }
  };

  const resetFileInput = () => {
    setInputKey(Date.now());
  };

  return (
    <div className="image-uploader">
      <input
        key={inputKey}
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        hidden
        disabled={isUploading}
      />
      
      <div 
        className="upload-container"
        onClick={handleClick}
      >
        {previewUrl ? (
          <div className="image-preview">
            <img
              src={previewUrl}
              alt="پیش‌نمایش تصویر"
              className="preview-image"
            />
            {!isUploading && (
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
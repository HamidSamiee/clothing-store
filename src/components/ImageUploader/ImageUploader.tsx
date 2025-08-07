import { useState, useRef } from 'react';
import axios from 'axios';

const ImageUploader = ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // نمایش پیش‌نمایش تصویر
    setPreviewUrl(URL.createObjectURL(file));

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);

      // ارسال به تابع Netlify
      const response = await axios.post('/.netlify/functions/uploadProductImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUploadSuccess(response.data.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود تصویر');
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
      
      {previewUrl ? (
        <div className="preview-container">
          <img src={previewUrl} alt="Preview" className="preview-image" />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            تغییر تصویر
          </button>
        </div>
      ) : (
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
// src/ui/ImageModal/ImageModal.tsx
import { useEffect, useState } from 'react';
import styles from './ImageModal.module.css';
import { FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageModal = ({ isOpen, onClose, imageUrl }: ImageModalProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalOverlay}
      onClick={resetZoom}
    >
      <div 
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <div className={styles.modalHeader}>
          <button 
            className={styles.closeButton}
            onClick={resetZoom}
          >
            <FiX size={24} />
          </button>
          
          <div className={styles.zoomControls}>
            <button 
              className={styles.zoomButton}
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
              disabled={zoomLevel >= 3}
            >
              <FiZoomIn size={20} />
            </button>
            <span className={styles.zoomPercentage}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              className={styles.zoomButton}
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
              disabled={zoomLevel <= 0.5}
            >
              <FiZoomOut size={20} />
            </button>
          </div>
        </div>

        <div 
          className={styles.imageContainer}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default'
          }}
        >
          <img
            src={imageUrl}
            alt="Zoomed product"
            className={styles.zoomedImage}
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
              cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'zoom-in'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
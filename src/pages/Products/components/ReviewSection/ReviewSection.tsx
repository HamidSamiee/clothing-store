// src/components/ReviewSection/ReviewSection.tsx
import { useState } from 'react';
import styles from './ReviewSection.module.css';
import { toast } from 'react-toastify';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/types/User';


interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  reviews: Review[];
  averageRating?: number;
  user: SafeUser | null;
  onAddReview: (review: { rating: number; comment: string }) => Promise<void>;
}

const ReviewSection = ({
  reviews,
  averageRating = 0,
  user,
  onAddReview,
}: ReviewSectionProps) => {
  const { t } = useTranslation();
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast.info(t('reviews.loginPrompt'));
      return;
    }
    
    if (newReview.rating === 0) {
      toast.error(t('reviews.ratingError'));
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error(t('reviews.commentError'));
      return;
    }

    try {
      await onAddReview(newReview);
      setNewReview({ rating: 0, comment: '' });
    } catch (error) {
      toast.error(t('reviews.submitError'));
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className={styles.reviewSection}>
      <div className={styles.ratingSummary}>
        <h3>{t('reviews.productRating')}</h3>
        <div className={styles.averageRating}>
          <span className={styles.ratingNumber}>{toPersianNumbers(averageRating.toFixed(1))}</span>
          <div className={styles.ratingStars}>
            {'★'.repeat(Math.round(averageRating))}
            {'☆'.repeat(5 - Math.round(averageRating))}
          </div>
          <span className={styles.reviewCount}>
            ({toPersianNumbers(reviews.length)} {t('reviews.reviewsCount')})
          </span>
        </div>
      </div>

      <h3>{t('reviews.userReviews')}</h3>
      
      <div className={styles.reviewForm}>
        <div className={styles.ratingInput}>
          <span>{t('reviews.yourRating')}: </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setNewReview({...newReview, rating: star})}
              className={newReview.rating >= star ? styles.activeStar : ''}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={newReview.comment}
          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          placeholder={t('reviews.commentPlaceholder')}
        />
        <button onClick={handleSubmitReview} className={styles.reviewSubmit}>
          {t('reviews.submitReview')}
        </button>
      </div>

      <div className={styles.reviewsList}>
      {reviews.map((review) => (
        <div key={review.id} className={styles.reviewItem}>
          <div className={styles.reviewHeader}>
            <div>
              <h4>{review.userName}</h4>
              <div className={styles.reviewRating}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
              <small>
                {new Date(review.createdAt).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </div>
          </div>
          <p>{review.comment}</p>
        </div>
      ))}
      </div>
    </div>
  );
};

export default ReviewSection;
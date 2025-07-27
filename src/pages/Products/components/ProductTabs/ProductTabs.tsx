
import styles from './ProductTabs.module.css';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { useTranslation } from 'react-i18next';
import ReviewSection from '../ReviewSection/ReviewSection';
import QuestionsSection from '../QuestionsSection/QuestionsSection';

interface ProductTabsProps {
  activeTab: 'description' | 'specs' | 'reviews' | 'questions';
  onTabChange: (tab: 'description' | 'specs' | 'reviews' | 'questions') => void;
  description: string;
  reviews: any[];
  averageRating?: number;
  user: any;
  onAddReview: (review: { rating: number; comment: string }) => Promise<void>;
  onAddReply: (reviewId: string, comment: string) => Promise<void>;
  questions: any[];
  onAddQuestion: (question: string) => Promise<void>; // اضافه کردن prop جدید
  onAddAnswer: (questionId: string, answer: string) => Promise<void>; // اضافه کردن prop جدید
}

const ProductTabs = ({
  activeTab,
  onTabChange,
  description,
  reviews,
  averageRating,
  user,
  onAddReview,
  onAddReply,
  questions,
  onAddQuestion, // دریافت prop جدید
  onAddAnswer // دریافت prop جدید
}: ProductTabsProps) => {
  
  const { t } = useTranslation();

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeaders}>
        <button
          className={`${styles.tabHeader} ${activeTab === 'description' ? styles.active : ''}`}
          onClick={() => onTabChange('description')}
        >
          {t('product.description')}
        </button>
        <button
          className={`${styles.tabHeader} ${activeTab === 'reviews' ? styles.active : ''}`}
          onClick={() => onTabChange('reviews')}
        >
          {t('product.reviews')} ({toPersianNumbers(reviews.length)})
        </button>
        <button
          className={`${styles.tabHeader} ${activeTab === 'questions' ? styles.active : ''}`}
          onClick={() => onTabChange('questions')}
        >
          {t('product.questions')} ({toPersianNumbers(questions.length)})
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'description' && (
          <div className={styles.description}>
            <p>{description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.reviews}>
            <ReviewSection
              reviews={reviews}
              averageRating={averageRating}
              user={user}
              onAddReview={onAddReview}
              onAddReply={onAddReply}
            />
          </div>
        )}

      {activeTab === 'questions' && (
        <div className={styles.questions}>
          <QuestionsSection
            questions={questions}
            user={user}
            onAddQuestion={onAddQuestion} // ارسال به کامپوننت QuestionsSection
            onAddAnswer={onAddAnswer} // ارسال به کامپوننت QuestionsSection
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductTabs;
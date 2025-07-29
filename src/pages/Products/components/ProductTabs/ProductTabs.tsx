import styles from './ProductTabs.module.css';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { useTranslation } from 'react-i18next';
import ReviewSection from '../ReviewSection/ReviewSection';
import QuestionsSection from '../QuestionsSection/QuestionsSection';

import { Review } from '@/types/Review';
import { Question } from '@/types/Review'; // Answer داخل Review تعریف شده
import { SafeUser } from '@/types/User';

interface ProductTabsProps {
  activeTab: 'description' | 'specs' | 'reviews' | 'questions';
  onTabChange: (tab: 'description' | 'specs' | 'reviews' | 'questions') => void;
  description: string;
  reviews: Review[];
  averageRating?: number;
  user: SafeUser | null;
  onAddReview: (review: { rating: number; comment: string }) => Promise<void>;
  questions: Question[];
  onAddQuestion: (question: string) => Promise<void>;
  onAddAnswer: (questionId: string, answer: string) => Promise<void>;
}

const ProductTabs = ({
  activeTab,
  onTabChange,
  description,
  reviews,
  averageRating,
  user,
  onAddReview,
  questions,
  onAddQuestion,
  onAddAnswer
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
            />
          </div>
        )}

        {activeTab === 'questions' && (
          <div className={styles.questions}>
            <QuestionsSection
              questions={questions}
              user={user}
              onAddQuestion={onAddQuestion}
              onAddAnswer={onAddAnswer}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;

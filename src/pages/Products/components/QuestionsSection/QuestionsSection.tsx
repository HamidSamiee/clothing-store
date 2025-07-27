import { useState } from 'react';
import styles from './QuestionsSection.module.css';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface User {
  id: string | number;
  name: string;
  role: string;
}

interface Answer {
  id: string;
  userId: string | number;
  userName: string;
  answer: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Question {
  id: string;
  productId: string;
  userId: string | number;
  userName: string;
  question: string;
  answers: Answer[];
  createdAt: string;
}

interface QuestionsSectionProps {
  questions: Question[];
  user: User | null;
  onAddQuestion: (question: string) => Promise<void>;
  onAddAnswer: (questionId: string, answer: string) => Promise<void>;
}

const QuestionsSection = ({ 
  questions = [],
  user, 
  onAddQuestion, 
  onAddAnswer 
}: QuestionsSectionProps) => {
  const { t } = useTranslation();
  const [newQuestion, setNewQuestion] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitQuestion = async () => {
    if (!user) {
      toast.info(t('questions.loginPrompt'));
      return;
    }

    if (!newQuestion.trim()) {
      toast.error(t('questions.emptyQuestionError'));
      return;
    }

    try {
      await onAddQuestion(newQuestion);
      setNewQuestion('');
      toast.success(t('questions.questionSubmitted'));
    } catch (error) {
      toast.error(t('questions.submitError'));
      console.error('Error submitting question:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!replyingTo) return;
    
    if (!replyText.trim()) {
      toast.error(t('questions.emptyAnswerError'));
      return;
    }

    try {
      await onAddAnswer(replyingTo, replyText);
      setReplyingTo(null);
      setReplyText('');
      toast.success(t('questions.answerSubmitted'));
    } catch (error) {
      toast.error(t('questions.answerSubmitError'));
      console.error('Error submitting answer:', error);
    }
  };

  return (
    <div className={styles.questionsSection}>
      <h3>{t('questions.title')}</h3>
      
      <div className={styles.questionForm}>
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={t('questions.questionPlaceholder')}
        />
        <button 
          onClick={handleSubmitQuestion} 
          className={styles.questionSubmit}
        >
          {t('questions.submitQuestion')}
        </button>
      </div>

      <div className={styles.questionsList}>
        {questions.map((question) => (
          <div key={question.id} className={styles.questionItem}>
            <div className={styles.questionHeader}>
              <div>
                <h4>{question.userName}</h4>
                <small>{new Date(question.createdAt).toLocaleDateString('fa-IR')}</small>
              </div>
            </div>
            <p className={styles.questionText}>{question.question}</p>

            {question.answers && question.answers.map((answer) => (
              <div key={answer.id} className={styles.answerItem}>
                <div className={styles.answerHeader}>
                  <div>
                    <h5>
                      {answer.isAdmin 
                        ? t('questions.adminAnswer') 
                        : t('questions.userAnswer')}: {answer.userName}
                    </h5>
                    <small>{new Date(answer.createdAt).toLocaleDateString('fa-IR')}</small>
                  </div>
                </div>
                <p>{answer.answer}</p>
              </div>
            ))}

            {user?.role === 'admin' && (
              <div className={styles.replyForm}>
                {replyingTo === question.id ? (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t('questions.answerPlaceholder')}
                    />
                    <div className={styles.replyButtons}>
                      <button onClick={handleSubmitAnswer}>
                        {t('questions.submitAnswer')}
                      </button>
                      <button 
                        onClick={() => setReplyingTo(null)}
                        className={styles.cancelButton}
                      >
                        {t('questions.cancel')}
                      </button>
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => setReplyingTo(question.id)}
                    className={styles.replyButton}
                  >
                    {t('questions.reply')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionsSection;
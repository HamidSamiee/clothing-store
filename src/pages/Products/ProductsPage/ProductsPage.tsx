// src/pages/ProductPage/ProductPage.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import styles from './ProductPage.module.css';
import http from '@/services/httpService';
import LoadingSpinner from '@/ui/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import ProductGallery from '../components/ProductGallery/ProductGallery';
import ProductInfo from '../components/ProductInfo/ProductInfo';
import ProductTabs from '../components/ProductTabs/ProductTabs';
import RelatedProducts from '../components/RelatedProducts/RelatedProducts';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { addToWishlist, getWishlist, removeFromWishlist } from '@/services/wishlist';
import { Product } from '@/types/Product';
import { Question, Review } from '@/types/Review';
import { useTranslation } from 'react-i18next';

const ProductPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { darkMode } = useTheme();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'questions'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productResponse = await http.get(`/products/${id}`);
        setProduct(productResponse.data);
        
        const questionsResponse = await http.get(`/questions?productId=${id}`);
        setQuestions(questionsResponse.data);
        
        const reviewsResponse = await http.get(`/reviews?productId=${id}`);
        setReviews(reviewsResponse.data);
        
        setError(null);
      } catch (err) {
        setError('خطا در دریافت اطلاعات محصول');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user?.id) {
        try {
          const data = await getWishlist(String(user.id));
          setIsWishlisted(data.includes(id || ''));
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        }
      }
    };
    
    fetchWishlist();
  }, [user?.id, id]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  const handleAddReview = async (reviewData: { rating: number; comment: string }) => {
    if (!user || !product) return;
    
    const newReview: Review = {
      id: `rev${Date.now()}`,
      productId: product.id,
      userId: user.id.toString(),
      userName: user.name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
    };

    try {
      await http.post('/reviews', newReview);
      setReviews([...reviews, newReview]);
      toast.success(t('reviews.submitSuccess'));
    } catch (error) {
      toast.error(t('reviews.submitError'));
      console.error('Error adding review:', error);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.info(t('wishlist.loginPrompt'));
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(String(user.id), id || '');
        setIsWishlisted(false);
        toast.success(t('wishlist.removeSuccess'));
      } else {
        await addToWishlist(String(user.id), id || '');
        setIsWishlisted(true);
        toast.success(t('wishlist.addSuccess'));
      }
    } catch  {
      toast.error(t('wishlist.updateError'));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize || !selectedColor) {
      toast.error(t('cart.selectOptions'));
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    toast.success(t('cart.addSuccess'));
  };

  const handleAddQuestion = async (question: string) => {
    if (!user || !product) return;
  
    try {
      const newQuestion: Question = {
        id: `q${Date.now()}`,
        productId: product.id,
        userId: user.id.toString(),
        userName: user.name,
        question,
        answers: [],
        createdAt: new Date().toISOString()
      };
  
      await http.post('/questions', newQuestion);
      setQuestions([...questions, newQuestion]);
      toast.success(t('questions.questionSubmitted'));
    } catch (error) {
      toast.error(t('questions.submitError'));
      console.error('Error adding question:', error);
    }
  };
  
  const handleAddAnswer = async (questionId: string, answer: string) => {
    if (!user || !product) return;
  
    try {
      const newAnswer = {
        id: `ans${Date.now()}`,
        questionId,
        userId: user.id.toString(),
        userName: user.name,
        answer,
        isAdmin: user.role === 'admin',
        createdAt: new Date().toISOString()
      };
  
      await http.post('/answers', newAnswer);
      
      setQuestions(questions.map(q => 
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      ));
      
      toast.success(t('questions.answerSubmitted'));
    } catch (error) {
      toast.error(t('questions.answerSubmitError'));
      console.error('Error adding answer:', error);
    }
  };

  const handleShare = () => {
    if (!product) return;
  
    const shareData = {
      title: product.name,
      text: `محصول "${product.name}" رو ببین! 👇`,
      url: window.location.href,
    };
  
    if (navigator.share) {
      navigator.share(shareData).catch(err => {
        console.error('خطا در اشتراک‌گذاری:', err);
      });
    } else {
      // در مرورگرهایی که Web Share پشتیبانی نمی‌کنند:
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success('لینک محصول کپی شد!'))
        .catch(() => toast.error('کپی لینک با خطا مواجه شد.'));
    }
  };
  

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retry={() => window.location.reload()} />;
  if (!product) return <ErrorMessage message={t('product.notFound')} />;

  const ratingStars = '★'.repeat(Math.round(calculateAverageRating())) + '☆'.repeat(5 - Math.round(calculateAverageRating()));

  return (
    <div className={`${styles.productPage} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.productContainer}>
        <ProductGallery 
          image={String(product.image)}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />

        <ProductInfo
          product={product}
          finalPrice={product.discount 
            ? product.price * (1 - product.discount / 100)
            : product.price}
          rating={calculateAverageRating()}
          stars={ratingStars}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleWishlist}
          isWishlisted={isWishlisted}
          onShare={handleShare}
        />
      </div>

      <ProductTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        description={product.description}
        reviews={reviews}
        averageRating={calculateAverageRating()}
        user={user}
        onAddReview={handleAddReview}
        questions={questions}
        onAddQuestion={handleAddQuestion}
        onAddAnswer={handleAddAnswer}
      />

      <RelatedProducts 
        category={product.category} 
        currentProductId={product.id}
      />
    </div>
  );
};

export default ProductPage;
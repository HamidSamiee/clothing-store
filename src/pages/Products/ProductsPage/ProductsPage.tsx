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
import { Review, Reply } from '@/types/Review';

const ProductPage = () => {
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
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productResponse = await http.get(`/products/${id}`);
        setProduct(productResponse.data);
        
        // دریافت سوالات محصول
        const questionsResponse = await http.get(`/questions?productId=${id}`);
        setQuestions(questionsResponse.data);
        
        // دریافت نظرات محصول
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
          const data = await getWishlist(user.id);
          setWishlist(data);
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
      userId: user.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      replyIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // ارسال نظر جدید به سرور
      await http.post('/reviews', newReview);
      
      // به‌روزرسانی لیست نظرات محصول
      await http.patch(`/products/${product.id}`, {
        reviewIds: [...product.reviewIds, newReview.id]
      });
      
      // به‌روزرسانی state
      setReviews([...reviews, newReview]);
      setProduct({
        ...product,
        reviewIds: [...product.reviewIds, newReview.id]
      });
      
      // toast.success('نظر شما با موفقیت ثبت شد');
    } catch (error) {
      toast.error('خطا در ثبت نظر');
      console.error('Error adding review:', error);
    }
  };

  const handleAddReply = async (reviewId: string, comment: string) => {
    if (!user || !product) return;
    
    const newReply = {
      id: `rep${Date.now()}`,
      reviewId,
      userId: user.id,
      comment,
      isAdmin: user.role === 'admin',
      createdAt: new Date().toISOString()
    };

    try {
      // ارسال پاسخ جدید به سرور
      await http.post('/replies', newReply);
      
      // به‌روزرسانی لیست پاسخ‌های نظر
      const reviewToUpdate = reviews.find(r => r.id === reviewId);
      if (reviewToUpdate) {
        await http.patch(`/reviews/${reviewId}`, {
          replyIds: [...reviewToUpdate.replyIds, newReply.id]
        });
        
        // به‌روزرسانی state
        setReviews(reviews.map(review => 
          review.id === reviewId
            ? { ...review, replyIds: [...review.replyIds, newReply.id] }
            : review
        ));
      }
      
      toast.success('پاسخ شما با موفقیت ثبت شد');
    } catch (error) {
      toast.error('خطا در ثبت پاسخ');
      console.error('Error adding reply:', error);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.info("لطفا وارد حساب کاربری خود شوید");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(user.id, id || '');
        setWishlist(prev => prev.filter(itemId => itemId !== id));
        setIsWishlisted(false);
        toast.success("محصول از لیست علاقه‌مندی‌ها حذف شد");
      } else {
        await addToWishlist(user.id, id || '');
        setWishlist(prev => [...prev, id || '']);
        setIsWishlisted(true);
        toast.success("محصول به لیست علاقه‌مندی‌ها افزوده شد");
      }
    } catch (error) {
      toast.error('خطا در بروزرسانی لیست علاقه‌مندی‌ها');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize || !selectedColor) {
      toast.error('لطفا سایز و رنگ محصول را انتخاب کنید');
      return;
    }

    addToCart({
      ...product,
      quantity,
      size: selectedSize,
      color: selectedColor
    });

    toast.success('محصول به سبد خرید اضافه شد');
  };


  const handleAddQuestion = async (question: string) => {
    if (!user || !product) return;
  
    try {
      const newQuestion = {
        id: `q${Date.now()}`,
        productId: product.id,
        userId: user.id,
        userName: user.name,
        question,
        answers: [],
        createdAt: new Date().toISOString()
      };
  
      // ارسال به سرور
      await http.post('/questions', newQuestion);
      
      // به‌روزرسانی state
      setQuestions([...questions, newQuestion]);
    } catch (error) {
      toast.error('خطا در ثبت سوال');
      console.error('Error adding question:', error);
    }
  };
  
  const handleAddAnswer = async (questionId: string, answer: string) => {
    if (!user || !product) return;
  
    try {
      const newAnswer = {
        id: `ans${Date.now()}`,
        questionId,
        userId: user.id,
        userName: user.name,
        answer,
        isAdmin: user.role === 'admin',
        createdAt: new Date().toISOString()
      };
  
      // ارسال به سرور
      await http.post('/answers', newAnswer);
      
      // به‌روزرسانی state
      setQuestions(questions.map(q => 
        q.id === questionId
          ? { ...q, answers: [...(q.answers || []), newAnswer] }
          : q
      ));
    } catch (error) {
      toast.error('خطا در ثبت پاسخ');
      console.error('Error adding answer:', error);
    }
  };
  

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retry={() => window.location.reload()} />;
  if (!product) return <ErrorMessage message="محصول یافت نشد" />;

  const ratingStars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));

  return (
    <div className={`${styles.productPage} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.productContainer}>
        <ProductGallery 
          image={product.image}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />

        <ProductInfo
          product={product}
          finalPrice={product.discount 
            ? product.price * (1 - product.discount / 100)
            : product.price}
          rating={product.rating}
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
        onAddReply={handleAddReply}
        questions={questions}
        onAddQuestion={handleAddQuestion} // ارسال تابع به ProductTabs
        onAddAnswer={handleAddAnswer} // ارسال تابع به ProductTabs
      />

      <RelatedProducts 
        category={product.category} 
        currentProductId={product.id}
      />
    </div>
  );
};

export default ProductPage;
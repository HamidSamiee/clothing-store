import { Product, ProductFilterOptions, PaginatedResponse, RawProduct } from "@/types/Product";
import http from "./httpService";
import { Review } from "@/types/Review";



export const getProducts = async (
  options: ProductFilterOptions = {}
): Promise<PaginatedResponse<Product>> => {
  // ابتدا همه محصولات را دریافت می‌کنیم
  const response = await http.get('/.netlify/functions/getProducts');
  // console.log('data:', response);

  let products = response.data;

  // اعمال فیلترها
  if (options.category) {
    products = products.filter((product: Product) => 
      product.category === options.category
    );
  }

  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    products = products.filter((product: Product) => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  if (options.minPrice) {
    products = products.filter((product: Product) => 
      product.price >= (options.minPrice || 0)
    );
  }

  if (options.maxPrice) {
    products = products.filter((product: Product) => 
      product.price <= (options.maxPrice || Infinity)
    );
  }

  if (options.featured) {
    products = products.filter((product: Product) => product.featured);
  }

  // اعمال مرتب‌سازی
  if (options.sort) {
    switch (options.sort) {
      case 'price_asc':
        products.sort((a: Product, b: Product) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a: Product, b: Product) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a: Product, b: Product) => b.rating - a.rating);
        break;
      case 'newest':
        products.sort((a: Product, b: Product) => Number(b.id) - Number(a.id));
        break;
    }
  }

  // اعمال صفحه‌بندی
  const page = options.page || 1;
  const perPage = options.perPage || 9;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = products.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: products.length,
    page,
    perPage
  };
};


export const getProductById = async (id: number | string) => {
 
    const productId = typeof id === 'number' ? id.toString() : id;
    const response = await http.get(`/.netlify/functions/getProductById?id=${productId}`);
    console.log(response.data)
    return response.data;
  
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await http.get(`/.netlify/functions/searchProducts?q=${encodeURIComponent(query)}`);
    return response.data.map(normalizeProduct);
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};

export const normalizeProduct = (product: RawProduct): Product => {
  // تبدیل reviews از string به آرایه در صورت نیاز
  const reviews: Review[] = product.reviews 
    ? typeof product.reviews === 'string' 
      ? JSON.parse(product.reviews) as Review[]
      : product.reviews
    : [];

  // تبدیل sizes و colors به آرایه
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === 'string'
    ? product.sizes.split(',').map(s => s.trim())
    : [];

  const colors = Array.isArray(product.colors)
    ? product.colors
    : typeof product.colors === 'string'
    ? product.colors.split(',').map(c => c.trim())
    : [];

  // محاسبه averageRating
  const averageRating = reviews.length > 0
    ? parseFloat((
        reviews.reduce((sum, review) => sum + review.rating, 0) / 
        reviews.length
      ).toFixed(1))
    : 0;

  // ایجاد آبجکت نرمالایز شده
  const normalized: Product = {
    id: product.id?.toString() || '',
    name: product.name,
    price: Number(product.price),
    discount: product.discount ? Number(product.discount) : undefined,
    description: product.description || '',
    specifications: product.specifications || {},
    category: product.category || '',
    image: product.image || '',
    rating: product.rating ? Number(product.rating) : 0,
    sizes,
    colors,
    stock: product.stock ? Number(product.stock) : 0,
    featured: Boolean(product.featured),
    reviews,
    averageRating,
    shareUrl: product.shareUrl || undefined
  };

  return normalized;
};

// export const searchProducts = async (query: string) => {

//     const response = await http.get('/products');
//     const products = response.data.filter((product: Product) => 
//       product.name.toLowerCase().includes(query.toLowerCase()) || 
//       product.description.toLowerCase().includes(query.toLowerCase())
//     );
//     return products;

// };




// سرویس‌های مدیریت محصولات (برای ادمین)

// const normalizeProduct = (product: RawProduct): Product => {
//   const normalized: Product = {
//     ...product,
//     id: product.id?.toString() || '', // تبدیل به string با مقدار پیش‌فرض
//     price: Number(product.price),
//     rating: Number(product.rating),
//     stock: Number(product.stock),
//     sizes: Array.isArray(product.sizes) 
//       ? product.sizes 
//       : product.sizes.split(',').map((s: string) => s.trim()),
//     colors: Array.isArray(product.colors) 
//       ? product.colors 
//       : product.colors.split(',').map((c: string) => c.trim()),
//     specifications: product.specifications || {},
//     reviews: product.reviews ? JSON.parse(product.reviews) : []
//   };
  
//   // محاسبه averageRating اگر وجود نداشت
//   if (normalized.reviews && normalized.reviews.length > 0 && !normalized.averageRating) {
//     normalized.averageRating = normalized.reviews.reduce((sum, review) => sum + review.rating, 0) / normalized.reviews.length;
//   }
  
//   return normalized;
// };

// تابع addProduct اصلاح شده
// export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
//   const normalizedData: RawProduct = {
//     ...productData,
//     price: productData.price.toString(),
//     rating: productData.rating.toString(),
//     stock: productData.stock.toString(),
//     sizes: productData.sizes,
//     colors: productData.colors,
//     reviews: productData.reviews ? JSON.stringify(productData.reviews) : undefined
//   };
  
//   const response = await http.post('/products', normalizedData);
//   return normalizeProduct(response.data);
// };

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  try {
    // تبدیل داده‌ها به فرمت مناسب برای دیتابیس
    const productToSend = {
      ...productData,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      reviews: productData.reviews ? JSON.stringify(productData.reviews) : '[]'
    };

    const response = await http.post('/.netlify/functions/addProduct', productToSend);
    return normalizeProduct(response.data);
  } catch (error) {
    console.error('Add product error:', error);
    throw error;
  }
};

// export const updateProduct = async (id: number | string, productData: Partial<Product>) => {

//     const response = await http.patch(`/products/${id}`, productData);
//     return response.data;

// };

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  try {
    // تبدیل داده‌ها به فرمت مناسب برای دیتابیس
    const updateData = {
      ...productData,
      sizes: productData.sizes || undefined,
      colors: productData.colors || undefined,
      reviews: productData.reviews ? JSON.stringify(productData.reviews) : undefined
    };

    const response = await http.patch(`/.netlify/functions/updateProduct?id=${id}`, updateData);
    return normalizeProduct(response.data);
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

// export const deleteProduct = async (id: number | string) => {

//     const response = await http.delete(`/products/${id}`);
//     return response.data;

// };


// export const getFeaturedProducts = async () => {
//   const response = await http.get('/api/products', {
//     params: { featured: true },
//   });
//   console.log('getFeaturedProducts:', response.data);

//   return response.data;
// };

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await http.delete(`/.netlify/functions/deleteProduct?id=${id}`);
    return response.data.success;
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

export const getFeaturedProducts =  async () => {
  try {
    const response = await fetch('/.netlify/functions/getFeaturedProducts');
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`خطای سرور: ${response.status} - ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      throw new Error(`پاسخ غیرمنتظره: ${text}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در دریافت محصولات ویژه:', error);
    throw error;
  }
};
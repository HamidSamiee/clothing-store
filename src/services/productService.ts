import { Product, ProductFilterOptions, PaginatedResponse ,RawProduct} from "@/types/Product";
import http from "./httpService";



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


export const searchProducts = async (query: string) => {

    const response = await http.get('/products');
    const products = response.data.filter((product: Product) => 
      product.name.toLowerCase().includes(query.toLowerCase()) || 
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    return products;

};


// سرویس‌های مدیریت محصولات (برای ادمین)

const normalizeProduct = (product: RawProduct): Product => {
  const normalized: Product = {
    ...product,
    id: product.id?.toString() || '', // تبدیل به string با مقدار پیش‌فرض
    price: Number(product.price),
    rating: Number(product.rating),
    stock: Number(product.stock),
    sizes: Array.isArray(product.sizes) 
      ? product.sizes 
      : product.sizes.split(',').map((s: string) => s.trim()),
    colors: Array.isArray(product.colors) 
      ? product.colors 
      : product.colors.split(',').map((c: string) => c.trim()),
    specifications: product.specifications || {},
    reviews: product.reviews ? JSON.parse(product.reviews) : []
  };
  
  // محاسبه averageRating اگر وجود نداشت
  if (normalized.reviews && normalized.reviews.length > 0 && !normalized.averageRating) {
    normalized.averageRating = normalized.reviews.reduce((sum, review) => sum + review.rating, 0) / normalized.reviews.length;
  }
  
  return normalized;
};

// تابع addProduct اصلاح شده
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  const normalizedData: RawProduct = {
    ...productData,
    price: productData.price.toString(),
    rating: productData.rating.toString(),
    stock: productData.stock.toString(),
    sizes: productData.sizes,
    colors: productData.colors,
    reviews: productData.reviews ? JSON.stringify(productData.reviews) : undefined
  };
  
  const response = await http.post('/products', normalizedData);
  return normalizeProduct(response.data);
};


export const updateProduct = async (id: number | string, productData: Partial<Product>) => {

    const response = await http.patch(`/products/${id}`, productData);
    return response.data;

};


export const deleteProduct = async (id: number | string) => {

    const response = await http.delete(`/products/${id}`);
    return response.data;

};


// export const getFeaturedProducts = async () => {
//   const response = await http.get('/api/products', {
//     params: { featured: true },
//   });
//   console.log('getFeaturedProducts:', response.data);

//   return response.data;
// };

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
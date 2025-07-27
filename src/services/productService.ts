import { Product, ProductFilterOptions, PaginatedResponse } from "@/types/Product";
import http from "./httpService";


export const getProducts = async (
  options: ProductFilterOptions = {}
): Promise<PaginatedResponse<Product>> => {
  // ابتدا همه محصولات را دریافت می‌کنیم
  const response = await http.get('/products');
  
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
        products.sort((a: Product, b: Product) => b.id - a.id);
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


export const getProductById = async (id: number) => {
 
    const response = await http.get(`/products/${id}`);
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

const normalizeProduct = (product: any): Product => ({
  ...product,
  price: Number(product.price),
  rating: Number(product.rating),
  stock: Number(product.stock),
  sizes: Array.isArray(product.sizes) ? product.sizes : product.sizes.split(',').map(s => s.trim()),
  colors: Array.isArray(product.colors) ? product.colors : product.colors.split(',').map(c => c.trim())
});

export const addProduct = async (productData: Omit<Product, 'id'>) => {
  const normalizedData = normalizeProduct(productData);
  const response = await http.post('/products', normalizedData);
  return response.data;
};


export const updateProduct = async (id: number, productData: Partial<Product>) => {

    const response = await http.patch(`/products/${id}`, productData);
    return response.data;

};


export const deleteProduct = async (id: number) => {

    const response = await http.delete(`/products/${id}`);
    return response.data;

};


export const getFeaturedProducts = async () => {
  const response = await http.get('/products', {
    params: { featured: true },
  });
  return response.data;
};

 
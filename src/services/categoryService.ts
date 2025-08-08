import http from "./httpService";

export const getCategories = async () => {
      const response = await http.get('/.netlify/functions/getCategories');
      return response.data;
    
  };
  
  export const getCategoryBySlug = async (slug: string) => {
      const response = await http.get('/categories', {
        params: { slug },
      });
      return response.data[0] || null;
  
  };
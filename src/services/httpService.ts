import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL || '/api';

const app = axios.create({
    baseURL,
    withCredentials: false,
    headers: { 'Content-Type': 'application/json' },
  });
  
  
app.interceptors.request.use(
  (res) => res,
  (err) => Promise.reject(err)
);

app.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;
    if (err.response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const { data } = await axios.get(
          `${baseURL}/user/refresh-token`,
          {
            withCredentials: true,
          }
        );
        if (data) return app(originalConfig);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(err);
  }
);

const http = {
  get: app.get,
  patch: app.patch,
  put: app.put,
  delete: app.delete,
  post: app.post,
};

export default http;

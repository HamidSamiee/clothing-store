import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import Layout from "@/layout/Layout";
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const Home = lazy(() => import('@pages/Home/Home'));
const ProductList = lazy(() => import('@pages/Products/ProductList'));
const ProductDetails = lazy(() => import('@pages/Products/ProductsPage/ProductsPage'));
const Cart = lazy(() => import('@pages/Cart/Cart'));
const Checkout = lazy(() => import('@pages/Checkout/Checkout'));
const Login = lazy(() => import('@pages/Auth/Login'));
const Register = lazy(() => import('@pages/Auth/Register'));
const Profile = lazy(() => import('@/pages/Profile/UserProfile'));
const SearchPage = lazy(() => import('@pages/SearchPage/SearchPage'));
const About = lazy(() => import('@pages/About/About'));
const Contact = lazy(() => import('@pages/About/Contact'));
const NotFound = lazy(() => import('@pages/NotFound/NotFound'));
const PaymentSuccess = lazy(() => import('@pages/PaymentSuccess/PaymentSuccess'));
const PaymentFailed = lazy(() => import('@pages/PaymentFailed/PaymentFailed'));
const AdminDashboard = lazy(() => import('@/pages/Dashboard/AdminDashboard'));
const ProductsManagement = lazy(() => import('@/pages/Dashboard/ProductsManagement'));
const OrdersManagement = lazy(() => import('@/pages/Dashboard/OrdersManagement'));
const UsersManagement = lazy(() => import('@/pages/Dashboard/UsersManagement'));
const StatsDashboard = lazy(() => import('@/pages/Dashboard/StatsDashboard'));
const OrderHistory = lazy(() => import('@/pages/Profile/OrderHistory'));
const ProfileLayout = lazy(() => import('@/pages/Profile/ProfileLayout'));


export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      // مسیرهای عمومی
      { index: true, element: <Home /> },
      { path: "/products", element: <ProductList /> },
      { path: "/products/:id", element: <ProductDetails /> },
      { path: "/cart", element: <Cart /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/payment-success", element: <PaymentSuccess /> },
      { path: "/payment-failed", element: <PaymentFailed /> },
      
      // مسیرهای نیازمند احراز هویت (کاربران عادی و ادمین)
      {
        element: <PrivateRoute allowedRoles={['user', 'admin']} />,
        children: [
          { path: "/checkout", element: <Checkout /> },
          {
            path: "/user",
              element: <ProfileLayout />,
              children: [
                { path: "/user/profile", element: <Profile /> },
                { path: "/user/orders", element: <OrderHistory /> },
                { index: true, element: <Profile  /> },
              ]
          }
        ]
      },
      
      // مسیرهای ادمین
      {
        element: <PrivateRoute allowedRoles={['admin']} />,
        children: [
          { 
            path: "/admin",
            element: <AdminDashboard />,
            children: [
              { path: "products", element: <ProductsManagement /> },
              { path: "orders", element: <OrdersManagement /> },
              { path: "users", element: <UsersManagement /> },
              { path: "stats", element: <StatsDashboard /> }
            ]
          }
        ]
      },
   
      { path: "*", element: <NotFound /> },
    ]
  }
];
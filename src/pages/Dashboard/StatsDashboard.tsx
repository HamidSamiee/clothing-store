import { FiBarChart2, FiDollarSign, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import http from '@/services/httpService';
import styles from './AdminComponents.module.css';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatsDashboard = () => {
  const [stats, setStats] = useState({
    monthlySales: 0,
    newOrders: 0,
    newUsers: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<number[]>([]);

  useEffect(() => {
    fetchStats();
    fetchSalesData();
  }, []);

  const fetchStats = async () => {
    try {
      // محاسبه فروش ماه
      const ordersResponse = await http.get('/orders');
      const monthlySales = ordersResponse.data.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.date);
        const currentDate = new Date();
        if (orderDate.getMonth() === currentDate.getMonth() && 
            orderDate.getFullYear() === currentDate.getFullYear()) {
          return sum + order.total;
        }
        return sum;
      }, 0);

      // تعداد سفارشات جدید
      const newOrders = ordersResponse.data.filter((order: any) => {
        const orderDate = new Date(order.date);
        const currentDate = new Date();
        return orderDate.getMonth() === currentDate.getMonth() && 
               orderDate.getFullYear() === currentDate.getFullYear();
      }).length;

      // تعداد کاربران جدید
      const usersResponse = await http.get('/users');
      const newUsers = usersResponse.data.filter((user: any) => {
        const userDate = new Date(typeof user.id === 'number' ? user.id : parseInt(user.id));
        const currentDate = new Date();
        return userDate.getMonth() === currentDate.getMonth() && 
               userDate.getFullYear() === currentDate.getFullYear();
      }).length;

      // نرخ تبدیل (ساده‌سازی شده)
      const conversionRate = (newOrders / usersResponse.data.length) * 100;

      setStats({
        monthlySales,
        newOrders,
        newUsers,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const ordersResponse = await http.get('/orders');
      const currentDate = new Date();
      const lastThreeMonths = Array(3).fill(0).map((_, i) => {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        return {
          month: date.getMonth(),
          year: date.getFullYear(),
          sales: 0
        };
      }).reverse();

      ordersResponse.data.forEach((order: any) => {
        const orderDate = new Date(order.date);
        const monthData = lastThreeMonths.find(m => 
          m.month === orderDate.getMonth() && 
          m.year === orderDate.getFullYear()
        );
        if (monthData) {
          monthData.sales += order.total;
        }
      });

      setSalesData(lastThreeMonths.map(m => m.sales));
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const getMonthName = (offset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (2 - offset));
    return date.toLocaleString('fa-IR', { month: 'long' });
  };

  const chartData = {
    labels: Array(3).fill(0).map((_, i) => getMonthName(i)),
    datasets: [
      {
        label: 'فروش (تومان)',
        data: salesData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
      },
      title: {
        display: true,
        text: 'نمودار فروش ۳ ماه اخیر',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
        },
        ticks: {
          callback: function(value: number) {
            return toPersianNumbers(value.toLocaleString());
          },
        },
      },
    },
  };

  if (loading) {
    return <div className={styles.loading}>در حال بارگذاری آمار...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>آمار و گزارشات</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <h3>فروش ماه</h3>
            <p>{toPersianNumbers(stats.monthlySales.toLocaleString())} تومان</p>
            <span className={styles.trendUp}>
              ↑ {toPersianNumbers('5.2')}% نسبت به ماه گذشته
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiShoppingCart />
          </div>
          <div className={styles.statContent}>
            <h3>سفارشات جدید</h3>
            <p>{toPersianNumbers(stats.newOrders.toString())}</p>
            <span className={styles.trendUp}>
              ↑ {toPersianNumbers('3.1')}% نسبت به ماه گذشته
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUser />
          </div>
          <div className={styles.statContent}>
            <h3>کاربران جدید</h3>
            <p>{toPersianNumbers(stats.newUsers.toString())}</p>
            <span className={styles.trendDown}>
              ↓ {toPersianNumbers('1.8')}% نسبت به ماه گذشته
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiBarChart2 />
          </div>
          <div className={styles.statContent}>
            <h3>نرخ تبدیل</h3>
            <p>{toPersianNumbers(stats.conversionRate.toString())}%</p>
            <span className={styles.trendUp}>
              ↑ {toPersianNumbers('0.5')}% نسبت به ماه گذشته
            </span>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StatsDashboard;
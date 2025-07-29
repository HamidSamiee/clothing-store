import { useState, useEffect, useCallback } from 'react';
import { 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiEye,
  FiUser,
  FiShield,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';
import { User } from '@/types/User';
import http from '@/services/httpService';
import styles from './AdminComponents.module.css';
import { toPersianNumbers } from '@/utils/toPersianNumbers';
import { PersianTooltip } from '@/ui/Tooltip/Tooltip';
import UserModal from './components/UserModal/UserModal';
import { useDebounce } from '@/hooks/useDebounce';

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add'>('view');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // تاخیر 500 میلی‌ثانیه


  const USERS_PER_PAGE = 8;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await http.get('/users', {
        params: {
          _page: currentPage,
          _limit: USERS_PER_PAGE,
          q: debouncedSearchTerm
        }
      });
      setUsers(response.data);
      setTotalUsers(parseInt(response.headers['x-total-count'] || '0', 10));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  },[currentPage,debouncedSearchTerm])

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleOpenModal = (type: 'view' | 'edit' | 'add', user?: User) => {
    setModalType(type);
    setSelectedUser(user || {
      id: 0,
      name: '',
      email: '',
      password: '',
      address: '',
      phone: '',
      orders: [],
      role: 'user'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (userData: User) => {
    try {
      if (modalType === 'add') {
        await http.post('/users', userData);
      } else if (modalType === 'edit') {
        await http.patch(`/users/${userData.id}`, userData);
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleDelete = async (userId: string | number) => {
    try {
      await http.delete(`/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  if (loading) {
    return <div className={styles.loading}>در حال بارگذاری کاربران...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>مدیریت کاربران</h2>
      
      <div className={styles.actionBar}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجوی کاربر (نام، ایمیل، تلفن)..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button 
          className={styles.addButton}
          onClick={() => handleOpenModal('add')}
        >
          <FiPlus /> کاربر جدید
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>تلفن</th>
              <th>نقش</th>
              <th>سفارشات</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{toPersianNumbers(user.phone ?? '-')}</td>
                <td>
                  <span className={`${styles.badge} ${
                    user.role === 'admin' ? styles.adminBadge : styles.userBadge
                  }`}>
                    {user.role === 'admin' ? (
                      <>
                        <FiShield /> مدیر
                      </>
                    ) : (
                      <>
                        <FiUser /> کاربر
                      </>
                    )}
                  </span>
                </td>
                <td>{toPersianNumbers((user.orders?.length ?? 0).toString())}</td>
                <td>
                  <div className={styles.actions}>
                    <PersianTooltip title="مشاهده" arrow>
                      <button 
                        className={styles.viewBtn}
                        onClick={() => handleOpenModal('view', user)}
                      >
                        <FiEye />
                      </button>
                    </PersianTooltip>
                    <PersianTooltip title="ویرایش" arrow>
                      <button 
                        className={styles.editBtn}
                        onClick={() => handleOpenModal('edit', user)}
                      >
                        <FiEdit />
                      </button>
                    </PersianTooltip>
                    <PersianTooltip title="حذف" arrow>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(user.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </PersianTooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* صفحه‌بندی */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronRight /> {/* برای RTL */}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {toPersianNumbers(page)}
            </button>
          ))}

          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FiChevronLeft /> {/* برای RTL */}
          </button>
        </div>
      )}

      {/* مودال کاربر */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        user={selectedUser}
        mode={modalType}
      />
    </div>
  );
};

export default UsersManagement;
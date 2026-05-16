import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    // Load quiz data from JSON
    fetch('/examen_completo.json')
      .then(res => res.json())
      .then(data => setQuizData(data))
      .catch(err => console.error("Error loading quiz data:", err));
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        quizData={quizData} 
      />
      
      <main className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}>
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user?.email || 'Usuario'}</span>
            <button className={styles.logoutBtn} onClick={logout}>Cerrar Sesión</button>
          </div>
        </header>

        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

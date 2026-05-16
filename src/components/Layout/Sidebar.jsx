import { Link, useLocation, useParams } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, toggleSidebar, quizData }) {
  const location = useLocation();
  const { examId, attemptId } = useParams();
  const { attemptData } = useQuiz();

  // Si no hay datos del quiz o no hay attempt activo, no mostramos grid
  if (!quizData || !examId || !attemptId || !attemptData) {
    return (
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.loading}>Loading Map...</div>
      </aside>
    );
  }

  const examInfo = quizData[examId];
  if (!examInfo) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2>QUESTION MAP</h2>
          <button className={styles.closeBtn} onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.navContainer}>
          <div className={styles.examSection}>
            <h3 className={styles.examTitle}>{examInfo.titulo}</h3>
            <div className={styles.questionGrid}>
              {examInfo.preguntas.map((q, idx) => {
                const path = `/exam/${examId}/attempt/${attemptId}/q/${idx}`;
                const isActive = location.pathname === path;
                
                // Determinar el estado visual
                const isAnswered = attemptData.answers && attemptData.answers[idx] && attemptData.answers[idx].length > 0;
                const isFlagged = attemptData.flags && attemptData.flags[idx];
                
                // En modo práctica, evaluamos si ya se comprobó
                // Vamos a usar un truco temporal: si está respondida y estamos viendo la solución, o guardamos el resultado
                // Para simplificar, si está "flagged" gana el color amarillo.
                
                let stateClass = '';
                if (isFlagged) stateClass = styles.gridFlagged;
                else if (isAnswered) {
                   // Si queremos saber si está bien/mal necesitamos comparar con `q.opciones`. 
                   // Como el usuario puede no haber validado, podemos colorearlo solo azul (respondido). 
                   // Si está validado (lo sabemos si guardamos un array `results` en Firestore). 
                   // Por ahora, asumimos que si está respondido es gris oscuro/azul.
                   stateClass = styles.gridAnswered;
                   
                   if (attemptData.results && attemptData.results[idx] !== undefined) {
                      stateClass = attemptData.results[idx] ? styles.gridCorrect : styles.gridIncorrect;
                   }
                }

                return (
                  <Link 
                    key={idx}
                    to={path} 
                    className={`${styles.gridItem} ${isActive ? styles.active : ''} ${stateClass}`}
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                  >
                    {idx + 1}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

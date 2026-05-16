import { useNavigate, useParams } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import styles from './ModeSelector.module.css';

export default function ModeSelector() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { startAttempt, loadingContext } = useQuiz();

  const handleSelectMode = async (mode) => {
    const attemptId = await startAttempt(examId, mode);
    if (attemptId) {
      navigate(`/exam/${examId}/attempt/${attemptId}/q/0`);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← Volver al Dashboard
      </button>

      <div className={styles.header}>
        <h1>Configurar Sesión</h1>
        <p>Selecciona el modo de evaluación para {examId.replace('_', ' ')}</p>
      </div>

      {loadingContext ? (
        <div className={styles.loading}>Iniciando sesión segura...</div>
      ) : (
        <div className={styles.modesGrid}>
          {/* MODO PRÁCTICA */}
          <div className={styles.modeCard}>
            <div className={styles.modeIcon}>P</div>
            <h2>Modo Práctica</h2>
            <p>Ideal para estudiar. Recibirás justificaciones detalladas y diagramas visuales inmediatamente después de contestar cada pregunta.</p>
            <ul className={styles.featureList}>
              <li>✓ Sin límite de tiempo</li>
              <li>✓ Explicaciones instantáneas</li>
              <li>✓ Progreso guardado automáticamente</li>
            </ul>
            <button className={styles.primaryBtn} onClick={() => handleSelectMode('practice')}>
              Iniciar Práctica
            </button>
          </div>

          {/* MODO EXAMEN */}
          <div className={styles.modeCard}>
            <div className={styles.modeIcon}>E</div>
            <h2>Modo Examen</h2>
            <p>Simulador estricto. Tendrás 130 minutos para completarlo. No verás si estás bien o mal hasta terminar la prueba.</p>
            <ul className={styles.featureList}>
              <li>✓ Temporizador de 130 minutos</li>
              <li>✓ Sin interrupciones ni ayudas</li>
              <li>✓ Calificación final y analítica</li>
            </ul>
            <button className={`${styles.primaryBtn} ${styles.examBtn}`} onClick={() => handleSelectMode('exam')}>
              Iniciar Simulación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

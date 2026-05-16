import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import styles from './ExamHistory.module.css';

export default function ExamHistory() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getUserAttempts } = useQuiz();
  const [attempts, setAttempts] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/examen_completo.json')
      .then(res => res.json())
      .then(data => setQuizData(data));
  }, []);

  useEffect(() => {
    const fetchAttempts = async () => {
      const allAttempts = await getUserAttempts();
      const examAttempts = allAttempts.filter(a => a.examId === examId);
      setAttempts(examAttempts.reverse()); 
      setLoading(false);
    };
    fetchAttempts();
  }, [examId, getUserAttempts]);

  if (loading || !quizData) return <div className={styles.loading}>Cargando historial...</div>;

  const exam = quizData[examId];
  if (!exam) return <div className={styles.emptyState}>Examen no encontrado</div>;

  const handleStartNew = () => {
    navigate(`/exam/${examId}/mode`);
  };

  const handleViewAttempt = (attemptId) => {
    navigate(`/exam/${examId}/attempt/${attemptId}/results`);
  };

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return 'En progreso';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours} h ${mins} min`;
    }
    return `${diffMins} minutos`;
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-MX');
  };

  // SVG Circular chart generator
  const CircularChart = ({ score }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
    const color = score >= 70 ? '#10b981' : '#f43f5e'; // Green vs Red

    return (
      <div className={styles.chartContainer}>
        <svg className={styles.chartSvg} viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} className={styles.chartBg} />
          <circle 
            cx="30" 
            cy="30" 
            r={radius} 
            className={styles.chartProgress}
            stroke={color}
            strokeDasharray={strokeDasharray}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        <ChevronLeft size={20} /> Volver al Dashboard
      </button>

      <div className={styles.header}>
        <div className={styles.examInfo}>
          {exam.preguntas.length} preguntas <span>|</span> 130 minutos <span>|</span> Se requiere 70% para aprobar
        </div>
        <button className={styles.startBtn} onClick={handleStartNew}>
          Iniciar nuevo intento
        </button>
      </div>

      <h2 className={styles.sectionTitle}>Intentos Previos</h2>

      {attempts.length === 0 ? (
        <div className={styles.emptyState}>
          No has realizado ningún intento para este examen.
        </div>
      ) : (
        <div className={styles.attemptsList}>
          {attempts.map((attempt) => (
            <div 
              key={attempt.attemptId} 
              className={styles.attemptCard}
              onClick={() => handleViewAttempt(attempt.attemptId)}
            >
              <div className={styles.leftSection}>
                <CircularChart score={attempt.score || 0} />
                <span className={styles.modeBadge}>
                  {attempt.isExamMode ? 'Modo Examen' : 'Modo Práctica'}
                </span>
                <div className={styles.score}>
                  {attempt.score || 0}% correcto
                </div>
              </div>
              <div className={styles.metadata}>
                {calculateDuration(attempt.startTime, attempt.endTime)}
              </div>
              <div className={styles.date}>
                {formatDate(attempt.endTime || attempt.startTime)}
              </div>
              <ChevronDown className={styles.chevron} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

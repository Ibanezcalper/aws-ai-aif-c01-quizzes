import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuiz } from '../../context/QuizContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserAttempts } = useQuiz();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const availableExams = [
    { id: 'examen_1', title: 'Examen de Prueba 1', color: '#00e5ff' },
    { id: 'examen_2', title: 'Examen de Prueba 2', color: '#00e676' },
    { id: 'examen_3', title: 'Examen de Prueba 3', color: '#ffea00' },
    { id: 'examen_4', title: 'Examen de Prueba 4', color: '#ff4d4f' },
    { id: 'examen_5', title: 'Examen de Prueba 5', color: '#b388ff' },
    { id: 'examen_6', title: 'Examen de Prueba 6', color: '#ff8a65' }
  ];

  useEffect(() => {
    const fetchAttempts = async () => {
      const data = await getUserAttempts();
      setAttempts(data.reverse()); 
      setLoading(false);
    };
    fetchAttempts();
  }, [getUserAttempts]);

  // Filtrar solo los completados para la gráfica
  const completedAttempts = attempts.filter(a => a.status === 'completed');
  
  // Dar formato para múltiples líneas
  const chartData = completedAttempts.map((a, index) => {
    const point = { name: `T-${index + 1}` };
    point[a.examId] = a.score || 0;
    return point;
  });

  const handleViewHistory = (examId) => {
    navigate(`/exam/${examId}/history`);
  };

  if (loading) return <div className={styles.loading}>Cargando dashboard...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Bienvenido, {user?.displayName || 'Usuario'}</h1>
        <p>Selecciona un examen para ver tu historial y comenzar nuevos intentos. Tu progreso se guarda automáticamente.</p>
      </div>

      <div className={styles.statsSection}>
        <h2>Tu Evolución Global</h2>
        {completedAttempts.length > 0 ? (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="5 5" />
                <XAxis dataKey="name" stroke="#a0a6b5" />
                <YAxis stroke="#a0a6b5" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend />
                {availableExams.map(exam => (
                  <Line 
                    key={exam.id}
                    type="monotone" 
                    dataKey={exam.id} 
                    name={exam.title}
                    stroke={exam.color} 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyState}>
            Aún no has completado ningún examen. La gráfica aparecerá cuando termines uno.
          </div>
        )}
      </div>

      <div className={styles.examsSection}>
        <h2>Exámenes Disponibles</h2>
        <div className={styles.examsGrid}>
          {availableExams.map(exam => (
            <div key={exam.id} className={styles.examCard}>
              <h3>{exam.title}</h3>
              <p>Simulador técnico AssessTech</p>
              <div className={styles.cardActions}>
                <button className={styles.startBtn} onClick={() => handleViewHistory(exam.id)}>
                  Ver Historial
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

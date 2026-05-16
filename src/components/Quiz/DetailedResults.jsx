import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { ChevronLeft, ChevronDown, CheckCircle, XCircle, Zap } from 'lucide-react';
import styles from './DetailedResults.module.css';

export default function DetailedResults() {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const { getUserAttempts } = useQuiz();
  const [attempt, setAttempt] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    fetch('/examen_completo.json')
      .then(res => res.json())
      .then(data => setQuizData(data));
  }, []);

  useEffect(() => {
    const fetchAttempt = async () => {
      const allAttempts = await getUserAttempts();
      const current = allAttempts.find(a => a.attemptId === attemptId);
      if (current) setAttempt(current);
      setLoading(false);
    };
    fetchAttempt();
  }, [attemptId, getUserAttempts]);

  if (loading || !quizData) return <div className={styles.loading}>Cargando resultados...</div>;

  const exam = quizData[examId];
  if (!exam || !attempt) return <div className={styles.error}>Datos no encontrados</div>;

  // Calculate statistics
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let flaggedCount = 0;

  const questionsWithStatus = exam.preguntas.map((q, idx) => {
    const userAnswers = attempt.answers[idx] || [];
    const correctIndices = q.opciones.map((o, i) => o.es_correcta ? i : -1).filter(i => i !== -1);
    
    const isAnswered = userAnswers.length > 0;
    const isCorrect = isAnswered && userAnswers.length === correctIndices.length && correctIndices.every(i => userAnswers.includes(i));
    const isFlagged = attempt.flags && attempt.flags[idx];

    let status = 'skipped';
    if (isAnswered) {
      status = isCorrect ? 'correct' : 'incorrect';
    }

    if (status === 'correct') correctCount++;
    if (status === 'incorrect') incorrectCount++;
    if (status === 'skipped') skippedCount++;
    if (isFlagged) flaggedCount++;

    return { ...q, idx, status, userAnswers, correctIndices, isFlagged };
  });

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  const filteredQuestions = questionsWithStatus.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'flagged') return q.isFlagged;
    return q.status === filter;
  });

  return (
    <div className={styles.container}>
      <button className={styles.backLink} onClick={() => navigate(`/exam/${examId}/history`)}>
        <ChevronLeft size={16} /> Volver al historial de intentos
      </button>

      <div className={styles.topBar}>
        <h1 className={styles.title}>{exam.titulo || examId} - Resultados</h1>
      </div>

      <h2 className={styles.attemptInfo}>Intento {attempt.attemptId.substring(0,6)}</h2>

      <div className={styles.filtersRow}>
        <button className={styles.filterBtn}>Todos los dominios <ChevronDown size={14}/></button>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>
          {exam.preguntas.length} todas
        </button>
        <button className={`${styles.filterBtn} ${filter === 'correct' ? styles.active : ''}`} onClick={() => setFilter('correct')}>
          {correctCount} correctas
        </button>
        <button className={`${styles.filterBtn} ${filter === 'incorrect' ? styles.active : ''}`} onClick={() => setFilter('incorrect')}>
          {incorrectCount} incorrectas
        </button>
        <button className={`${styles.filterBtn} ${filter === 'skipped' ? styles.active : ''}`} onClick={() => setFilter('skipped')}>
          {skippedCount} omitidas
        </button>
        <button className={`${styles.filterBtn} ${filter === 'flagged' ? styles.active : ''}`} onClick={() => setFilter('flagged')}>
          {flaggedCount} marcadas
        </button>

        <button className={styles.collapseBtn} onClick={collapseAll}>
          Colapsar todas las preguntas
        </button>
      </div>

      <div className={styles.questionsList}>
        {filteredQuestions.map((q) => {
          const isExpanded = !!expandedQuestions[q.idx];

          return (
            <div key={q.idx} className={styles.questionCard}>
              <div className={styles.cardHeader} onClick={() => toggleQuestion(q.idx)}>
                <div className={`${styles.qStatusIcon} ${styles[q.status]}`}>
                  {q.status === 'correct' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </div>
                <div className={styles.qTitle}>
                  Pregunta {q.idx + 1} 
                  <span className={`${styles.qResultText} ${styles[q.status]}`}>
                    {q.status === 'correct' ? 'Correcta' : q.status === 'incorrect' ? 'Incorrecta' : 'Omitida'}
                  </span>
                </div>
                
                <ChevronDown className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`} size={20} style={{marginLeft: 'auto'}} />
              </div>

              {isExpanded && (
                <div className={styles.cardBody}>
                  <div className={styles.questionText}>
                    {q.pregunta_texto}
                  </div>

                  <div className={styles.optionsList}>
                    {q.opciones.map((opt, oIdx) => {
                      const isSelected = q.userAnswers.includes(oIdx);
                      const isCorrectOption = opt.es_correcta;

                      // Styles based on logic
                      let itemClass = styles.optionItem;
                      let badge = null;

                      if (isSelected && !isCorrectOption) {
                        itemClass += ` ${styles.selectedIncorrect}`;
                        badge = <div className={`${styles.optionBadge} ${styles.incorrect}`}>Tu respuesta es incorrecta</div>;
                      } else if (isCorrectOption) {
                        itemClass += ` ${styles.isCorrect}`;
                        badge = <div className={`${styles.optionBadge} ${styles.correct}`}>Respuesta correcta</div>;
                      }

                      return (
                        <div key={oIdx} className={itemClass}>
                          <div className={`${styles.radioCircle} ${isSelected ? styles.selected : ''}`}>
                            {isSelected && <div className={styles.radioInner}></div>}
                          </div>
                          <div className={styles.optionContent}>
                            {badge}
                            <div className={styles.optionText}>{opt.texto}</div>
                          </div>
                          {isSelected && !isCorrectOption && (
                            <XCircle size={20} color="#f43f5e" style={{marginTop: badge ? '2rem' : '0'}}/>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.explanationSection}>
                    <div className={styles.explanationTitle}>Explicación general</div>
                    
                    <div className={styles.explanationContent}>
                      {q.explicacion}
                    </div>

                    {/* Option-specific images */}
                    {q.opciones.map((opt, idx) => {
                      if (opt.imagenes && opt.imagenes.length > 0) {
                        return (
                          <div key={`opt-img-${idx}`} style={{ marginTop: '1.5rem' }}>
                            <div style={{ fontSize: '0.9rem', color: '#8b5cf6', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                              Relacionado a: {opt.texto.split('-')[0]}
                            </div>
                            {opt.imagenes.map((img, i) => (
                              <img key={i} src={`/${img}`} alt="Diagrama de opción" className={styles.explanationImage} />
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* General explanation images */}
                    {q.imagenes_explicacion && q.imagenes_explicacion.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        {q.imagenes_explicacion.map((img, i) => (
                          <img key={`expl-img-${i}`} src={`/${img}`} alt="Explicación general" className={styles.explanationImage} />
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

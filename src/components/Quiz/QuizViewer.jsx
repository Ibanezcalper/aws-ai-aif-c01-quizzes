import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { Flag, Clock, CheckCircle, XCircle } from 'lucide-react';
import styles from './QuizViewer.module.css';

export default function QuizViewer() {
  const { examId, attemptId, qId } = useParams();
  const navigate = useNavigate();
  const { attemptData, activeAttemptId, resumeAttempt, saveAnswer, saveResult, toggleFlag, finishAttempt } = useQuiz();
  
  const [quizData, setQuizData] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7800); // 130 minutes

  useEffect(() => {
    fetch('/examen_completo.json')
      .then(res => res.json())
      .then(data => setQuizData(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!activeAttemptId && attemptId) {
      resumeAttempt(attemptId);
    }
  }, [activeAttemptId, attemptId, resumeAttempt]);

  // Update timer
  useEffect(() => {
    if (attemptData?.mode === 'exam' && attemptData?.status === 'in_progress') {
      const start = new Date(attemptData.startTime).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        const remaining = 7800 - diff;
        if (remaining <= 0) {
          clearInterval(interval);
          handleFinishExam();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attemptData]);

  if (!quizData || !attemptData) return <div className={styles.loading}>Cargando entorno de prueba...</div>;

  const exam = quizData[examId];
  const questionIndex = parseInt(qId, 10);
  const question = exam?.preguntas[questionIndex];
  
  if (!question) return <div className={styles.error}>Pregunta no encontrada.</div>;

  // Retrieve answers for this specific question from context
  const selectedOptions = attemptData.answers[questionIndex] || [];
  const isFlagged = attemptData.flags[questionIndex] || false;
  const isExamMode = attemptData.mode === 'exam';
  
  // If we already evaluated this in practice mode, we can show explanation automatically
  const hasResult = attemptData.results && attemptData.results[questionIndex] !== undefined;
  // Solo auto-abrir si ya se comprobó en modo práctica.
  const shouldShowExplanation = showExplanation || (hasResult && !isExamMode);

  const handleOptionToggle = (index) => {
    if (shouldShowExplanation && !isExamMode) return; // Block changes if already checked in practice mode
    if (attemptData.status === 'completed') return; // Block changes if exam finished

    const correctCount = question.opciones.filter(o => o.es_correcta).length;

    let newSelections;
    
    if (correctCount === 1) {
      // Single choice: selecting a new option replaces the old one
      newSelections = [index];
    } else {
      // Multiple choice: toggle option, but prevent exceeding max allowed
      if (selectedOptions.includes(index)) {
        newSelections = selectedOptions.filter(i => i !== index);
      } else {
        if (selectedOptions.length < correctCount) {
          newSelections = [...selectedOptions, index];
        } else {
          // If they try to select more than allowed, we could ignore or replace the oldest. 
          // Ignoring is standard for checkboxes with limits.
          return;
        }
      }
    }
    
    saveAnswer(questionIndex, newSelections);
  };

  const isFullyCorrect = () => {
    const correctIndices = question.opciones
      .map((o, i) => o.es_correcta ? i : -1)
      .filter(i => i !== -1);
    
    if (correctIndices.length !== selectedOptions.length) return false;
    return correctIndices.every(i => selectedOptions.includes(i));
  };

  const handleCheckAnswer = () => {
    if (selectedOptions.length === 0) return;
    
    if (isExamMode) {
      handleNext();
    } else {
      setShowExplanation(true);
      const isCorrect = isFullyCorrect();
      saveResult(questionIndex, isCorrect);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (questionIndex < exam.preguntas.length - 1) {
      navigate(`/exam/${examId}/attempt/${attemptId}/q/${questionIndex + 1}`);
    } else {
      handleFinishExam();
    }
  };

  const handleFinishExam = () => {
    let correctCount = 0;
    exam.preguntas.forEach((q, idx) => {
      const userAnswers = attemptData.answers[idx] || [];
      const correctIndices = q.opciones.map((o, i) => o.es_correcta ? i : -1).filter(i => i !== -1);
      const isOk = userAnswers.length === correctIndices.length && correctIndices.every(i => userAnswers.includes(i));
      if (isOk) correctCount++;
    });
    
    const score = Math.round((correctCount / exam.preguntas.length) * 100);
    finishAttempt(score);
    navigate(`/exam/${examId}/attempt/${attemptId}/results`);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePauseExit = () => {
    navigate('/');
  };

  return (
    <div className={styles.splitLayout}>
      {/* Left Column: Question & Options */}
      <div className={`${styles.mainColumn} ${shouldShowExplanation ? styles.panelOpen : ''}`}>
        
        {/* Top Action Bar */}
        <div className={styles.topBar}>
          <div className={styles.examModeInfo}>
            <button className={styles.backBtn} onClick={handlePauseExit}>
              ← Pausar y Salir
            </button>
            {isExamMode ? <span className={styles.badgeExam}>MODO EXAMEN</span> : <span className={styles.badgePractice}>MODO PRÁCTICA</span>}
            {isExamMode && (
              <div className={styles.timer}>
                <Clock size={18} /> {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <button 
            className={`${styles.flagBtn} ${isFlagged ? styles.flagged : ''}`}
            onClick={() => toggleFlag(questionIndex)}
          >
            <Flag size={18} /> {isFlagged ? 'Desmarcar' : 'Marcar para revisión'}
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.badge}>{exam.titulo}</span>
            <span className={styles.counter}>PREGUNTA {questionIndex + 1} DE {exam.preguntas.length}</span>
          </div>

          <h2 className={styles.prompt}>
            {question.texto}
            {question.opciones.filter(o => o.es_correcta).length > 1 && (
              <span style={{display: 'block', fontSize: '0.95rem', color: '#8b5cf6', marginTop: '0.75rem', fontWeight: 'bold', fontFamily: 'Sora'}}>
                (Elige {question.opciones.filter(o => o.es_correcta).length} opciones)
              </span>
            )}
          </h2>

          {question.imagenes_pregunta && question.imagenes_pregunta.length > 0 && (
            <div className={styles.imagesContainer}>
              {question.imagenes_pregunta.map((img, i) => (
                <img key={i} src={`/${img}`} alt="Pregunta" className={styles.questionImage} />
              ))}
            </div>
          )}

          <div className={styles.optionsList}>
            {question.opciones.map((opt, idx) => {
              const isSelected = selectedOptions.includes(idx);
              const letter = String.fromCharCode(65 + idx); // A, B, C, D...
              let optionClass = styles.option;
              
              if (isSelected) optionClass += ` ${styles.selected}`;
              
              if (shouldShowExplanation && !isExamMode) {
                if (opt.es_correcta) optionClass += ` ${styles.correct}`;
                else if (isSelected && !opt.es_correcta) optionClass += ` ${styles.incorrect}`;
              }

              return (
                <div 
                  key={idx} 
                  className={optionClass}
                  onClick={() => handleOptionToggle(idx)}
                >
                  <div className={styles.optionLetter}>{letter}</div>
                  <div className={styles.optionContent}><p>{opt.texto}</p></div>
                  
                  {shouldShowExplanation && !isExamMode && opt.es_correcta && (
                    <div className={styles.correctIcon}><CheckCircle size={24} /></div>
                  )}
                  {shouldShowExplanation && !isExamMode && isSelected && !opt.es_correcta && (
                    <div className={styles.incorrectIcon}><XCircle size={24} /></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.actions}>
            {(!shouldShowExplanation || isExamMode) ? (
              <button 
                className={styles.primaryBtn} 
                onClick={handleCheckAnswer}
                disabled={selectedOptions.length === 0}
              >
                {isExamMode ? 'Guardar y Continuar' : 'Comprobar Respuesta'}
              </button>
            ) : (
              <button className={styles.primaryBtn} onClick={handleNext}>
                {questionIndex < exam.preguntas.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Práctica'}
              </button>
            )}
            
            {isExamMode && questionIndex === exam.preguntas.length - 1 && (
              <button className={styles.dangerBtn} onClick={handleFinishExam} style={{marginLeft: '1rem'}}>
                Finalizar Examen
              </button>
            )}
          </div>

          {/* Navigation Controls */}
          <div className={styles.navigationRow}>
            <button 
              className={styles.navBtn} 
              onClick={() => navigate(`/exam/${examId}/attempt/${attemptId}/q/${questionIndex - 1}`)}
              disabled={questionIndex === 0}
            >
              ← Pregunta Anterior
            </button>
            <button 
              className={styles.navBtn} 
              onClick={() => navigate(`/exam/${examId}/attempt/${attemptId}/q/${questionIndex + 1}`)}
              disabled={questionIndex === exam.preguntas.length - 1}
            >
              Siguiente Pregunta →
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Solution Analysis Panel (Only in Practice Mode) */}
      {shouldShowExplanation && !isExamMode && (
        <aside className={styles.sidePanel}>
          <div className={`${styles.explanationPane} ${isFullyCorrect() ? styles.paneSuccess : styles.paneError}`}>
            <div className={styles.explanationHeader}>
              <h3>{isFullyCorrect() ? 'Análisis de Solución: Correcta' : 'Análisis de Solución: Incorrecta'}</h3>
            </div>
            
            <div className={styles.explanationBody}>
              <p className={styles.mainExplanationText}>{question.explicacion}</p>
              
              {/* Interleaved Images Logic */}
              <div className={styles.interleavedConcepts}>
                {question.opciones
                  .filter(o => o.es_correcta || (o.imagenes && o.imagenes.length > 0))
                  .map((opt, idx) => (
                    <div key={`concept-${idx}`} className={styles.conceptBlock}>
                      {/* Solo mostramos el mini-header si trae imágenes que intercalar o si es correcta */}
                      {opt.imagenes && opt.imagenes.length > 0 && (
                        <>
                          <div className={styles.conceptTitle}>
                            Relacionado a: <strong>{opt.texto}</strong>
                          </div>
                          <div className={styles.conceptImages}>
                            {opt.imagenes.map((img, i) => (
                              <img key={i} src={`/${img}`} alt={`Diagrama explicativo`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                ))}
                
                {/* General images at the bottom if any */}
                {question.imagenes_explicacion && question.imagenes_explicacion.length > 0 && (
                  <div className={styles.generalImages}>
                    <h4>Diagrama General:</h4>
                    {question.imagenes_explicacion.map((img, i) => (
                      <img key={`expl-img-${i}`} src={`/${img}`} alt="Explicación general" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

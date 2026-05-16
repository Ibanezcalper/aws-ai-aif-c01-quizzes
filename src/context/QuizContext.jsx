import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const QuizContext = createContext();

export function useQuiz() {
  return useContext(QuizContext);
}

export function QuizProvider({ children }) {
  const { user } = useAuth();
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);

  // Resume an attempt if we pass an ID
  const resumeAttempt = async (attemptId) => {
    if (!user) return;
    setLoadingContext(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'attempts', attemptId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setActiveAttemptId(attemptId);
        setAttemptData(docSnap.data());
      }
    } catch (e) {
      console.error("Error resuming attempt", e);
    }
    setLoadingContext(false);
  };

  // Start a new attempt
  const startAttempt = async (examId, mode) => {
    if (!user) return null;
    setLoadingContext(true);
    
    // Auto-generate attempt ID: e.g. "examen_1_17154212"
    const timestamp = Date.now();
    const attemptId = `${examId}_${timestamp}`;
    
    const newAttempt = {
      attemptId,
      examId,
      mode, // 'practice' or 'exam'
      startTime: new Date().toISOString(),
      status: 'in_progress',
      answers: {},
      flags: {},
      results: {}, // Guardar si está bien/mal
      score: null
    };

    try {
      const docRef = doc(db, 'users', user.uid, 'attempts', attemptId);
      await setDoc(docRef, newAttempt);
      setActiveAttemptId(attemptId);
      setAttemptData(newAttempt);
      setLoadingContext(false);
      return attemptId;
    } catch (e) {
      console.error("Error starting attempt", e);
      setLoadingContext(false);
      return null;
    }
  };

  // Save answer
  const saveAnswer = async (questionIndex, selectedOptions) => {
    if (!user || !activeAttemptId) return;
    
    setAttemptData(prev => ({
      ...prev,
      answers: { ...(prev?.answers || {}), [questionIndex]: selectedOptions }
    }));

    // Persist to Firestore
    try {
      const docRef = doc(db, 'users', user.uid, 'attempts', activeAttemptId);
      await updateDoc(docRef, {
        [`answers.${questionIndex}`]: selectedOptions
      });
    } catch (e) {
      console.error("Error saving answer", e);
    }
  };

  // Save result (for practice mode map colors)
  const saveResult = async (questionIndex, isCorrect) => {
    if (!user || !activeAttemptId) return;
    
    setAttemptData(prev => ({
      ...prev,
      results: { ...(prev?.results || {}), [questionIndex]: isCorrect }
    }));

    try {
      const docRef = doc(db, 'users', user.uid, 'attempts', activeAttemptId);
      await updateDoc(docRef, {
        [`results.${questionIndex}`]: isCorrect
      });
    } catch (e) {
      console.error("Error saving result", e);
    }
  };

  // Toggle flag
  const toggleFlag = async (questionIndex) => {
    if (!user || !activeAttemptId || !attemptData) return;
    
    const currentFlag = !!attemptData.flags[questionIndex];

    setAttemptData(prev => ({
      ...prev,
      flags: { ...(prev?.flags || {}), [questionIndex]: !currentFlag }
    }));

    try {
      const docRef = doc(db, 'users', user.uid, 'attempts', activeAttemptId);
      await updateDoc(docRef, {
        [`flags.${questionIndex}`]: !currentFlag
      });
    } catch (e) {
      console.error("Error saving flag", e);
    }
  };

  // Finish exam
  const finishAttempt = async (score) => {
    if (!user || !activeAttemptId) return;
    
    setAttemptData(prev => ({ ...prev, status: 'completed', score }));
    
    try {
      const docRef = doc(db, 'users', user.uid, 'attempts', activeAttemptId);
      await updateDoc(docRef, {
        status: 'completed',
        endTime: new Date().toISOString(),
        score
      });
    } catch (e) {
      console.error("Error finishing attempt", e);
    }
  };

  // Fetch all attempts for dashboard
  const getUserAttempts = async () => {
    if (!user) return [];
    try {
      const q = query(collection(db, 'users', user.uid, 'attempts'), orderBy('startTime', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
      console.error("Error fetching attempts", e);
      return [];
    }
  };

  const value = {
    activeAttemptId,
    attemptData,
    loadingContext,
    startAttempt,
    resumeAttempt,
    saveAnswer,
    saveResult,
    toggleFlag,
    finishAttempt,
    getUserAttempts
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

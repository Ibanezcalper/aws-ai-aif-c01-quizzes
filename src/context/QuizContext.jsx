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

  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const getMockAttempts = () => JSON.parse(localStorage.getItem(`mock_attempts_${user?.uid}`) || '{}');
  const saveMockAttempts = (data) => localStorage.setItem(`mock_attempts_${user?.uid}`, JSON.stringify(data));

  // Resume an attempt if we pass an ID
  const resumeAttempt = async (attemptId) => {
    if (!user) return;
    setLoadingContext(true);
    if (useMock) {
      const attempts = getMockAttempts();
      if (attempts[attemptId]) {
        setActiveAttemptId(attemptId);
        setAttemptData(attempts[attemptId]);
      }
      setLoadingContext(false);
      return;
    }
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

    if (useMock) {
      const attempts = getMockAttempts();
      attempts[attemptId] = newAttempt;
      saveMockAttempts(attempts);
      setActiveAttemptId(attemptId);
      setAttemptData(newAttempt);
      setLoadingContext(false);
      return attemptId;
    }

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

    if (useMock) {
      const attempts = getMockAttempts();
      if (attempts[activeAttemptId]) {
        attempts[activeAttemptId].answers = { ...attempts[activeAttemptId].answers, [questionIndex]: selectedOptions };
        saveMockAttempts(attempts);
      }
      return;
    }

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

    if (useMock) {
      const attempts = getMockAttempts();
      if (attempts[activeAttemptId]) {
        attempts[activeAttemptId].results = { ...attempts[activeAttemptId].results, [questionIndex]: isCorrect };
        saveMockAttempts(attempts);
      }
      return;
    }

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

    if (useMock) {
      const attempts = getMockAttempts();
      if (attempts[activeAttemptId]) {
        attempts[activeAttemptId].flags = { ...attempts[activeAttemptId].flags, [questionIndex]: !currentFlag };
        saveMockAttempts(attempts);
      }
      return;
    }

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
    
    if (useMock) {
      const attempts = getMockAttempts();
      if (attempts[activeAttemptId]) {
        attempts[activeAttemptId].status = 'completed';
        attempts[activeAttemptId].endTime = new Date().toISOString();
        attempts[activeAttemptId].score = score;
        saveMockAttempts(attempts);
      }
      return;
    }

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
    if (useMock) {
      const attempts = getMockAttempts();
      return Object.values(attempts).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }
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

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ExamHistory from './components/Quiz/ExamHistory';
import ModeSelector from './components/Quiz/ModeSelector';
import QuizViewer from './components/Quiz/QuizViewer';
import DetailedResults from './components/Quiz/DetailedResults';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="exam/:examId/history" element={<ExamHistory />} />
              <Route path="exam/:examId/mode" element={<ModeSelector />} />
              <Route path="exam/:examId/attempt/:attemptId/q/:qId" element={<QuizViewer />} />
              <Route path="exam/:examId/attempt/:attemptId/results" element={<DetailedResults />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;

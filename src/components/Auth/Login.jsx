import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to Dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const getFirebaseErrorMessage = (errCode) => {
    switch (errCode) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado. Intenta iniciar sesión.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      default:
        return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, displayName);
        alert("¡Registro exitoso! Se ha enviado un correo de verificación con un enlace a tu bandeja de entrada (revisa también la carpeta de SPAM). Haz clic en el enlace para verificar tu cuenta.");
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      console.error("Firebase Email Auth Error:", err);
      setError(getFirebaseErrorMessage(err.code));
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Firebase Google Auth Error:", err);
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>AWS AI Quiz</h1>
        <p className={styles.subtitle}>
          Inicia sesión para acceder a los simuladores de examen y guardar tu progreso.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleEmailAuth} className={styles.form}>
          {isRegistering && (
            <div className={styles.inputGroup}>
              <label htmlFor="displayName">Nombre Completo</label>
              <input 
                type="text" 
                id="displayName" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isRegistering}
                placeholder="Ej. Juan Pérez"
              />
            </div>
          )}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.primaryButton}>
            {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>O continuar con</span>
        </div>

        <button onClick={handleGoogleAuth} className={styles.googleButton}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Google
        </button>

        <div className={styles.switchMode}>
          ¿{isRegistering ? 'Ya tienes' : 'No tienes'} una cuenta?{' '}
          <button onClick={() => setIsRegistering(!isRegistering)} className={styles.linkButton}>
            {isRegistering ? 'Inicia sesión aquí' : 'Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}

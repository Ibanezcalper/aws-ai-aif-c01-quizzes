# Simulador de Examen AWS AI Practitioner (AIF-C01)

Una aplicación React de grado SaaS (Software as a Service) diseñada para simular la experiencia del examen AWS Certified AI Practitioner (AIF-C01). Esta aplicación proporciona un entorno de estudio robusto con seguimiento de progreso en tiempo real, analíticas avanzadas y dos modos de estudio distintos (Práctica y Examen) para ayudarte a prepararte de forma eficaz.

## Características

- **Autenticación y Seguridad:** 
  - Integrado con Autenticación de Firebase.
  - Funcionalidad segura de registro e inicio de sesión de usuarios.
- **Modos de Estudio Duales:**
  - **Modo Práctica:** Retroalimentación instantánea después de cada pregunta. Muestra explicaciones detalladas e intercala diagramas relevantes inmediatamente después de comprobar la respuesta.
  - **Modo Examen:** Simula condiciones reales de examen con una cuenta regresiva de 130 minutos y resultados diferidos al finalizar.
- **Cuadrícula Dinámica de Preguntas:** 
  - Una barra lateral (sidebar) en tiempo real que rastrea las preguntas respondidas, no respondidas y marcadas para revisión.
  - Indicadores visuales por color (Gris: Vacía, Azul: Respondida, Amarillo: Marcada).
- **Persistencia de Estado Avanzada:** 
  - Sincronización en tiempo real con Firestore. 
  - Los intentos de examen se guardan automáticamente, permitiendo pausar, cerrar el navegador y reanudar exactamente donde te quedaste.
- **Historial Completo y Analíticas:**
  - **Dashboard:** Cuenta con un Gráfico Lineal dinámico construido con Recharts para visualizar la evolución de tus puntuaciones a lo largo del tiempo.
  - **Historial de Exámenes:** Una vista de historial estilo Udemy que lista todos los intentos previos, con gráficos de progreso circulares, marcas de tiempo e indicadores de modo.
  - **Resultados Detallados (Acordeón):** Interfaz de revisión post-examen que desglosa preguntas correctas, incorrectas y omitidas. Cuenta con tarjetas expandibles que muestran tus selecciones contra las respuestas correctas, junto a explicaciones generales detalladas e imágenes.

## Stack Tecnológico

- **Frontend:** React (Vite)
- **Enrutamiento:** React Router DOM v6
- **Estilos:** Vanilla CSS Modules con un tema oscuro moderno (Dark Theme)
- **Íconos:** Lucide React
- **Gráficos:** Recharts
- **Backend/Base de Datos:** Firebase (Auth y Firestore)

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Ibanezcalper/aws-ai-aif-c01-quizzes.git
   cd aws-ai-aif-c01-quizzes
   ```

2. **Instalar dependencias:**
   Este proyecto usa `pnpm`. Si no lo tienes instalado, puedes usar `npm` o `yarn`.
   ```bash
   pnpm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env` en el directorio raíz y agrega tu configuración de Firebase. Puedes usar el archivo `.env.example` como plantilla:
   ```env
   VITE_FIREBASE_API_KEY="tu_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="tu_auth_domain"
   VITE_FIREBASE_PROJECT_ID="tu_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="tu_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="tu_messaging_sender_id"
   VITE_FIREBASE_APP_ID="tu_app_id"
   VITE_FIREBASE_MEASUREMENT_ID="tu_measurement_id"
   
   # Opcional: Modo Mock Local
   # Establece esta variable en 'true' para omitir la autenticación y base de datos de Firebase.
   # Esto utilizará un usuario ficticio y guardará el progreso en el localStorage de tu navegador.
   VITE_USE_MOCK="true"
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   pnpm run dev
   ```
   Abre `http://localhost:5173` en tu navegador para ver la aplicación.

## Estructura de Datos

La aplicación lee las preguntas de forma estática desde `public/examen_completo.json`. Este archivo contiene un arreglo de exámenes, donde cada examen consta de múltiples preguntas. Cada objeto de pregunta contiene el texto de la pregunta, las opciones, las respuestas correctas, las explicaciones y las referencias a imágenes locales almacenadas en el directorio `public/imagenes_examen/`.

## Licencia

Este proyecto está destinado únicamente para fines de estudio personal y educativos. AWS y AWS Certified AI Practitioner son marcas comerciales de Amazon Web Services, Inc.

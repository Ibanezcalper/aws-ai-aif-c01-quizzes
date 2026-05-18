# AWS AI Practitioner (AIF-C01) Quiz Simulator

A fully-featured, SaaS-grade React application designed to simulate the AWS Certified AI Practitioner (AIF-C01) exam experience. This application provides a robust study environment with real-time progress tracking, advanced analytics, and two distinct study modes (Practice and Exam) to help users prepare effectively.

## Features

- **Authentication & Security:** 
  - Integrated with Firebase Authentication.
  - Secure user registration and login functionality.
- **Dual Study Modes:**
  - **Practice Mode:** Instant feedback after each question. Displays detailed explanations and interleaves relevant diagrams immediately after checking the answer.
  - **Exam Mode:** Simulates real exam conditions with a 130-minute countdown timer and deferred results.
- **Dynamic Question Grid:** 
  - A real-time sidebar tracking answered, unanswered, and flagged questions. 
  - Color-coded visual cues (Gray: Empty, Blue: Answered, Yellow: Flagged).
- **Advanced State Persistence:** 
  - Real-time synchronization with Firestore. 
  - Exam attempts are saved automatically, allowing users to pause, close the browser, and resume exactly where they left off.
- **Comprehensive History & Analytics:**
  - **Dashboard:** Features a dynamic Line Chart built with Recharts to visualize score progression over time across multiple attempts.
  - **Exam History:** A Udemy-style history view listing all previous attempts, complete with circular progress graphs, timestamps, and mode indicators.
  - **Detailed Results (Accordion):** Post-exam review interface that breaks down correct, incorrect, and skipped questions. Features expanding cards that show user selections versus correct answers, alongside rich overall explanations and diagrams.

## Tech Stack

- **Frontend:** React (Vite)
- **Routing:** React Router DOM v6
- **Styling:** Vanilla CSS Modules with a modern Dark Theme
- **Icons:** Lucide React
- **Charts:** Recharts
- **Backend/Database:** Firebase (Auth & Firestore)

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ibanezcalper/aws-ai-aif-c01-quizzes.git
   cd aws-ai-aif-c01-quizzes
   ```

2. **Install dependencies:**
   This project uses `pnpm`. If you don't have it installed, you can use `npm` or `yarn`.
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase configuration. You can use the `.env.example` file as a template:
   ```env
   VITE_FIREBASE_API_KEY="your_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
   
   # Optional: Local Mock Mode
   # Set to 'true' to bypass Firebase authentication and Firestore.
   # This will use a dummy user and save attempts to your browser's localStorage.
   VITE_USE_MOCK="true"
   ```

4. **Run the development server:**
   ```bash
   pnpm run dev
   ```
   Open `http://localhost:5173` to view it in the browser.

## Data Structure

The application reads questions statically from `public/examen_completo.json`. This file contains an array of exams, where each exam consists of multiple questions. Each question object contains the prompt, options, correct answers, explanations, and references to local images stored in the `public/imagenes_examen/` directory.

## License

This project is intended for personal study and educational purposes. AWS and AWS Certified AI Practitioner are trademarks of Amazon Web Services, Inc.

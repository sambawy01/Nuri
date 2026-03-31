import { Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import WelcomePage from './pages/WelcomePage';
import CreateProfilePage from './pages/CreateProfilePage';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import LearnPage from './pages/LearnPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <ProfileProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/subject/:subject" element={<SubjectPage />} />
          <Route path="/learn/:subject" element={<LearnPage />} />
          <Route path="/quiz/:subject" element={<QuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </ProfileProvider>
  );
}

export default App;

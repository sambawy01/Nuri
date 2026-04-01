import { Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import WelcomePage from './pages/WelcomePage';
import CreateProfilePage from './pages/CreateProfilePage';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import LearnPage from './pages/LearnPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';
import BadgesPage from './pages/BadgesPage';
import MistakesPage from './pages/MistakesPage';
import ReviewPage from './pages/ReviewPage';
import ExplainBackPage from './pages/ExplainBackPage';
import StickerBookPage from './pages/StickerBookPage';
import HomeworkPage from './pages/HomeworkPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import TreehousePage from './pages/TreehousePage';
import DuelsPage from './pages/DuelsPage';
import DuelPlayPage from './pages/DuelPlayPage';
import DuelResultsPage from './pages/DuelResultsPage';

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
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/explain/:subject" element={<ExplainBackPage />} />
          <Route path="/stickers" element={<StickerBookPage />} />
          <Route path="/homework" element={<HomeworkPage />} />
          <Route path="/parent/:profileId" element={<ParentDashboardPage />} />
          <Route path="/treehouse" element={<TreehousePage />} />
          <Route path="/duels" element={<DuelsPage />} />
          <Route path="/duel/:id" element={<DuelPlayPage />} />
          <Route path="/duel/:id/results" element={<DuelResultsPage />} />
        </Routes>
      </div>
    </ProfileProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import ErrorBoundary from './components/ErrorBoundary';
import ConnectionStatus from './components/ConnectionStatus';
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
import StoryMapPage from './pages/StoryMapPage';
import StoryChapterPage from './pages/StoryChapterPage';
import DuelsPage from './pages/DuelsPage';
import DuelPlayPage from './pages/DuelPlayPage';
import DuelResultsPage from './pages/DuelResultsPage';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <ConnectionStatus />
        <div className="min-h-screen pb-20">
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
            <Route path="/story" element={<StoryMapPage />} />
            <Route path="/story/:chapter/:stage" element={<StoryChapterPage />} />
          </Routes>
          <BottomNav />
        </div>
      </ProfileProvider>
    </ErrorBoundary>
  );
}

export default App;

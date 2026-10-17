import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StudentProvider } from './context/StudentContext';
import { FocusProvider } from './context/FocusContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import AuthModal from './components/common/AuthModal';
import MathScratchpadModal from './components/student_tools/MathScratchpadModal';
import StepByStepSolverModal from './components/student_tools/StepByStepSolverModal';
import CompareDock from './components/student_tools/CompareDock';
import ScholarCardModal from './components/student_tools/ScholarCardModal';

// Focus Components
import FocusSetupModal from './components/focus/FocusSetupModal';
import FocusHUD from './components/focus/FocusHUD';
import FocusCompleteModal from './components/focus/FocusCompleteModal';
import MindfulBreakStudio from './components/focus/MindfulBreakStudio';

// Pages
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import LibraryPage from './pages/LibraryPage';
import LessonDetailPage from './pages/LessonDetailPage';
import VisualLabPage from './pages/VisualLabPage';
import PracticePage from './pages/PracticePage';
import SolverPage from './pages/SolverPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CheatSheetPage from './pages/CheatSheetPage';
import AboutPage from './pages/AboutPage';
import DonatePage from './pages/DonatePage';
import ProfilePage from './pages/ProfilePage';
import RankingsPage from './pages/RankingsPage';

import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <ThemeProvider>
      <StudentProvider>
        <FocusProvider>
          <Router>
            {/* Automatic scroll restoration to top on any page switch */}
            <ScrollToTop />

            <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
              {/* Header Navigation */}
              <Navbar />

              {/* Global Modals & Docks */}
              <GlobalSearchModal />
              <AuthModal />
              <MathScratchpadModal />
              <StepByStepSolverModal />
              <CompareDock />
              <ScholarCardModal />

              {/* Global Focus Mode UI */}
              <FocusSetupModal />
              <FocusHUD />
              <FocusCompleteModal />
              <MindfulBreakStudio />

              {/* Main Content Router */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/learn" element={<LearnPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/lesson/:slug" element={<LessonDetailPage />} />
                  <Route path="/lessons/:slug" element={<LessonDetailPage />} />
                  <Route path="/lab" element={<VisualLabPage />} />
                  <Route path="/labs" element={<VisualLabPage />} />
                  <Route path="/visual-labs" element={<VisualLabPage />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/solver" element={<SolverPage />} />
                  <Route path="/flashcards" element={<FlashcardsPage />} />
                  <Route path="/cheatsheet" element={<CheatSheetPage />} />
                  <Route path="/cheat-sheet" element={<CheatSheetPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/support" element={<DonatePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/rankings" element={<RankingsPage />} />
                  <Route path="/leaderboard" element={<RankingsPage />} />
                  <Route path="/hall-of-fame" element={<RankingsPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </Router>
        </FocusProvider>
      </StudentProvider>
    </ThemeProvider>
  );
}

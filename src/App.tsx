import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BackToTopButton from './components/BackToTopButton';
import { HomePage } from './pages/HomePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { DocsPage } from './pages/DocsPage';
import { AboutPage } from './pages/AboutPage';
import { ManageProfilesPage } from './pages/ManageProfilesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-yellow-50/30 to-emerald-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 lg:px-6">
          <Header />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/manage-profile" element={<ManageProfilesPage />} />
            <Route path="/manage-uploads" element={<ManageProfilesPage />} />
            {/* <Route path="/desktop" element={<DesktopSyncPage />} /> */}
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
          </Routes>
          <BackToTopButton />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

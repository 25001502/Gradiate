import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AuthForm from './AuthForm';
import Application from './pages/Aplication';
import Startup from './pages/Startup';
import Bursaryguest from './pages/Bursaryguest';
import ProgramsGuest from './pages/Programsguest';
import How from './pages/How';
import About from './pages/About';
import Practise from './pages/Practise';
import Profile from './pages/Profile';

function CanonicalTagManager() {
  const location = useLocation();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SITE_URL || 'https://gradiate';
    const canonicalHref = `${baseUrl}${location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', canonicalHref);
  }, [location.pathname]);

  return null;
}


function App() {
  return (
    <Router>
      <CanonicalTagManager />
      <Routes>
        <Route path="/" element={<Startup />} />

        {/* Canonical SEO-friendly paths */}
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/application" element={<Application />} />
        <Route path="/bursaries" element={<Bursaryguest />} />
        <Route path="/programs" element={<ProgramsGuest />} />
        <Route path="/how-it-works" element={<How />} />
        <Route path="/about" element={<About />} />
        <Route path="/practice" element={<Practise />} />
        <Route path="/profile" element={<Profile />} />

        {/* Legacy paths kept for backward compatibility */}
        <Route path="/AuthForm" element={<AuthForm />} />
        <Route path="/Aplication" element={<Application />} />
        <Route path="/Bursaryguest" element={<Bursaryguest />} />
        <Route path="/Programsguest" element={<ProgramsGuest />} />
        <Route path="/How" element={<How />} />
        <Route path="/About" element={<About />} />
        <Route path="/Practise" element={<Practise />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;

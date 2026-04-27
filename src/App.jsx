import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Startup from './pages/Startup';
import { useAuth } from './context/AuthContext';

const AuthForm = lazy(() => import('./AuthForm'));
const Application = lazy(() => import('./pages/Aplication'));
const Bursaryguest = lazy(() => import('./pages/Bursaryguest'));
const ProgramsGuest = lazy(() => import('./pages/Programsguest'));
const How = lazy(() => import('./pages/How'));
const About = lazy(() => import('./pages/About'));
const Practise = lazy(() => import('./pages/Practise'));
const Profile = lazy(() => import('./pages/Profile'));
const Bursary = lazy(() => import('./pages/Bursary'));

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

function ProtectedProfileRoute() {
  const { user } = useAuth();

  if (!user?.uid) {
    return <Navigate to="/auth" replace />;
  }

  return <Profile />;
}

function RouteFallback() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        color: '#475569',
      }}
      aria-live="polite"
    >
      <p style={{ margin: 0, fontWeight: 600 }}>Loading page...</p>
    </main>
  );
}


function App() {
  return (
    <Router>
      <CanonicalTagManager />
      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/profile" element={<ProtectedProfileRoute />} />
          <Route path="/bursary" element={<Bursary />} />

          {/* Legacy paths kept for backward compatibility */}
          <Route path="/AuthForm" element={<AuthForm />} />
          <Route path="/Aplication" element={<Application />} />
          <Route path="/Bursaryguest" element={<Bursaryguest />} />
          <Route path="/Programsguest" element={<ProgramsGuest />} />
          <Route path="/How" element={<How />} />
          <Route path="/About" element={<About />} />
          <Route path="/Practise" element={<Practise />} />
          <Route path="/Profile" element={<ProtectedProfileRoute />} />
          <Route path="/Bursary" element={<Bursary />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

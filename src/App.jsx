import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Startup from './pages/Startup';
import { useAuth } from './context/useAuth';
import { legacyRouteRedirects, routes } from './lib/routes';

const AuthForm = lazy(() => import('./AuthForm'));
const Application = lazy(() => import('./pages/Aplication'));
const Bursaryguest = lazy(() => import('./pages/Bursaryguest'));
const ProgramsGuest = lazy(() => import('./pages/Programsguest'));
const How = lazy(() => import('./pages/How'));
const About = lazy(() => import('./pages/About'));
const Practise = lazy(() => import('./pages/Practise'));
const Profile = lazy(() => import('./pages/Profile'));
const Bursary = lazy(() => import('./pages/Bursary'));
const Community = lazy(() => import('./pages/Community'));

function CanonicalTagManager() {
  const location = useLocation();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SITE_URL || 'https://gradiate.co.za';
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
    return <Navigate to={routes.auth} replace />;
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
  const legacyRoutes = Object.entries(legacyRouteRedirects);

  return (
    <Router>
      <CanonicalTagManager />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={routes.home} element={<Startup />} />
          <Route path={routes.auth} element={<AuthForm />} />
          <Route path={routes.application} element={<Application />} />
          <Route path={routes.bursaries} element={<Bursaryguest />} />
          <Route path={routes.programs} element={<ProgramsGuest />} />
          <Route path={routes.howItWorks} element={<How />} />
          <Route path={routes.about} element={<About />} />
          <Route path={routes.practice} element={<Practise />} />
          <Route path={routes.profile} element={<ProtectedProfileRoute />} />
          <Route path={routes.bursaryDashboard} element={<Bursary />} />
          <Route path={routes.community} element={<Community />} />

          {legacyRoutes.map(([legacyPath, canonicalPath]) => (
            <Route
              key={legacyPath}
              path={legacyPath}
              element={<Navigate to={canonicalPath} replace />}
            />
          ))}

          <Route path="*" element={<Navigate to={routes.home} replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

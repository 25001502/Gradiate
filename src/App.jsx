import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Startup from './pages/Startup';
import BottomNavigation from './components/BottomNavigation';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { useAuth } from './context/useAuth';
import { useFirestoreNetworkLifecycle } from './lib/firebase/useFirestoreNetworkLifecycle';
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
const CommunityPostDetail = lazy(() => import('./pages/CommunityPostDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function isVerifiedUser(user) {
  return Boolean(user?.uid && user.emailVerified);
}

function ProtectedProfileRoute() {
  const { user } = useAuth();

  if (!isVerifiedUser(user)) {
    return <Navigate to={routes.auth} replace />;
  }

  return <Profile />;
}

function ProtectedAdminRoute() {
  const { user, isAdmin, adminLoading } = useAuth();

  if (!isVerifiedUser(user)) {
    return <Navigate to={routes.auth} replace />;
  }

  if (adminLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to={routes.home} replace />;
  }

  return <AdminDashboard />;
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

function shouldShowBottomNavigation(pathname) {
  return (
    pathname === routes.application ||
    pathname === routes.practice ||
    pathname === routes.bursaryDashboard ||
    pathname === routes.profile ||
    pathname === routes.community ||
    pathname.startsWith('/community/post/')
  );
}

function AppRoutes() {
  const { pathname } = useLocation();

  const legacyRoutes = Object.entries(legacyRouteRedirects);

  return (
    <>
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
          <Route path={routes.communityPost} element={<CommunityPostDetail />} />
          <Route path={routes.privacyPolicy} element={<PrivacyPolicy />} />
          <Route path={routes.admin} element={<ProtectedAdminRoute />} />

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
      {shouldShowBottomNavigation(pathname) && <BottomNavigation />}
    </>
  );
}

function App() {
  useFirestoreNetworkLifecycle();

  return (
    <>
      <Router>
        <AppRoutes />
      </Router>
      <PwaInstallPrompt />
    </>
  );
}

export default App;

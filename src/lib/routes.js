export const routes = {
  home: '/',
  auth: '/auth',
  application: '/application',
  bursaries: '/bursaries',
  programs: '/programs',
  howItWorks: '/how-it-works',
  about: '/about',
  practice: '/practice',
  profile: '/profile',
  bursaryDashboard: '/bursary',
};

export const legacyRouteRedirects = {
  '/AuthForm': routes.auth,
  '/Aplication': routes.application,
  '/Bursaryguest': routes.bursaries,
  '/Programsguest': routes.programs,
  '/How': routes.howItWorks,
  '/About': routes.about,
  '/Practise': routes.practice,
  '/Profile': routes.profile,
  '/Bursary': routes.bursaryDashboard,
};

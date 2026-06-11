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
  community: '/community',
  communityPost: '/community/post/:postId',
  privacyPolicy: '/privacy-policy',
  termsOfUse: '/terms-of-use',
  admin: '/admin',
};

// Only canonical public pages that should appear in search results.
export const indexableRoutes = [
  routes.home,
  routes.application,
  routes.bursaries,
  routes.programs,
  routes.howItWorks,
  routes.about,
  routes.practice,
  routes.community,
  routes.privacyPolicy,
  routes.termsOfUse,
];

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
  '/Community': routes.community,
  '/terms-of-service': routes.termsOfUse,
};

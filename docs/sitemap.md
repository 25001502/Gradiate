# Sitemap

Gradiate's XML sitemap is generated from `indexableRoutes` in
`src/lib/routes.js`.

Run:

```sh
npm run sitemap
```

The production build runs this command automatically before Vite builds.

## Indexable Canonical Routes

1. `/` - Home
2. `/application` - University application tracker and finder
3. `/bursaries` - Public bursary finder
4. `/programs` - Public programme finder
5. `/how-it-works` - How Gradiate works
6. `/about` - About Gradiate
7. `/practice` - Past papers and practice resources
8. `/community` - Student Community
9. `/privacy-policy` - Privacy Policy
10. `/terms-of-use` - Terms of Use

## Excluded Routes

- `/auth`, `/profile`, and `/admin` are account or private routes and use `noindex`.
- `/bursary` is excluded and uses `noindex` because `/bursaries` is the preferred
  public bursary page.
- Individual Community posts are dynamic and are not currently generated into
  the static sitemap.
- Legacy routes redirect to canonical routes and must not be included.

The generated XML intentionally omits `priority` and `changefreq` because Google
ignores them. It also omits `lastmod` until Gradiate has a reliable per-page
content-update source.

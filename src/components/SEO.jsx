import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Gradiate';
const DEFAULT_TITLE = 'Gradiate | Find Bursaries, Scholarships and Student Opportunities';
const DEFAULT_DESCRIPTION =
  'Gradiate helps South African students discover bursaries, scholarships, learnerships and student opportunities. Search, apply and get ahead.';
const DEFAULT_IMAGE =
  'https://firebasestorage.googleapis.com/v0/b/my-univen-project.firebasestorage.app/o/draft_cover%20-%20Copy.jpg?alt=media&token=c1953262-7869-4f7b-b2b5-42394f50826f';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://gradiate.co.za';

/**
 * SEO component — drop into any page to set <head> metadata.
 *
 * @param {string}  title        - Page title. Appended with " | Gradiate" unless `titleFull` is true.
 * @param {boolean} titleFull    - When true, `title` is used verbatim (no suffix appended).
 * @param {string}  description  - Meta description.
 * @param {string}  canonical    - Canonical path (e.g. "/bursaries"). Resolved against SITE_URL.
 * @param {string}  image        - Absolute URL of the OG/Twitter card image.
 * @param {boolean} noindex      - When true, sets robots to "noindex, nofollow".
 * @param {string}  type         - OG type (default "website").
 */
export default function SEO({
  title,
  titleFull = false,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  noindex = false,
  type = 'website',
}) {
  const resolvedTitle = title
    ? titleFull
      ? title
      : `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const resolvedCanonical = canonical
    ? `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : null;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

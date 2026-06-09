import { FaArrowLeft, FaEnvelope, FaExternalLinkAlt, FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { routes } from "../lib/routes";
import "./PrivacyPolicy.css";

const LAST_UPDATED = "9 June 2026";
const PRIVACY_EMAIL = "thandululo99@gmail.com";

const sections = [
  ["scope", "Scope"],
  ["responsible-party", "Who is responsible"],
  ["information", "Information we collect"],
  ["use", "How we use information"],
  ["community", "Community content"],
  ["storage", "Cookies and device storage"],
  ["sharing", "Sharing and service providers"],
  ["international", "International processing"],
  ["retention", "Retention"],
  ["security", "Security"],
  ["children", "Students under 18"],
  ["rights", "Your privacy rights"],
  ["deletion", "Account deletion"],
  ["changes", "Policy changes"],
  ["contact", "Contact and complaints"],
];

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children} <FaExternalLinkAlt aria-hidden="true" />
    </a>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        canonical="/privacy-policy"
        description="Learn how Gradiate collects, uses, stores, and protects personal information."
      />

      <header className="privacy-header">
        <div className="privacy-header__inner">
          <Link className="privacy-back-link" to={routes.home}>
            <FaArrowLeft aria-hidden="true" />
            Back to Gradiate
          </Link>

          <div className="privacy-brand" aria-label="Gradiate">
            Grad<span>iate</span>
          </div>
        </div>
      </header>

      <main className="privacy-page">
        <section className="privacy-intro">
          <div className="privacy-intro__icon" aria-hidden="true">
            <FaShieldAlt />
          </div>
          <p className="privacy-eyebrow">Privacy at Gradiate</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-intro__summary">
            This policy explains what personal information Gradiate processes, why we process it,
            who may receive it, and the choices available to you.
          </p>
          <div className="privacy-meta" aria-label="Policy dates">
            <span>Effective: {LAST_UPDATED}</span>
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </section>

        <div className="privacy-layout">
          <aside className="privacy-toc" aria-label="Privacy policy contents">
            <strong>On this page</strong>
            <nav>
              {sections.map(([id, label]) => (
                <a href={`#${id}`} key={id}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <article className="privacy-content">
            <div className="privacy-notice">
              <strong>Plain-language notice</strong>
              <p>
                Providing profile details is optional, but an email address, password, and display
                name are required to create an account. Guests can still browse parts of Gradiate.
              </p>
            </div>

            <section id="scope">
              <h2>1. Scope</h2>
              <p>
                This Privacy Policy applies to the Gradiate website, progressive web app, and
                related student services. It should be read with any shorter privacy notice shown
                when Gradiate asks you for personal information.
              </p>
              <p>
                Gradiate helps South African students discover universities, programmes, bursaries,
                past papers, and community information. Gradiate does not decide whether a
                university or funder accepts an application.
              </p>
            </section>

            <section id="responsible-party">
              <h2>2. Who is responsible for your information</h2>
              <p>
                THANDULULO TECHNOLOGIES, operating Gradiate in South Africa, is the responsible
                party for personal information processed through Gradiate. Privacy requests can be
                sent to <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
              </p>
            </section>

            <section id="information">
              <h2>3. Information we collect</h2>
              <h3>Information you provide</h3>
              <ul>
                <li>
                  Account details such as your display name, email address, password, Firebase user
                  ID, and email verification status. Your password is handled by Firebase
                  Authentication and is not stored in Gradiate&apos;s Firestore database.
                </li>
                <li>
                  Optional profile details such as your bio, phone number, location, institution,
                  qualification, graduation year, school, grade, matric year, subjects, skills, and
                  career goals.
                </li>
                <li>
                  Saved universities, bursaries, past-paper subjects, notes, folders, reminders,
                  and application-tracking checklist or status information.
                </li>
                <li>
                  Community posts, comments, likes, saved posts, reports, and information attached
                  to your public community profile.
                </li>
                <li>Messages or privacy requests you send directly to us.</li>
              </ul>

              <h3>Information collected automatically</h3>
              <ul>
                <li>
                  Authentication and security information such as sign-in activity, device or
                  browser information, user-agent details, and IP addresses processed by Firebase
                  to provide and protect the service.
                </li>
                <li>
                  Usage information such as page interactions, application-link clicks, saves, and
                  feature events measured through Google Analytics. We do not intentionally send
                  your email address, name, phone number, or private notes to Google Analytics.
                </li>
                <li>
                  Approximate location, browser, device, session, and pseudonymous client
                  identifier information collected by Google Analytics.
                </li>
              </ul>
            </section>

            <section id="use">
              <h2>4. How and why we use information</h2>
              <p>We process personal information only where reasonably necessary to:</p>
              <ul>
                <li>Create, verify, secure, and manage your Gradiate account.</li>
                <li>Save your preferences and provide personalised education recommendations.</li>
                <li>Provide application tracking, saved items, practice tools, and reminders.</li>
                <li>Publish and moderate community content, respond to reports, and prevent abuse.</li>
                <li>Measure performance, diagnose problems, and improve Gradiate.</li>
                <li>Respond to support, privacy, security, and legal requests.</li>
                <li>Comply with applicable law and protect users, Gradiate, and the public.</li>
              </ul>
              <p>
                Depending on the context, our grounds for processing include providing the service
                you request, your consent where required, our legitimate interests in operating and
                improving Gradiate, and compliance with legal obligations. Recommendations are
                guidance only and are not automated admission or funding decisions.
              </p>
            </section>

            <section id="community">
              <h2>5. Community content is public</h2>
              <p>
                Information you publish in the Community, including your display name, avatar,
                academic profile line, posts, and comments, may be visible to other users. Do not
                publish identity numbers, passwords, financial records, private contact details, or
                other sensitive information.
              </p>
              <p>
                Reports, moderation records, and notifications may be retained where reasonably
                necessary to keep the Community safe and enforce platform rules.
              </p>
            </section>

            <section id="storage">
              <h2>6. Cookies and device storage</h2>
              <p>Gradiate and its service providers use browser storage for purposes including:</p>
              <ul>
                <li>
                  Google Analytics first-party cookies, including a pseudonymous client identifier,
                  to measure visits and usage.
                </li>
                <li>
                  Local storage for guest bookmarks, saved practice subjects, install-prompt
                  preferences, verification-request controls, and security activity shown on your
                  device.
                </li>
                <li>Session storage to help measure and manage the current signed-in session.</li>
              </ul>
              <p>
                You can delete or block cookies and browser storage using your browser settings.
                Doing so may reset saved guest preferences or affect some features.
              </p>
            </section>

            <section id="sharing">
              <h2>7. When we share information</h2>
              <p>We do not sell your personal information. We may share or disclose it:</p>
              <ul>
                <li>
                  With Google Firebase and Google Cloud services that provide authentication,
                  database, hosting, functions, and security infrastructure.
                </li>
                <li>
                  With Google Analytics to measure aggregated and pseudonymous usage information.
                </li>
                <li>
                  With DiceBear when your generated avatar is requested. DiceBear receives the
                  avatar style and technical seed needed to render the image.
                </li>
                <li>
                  With moderators and administrators where necessary to review Community reports,
                  enforce rules, or protect users.
                </li>
                <li>
                  When required by law, court order, or a lawful request, or where necessary to
                  protect legal rights and safety.
                </li>
              </ul>
              <p>
                Gradiate links to external university, bursary, and education-provider websites.
                Gradiate does not automatically submit your profile to those providers. Their own
                privacy policies apply when you visit or apply through their websites.
              </p>
            </section>

            <section id="international">
              <h2>8. International processing</h2>
              <p>
                Some service providers operate globally and may process personal information
                outside South Africa. For example, Firebase states that Firebase Authentication is
                operated from United States data centres, while other Firebase services may use
                global Google infrastructure. We use provider contractual, security, and privacy
                safeguards when relying on these services.
              </p>
            </section>

            <section id="retention">
              <h2>9. How long we keep information</h2>
              <p>
                We keep personal information only for as long as reasonably necessary for the
                purposes described in this policy, to provide your account, resolve disputes,
                maintain security, and meet legal obligations.
              </p>
              <p>
                Private saved records generally remain until you remove them or delete your
                account. Public Community contributions, reports, provider logs, and backup records
                may remain for a reasonable period after account deletion where required for
                moderation, security, legal compliance, or service integrity.
              </p>
            </section>

            <section id="security">
              <h2>10. How we protect information</h2>
              <p>
                Gradiate uses measures including HTTPS, Firebase authentication, email verification,
                access-controlled Firestore rules, and restricted administrative access. Firebase
                states that supported services encrypt data in transit and several services,
                including Authentication and Cloud Firestore, encrypt data at rest.
              </p>
              <p>
                No online service can guarantee absolute security. Contact us immediately if you
                believe your account or personal information has been compromised.
              </p>
            </section>

            <section id="children">
              <h2>11. Students under 18</h2>
              <p>
                Gradiate supports school and tertiary students, including users who may be under 18.
                If you are under 18, use Gradiate with the involvement of a parent, guardian, or
                other competent person where required by law.
              </p>
              <p>
                We do not intentionally ask users to upload identity documents, financial records,
                or other special personal information. A parent or guardian who believes a
                child&apos;s information has been processed inappropriately should contact us so we
                can investigate and take appropriate action.
              </p>
            </section>

            <section id="rights">
              <h2>12. Your privacy rights</h2>
              <p>Subject to applicable law, including POPIA, you may ask us to:</p>
              <ul>
                <li>Confirm whether we hold personal information about you.</li>
                <li>Provide access to or a description of your personal information.</li>
                <li>Correct, update, delete, or destroy eligible personal information.</li>
                <li>Object to certain processing or withdraw consent where processing relies on it.</li>
                <li>Explain the categories of third parties that have had access to your information.</li>
              </ul>
              <p>
                Send requests to <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We may
                need to verify your identity before completing a request. You can also update many
                profile details directly from your Gradiate profile.
              </p>
            </section>

            <section id="deletion">
              <h2>13. Account deletion</h2>
              <p>
                Signed-in users can request account deletion from <strong>Profile</strong>, then{" "}
                <strong>Security Center</strong>. This removes the authentication account, profile,
                and certain private saved records.
              </p>
              <p>
                Public Community contributions and moderation records may not be removed
                automatically. Contact us if you also want us to review eligible public content or
                other records associated with your account.
              </p>
            </section>

            <section id="changes">
              <h2>14. Changes to this policy</h2>
              <p>
                We may update this policy when Gradiate&apos;s features, service providers, or legal
                obligations change. We will publish the updated date on this page and provide
                additional notice where a change materially affects your privacy.
              </p>
            </section>

            <section id="contact">
              <h2>15. Contact and complaints</h2>
              <div className="privacy-contact">
                <FaEnvelope aria-hidden="true" />
                <div>
                  <strong>Gradiate privacy contact</strong>
                  <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
                  <span>THANDULULO TECHNOLOGIES, South Africa</span>
                </div>
              </div>
              <p>
                If you believe your personal information has been processed contrary to POPIA, you
                may also lodge a complaint with the Information Regulator (South Africa).
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <a href="mailto:POPIAComplaints@inforegulator.org.za">
                    POPIAComplaints@inforegulator.org.za
                  </a>
                </li>
                <li>Telephone: 010 023 5200</li>
                <li>
                  <ExternalLink href="https://inforegulator.org.za/complaints/">
                    Information Regulator complaints page
                  </ExternalLink>
                </li>
              </ul>
            </section>

            <div className="privacy-sources">
              <strong>Service-provider privacy information</strong>
              <ExternalLink href="https://firebase.google.com/support/privacy">
                Firebase privacy and security
              </ExternalLink>
              <ExternalLink href="https://support.google.com/analytics/answer/11593727">
                Google Analytics data collection
              </ExternalLink>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}

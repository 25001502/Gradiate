import {
  FaArrowLeft,
  FaBalanceScale,
  FaEnvelope,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { routes } from "../lib/routes";
import "./PrivacyPolicy.css";

const LAST_UPDATED = "9 June 2026";
const SUPPORT_EMAIL = "thandululo99@gmail.com";

const sections = [
  ["acceptance", "Accepting these terms"],
  ["service", "What Gradiate provides"],
  ["accounts", "Accounts and security"],
  ["acceptable-use", "Acceptable use"],
  ["prohibited-use", "Prohibited conduct"],
  ["opportunity-information", "Verify opportunity details"],
  ["user-content", "Your posts and content"],
  ["moderation", "Content removal and enforcement"],
  ["third-party-services", "Third-party services"],
  ["availability", "Platform availability and changes"],
  ["responsibility", "Limitation of responsibility"],
  ["termination", "Suspension and termination"],
  ["changes", "Changes to these terms"],
  ["law", "Applicable law"],
  ["contact", "Contact"],
];

export default function TermsOfUse() {
  return (
    <>
      <SEO
        title="Terms of Use"
        canonical="/terms-of-use"
        description="Read the rules and conditions for using Gradiate's student opportunity platform."
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
            <FaBalanceScale />
          </div>
          <p className="privacy-eyebrow">Using Gradiate responsibly</p>
          <h1>Terms of Use</h1>
          <p className="privacy-intro__summary">
            These terms explain the rules for using Gradiate, your responsibilities, and the
            limits of the information and services we provide.
          </p>
          <div className="privacy-meta" aria-label="Terms dates">
            <span>Effective: {LAST_UPDATED}</span>
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </section>

        <div className="privacy-layout">
          <aside className="privacy-toc" aria-label="Terms of use contents">
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
              <strong>Important</strong>
              <p>
                Gradiate helps you discover and track education opportunities. Always confirm
                application dates, requirements, fees, and instructions on the official university
                or bursary-provider website before applying.
              </p>
            </div>

            <section id="acceptance">
              <h2>1. Accepting these terms</h2>
              <p>
                These Terms of Use form an agreement between you and THANDULULO TECHNOLOGIES,
                operating Gradiate in South Africa. By accessing or using the Gradiate website,
                progressive web app, Community, or related services, you agree to these terms and
                our <Link to={routes.privacyPolicy}>Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree, do not use Gradiate. If you use Gradiate on behalf of another
                person or organisation, you confirm that you have authority to accept these terms
                for them.
              </p>
            </section>

            <section id="service">
              <h2>2. What Gradiate provides</h2>
              <p>
                Gradiate provides educational and opportunity information, including university,
                programme, bursary, past-paper, recommendation, Community, saving, and application
                tracking features.
              </p>
              <p>
                Gradiate is an information and planning platform. It is not a university, bursary
                provider, admissions authority, financial adviser, or application-processing
                service. Gradiate does not decide whether you qualify for or receive admission,
                funding, employment, or any other opportunity.
              </p>
            </section>

            <section id="accounts">
              <h2>3. Accounts and security</h2>
              <ul>
                <li>Provide accurate account information and keep it reasonably up to date.</li>
                <li>Keep your password and access to your email account secure.</li>
                <li>Do not share, sell, transfer, or allow another person to misuse your account.</li>
                <li>
                  You are responsible for activity performed through your account unless caused by
                  circumstances for which the law makes Gradiate responsible.
                </li>
                <li>
                  Tell us promptly if you believe your account has been accessed without
                  permission.
                </li>
              </ul>
              <p>
                If you are under 18, use Gradiate with the involvement of a parent, guardian, or
                other competent person where required by law.
              </p>
            </section>

            <section id="acceptable-use">
              <h2>4. Acceptable use</h2>
              <p>You may use Gradiate to:</p>
              <ul>
                <li>Discover and compare legitimate education and funding opportunities.</li>
                <li>Save opportunities and privately track your own application progress.</li>
                <li>Access study resources for lawful personal and educational use.</li>
                <li>
                  Ask genuine questions, share helpful experiences, and participate respectfully in
                  the Community.
                </li>
                <li>Report suspicious, harmful, misleading, or rule-breaking content.</li>
              </ul>
            </section>

            <section id="prohibited-use">
              <h2>5. Prohibited conduct</h2>
              <p>You must not use Gradiate to:</p>
              <ul>
                <li>
                  Create, advertise, or promote fake bursaries, fraudulent opportunities, scams,
                  phishing, impersonation, or deceptive application links.
                </li>
                <li>
                  Harass, bully, threaten, exploit, discriminate against, or intimidate another
                  person.
                </li>
                <li>
                  Post spam, repetitive promotions, unsolicited advertising, chain messages, or
                  irrelevant content.
                </li>
                <li>
                  Publish illegal, hateful, sexually exploitative, violent, defamatory, or otherwise
                  harmful content.
                </li>
                <li>
                  Request, publish, or misuse identity documents, passwords, banking details, or
                  another person&apos;s private or sensitive information.
                </li>
                <li>
                  Copy, scrape, reverse engineer, overload, disrupt, bypass security, introduce
                  malware, or interfere with Gradiate or its users.
                </li>
                <li>
                  Infringe copyright, trademarks, privacy, confidentiality, or other legal rights.
                </li>
                <li>Use Gradiate for any unlawful purpose.</li>
              </ul>
            </section>

            <section id="opportunity-information">
              <h2>6. Verify official opportunity details</h2>
              <div className="privacy-contact">
                <FaExclamationTriangle aria-hidden="true" />
                <div>
                  <strong>Dates and requirements can change</strong>
                  <span>
                    Confirm all information directly with the official institution or provider
                    before submitting an application or payment.
                  </span>
                </div>
              </div>
              <p>
                We work to keep opportunity information useful and current, but universities,
                bursary providers, and other third parties control their own dates, requirements,
                selection processes, websites, and decisions. Gradiate does not guarantee that
                every listing is complete, current, available, genuine, or suitable for you.
              </p>
              <p>
                Never pay a person claiming that Gradiate guarantees admission or funding. Report
                suspicious listings or messages to us.
              </p>
            </section>

            <section id="user-content">
              <h2>7. Your posts and content</h2>
              <p>
                You remain responsible for posts, comments, reports, profile information, and other
                content you submit. You confirm that you have the right to submit it and that it
                complies with these terms and applicable law.
              </p>
              <p>
                You keep ownership of your content. You give Gradiate a non-exclusive, worldwide,
                royalty-free licence to host, store, reproduce, display, and moderate that content
                only as reasonably necessary to operate, secure, promote, and improve the service.
                This licence ends when the content is deleted, except for reasonable backups,
                moderation records, or legal retention.
              </p>
              <p>
                Community posts and comments may be public. Do not post information you do not want
                other users to see.
              </p>
            </section>

            <section id="moderation">
              <h2>8. Content removal and enforcement</h2>
              <p>
                Gradiate may review reports and remove, restrict, edit, de-prioritise, or refuse
                content that breaks these terms, creates risk, or is not appropriate for the
                platform. We may also preserve relevant records and report serious unlawful conduct
                to the appropriate authorities.
              </p>
              <p>
                We are not required to monitor every post before publication and cannot guarantee
                that all harmful or inaccurate user content will be identified immediately.
              </p>
            </section>

            <section id="third-party-services">
              <h2>9. Third-party websites and services</h2>
              <p>
                Gradiate links to third-party websites, including universities, bursary providers,
                education resources, and application portals. Those services are controlled by
                their respective owners and have their own terms, privacy policies, security, and
                application processes.
              </p>
              <p>
                A link or listing does not mean Gradiate endorses, guarantees, or is affiliated
                with that third party. Use third-party services carefully and verify that you are
                on the official website before sharing information or making a payment.
              </p>
            </section>

            <section id="availability">
              <h2>10. Platform availability and changes</h2>
              <p>
                We may add, change, suspend, or discontinue features, content, or parts of Gradiate
                to improve the platform, respond to security issues, comply with law, or manage the
                service. We will provide reasonable notice where a material change significantly
                affects users and notice is practical.
              </p>
              <p>
                Gradiate may occasionally be unavailable due to maintenance, connectivity,
                third-party services, technical failures, or events outside our reasonable control.
              </p>
            </section>

            <section id="responsibility">
              <h2>11. Limitation of responsibility</h2>
              <p>
                Use Gradiate and make application decisions with reasonable care. To the maximum
                extent permitted by applicable law, Gradiate is not responsible for losses caused
                by reliance on outdated or incorrect third-party opportunity information,
                unsuccessful applications, missed external deadlines, third-party websites, user
                content, or events outside our reasonable control.
              </p>
              <p>
                Nothing in these terms excludes or limits rights or remedies that cannot lawfully
                be excluded, including applicable rights under South African consumer-protection
                law, or liability that applicable law does not permit us to exclude.
              </p>
            </section>

            <section id="termination">
              <h2>12. Suspension and termination</h2>
              <p>
                We may restrict, suspend, or terminate access where we reasonably believe an account
                has broken these terms, created safety or security risks, harmed users, or exposed
                Gradiate to legal liability. Where appropriate, we may first warn the user or
                provide an opportunity to correct the issue.
              </p>
              <p>
                You may stop using Gradiate at any time and can request account deletion from the
                Security Center in your profile. Some public content, moderation records, and
                backups may remain as explained in our <Link to={routes.privacyPolicy}>Privacy Policy</Link>.
              </p>
            </section>

            <section id="changes">
              <h2>13. Changes to these terms</h2>
              <p>
                We may update these terms when Gradiate&apos;s services, risks, or legal obligations
                change. We will publish the updated terms and their effective date on this page and
                provide additional notice where a change materially affects your rights or use of
                the platform.
              </p>
              <p>
                Continuing to use Gradiate after updated terms take effect means you accept the
                updated terms, subject to applicable law.
              </p>
            </section>

            <section id="law">
              <h2>14. Applicable law</h2>
              <p>
                These terms are governed by the laws of the Republic of South Africa. Any dispute
                should first be raised with us so that we can try to resolve it fairly. Nothing in
                these terms prevents you from using a regulator, tribunal, court, or other remedy
                available under applicable law.
              </p>
            </section>

            <section id="contact">
              <h2>15. Contact</h2>
              <div className="privacy-contact">
                <FaEnvelope aria-hidden="true" />
                <div>
                  <strong>Gradiate support</strong>
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                  <span>THANDULULO TECHNOLOGIES, South Africa</span>
                </div>
              </div>
              <p>
                Contact us to report scams, harmful content, security concerns, or questions about
                these terms.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaMapMarkerAlt,
  FaBookOpen,
  FaCalendarAlt,
} from "react-icons/fa";
import { PUBLIC_BURSARIES } from "../data/mockBursaries";
import SEO from '../components/SEO';

const Bursaryguest = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <SEO
        title="Browse Bursaries & Scholarships"
        canonical="/bursaries"
        description="Explore bursaries and scholarships available to South African students. Search by field of study, deadline and provider to find funding that's right for you."
      />
      <nav className="navbar-responsive">
        <div className="navbar-container">
          <a
            className="logo"
            href="#"
            style={{
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#2c3e50",
              textDecoration: "none",
            }}
          >
            Grad<span style={{ color: "#3498db" }}>iate</span>
          </a>
          <div className="nav-actions">
            <a
              onClick={() => navigate("/auth")}
              className="btn btn-primary"
              style={{ marginLeft: "auto" }}
            >
              Sign Up
            </a>
            <button
              className="burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
              <span className="burger-bar"></span>
            </button>
          </div>
          {menuOpen && (
            <div className="burger-menu">
              <a onClick={() => navigate("/")}>Home</a>
              <a onClick={() => navigate("/bursaries")} className="active">
                Bursaries
              </a>
              <a onClick={() => navigate("/programs")}>Programs</a>
              <a onClick={() => navigate("/how-it-works")}>How It Works</a>
              <a onClick={() => navigate("/community")}>Community</a>
              <a onClick={() => navigate("/about")}>About</a>
            </div>
          )}
        </div>
      </nav>

      {/* Bursaries Main Content */}
      <main className="bursaries-container">
        <div className="container">
          <div className="page-header">
            <h1 style={{fontWeight:"bold"}}>
              <i className="fas fa-graduation-cap" ></i> Bursaries
            </h1>
            <p id="header-description">
              Explore bursary opportunities you're eligible for and apply
              directly through the platform.
            </p>
            <div className="filter-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  id="bursary-search"
                  placeholder="Search bursaries..."
                />
              </div>
              <div className="filter-dropdown">
                <select id="filter-field" title="Filter by field of study">
                  <option value="all">All Fields</option>
                  <option value="engineering">Engineering</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="medicine">Medicine</option>
                  <option value="business">Business</option>
                </select>
              </div>
              <div className="filter-dropdown">
                <select id="filter-province" title="Filter by province">
                  <option value="all">All Provinces</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>
            </div>
          </div>

          {/* Public Bursary Listings */}
          <section className="public-listings">
            <div className="section-header">
              <h2 style={{ fontWeight: "bold" }}>
                <i className="fas fa-star"></i> Featured Bursaries
              </h2>
              <p>A selection of active bursary opportunities for South African students. Sign up to see personalised matches based on your profile.</p>
            </div>
            <div className="bursaries-grid">
              {PUBLIC_BURSARIES.map((bursary) => (
                <div className="bursary-card" key={bursary.id}>
                  <div className="card-header">
                    <h3>{bursary.title}</h3>
                    <p className="institution">{bursary.field}</p>
                  </div>
                  <div className="card-body">
                    <div className="bursary-detail">
                      <FaMapMarkerAlt style={{ color: "#3498db", flexShrink: 0 }} />
                      <span>{bursary.province}</span>
                    </div>
                    <div className="bursary-detail">
                      <FaCalendarAlt style={{ color: "#3498db", flexShrink: 0 }} />
                      <span>Closing: {bursary.closingDate}</span>
                    </div>
                    <div className="bursary-detail">
                      <FaBookOpen style={{ color: "#3498db", flexShrink: 0 }} />
                      <span>{bursary.eligibility}</span>
                    </div>
                    <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#555" }}>
                      {bursary.description}
                    </p>
                  </div>
                  <div className="card-footer">
                    <a
                      onClick={() => navigate("/auth")}
                      className="btn btn-primary"
                      style={{ cursor: "pointer", fontSize: "0.9rem" }}
                    >
                      Apply / View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Guest View — personalised matching CTA */}
          <section className="guest-view" id="guest-view">
            <div className="guest-message">
              <div className="message-content">
                <i className="fas fa-bolt"></i>
                <h2 style={{ fontWeight: "bold" }}>Get Personalised Bursary Matches</h2>
                <p>
                  Create a free account to see bursaries matched specifically to your APS score,
                  field of study, and province — and save your favourites.
                </p>
                <div className="auth-actions">
                  <a
                    onClick={() => navigate("/auth")}
                    className="btn btn-primary"
                  >
                    Sign Up Free
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Informative content sections */}
          <section className="info-section">
            <h2 style={{ fontWeight: "bold" }}>What is a Bursary?</h2>
            <p>
              A bursary is a financial award given to students to help cover the cost of their
              education. Unlike a student loan, a bursary does not need to be repaid — as long
              as you meet the conditions set by the funder, such as achieving a minimum academic
              average or working for the company for a set period after graduation.
            </p>
            <p>
              Bursaries in South Africa are offered by government departments, state-owned
              enterprises (like Eskom and Transnet), large corporations, and non-profit
              organisations. They are one of the most important tools for making higher education
              accessible to students from all financial backgrounds.
            </p>
          </section>

          <section className="info-section">
            <h2 style={{ fontWeight: "bold" }}>How Gradiate Helps You Find Bursaries</h2>
            <div className="info-steps">
              <div className="info-step">
                <div className="info-step-num">1</div>
                <div>
                  <strong>Profile matching</strong> — Enter your subjects, marks, and APS. Gradiate matches you to bursaries you actually qualify for.
                </div>
              </div>
              <div className="info-step">
                <div className="info-step-num">2</div>
                <div>
                  <strong>Filter by field &amp; province</strong> — Narrow down bursaries by your chosen field of study or where you live.
                </div>
              </div>
              <div className="info-step">
                <div className="info-step-num">3</div>
                <div>
                  <strong>Save &amp; track</strong> — Bookmark bursaries and get reminders before closing dates so you never miss a deadline.
                </div>
              </div>
              <div className="info-step">
                <div className="info-step-num">4</div>
                <div>
                  <strong>Apply directly</strong> — Access the official application links and requirements for each bursary in one place.
                </div>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 style={{ fontWeight: "bold" }}>Common Bursary Requirements in South Africa</h2>
            <ul className="info-list">
              <li>South African citizenship or permanent residency</li>
              <li>Proof of financial need (household income statement or SASSA grant)</li>
              <li>Minimum academic average (usually 60%–70% depending on the funder)</li>
              <li>Acceptance at or current enrolment in an accredited institution</li>
              <li>Studying in a specific field aligned with the funder&apos;s industry</li>
              <li>A completed bursary application form with supporting documents</li>
              <li>Academic transcripts or matric results</li>
              <li>ID copy and proof of registration</li>
            </ul>
          </section>

          <section className="info-section">
            <h2 style={{ fontWeight: "bold" }}>How to Improve Your Chances of Qualifying</h2>
            <ul className="info-list">
              <li>Apply early — many bursaries close months before the academic year starts</li>
              <li>Apply to multiple bursaries at the same time to increase your chances</li>
              <li>Keep your academic average above 60% to remain eligible for most bursaries</li>
              <li>Tailor your motivation letter to the specific funder&apos;s mission and values</li>
              <li>Include all required documents — incomplete applications are often rejected</li>
              <li>Ask a teacher or mentor to review your application before submission</li>
            </ul>
          </section>

          <section className="info-section">
            <h2 style={{ fontWeight: "bold" }}>Bursary FAQ</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Can I get a bursary if I am already studying?</h3>
                <p>Yes. Many bursary providers accept applications from students currently enrolled at university, not only incoming students. Check the specific bursary&apos;s eligibility criteria.</p>
              </div>
              <div className="faq-item">
                <h3>What happens if I fail my year while on a bursary?</h3>
                <p>Most bursary agreements require you to maintain a minimum academic performance. Failing may result in the bursary being cancelled. Always check the conditions in your bursary agreement.</p>
              </div>
              <div className="faq-item">
                <h3>Is NSFAS the same as a bursary?</h3>
                <p>NSFAS (National Student Financial Aid Scheme) is a government-funded bursary programme available to eligible students at public universities and TVET colleges. It covers tuition, accommodation, meals, and other allowances for qualifying students.</p>
              </div>
              <div className="faq-item">
                <h3>Can I apply for a bursary without knowing which university I will attend?</h3>
                <p>Some bursaries require proof of acceptance, while others allow you to apply before receiving an offer. Read each bursary&apos;s requirements carefully. Gradiate highlights which stage of the process each bursary applies to.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a  className="logo">
                Grad<span>iate</span>
              </a>
              <p>Smart education matching for everyone.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a onClick={() => navigate("/how-it-works")} style={{ cursor: "pointer" }}>How It Works</a>
                <a onClick={() => navigate("/about")} style={{ cursor: "pointer" }}>About</a>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <a href="mailto:thandululo99@gmail.com">Contact Us</a>
                <a onClick={() => navigate("/programs")} style={{ cursor: "pointer" }}>Programs</a>
              </div>
              <div className="link-group">
                <h4>Legal</h4>
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-of-service">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="social-links">
              <a href="#">
                <FaFacebookF />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
              <a href="#">
                <FaLinkedin />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
            </div>
            <p className="copyright">
              &copy; 2026 THANDULULO TECHNOLOGIES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Bursaryguest;

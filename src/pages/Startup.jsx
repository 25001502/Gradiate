import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import image from "../images/hero-image.jpg";
import image2 from "../images/testimonial1.jpg";

import {
  FaSearch,
  FaBullseye,
  FaBolt,
  FaRoad,
  FaHandsHelping,
  FaUserGraduate,
  FaUserTie,
  FaCheck,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaLinkedin,
  FaGraduationCap,
  FaHandHoldingUsd,
  FaUniversity,
} from "react-icons/fa";

export default function Startup() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
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
              <a className="cursor-pointer" onClick={() => navigate("/")} >Home</a>
              <a onClick={() => navigate("/bursaries")} className="active cursor-pointer">
                Bursaries
              </a>
              <a onClick={() => navigate("/programs")} className="cursor-pointer">Programs</a>
              <a onClick={() => navigate("/how-it-works")} className="cursor-pointer">How It Works</a>
              <a onClick={() => navigate("/about")} className="cursor-pointer">About</a>
            </div>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 style={{fontWeight:"bold"}}>Find Your Perfect Education Match</h1>
            <p className="subtitle">
              Gradiate instantly connects students with bursaries and graduates
              with ideal programs based on their qualifications.
            </p>
           
          </div>
          <div className="hero-image">
            <img src={image} alt="Students celebrating graduation" />
          </div>
        </div>
      </section>

      {/* About Gradiate Intro */}
      <section className="about-intro">
        <div className="container">
          <div className="about-intro-grid">
            <div className="about-intro-text">
              <h2 style={{ textAlign: "left", fontWeight: "bold", marginBottom: "1rem" }}>What is Gradiate?</h2>
              <p>
                Gradiate is South Africa&apos;s smart education matching platform built to help matric learners
                and graduates navigate the complex world of higher education and funding.
              </p>
              <p>
                Thousands of South African students miss out on university placements and bursaries every
                year  not because they don&apos;t qualify, but because they don&apos;t know they exist.
                Gradiate solves this by matching your academic profile to real, available opportunities
                across every province.
              </p>
              <p>
                Whether you are a Grade 12 learner figuring out which programmes your APS qualifies
                you for, or a graduate looking for postgraduate funding and learnerships, Gradiate is
                built for you  and it is completely free.
              </p>
            </div>
            <div className="about-intro-highlights">
              <div className="highlight-pill">
                <span className="highlight-icon"><FaGraduationCap /></span>
                <div>
                  <strong>APS Guidance</strong>
                  <p>Understand what your APS means and see exactly which programmes you qualify for.</p>
                </div>
              </div>
              <div className="highlight-pill">
                <span className="highlight-icon"><FaHandHoldingUsd /></span>
                <div>
                  <strong>Bursaries &amp; Funding</strong>
                  <p>Browse bursaries from major South African companies and government programmes like NSFAS.</p>
                </div>
              </div>
              <div className="highlight-pill">
                <span className="highlight-icon"><FaUniversity /></span>
                <div>
                  <strong>University Programmes</strong>
                  <p>Explore programmes at public universities and TVET colleges across all nine provinces.</p>
                </div>
              </div>
              <div className="highlight-pill">
                <span className="highlight-icon"><FaHandsHelping /></span>
                <div>
                  <strong>Student Support</strong>
                  <p>Get guidance on the application process and track deadlines all in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 style={{fontWeight:"bold"}}>Why Choose Gradiate?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaBullseye />
              </div>
              <h3 style={{fontWeight:"bold"}}>Personalized Matching</h3>
              <p>
                We use your grades or qualifications to recommend bursaries and
                programs you actually qualify for.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaBolt />
              </div>
              <h3 style={{fontWeight:"bold"}}>Fast and Free</h3>
              <p>
                Sign up in minutes and instantly access real opportunities
                tailored to your goals.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaRoad />
              </div>
              <h3 style={{fontWeight:"bold"}}>One Platform, Many Paths</h3>
              <p>
                Gradiate bridges the gap between high school and higher
                education, and between graduation and your first job.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaHandsHelping />
              </div>
              <h3 style={{fontWeight:"bold"}}>Support When You Need It</h3>
              <p>
                Ask questions, get guidance, and stay on track with the help of
                our support team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Gradiate Works */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 style={{ fontWeight: "bold" }}>How Gradiate Works</h2>
          <p className="subtitle">Four simple steps to find your perfect education match</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 style={{ fontWeight: "bold" }}>Create Your Profile</h3>
              <p>Sign up and enter your matric results or current academic record. Your APS score is calculated automatically — no guesswork needed.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 style={{ fontWeight: "bold" }}>Get Matched</h3>
              <p>Our platform instantly matches you with university programmes and bursaries that fit your profile, subjects, and interests.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 style={{ fontWeight: "bold" }}>Explore Opportunities</h3>
              <p>Browse your personalised results, save your favourites, and compare options across provinces, fields, and institution types.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 style={{ fontWeight: "bold" }}>Apply with Confidence</h3>
              <p>Access application deadlines, requirements, and direct links so you can apply to the right places at the right time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="target-groups">
        <div className="container">
          <h2 style={{fontWeight:"bold"}}>Who Can Benefit?</h2>
          <div className="groups-grid">
            <div className="group-card">
              <div className="group-icon">
                <FaUserGraduate />
              </div>
              <h3 style={{fontWeight:"bold"}}>For Grade 12 Learners</h3>
              <ul>
                <li>
                  <FaCheck /> University programs you qualify for
                </li>
                <li>
                  <FaCheck /> Bursaries or NSFAS-related opportunities
                </li>
                <li>
                  <FaCheck /> Download prospectuses and save options
                </li>
              </ul>
              <a
                onClick={() => navigate("/auth")}
                className="btn btn-outline"
              >
                Explore Options
              </a>
            </div>
            <div className="group-card">
              <div className="group-icon">
                <FaUserTie />
              </div>
              <h3 style={{fontWeight:"bold"}}>For Graduates</h3>
              <ul>
                <li>
                  <FaCheck /> Graduate internships
                </li>
                <li>
                  <FaCheck /> Learnerships & apprenticeships
                </li>
                <li>
                  <FaCheck /> Postgraduate funding and scholarships
                </li>
              </ul>
              <a
                onClick={() => navigate("/auth")}
                className="btn btn-outline"
              >
                Find Opportunities
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <h2 style={{ fontWeight: "bold" }}>Success Stories</h2>
          <p className="subtitle">Real students who found their path with Gradiate</p>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote">
                &ldquo;I didn&apos;t know which university accepted my marks until Gradiate
                guided me. I got a bursary and now I&apos;m studying Civil Engineering.
                I would never have found this on my own.&rdquo;
              </div>
              <div className="author">
                <img src={image2} alt="Lerato M." />
                <div className="author-info">
                  <h4>Lerato M.</h4>
                  <p>Civil Engineering Student, University of the Witwatersrand</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote">
                &ldquo;Gradiate helped me find a bursary I didn&apos;t even know I
                qualified for. It completely changed my educational journey and
                saved my family so much financial stress.&rdquo;
              </div>
              <div className="author">
                <img src={image2} alt="Sarah M." />
                <div className="author-info">
                  <h4>Sarah M.</h4>
                  <p>Computer Science Student, University of Pretoria</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote">
                &ldquo;I am now part of a 24-month internship at a top engineering firm
                — all thanks to Gradiate connecting me with the right opportunity
                right after I graduated.&rdquo;
              </div>
              <div className="author">
                <img src={image2} alt="Jake Mpane" />
                <div className="author-info">
                  <h4>Jake Mpane</h4>
                  <p>Mechanical Engineer Graduate, Anglo American Internship</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APS Guide Section */}
      <section className="aps-guide-section">
        <div className="container">
          <h2 style={{ fontWeight: "bold" }}>Understanding Your APS Score</h2>
          <p className="subtitle">
            Your Admission Point Score (APS) determines which university programmes you can apply for.
            Gradiate calculates it automatically when you sign up.
          </p>
          <div className="aps-grid">
            <div className="aps-card">
              <div className="aps-range">20 – 24</div>
              <h3 style={{ fontWeight: "bold" }}>Foundation / Higher Certificate</h3>
              <p>Entry into bridging programmes and higher certificates at TVET colleges and universities of technology. An excellent starting point for building towards a full degree.</p>
            </div>
            <div className="aps-card">
              <div className="aps-range">25 – 29</div>
              <h3 style={{ fontWeight: "bold" }}>Diploma &amp; Extended Degrees</h3>
              <p>Access to diploma programmes and extended degree pathways at universities and universities of technology across South Africa.</p>
            </div>
            <div className="aps-card">
              <div className="aps-range">30 – 35</div>
              <h3 style={{ fontWeight: "bold" }}>Bachelor&apos;s Degree Entry</h3>
              <p>Qualifies for most bachelor&apos;s degree programmes including Commerce, Education, Social Sciences, and many Science programmes at mainstream universities.</p>
            </div>
            <div className="aps-card aps-card--highlight">
              <div className="aps-range">36+</div>
              <h3 style={{ fontWeight: "bold" }}>Competitive Programmes</h3>
              <p>Access to highly competitive programmes such as Medicine, Law, Engineering, and programmes at top-ranked South African universities like UCT, Wits, and Stellenbosch.</p>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            <a onClick={() => navigate("/auth")} className="btn btn-primary" style={{ cursor: "pointer" }}>
              Calculate My APS &amp; Find Programmes
            </a>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 style={{ fontWeight: "bold" }}>Frequently Asked Questions</h2>
          <p className="subtitle">Answers to common questions from South African students</p>
          <div className="faq-list">
            <div className="faq-item">
              <h3>Is Gradiate free to use?</h3>
              <p>Yes. Signing up and browsing bursaries, programmes, and opportunities on Gradiate is completely free for all students. There are no hidden costs.</p>
            </div>
            <div className="faq-item">
              <h3>What is an APS score and how is it calculated?</h3>
              <p>APS stands for Admission Point Score. It is calculated by adding the point values from your 6 best Grade 12 subjects (excluding Life Orientation for most institutions). Each subject&apos;s percentage converts to a point on a 1–7 scale. Gradiate calculates this automatically when you enter your results.</p>
            </div>
            <div className="faq-item">
              <h3>What is the difference between a bursary and a student loan?</h3>
              <p>A bursary is a financial award that does not need to be repaid, as long as any conditions set by the funder (such as working for them after graduation) are met. A student loan must be repaid with interest. Gradiate focuses on bursary and grant opportunities to help students avoid debt.</p>
            </div>
            <div className="faq-item">
              <h3>Can I apply for multiple bursaries at the same time?</h3>
              <p>Yes. You are generally allowed to apply for multiple bursaries simultaneously. Some providers require you to disclose other funding you receive. Gradiate helps you track multiple applications and deadlines in one place.</p>
            </div>
            <div className="faq-item">
              <h3>What programmes are available if my APS is below 30?</h3>
              <p>Students with an APS below 30 can still access higher certificates, diploma programmes, and extended degree pathways at universities of technology and TVET colleges. Gradiate shows all available options for your score across South Africa.</p>
            </div>
            <div className="faq-item">
              <h3>Do I need a high APS to qualify for a bursary?</h3>
              <p>Not always. Many bursaries are primarily need-based rather than purely merit-based. NSFAS, for example, is income-based. Some corporate bursaries require a minimum 60% average in relevant subjects. Gradiate matches you to bursaries that fit your actual profile.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2 >Ready to Find Your Perfect Match?</h2>
          <p>
            Join thousands of students and graduates who've found their ideal
            opportunities through Gradiate.
          </p>
          <div className="cta-buttons">
            <a  onClick={() => navigate("/auth")}
             className="btn btn-primary btn-large">Get Started</a>

          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a className="logo">
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
                <a onClick={() => navigate("/bursaries")} style={{ cursor: "pointer" }}>Bursaries</a>
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

      <style>{`
        .burger {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          margin-left: auto;
          z-index: 102; /* Make sure burger stays above the menu */
          position: relative;
        }
        .burger-bar {
          width: 28px;
          height: 3px;
          background: #333;
          border-radius: 2px;
          display: block;
        }
        .burger-menu {
          position: absolute;
          top: 56px; /* Move menu below navbar */
          right: 0;
          background: #fff;
          border: 1px solid #eee;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 101;
          min-width: 160px;
        }
        /* Remove or comment out this block to always show burger menu */
        /* 
        @media (min-width: 800px) {
          .burger, .burger-menu {
            display: none;
          }
        }
        */
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0.7; }
          60% { transform: scale(1.05); opacity: 1; }
          80% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        .bounce-in {
          animation: bounceIn 1.2s infinite alternate;
        }
      `}</style>
    </div>
  );
}

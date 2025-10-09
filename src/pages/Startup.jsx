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
              onClick={() => navigate("/AuthForm")}
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
              <a onClick={() => navigate("/Bursaryguest")} className="active">
                Bursaries
              </a>
              <a onClick={() => navigate("/Programsguest")}>Programs</a>
              <a onClick={() => navigate("/How")}>How It Works</a>
              <a onClick={() => navigate("/About")}>About</a>
            </div>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Find Your Perfect Education Match</h1>
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

      <section className="features">
        <div className="container">
          <h2>Why Choose Gradiate?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaBullseye />
              </div>
              <h3>Personalized Matching</h3>
              <p>
                We use your grades or qualifications to recommend bursaries and
                programs you actually qualify for.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaBolt />
              </div>
              <h3>Fast and Free</h3>
              <p>
                Sign up in minutes and instantly access real opportunities
                tailored to your goals.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaRoad />
              </div>
              <h3>One Platform, Many Paths</h3>
              <p>
                Gradiate bridges the gap between high school and higher
                education, and between graduation and your first job.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaHandsHelping />
              </div>
              <h3>Support When You Need It</h3>
              <p>
                Ask questions, get guidance, and stay on track with the help of
                our support team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="target-groups">
        <div className="container">
          <h2>Who Can Benefit?</h2>
          <div className="groups-grid">
            <div className="group-card">
              <div className="group-icon">
                <FaUserGraduate />
              </div>
              <h3>For Grade 12 Learners</h3>
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
                onClick={() => navigate("/AuthForm")}
                className="btn btn-outline"
              >
                Explore Options
              </a>
            </div>
            <div className="group-card">
              <div className="group-icon">
                <FaUserTie />
              </div>
              <h3>For Graduates</h3>
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
                onClick={() => navigate("/AuthForm")}
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
          <h2>Success Stories</h2>
          <div className="testimonial-carousel">
            <div className="testimonial active">
              <div className="quote">
                "I didn't know which university accepted my marks until Gradiate
                guided me. I got a bursary too!"
              </div>
              <div className="author">
                <img src={image2} alt="Lerato M." />
                <div className="author-info">
                  <h4>Lerato M.</h4>
                  <p>Matriculant</p>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="quote">
                "Gradiate helped me find a bursary I didn't even know I
                qualified for. It completely changed my educational journey!"
              </div>
              <div className="author">
                <img src="images/testimonial2.jpg" alt="Sarah M." />
                <div className="author-info">
                  <h4>Sarah M.</h4>
                  <p>Computer Science Student</p>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="quote">
                "I am now part of a 24-month internship all thanks to Gradiate"
              </div>
              <div className="author">
                <img src="images/testimonial3.jpg" alt="Jake Mpane" />
                <div className="author-info">
                  <h4>Jake Mpane</h4>
                  <p>Mechanical Engineer Graduate</p>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-controls">
            <button className="carousel-btn prev">
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="carousel-dots"></div>
            <button className="carousel-btn next">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Find Your Perfect Match?</h2>
          <p>
            Join thousands of students and graduates who've found their ideal
            opportunities through Gradiate.
          </p>
          <div className="cta-buttons">
            <a  onClick={() => navigate("/AuthForm")}
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
                <a onClick={() => navigate("/How")}>How It Works</a>
                <a href="#">Features</a>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
              </div>
              <div className="link-group">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
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
              &copy; 2025 Gradiate. All rights reserved.
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

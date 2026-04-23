import React, { useState } from "react";
import heroAbout from "../images/hero-about.jpg";
import aboutTeam from "../images/about-team.jpg";
import aboutApproach from "../images/about-approach.jpg";
import team1 from "../images/team1.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGraduationCap,
  faUsers,
  faBalanceScale,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      {/* Navigation Bar */}
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
              <a onClick={() => navigate("/about")}>About</a>
            </div>
          )}
        </div>
      </nav>

      {/* About Hero Section */}
      <section className="about-hero">
        <img src={heroAbout} alt="Diverse students studying together" />
        <div className="hero-image-overlay"></div>
        <div className="container hero-image-content">
          <h1 style={{fontWeight:"bold"}}>Our Mission to Transform Education Access</h1>
          <p className="subtitle">
            Gradiate was founded to bridge the gap between students and
            educational opportunities, making higher education accessible to
            all.
          </p>
        </div>
      </section>

      {/* About Content Section */}
      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title" style={{fontWeight:"bold"}}>Our Story</h2>
              <p style={{ lineHeight: "1.85", fontSize: "1.05rem" }}>
                Gradiate was born in 2023 from a simple observation: too many
                talented students were missing out on educational opportunities
                simply because they didn't know they existed or how to access
                them.
              </p>
              <p style={{ lineHeight: "1.85", fontSize: "1.05rem" }}>
                What started as a small project to help local students find
                bursaries has grown into a comprehensive platform serving
                thousands of students across the country. Today, we're proud to
                be a trusted education matching platform in South Africa —
                connecting students with the opportunities they deserve.
              </p>
            </div>
            <div className="about-text">
              <h2 className="section-title" style={{fontWeight:"bold"}}>Our Approach</h2>
              <p style={{ lineHeight: "1.85", fontSize: "1.05rem" }}>
                We believe that every student deserves personalised guidance in
                their educational journey. Unlike traditional resources that
                provide generic information, Gradiate uses smart matching
                algorithms to connect students with opportunities that are right
                for them.
              </p>
              <p style={{ lineHeight: "1.85", fontSize: "1.05rem" }}>
                Our platform analyses students' academic records, interests, and
                goals to recommend relevant bursaries, study programmes, and
                career opportunities — ensuring each user gets matched with what
                truly fits their profile and aspirations.
              </p>
            </div>
          </div>
          <div className="about-grid">
            <div className="about-image">
              <img src={aboutTeam} alt="Gradiate team working together" />
            </div>
            <div className="about-image">
              <img src={aboutApproach} alt="Gradiate approach illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <h2 className="section-title" style={{fontWeight:"bold"}}>Meet Our Leadership Team</h2>
          <p className="subtitle">
            A diverse group of passionate individuals dedicated to transforming
            education access.
          </p>

          <div className="team-grid">
            <div className="team-card">
              <img src={"https://firebasestorage.googleapis.com/v0/b/my-univen-project.firebasestorage.app/o/gemini-2.5-flash-image_make_me_look_profetional_for_a_portfolio_profile_picture_and_make_the_suit_black-0.jpg?alt=media&token=7a85f9f2-d8cc-47f1-be49-7684677b2522"} alt="Nengovhela Thandululo" />
              <h3 style={{fontWeight:"bold"}}>Nengovhela Thandululo</h3>
              <p className="position">Founder & CEO</p>
              <p className="bio" style={{ lineHeight: "1.8", fontSize: "0.98rem" }}>
                A young man with a passion for education equity and helping disadvantaged students. He has a strong background in software development and built Gradiate to ensure no South African student misses an opportunity due to lack of information.
              </p>
              <div className="social-links" style={{ marginTop: 12 }}>
                <a href="https://www.linkedin.com/in/nengovhela-thandululo-880080367/" style={{ marginRight: 16, color: "#0077b5" }}>
                  <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
                <a href="mailto:thandululo99@gmail.com" style={{ color: "#333" }}>
                  <FontAwesomeIcon icon={faEnvelope} size="2x" />
                </a>
              </div>
            </div>
            <div className="team-card">
              <img src={team1} alt="Nicoroy Zwane" />
              <h3 style={{fontWeight:"bold"}}>Nicoroy Zwane</h3>
              <p className="position">Website Designer</p>
              <p className="bio" style={{ lineHeight: "1.8", fontSize: "0.98rem" }}>
                Experienced web designer who contributed significantly to Gradiate&apos;s user experience. He brought a wealth of knowledge in graphic design and branding, shaping the visual identity that makes Gradiate stand out.
              </p>
              <div className="social-links" style={{ marginTop: 12 }}>
                <a href="#" style={{ marginRight: 16, color: "#0077b5" }}>
                  <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
                <a href="#" style={{ color: "#333333ff" }}>
                  <FontAwesomeIcon icon={faEnvelope} size="2x" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="values-section">
        <div className="container">
          <h2 style={{fontWeight:"bold"}}>Our Core Values</h2>
          <p className="subtitle">
            Everything we do at Gradiate is driven and guided by these core
            principles.
          </p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h3 style={{fontWeight:"bold"}}>Accessibility</h3>
              <p>
                We're committed to breaking down barriers to education and
                making opportunities available to all students, regardless of
                background.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 style={{fontWeight:"bold"}}>Community</h3>
              <p>
                We foster connections between students, institutions, and
                sponsors to create a supportive ecosystem where everyone can
                thrive together.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faBalanceScale} />
              </div>
              <h3 style={{fontWeight:"bold"}}>Equity</h3>
              <p>
                We actively work to level the playing field by identifying and
                addressing systemic barriers in education access.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3 style={{fontWeight:"bold"}}>Integrity</h3>
              <p>
                We maintain the highest standards of honesty and transparency in
                all our student-institution matching processes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2 style={{fontWeight:"bold"}}>By The Numbers</h2>
          <p className="subtitle">
            The impact we've made thus far together with our partners
          </p>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">1500+</div>
              <div className="stat-label">Students Helped</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">120+</div>
              <div className="stat-label">Partner Institutions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">R100K+</div>
              <div className="stat-label">In Bursaries Facilitated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2 style={{fontWeight:"bold"}}>Ready to Find Your Perfect Match?</h2>
          <p>
            Join thousands of students and graduates who've found their ideal
            opportunities through Gradiate.
          </p>
          <div className="cta-buttons">
            <a
              onClick={() => navigate("/auth")}
              className="btn btn-primary btn-large"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

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
                <a onClick={() => navigate("/how-it-works")}>How It Works</a>
                <a >About Us</a>
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
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="#">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="#">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a href="#">
                <FontAwesomeIcon icon={faInstagram} />
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
export default About;

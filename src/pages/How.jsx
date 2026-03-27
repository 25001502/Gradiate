import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import image from '../images/how-it-works-hero.jpg';
import image2 from '../images/signup-screen.jpg';
import image3 from '../images/profile-screen.jpg';
import image4 from '../images/interests-screen.jpg';
import image5 from '../images/matches-screen.jpg';
import image6 from '../images/apply-screen.jpg';
import image7 from '../images/graduate-profile.jpg';
import image8 from '../images/upload-screen.jpg';
import image9 from '../images/graduate-matches.jpg';
import image10 from '../images/notifications-screen.jpg';
import image11 from '../images/video-thumbnail.jpg';    
import {FaSearch, FaBullseye, FaBolt, FaRoad, FaHandsHelping, FaUserGraduate, FaUserTie, FaCheck, FaClock, FaPlay,
        
        FaRobot,
        FaShieldAlt,
        FaMousePointer,
        FaBell,
        FaSchool,
        FaUniversity,
        FaBriefcase,
        FaMapMarkerAlt,
        FaChevronDown,
        FaFacebookF,
        FaTwitter,
        FaLinkedinIn,
        FaInstagram} from 'react-icons/fa';
  
  
  
  
  
  
  
  

const How = () => {
    

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

            {/* How It Works Main Content */}
            <main className="how-it-works-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <h1 style={{fontWeight:"bold"}}>How Gradiate Works</h1>
                            <p className="lead">
                                Your simple guide to finding the perfect bursary or
                                graduate opportunity
                            </p>
                            <div className="cta-buttons">
                                <a onClick={()=> navigate('/auth')} className="btn btn-primary">
                                    Get Started
                                </a>
                                <a href="#video-explainer" className="btn btn-outline">
                                    <i className="fas fa-play"></i> Watch Video
                                </a>
                            </div>
                        </div>
                        <div className="hero-image">
                            <img
                                src={image}
                                alt="How Gradiate Works"
                            />
                        </div>
                    </div>
                </section>

                {/* Overview Section */}
                <section className="overview-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 style={{fontWeight:"bold"}}>Smart Matching For Your Future</h2>
                            <p>
                                Gradiate helps students and graduates connect with
                                the best-matched bursaries, internships, and
                                graduate programs – all in one place.
                            </p>
                        </div>
                        <div className="benefits-grid">
                            <div className="benefit-card">
                                <div className="benefit-icon">
                                    <FaBolt />
                                </div>
                                <h3>Quick Matching</h3>
                                <p>
                                    Our AI finds opportunities that fit your profile
                                    in seconds
                                </p>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon">
                                    <FaCheck/>
                                </div>
                                <h3>Verified Opportunities</h3>
                                <p>
                                    Only legitimate bursaries and programs from
                                    trusted sources
                                </p>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon">
                                    <FaClock/>
                                </div>
                                <h3>Save Time</h3>
                                <p>
                                    No more searching multiple websites - everything
                                    in one place
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Students Section */}
                <section className="process-section student-process">
                    <div className="container">
                        <div className="section-header">
                            <h2 style={{fontWeight:"bold"}}>
                                <i className="fas fa-user-graduate"></i> For Students
                            </h2>
                            <p>
                                Find bursaries that match your academic profile and
                                interests
                            </p>
                        </div>
                        <div className="process-steps">
                            <div className="process-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Create Your Account</h3>
                                    <p>
                                        Sign up with your email or student number in
                                        just 2 minutes
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image2}
                                        alt="Sign Up Screen"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Complete Your Profile</h3>
                                    <p>
                                        Upload your report card or input your
                                        subjects and marks
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image3}
                                        alt="Profile Screen"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Select Your Interests</h3>
                                    <p>
                                        Choose faculties or fields you're interested
                                        in studying
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image4}
                                        alt="Interests Screen"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Get Matched</h3>
                                    <p>
                                        Instantly see bursaries you're eligible htmlFor
                                        with match percentages
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image5}
                                        alt="Matches Screen"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">5</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Apply with One Click</h3>
                                    <p>
                                        Save time by applying through Gradiate
                                        directly
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image6}
                                        alt="Apply Screen"
                                    />
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </section>

                {/* For Graduates Section */}
                <section className="process-section graduate-process">
                    <div className="container">
                        <div className="section-header">
                            <h2 style={{fontWeight:"bold"}}>
                                <i className="fas fa-user-tie"></i> For Graduates
                            </h2>
                            <p>
                                Find programs and opportunities tailored to your
                                qualifications
                            </p>
                        </div>
                        <div className="process-steps">
                            <div className="process-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Create a Graduate Profile</h3>
                                    <p>
                                        Add your qualifications, experiences, and
                                        career interests
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image7}
                                        alt="Graduate Profile"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Upload CV and Documents</h3>
                                    <p>
                                        Quick upload and parsing of your resume and
                                        transcripts
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image8}
                                        alt="Upload Screen"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Smart Matching</h3>
                                    <p>
                                        Get shown graduate programs, jobs, or
                                        internships based on your background
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image9}
                                        alt="Graduate Matches"
                                    />
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h3 style={{fontWeight:"bold"}}>Apply or Get Notified</h3>
                                    <p>
                                        Set up alerts htmlFor new opportunities or apply
                                        instantly
                                    </p>
                                </div>
                                <div className="step-image">
                                    <img
                                        src={image10}
                                        alt="Notifications Screen"
                                    />
                                </div>
                            </div>
                        </div>
                     
                    </div>
                </section>

                {/* What Makes Us Different Section */}
                <section className="different-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 style={{fontWeight:"bold"}}>Why Choose Gradiate?</h2>
                            <p>
                                We're changing how students and graduates find
                                opportunities
                            </p>
                        </div>
                        <div className="difference-cards">
                            <div className="difference-card">
                                <div className="difference-icon">
                                    <FaRobot />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>AI-Powered Matching</h3>
                                <p>
                                    Our smart algorithms analyze thousands of
                                    opportunities to find your best matches
                                </p>
                            </div>
                            <div className="difference-card">
                                <div className="difference-icon">
                                    <FaShieldAlt />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>Verified Opportunities</h3>
                                <p>
                                    Every bursary and program is vetted before being
                                    listed on our platform
                                </p>
                            </div>
                            <div className="difference-card">
                                <div className="difference-icon">
                                    <FaMousePointer />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>One-Click Applications</h3>
                                <p>
                                    Apply to multiple opportunities with a single
                                    profile - no repetitive forms
                                </p>
                            </div>
                            <div className="difference-card">
                                <div className="difference-icon">
                                    <FaBell />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>Personalized Alerts</h3>
                                <p>
                                    Get notified when new opportunities matching
                                    your profile become available
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who Can Use It Section */}
                <section className="audience-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 style={{fontWeight:"bold"}}>Who Can Use Gradiate?</h2>
                            <p>
                                We serve students and graduates at all stages of
                                their educational journey
                            </p>
                        </div>
                        <div className="audience-cards">
                            <div className="audience-card">
                                <div className="audience-icon">
                                    <FaSchool />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>High School Learners</h3>
                                <p>
                                    Grade 11-12 students looking htmlFor bursaries and
                                    funding options
                                </p>
                            </div>
                            <div className="audience-card">
                                <div className="audience-icon">
                                    <FaUniversity />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>University Students</h3>
                                <p>
                                    First-year and continuing students seeking
                                    financial support
                                </p>
                            </div>
                            <div className="audience-card">
                                <div className="audience-icon">
                                    <FaUserGraduate/>
                                </div>
                                <h3 style={{fontWeight:"bold"}}>Recent Graduates</h3>
                                <p>
                                    Those who've completed their studies and are
                                    entering the workforce
                                </p>
                            </div>
                            <div className="audience-card">
                                <div className="audience-icon">
                                    <FaBriefcase />
                                </div>
                                <h3 style={{fontWeight:"bold"}}>Career Changers</h3>
                                <p>
                                    Professionals looking to upskill or change
                                    career paths
                                </p>
                            </div>
                        </div>
                        <div className="local-context">
                            <h3 style={{fontWeight:"bold"}}>
                                <FaMapMarkerAlt /> South African
                                Focus
                            </h3>
                            <p>
                                We cover NSFAS, Funza Lushaka, corporate bursaries,
                                and university-funded opportunities across South
                                Africa.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Video Explainer Section */}
                <section className="video-section" id="video-explainer">
                    <div className="container">
                        <div className="video-container">
                            <div className="video-placeholder">
                                <img
                                    src={image11}
                                    alt="Video Thumbnail"
                                />
                                <button className="play-button">
                                    <FaPlay />
                                </button>
                            </div>
                            <div className="video-caption">
                                <h3 style={{fontWeight:"bold"}}>See Gradiate in Action</h3>
                                <p>
                                    Watch our 2-minute explainer video to see how
                                    easy it is to find your perfect opportunity
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 style={{fontWeight:"bold"}}>Frequently Asked Questions</h2>
                            <p>Quick answers to common questions about Gradiate</p>
                        </div>
                        <div className="faq-accordion">
                            <div className="faq-item">
                                <button className="faq-question">
                                    Is Gradiate free to use?
                                    <FaChevronDown />
                                </button>
                                <div className="faq-answer">
                                    <p>
                                        Yes! Gradiate is completely free htmlFor
                                        students and graduates. We never charge you
                                        to search htmlFor or apply to opportunities.
                                    </p>
                                </div>
                            </div>
                            <div className="faq-item">
                                <button className="faq-question">
                                    Can I update my marks or qualifications later?
                                    <FaChevronDown />
                                </button>
                                <div className="faq-answer">
                                    <p>
                                        Absolutely. You can update your academic
                                        information at any time in your profile
                                        settings, and we'll automatically update
                                        your matches.
                                    </p>
                                </div>
                            </div>
                            <div className="faq-item">
                                <button className="faq-question">
                                    How do I know if I'm eligible For a bursary?
                                    <FaChevronDown />
                                </button>
                                <div className="faq-answer">
                                    <p>
                                        Our matching system shows you only
                                        opportunities you qualify htmlFor based on your
                                        profile. Each listing also clearly displays
                                        the eligibility requirements.
                                    </p>
                                </div>
                            </div>
                            <div className="faq-item">
                                <button className="faq-question">
                                    What if I need help with my application?
                                    <FaChevronDown />
                                </button>
                                <div className="faq-answer">
                                    <p>
                                        We offer free application guidance and tips
                                        through our blog and help center. For
                                        complex questions, you can contact our
                                        support team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="final-cta">
                    <div className="container">
                        <h2>Ready to Find Your Perfect Opportunity?</h2>
                        <p className="cta-info">
                            Join thousands of students and graduates who've already
                            discovered their path with Gradiate
                        </p>
                        <div className="cta-buttons centered">
                            <a onClick={()=> navigate('/auth')} className="btn btn-primary">
                                Create Free Account
                            </a>
                           
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <a  className="logo">
                                Grad<span>iate</span>
                            </a>
                            <p>Smart education matching For everyone.</p>
                        </div>
                        <div className="footer-links">
                            <div className="link-group">
                                <h4>Platform</h4>
                                <a onClick={() => navigate("/how-it-works")}>How It Works</a>
                                <a href="#">Features</a>
                            </div>
                            <div className="link-group">
                                <h4>Resources</h4>
                                <a >Help Center</a>
                                <a >Blog</a>
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
                            <a href="#"><FaFacebookF /></a>
                            <a href="#"><FaTwitter /></a>
                            <a href="#"><FaLinkedinIn /></a>
                            <a href="#"><FaInstagram /></a>
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

export default How;

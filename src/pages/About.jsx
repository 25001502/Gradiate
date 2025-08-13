import React from "react";
import heroAbout from '../images/hero-about.jpg';
import aboutTeam from '../images/about-team.jpg';
import aboutApproach from '../images/about-approach.jpg';
import billy from '../images/person1.jpg';
import team1 from '../images/team1.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faGraduationCap, 
  faUsers, 
  faBalanceScale, 
  faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faLinkedin, 
  faFacebookF, 
  faTwitter, 
  faLinkedinIn, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';

import { useNavigate } from "react-router-dom";



const About = () => {


  const navigate = useNavigate();
  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <a href="index.html" className="logo">
            Grad<span>iate</span>
          </a>
          <div className="nav-links">
           <a onClick={()=>navigate('/')}>Home</a>
            <a onClick={()=>navigate('/Bursaryguest')}>Bursaries</a>
            <a onClick={()=>navigate('/Programsguest')}>Programs</a>
            <a onClick={()=>navigate('/How')}>How It Works</a>
            <a onClick={()=>navigate('/About')}className="active">About</a>
          </div>
          <div className="auth-buttons">
            <a href="register.html" className="btn btn-primary">
              Sign Up
            </a>
            <a href="login.html" className="btn btn-outline">
              Log In
            </a>
          </div>
        </div>
      </nav>
  
      {/* About Hero Section */}
      <section className="about-hero">
        <img
          src={heroAbout}
          alt="Diverse students studying together"
        />
        <div className="hero-image-overlay"></div>
        <div className="container hero-image-content">
          <h1>Our Mission to Transform Education Access</h1>
          <p className="subtitle">
            Gradiate was founded to bridge the gap between students and
            educational opportunities, making higher education accessible to all.
          </p>
        </div>
      </section>
  
      {/* About Content Section */}
      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Our Story</h2>
              <p>
                Gradiate was born in 2023 from a simple observation: too many
                talented students were missing out on educational opportunities
                simply because they didn't know they existed or how to access
                them.
              </p>
              <p>
                What started as a small project to help local students find
                bursaries has grown into a comprehensive platform serving
                thousands of students across the country. Today, we're proud to be
                the most trusted education matching platform in South Africa.
              </p>
            </div>
            <div className="about-text">
              <h2 className="section-title">Our Approach</h2>
              <p>
                We believe that every student deserves personalized guidance in
                their educational journey. Unlike traditional resources that
                provide generic information, Gradiate uses smart matching
                algorithms to connect students with opportunities.
              </p>
              <p>
                Our platform analyzes students' academic records, interests, and
                goals to recommend relevant bursaries, study programs, and career
                opportunities — ensuring each user gets matched with what truly
                fits them.
              </p>
            </div>
          </div>
          <div className="about-grid">
            <div className="about-image">
              <img
                src={aboutTeam}
                alt="Gradiate team working together"
              />
            </div>
            <div className="about-image">
              <img
                src={aboutApproach}
                alt="Gradiate approach illustration"
              />
            </div>
          </div>
        </div>
      </section>
  
      {/* Team Section */}
      <section className="team">
        <div className="container">
          <h2 className="section-title">Meet Our Leadership Team</h2>
          <p className="subtitle">
            A diverse group of passionate individuals dedicated to transforming
            education access.
          </p>
  
          <div className="team-grid" style={{}}>
            
            <div className="team-card" >
              <img src={billy} alt="Nengovhela Thandululo" />
              <h3>Nengovhela Thandululo</h3>
              <p className="position">Founder & CEO</p>
              <p className="bio">
                Social entrepreneur with a background in computer science and
                  education.
              </p>
              <div className="social-links">
                <a href="#">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="#">
                  <FontAwesomeIcon icon={faEnvelope} />
                </a>
              </div>
            </div>
            <div className="team-card">
              <img src={team1} alt="Nicoroy Zwane" />
              <h3>Nicoroy Zwane</h3>
              <p className="position">Website Designer</p>
              <p className="bio">
                Former university administrator with 15 years experience in student services
              </p>
              <div className="social-links">
                <a href="#">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
                <a href="#">
                  <FontAwesomeIcon icon={faEnvelope} />
                </a>
              </div>
            </div>
          
          </div>
        </div>
      </section>
  
      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <p className="subtitle">
            Everything we do at Gradiate is driven and guided by these core
            principles.
          </p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <h3>Accessibility</h3>
              <p>
                We're committed to breaking down barriers to education and making
                opportunities available to all students, regardless of background.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3>Community</h3>
              <p>
                We foster connections between students, institutions, and sponsors
                to create a supportive ecosystem where everyone can thrive
                together.
              </p>
            </div>
  
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faBalanceScale} />
              </div>
              <h3>Equity</h3>
              <p>
                We actively work to level the playing field by identifying and
                addressing systemic barriers in education access.
              </p>
            </div>
  
            <div className="value-card">
              <div className="value-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3>Integrity</h3>
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
          <h2>By The Numbers</h2>
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
          <h2>Ready to Find Your Perfect Match?</h2>
          <p>
            Join thousands of students and graduates who've found their ideal
            opportunities through Gradiate.
          </p>
          <div className="cta-buttons">
            <a href="register.html" className="btn btn-primary btn-large">
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
              <a href="index.html" className="logo">
                Grad<span>iate</span>
              </a>
              <p>Smart education matching for everyone.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="howitworks.html">How It Works</a>
                <a href="about.html">About Us</a>
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
              &copy; 2025 Gradiate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
        );
 
      };
  export default About;

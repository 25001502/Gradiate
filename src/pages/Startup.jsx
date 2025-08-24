import { useNavigate } from "react-router-dom";
import image from '../images/hero-image.jpg';
import image2 from '../images/testimonial1.jpg';

import {FaSearch, FaBullseye, FaBolt, FaRoad, FaHandsHelping, FaUserGraduate, FaUserTie, FaCheck, FaFacebookF,
        FaTwitter,
        FaLinkedinIn,
        FaInstagram,
        FaLinkedin} from 'react-icons/fa';

export default function Startup() {
    
    const navigate = useNavigate();

    return (
        <div>
            <nav className="navbar">
                <div className="container">
                    <a href="index.html" className="logo">Grad<span>iate</span></a>
                    <div className="nav-links">
                        <a onClick={()=>navigate('/')}  className="active">Home</a>
                        <a onClick={()=>navigate('/Bursaryguest')}>Bursaries</a>
                        <a onClick={()=>navigate('/Programsguest')}>Programs</a>
                        <a onClick={()=>navigate('/How')}>How It Works</a>
                        <a onClick={()=>navigate('/About')}>About</a>
                    </div>
                    <div className="auth-buttons">
                        <button className="btn btn-primary" onClick={()=> navigate('/AuthForm')}>Sign Up</button>
                        <a  className="btn btn-outline" onClick={()=> navigate('/AuthForm')}>Log In</a>
                    </div>
                </div>
            </nav>

            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Find Your Perfect Education Match</h1>
                        <p className="subtitle">
                            Gradiate instantly connects students with bursaries and
                            graduates with ideal programs based on their
                            qualifications.
                        </p>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by program or opportunity..."
                            />
                            <button className="btn btn-accent">
                                <i className="fas fa-search"></i> Search
                            </button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img
                            src={image}
                            alt="Students celebrating graduation"
                        />
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
                                We use your grades or qualifications to recommend
                                bursaries and programs you actually qualify for.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaBolt/>
                            </div>
                            <h3>Fast and Free</h3>
                            <p>
                                Sign up in minutes and instantly access real
                                opportunities tailored to your goals.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <FaRoad />
                            </div>
                            <h3>One Platform, Many Paths</h3>
                            <p>
                                Gradiate bridges the gap between high school and
                                higher education, and between graduation and your
                                first job.
                            </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                 <FaHandsHelping/>
                            </div>
                            <h3>Support When You Need It</h3>
                            <p>
                                Ask questions, get guidance, and stay on track with
                                the help of our support team.
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
                                <FaUserGraduate/>
                            </div>
                            <h3>For Grade 12 Learners</h3>
                            <ul>
                                <li>
                                    <FaCheck/> University programs
                                    you qualify for
                                </li>
                                <li>
                                    <FaCheck/> Bursaries or
                                    NSFAS-related opportunities
                                </li>
                                <li>
                                    <FaCheck/> Download
                                    prospectuses and save options
                                </li>
                            </ul>
                            <a href="#" className="btn btn-outline">Explore Options</a>
                        </div>
                        <div className="group-card">
                            <div className="group-icon">
                                <FaUserTie/>
                            </div>
                            <h3>For Graduates</h3>
                            <ul>
                                <li>
                                    <FaCheck/> Graduate
                                    internships
                                </li>
                                <li>
                                    <FaCheck/> Learnerships &
                                    apprenticeships
                                </li>
                                <li>
                                    <FaCheck/> Postgraduate
                                    funding and scholarships
                                </li>
                            </ul>
                            <a href="#" className="btn btn-outline">
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
                                "I didn't know which university accepted my marks
                                until Gradiate guided me. I got a bursary too!"
                            </div>
                            <div className="author">
                                <img
                                    src={image2}
                                    alt="Lerato M."
                                />
                                <div className="author-info">
                                    <h4>Lerato M.</h4>
                                    <p>Matriculant</p>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial">
                            <div className="quote">
                                "Gradiate helped me find a bursary I didn't even
                                know I qualified for. It completely changed my
                                educational journey!"
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
                                "I am now part of a 24-month internship all thanks
                                to Gradiate"
                            </div>
                            <div className="author">
                                <img
                                    src="images/testimonial3.jpg"
                                    alt="Jake Mpane"
                                />
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
                        Join thousands of students and graduates who've found their
                        ideal opportunities through Gradiate.
                    </p>
                    <div className="cta-buttons">
                        <a href="register.html" className="btn btn-primary btn-large">
                            Get Started
                        </a>
                    </div>
                </div>
            </section>

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
                                <a href="#">How It Works</a>
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
                            <a href="#"><FaFacebookF/></a>
                            <a href="#"><FaTwitter/></a>
                            <a href="#"><FaLinkedin/></a>
                            <a href="#"><FaInstagram/></a>
                        </div>
                        <p className="copyright">
                            &copy; 2025 Gradiate. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
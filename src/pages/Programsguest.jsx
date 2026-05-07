import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import {FaTwitter,
        FaInstagram,
        FaLinkedin,FaFacebookF,FaMapMarkerAlt,FaUniversity,FaGraduationCap} from 'react-icons/fa';
import { PUBLIC_PROGRAMS } from "../data/mockPrograms";
import SEO from '../components/SEO';


const Programsguest = () => {
   
   
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    
    return (
        <>
            <SEO
              title="Browse Graduate Programs"
              canonical="/programs"
              description="Discover graduate programs, learnerships and University opportunities available to South African students. Find the program that matches your career goals on Gradiate."
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

            {/* Programs Main Content */}
            <main className="programs-container">
                <div className="container">
                    <div className="page-header">
                        <h1 style={{fontWeight:"bold"}}>
                            <i className="fas fa-book"></i> Academic Programs
                        </h1>
                        <p id="header-description">
                            Discover academic and graduate programs that match your
                            qualifications and interests.
                        </p>
                        <div className="filter-controls">
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    id="program-search"
                                    placeholder="Search programs..."
                                />
                            </div>
                            <div className="filter-dropdown">
                                <select id="filter-field">
                                    <option value="all">All Fields</option>
                                    <option value="engineering">Engineering</option>
                                    <option value="computer-science">
                                        Computer Science
                                    </option>
                                    <option value="health">Health Sciences</option>
                                    <option value="business">Business</option>
                                    <option value="arts">Arts & Humanities</option>
                                </select>
                            </div>
                            <div className="filter-dropdown">
                                <select id="filter-level">
                                    <option value="all">All Levels</option>
                                    <option value="undergraduate">
                                        Undergraduate
                                    </option>
                                    <option value="postgraduate">
                                        Postgraduate
                                    </option>
                                    <option value="phd">PhD/Doctoral</option>
                                </select>
                            </div>
                            <div className="filter-dropdown">
                                <select id="filter-province">
                                    <option value="all">All Provinces</option>
                                    <option value="Gauteng">Gauteng</option>
                                    <option value="Western Cape">
                                        Western Cape
                                    </option>
                                    <option value="KwaZulu-Natal">
                                        KwaZulu-Natal
                                    </option>
                                    <option value="Eastern Cape">
                                        Eastern Cape
                                    </option>
                                    <option value="Free State">Free State</option>
                                    <option value="Limpopo">Limpopo</option>
                                    <option value="Mpumalanga">Mpumalanga</option>
                                    <option value="North West">North West</option>
                                    <option value="Northern Cape">
                                        Northern Cape
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Public Program Listings */}
                    <section className="public-listings">
                        <div className="section-header">
                            <h2 style={{ fontWeight: "bold" }}>
                                <i className="fas fa-star"></i> Featured Academic Programmes
                            </h2>
                            <p>A selection of academic programmes at South African universities. Sign up to see personalised matches based on your APS and subjects.</p>
                        </div>
                        <div className="programs-public-grid">
                            {PUBLIC_PROGRAMS.map((program) => (
                                <div className="program-public-card" key={program.id}>
                                    <div className="program-public-card__header">
                                        <span className="program-qual-badge">{program.qualificationType}</span>
                                    </div>
                                    <div className="program-public-card__body">
                                        <h3 className="program-public-card__name">{program.name}</h3>
                                        <div className="program-public-card__meta">
                                            <FaUniversity style={{ color: "#3498db", flexShrink: 0 }} />
                                            <span>{program.institution}</span>
                                        </div>
                                        <div className="program-public-card__meta">
                                            <FaMapMarkerAlt style={{ color: "#3498db", flexShrink: 0 }} />
                                            <span>{program.province}</span>
                                        </div>
                                        <div className="program-public-card__meta">
                                            <FaGraduationCap style={{ color: "#3498db", flexShrink: 0 }} />
                                            <span>{program.apsRequirement}</span>
                                        </div>
                                        <p className="program-public-card__desc">{program.description}</p>
                                        <div className="bursary-tags">
                                            <span className="tag">{program.field}</span>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <a
                                            onClick={() => navigate("/auth")}
                                            className="btn btn-primary"
                                            style={{ cursor: "pointer", fontSize: "0.9rem" }}
                                        >
                                            View &amp; Apply
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Guest View — personalised recommendations CTA */}
                    <section className="guest-view" id="guest-view">
                        <div className="guest-message">
                            <div className="message-content">
                                <i className="fas fa-bolt"></i>
                                <h2 style={{fontWeight:"bold"}}>Get Personalised Programme Recommendations</h2>
                                <p>
                                    Create a free account to see programmes matched to your APS score,
                                    subjects, and interests — and save your favourites.
                                </p>
                                <div className="auth-actions">
                                    <a onClick={()=> navigate('/auth')} className="btn btn-primary">
                                        Sign Up Free
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Informative content sections */}
                    <section className="info-section">
                        <h2 style={{ fontWeight: "bold" }}>How to Choose the Right Academic Programme</h2>
                        <p>
                            Choosing the right programme is one of the most important decisions you will make
                            as a student. The right choice aligns your strengths, interests, and career goals
                            with a qualification that opens real doors in the job market.
                        </p>
                        <ul className="info-list">
                            <li>Research what careers each programme leads to before enrolling</li>
                            <li>Check the APS and subject requirements for each programme you are interested in</li>
                            <li>Consider the duration: a 3-year degree vs a 4-year professional degree vs a 1-year certificate</li>
                            <li>Look at the institution&apos;s accreditation and reputation in your field</li>
                            <li>Think about location and whether accommodation is available</li>
                            <li>Check if bursaries or NSFAS funding are available for the programme</li>
                        </ul>
                    </section>

                    <section className="info-section">
                        <h2 style={{ fontWeight: "bold" }}>Degree vs Diploma vs Higher Certificate</h2>
                        <div className="qual-comparison">
                            <div className="qual-card">
                                <div className="qual-card__badge">Higher Certificate</div>
                                <p><strong>Duration:</strong> 1 year</p>
                                <p><strong>APS needed:</strong> Typically 20–24</p>
                                <p>An entry-level qualification. Ideal for students who want to enter the workforce quickly or build towards a diploma or degree. Can articulate upward into further studies.</p>
                            </div>
                            <div className="qual-card">
                                <div className="qual-card__badge qual-card__badge--blue">Diploma</div>
                                <p><strong>Duration:</strong> 3 years</p>
                                <p><strong>APS needed:</strong> Typically 24–30</p>
                                <p>A practical, career-focused qualification offered mainly at universities of technology. Graduates often enter the workforce directly or pursue an Advanced Diploma.</p>
                            </div>
                            <div className="qual-card">
                                <div className="qual-card__badge qual-card__badge--green">Bachelor&apos;s Degree</div>
                                <p><strong>Duration:</strong> 3–6 years</p>
                                <p><strong>APS needed:</strong> Typically 28–42+</p>
                                <p>The standard university qualification. Provides broad theoretical and practical training. Required for entry into most professional careers and postgraduate study.</p>
                            </div>
                        </div>
                    </section>

                    <section className="info-section">
                        <h2 style={{ fontWeight: "bold" }}>How APS Affects Your Programme Eligibility</h2>
                        <p>
                            Your APS (Admission Point Score) is calculated from your six best Grade 12 subject
                            results (excluding Life Orientation for most universities). Each percentage range
                            earns a specific number of points on a 1–7 scale:
                        </p>
                        <div className="aps-table-wrapper">
                            <table className="aps-table">
                                <thead>
                                    <tr>
                                        <th>Percentage</th>
                                        <th>APS Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>80–100%</td><td>7</td></tr>
                                    <tr><td>70–79%</td><td>6</td></tr>
                                    <tr><td>60–69%</td><td>5</td></tr>
                                    <tr><td>50–59%</td><td>4</td></tr>
                                    <tr><td>40–49%</td><td>3</td></tr>
                                    <tr><td>30–39%</td><td>2</td></tr>
                                    <tr><td>0–29%</td><td>1</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p style={{ marginTop: "1rem" }}>
                            Gradiate automatically calculates your APS when you enter your results and shows
                            you only the programmes you are realistically eligible for.
                        </p>
                    </section>

                    <section className="info-section">
                        <h2 style={{ fontWeight: "bold" }}>Common Mistakes Students Make When Applying</h2>
                        <ul className="info-list">
                            <li>Applying only to one institution and missing backup options</li>
                            <li>Not checking subject-specific requirements (e.g., requiring Physical Sciences for Engineering)</li>
                            <li>Missing application deadlines — most South African universities close applications in September or October</li>
                            <li>Applying for programmes without researching career outcomes</li>
                            <li>Not applying for bursaries at the same time as university applications</li>
                            <li>Ignoring extended degree or bridging programmes as viable pathways</li>
                        </ul>
                    </section>

                    <section className="info-section">
                        <h2 style={{ fontWeight: "bold" }}>Academic Programmes FAQ</h2>
                        <div className="faq-list">
                            <div className="faq-item">
                                <h3>Can I change my programme after enrolling?</h3>
                                <p>Yes, most universities allow programme changes, usually at the end of your first year. However, changing programmes may extend your duration of study. Some modules may carry over.</p>
                            </div>
                            <div className="faq-item">
                                <h3>What is an extended degree?</h3>
                                <p>An extended degree adds a foundational first year to a standard degree, making it a 4-year programme instead of 3. It is designed for students who have the potential but need extra academic support to succeed in a competitive programme.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Do I need to apply to each university separately?</h3>
                                <p>Yes. Each South African university has its own application portal and process. There is no central application system for all universities (unlike some countries). Gradiate helps you track multiple applications in one place.</p>
                            </div>
                            <div className="faq-item">
                                <h3>What is the difference between a university and a university of technology?</h3>
                                <p>Traditional universities focus on academic and theoretical degrees. Universities of technology (like TUT, CPUT, DUT) are more vocationally oriented, offering diplomas and applied degrees with a practical, industry focus.</p>
                            </div>
                        </div>
                    </section>

                    {/* Logged-in view placeholder */}
                    <div id="logged-in-view" style={{ display: "none" }}>
                        <section className="recommended-programs">
                            <div className="section-header">
                                <h2 style={{fontWeight:"bold"}}> 
                                    <i className="fas fa-star"></i> Recommended For You
                                </h2>
                                <p>
                                    Programs that match your academic profile and interests
                                </p>
                            </div>
                            <div className="programs-grid" id="recommended-programs-grid"></div>
                        </section>
                    </div>
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
                            <a href="#"><FaFacebookF/></a>
                            <a href="#"><FaTwitter/></a>
                            <a href="#"><FaLinkedin/></a>
                            <a href="#"><FaInstagram/></a>
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

export default Programsguest;

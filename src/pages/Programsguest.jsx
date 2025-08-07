import React from "react";
import { useNavigate } from "react-router-dom";


const Programsguest = () => {
   
   
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
                        <a href="programs-not-logged-in.html" className="active">
                            Programs
                        </a>
                        <a onClick={()=>navigate('/How')}>How It Works</a>
                        <a href="about.html">About</a>
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

            {/* Programs Main Content */}
            <main className="programs-container">
                <div className="container">
                    <div className="page-header">
                        <h1>
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

                    {/* Guest View (shown when not logged in) */}
                    <section className="guest-view" id="guest-view">
                        <div className="guest-message">
                            <div className="message-content">
                                <i className="fas fa-lock"></i>
                                <h2>Unlock Personalized Program Recommendations</h2>
                                <p>
                                    Create an account or log in to view programs
                                    matched to your profile and save your favorites.
                                </p>
                                <div className="auth-actions">
                                    <a href="register.html" className="btn btn-primary">
                                        Sign Up
                                    </a>
                                    <a href="login.html" className="btn btn-outline">
                                        Log In
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Logged-in View (shown when authenticated) */}
                    <div id="logged-in-view">
                        {/* Recommended Programs Section */}
                        <section className="recommended-programs">
                            <div className="section-header">
                                <h2>
                                    <i className="fas fa-star"></i> Recommended For You
                                </h2>
                                <p>
                                    Programs that match your academic profile and
                                    interests
                                </p>
                            </div>

                            <div
                                className="programs-grid"
                                id="recommended-programs-grid"
                            >
                                {/* Program cards will be populated by JavaScript */}
                            </div>
                        </section>

                        {/* All Programs Section */}
                        <section className="all-programs">
                            <div className="section-header">
                                <h2>
                                    <i className="fas fa-list"></i> All Programs
                                </h2>
                                <p>Browse all available academic programs</p>
                            </div>

                            <div className="programs-grid" id="all-programs-grid">
                                {/* Program cards will be populated by JavaScript */}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

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
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
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

export default Programsguest;

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import image from "../images/hero-about.jpg";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
} from "react-icons/fa";


export default function Aplication() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
              <a onClick={() => navigate("/Profile")}>{user?.displayName || user?.email || "Guest"}</a>

              <a onClick={() => navigate("/Practise")}>Practise</a>
              
              <a onClick={() => alert("Sorry! this feature is not yet available")} className="active">
                Bursaries
              </a>
              
            </div>
              
          )}
        </div>
      </nav>

      <div className="core" style={{
              background: `linear-gradient(rgba(240,246,255,0.75), rgba(240,246,255,0.75)), url(${image}) center/cover no-repeat`,
              
            }}>

        {/* Intro Toggle Button */}
        <div
          style={{
            textAlign: "left",
            marginTop: "0.2rem",
            marginLeft: "1.5rem",
            marginBottom: "0.9rem",
          }}
        >
          <button
            onClick={() => setShowIntro((v) => !v)}
            style={{
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.7rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px #e0e7ef",
              transition: "background 0.2s",
            }}
          >
            {showIntro ? "Hide Guide" : "Show How to Use Gradiate"}
          </button>
        </div>
        {/* Intro Section (conditionally rendered) */}
        {showIntro && (
          <div
            className="intro-guide"
            style={{
              background: `linear-gradient(rgba(240,246,255,0.75), rgba(240,246,255,0.75)), url(${image}) center/cover no-repeat`,
              borderRadius: "12px",
              margin: "0.7rem auto 1.5rem auto",
              padding: "1.5rem 1rem",
              maxWidth: "700px",
              width: "95vw",
              minWidth: 0,
              boxSizing: "border-box",
              boxShadow: "0 2px 12px #e0e7ef",
              border: "1.5px solid #b3c6e0",
            }}
          >
            <h2
              style={{
                color: "#2c3e50",
                marginBottom: 8,
                textShadow: "0 2px 8px rgba(255,255,255,0.7)",
              }}
            >
              Steps to follow!
            </h2>
            <ol style={{ paddingLeft: 20, marginBottom: 8 }}>
              <li>
                {" "}
                Browse the university cards below to learn about each
                institution and their application process.
              </li>
              <li>
                {" "}
                Click "Apply Now" on any card to visit the official application
                page for that university.
              </li>
              <li>
                {" "}
                Use the navigation menu for more features, bursaries, and
                support.
              </li>
            </ol>
            <p
              style={{
                color: "#3498db",
                fontWeight: 500,
                textShadow: "0 2px 8px rgba(255,255,255,0.7)",
              }}
            >
              Tip: Each card includes a short description to help you get to
              know the university before applying!
            </p>
            {/* Responsive style for mobile */}
            <style>{`
            @media (max-width: 600px) {
              .intro-guide {
                padding: 1rem 0.5rem !important;
                max-width: 98vw !important;
                font-size: 0.97rem !important;
              }
              .intro-guide h2 {
                font-size: 1.1rem !important;
              }
              .intro-guide ol, .intro-guide p {
                font-size: 0.97rem !important;
              }
            }
          `}</style>
          </div>
        )}

        <div className="container">
          <div className="card1">
            <img
              className="img1"
              src="https://www.univen.ac.za/docs/univen-logo.png"
              alt="Univen Logo"
            />
            <p
              className="description1"
              style={{
                fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <strong>University of Venda</strong> — Located in Thohoyandou,
              Univen is known for its diverse programs and commitment to rural
              development. Find your path in science, education, law, and more.
            </p>
            <button
              className="button1"
              onClick={() =>
                window.open(
                  "https://www.univen.ac.za/students/student-support-services/how-to-apply/"
                )
              }
            >
              Apply Now
            </button>
          </div>

          <div className="card2">
            <img
              className="img2"
              src="https://edurank.org/assets/img/uni-logos/university-of-limpopo-logo.png"
              alt="University of Limpopo"
            />
            <p
              className="description2"
              style={{
                fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <strong>University of Limpopo</strong> — Situated in Mankweng, UL
              offers strong programs in health sciences, agriculture, and
              education. It is dedicated to empowering students from all
              backgrounds.
            </p>
            <button
              className="button2"
              onClick={() =>
                window.open("https://www.ul.ac.za/tgsl/tgsl-programmes/")
              }
            >
              Apply Now
            </button>
          </div>

          <div className="card3">
            <img
              className="img3"
              src="https://public.flourish.studio/uploads/70accd09-8527-4e3a-8c5c-af8fed4825d2.png"
              alt="University of Johannesburg"
            />
            <p
              className="description3"
              style={{
                fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <strong>University of Johannesburg</strong> — UJ is a vibrant
              urban university with a reputation for innovation and inclusivity.
              Explore a wide range of undergraduate and postgraduate programs in
              the heart of Johannesburg.
            </p>
            <button
              className="button3"
              onClick={() =>
                window.open("https://www.uj.ac.za/admission-aid/undergraduate/")
              }
            >
              Apply Now
            </button>
          </div>

          <div className="card4">
            <img
              className="img4"
              src="https://th.bing.com/th/id/OIP.QF-zHDVgl2X_DmzSc_nc5wAAAA?r=0&rs=1&pid=ImgDetMain&cb=idpwebpc2"
              alt="University of Witswatersrand"
            />
            <p
              className="description4"
              style={{
                fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <strong>University of the Witwatersrand (Wits)</strong> — Wits is
              a leading research university in Africa, renowned for its academic
              excellence and social impact. Ideal for students seeking a
              world-class education in Johannesburg.
            </p>
            <button
              className="button4"
              onClick={() =>
                window.open(
                  "https://www.wits.ac.za/undergraduate/apply-to-wits/"
                )
              }
            >
              Apply Now
            </button>
          </div>

          <div className="card5">
            <img
              className="img5"
              src="https://wikisouthafrica.co.za/wp-content/uploads/2020/08/Tshwane-University-of-Technology-1024x986.png"
              alt="Tshwane University of Technology"
            />
            <p
              className="description5"
              style={{
                fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <strong>Tshwane University of Technology (TUT)</strong> — TUT is
              one of South Africa's largest residential universities, offering
              practical and career-focused programs in engineering, science, and
              the arts.
            </p>
            <button
              className="button5"
              onClick={() => window.open("https://www.tut.ac.za/")}
            >
              Apply Now
            </button>
          </div>

          <div className="card6">
            <img
              className="img6"
              src="https://www.freelogovectors.net/wp-content/uploads/2021/04/university-of-cape-town-logo-freelogovectors.net_.png"
              alt="University of CapeTown"
            />
            <p
              className="description6"
              style={{
                fontFamily: '"Poppins", "Segoe UI", Arial, sans-serif',
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <strong>University of Cape Town (UCT)</strong> — UCT is Africa's
              top-ranked university, celebrated for its beautiful campus and
              academic leadership in science, business, and the humanities.
            </p>
            <button
              className="button6"
              onClick={() =>
                window.open(
                  "https://uct.ac.za/students/applications-apply-undergraduate-qualifications/application-procedure"
                )
              }
            >
              Apply Now
            </button>
          </div>
        </div>

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
              <a href="#" title="Facebook" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" title="Twitter" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" title="LinkedIn" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="#" title="Instagram" aria-label="Instagram">
                <FaInstagram />
              </a>
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

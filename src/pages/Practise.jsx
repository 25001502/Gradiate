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

const subjects = [
  {
    name: "Mathematics",
    papers: [
      { year: 2023, url: "/downloads/Maths_2023.pdf" },
      { year: 2022, url: "/downloads/Maths_2022.pdf" },
      { year: 2021, url: "/downloads/Maths_2021.pdf" },
    ],
  },
  {
    name: "Physical Sciences",
    papers: [
      { year: 2023, url: "/downloads/PhysicalSciences_2023.pdf" },
      { year: 2022, url: "/downloads/PhysicalSciences_2022.pdf" },
    ],
  },
  {
    name: "Life Sciences",
    papers: [
      { year: 2023, url: "/downloads/LifeSciences_2023.pdf" },
      { year: 2022, url: "/downloads/LifeSciences_2022.pdf" },
    ],
  },
  {
    name: "Geography",
    papers: [
      { year: 2023, url: "/downloads/Geography_2023.pdf" },
      { year: 2022, url: "/downloads/Geography_2022.pdf" },
    ],
  },
  {
    name: "History",
    papers: [
      { year: 2023, url: "/downloads/History_2023.pdf" },
      { year: 2022, url: "/downloads/History_2022.pdf" },
    ],
  },
  {
    name: "Accounting",
    papers: [
      { year: 2023, url: "/downloads/Accounting_2023.pdf" },
      { year: 2022, url: "/downloads/Accounting_2022.pdf" },
    ],
  },
  {
    name: "English FAL",
    papers: [
      { year: 2023, url: "/downloads/EnglishFAL_2023.pdf" },
      { year: 2022, url: "/downloads/EnglishFAL_2022.pdf" },
    ],
  },
  {
    name: "Economics",
    papers: [
      { year: 2023, url: "/downloads/Economics_2023.pdf" },
      { year: 2022, url: "/downloads/Economics_2022.pdf" },
    ],
  },
  {
    name: "Tshivenda",
    papers: [
      { year: 2023, url: "/downloads/Tshivenda_2023.pdf" },
      { year: 2022, url: "/downloads/Tshivenda_2022.pdf" },
    ],
  },
  {
    name: "Business Studies",
    papers: [
      { year: 2023, url: "/downloads/BusinessStudies_2023.pdf" },
      { year: 2022, url: "/downloads/BusinessStudies_2022.pdf" },
    ],
  },
];

export default function Practise() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const navigate = useNavigate();
    const { user } = useAuth();
     const [menuOpen, setMenuOpen] = useState(false);
      

  return (
<div style={{background: `linear-gradient(rgba(240,246,255,0.75), rgba(240,246,255,0.75)), url(${image}) center/cover no-repeat`,}}>
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
              <a>{user?.displayName || user?.email || "Guest"}</a>

             <a onClick={() => navigate("/Aplication")}>Application</a>
            

              <a onClick={() => navigate()} className="active">
                Bursaries
              </a>

              
            </div>
          )}
        </div>
      </nav>

    <div
      style={{
        maxWidth: 480,
        margin: "1.2rem auto",
        marginBottom: "0.09rem",
        marginTop: "0.09rem",
        padding: "0.5rem",
        width: "99vw",
         background: `linear-gradient(rgba(240,246,255,0.75), rgba(240,246,255,0.75)), url(${image}) center/cover no-repeat`,
      }} 
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          fontSize: "1.3rem",
        }}
      >
        Grade 12 Past Exam Papers
      </h1>
      <p
        style={{
          textAlign: "center",
          marginBottom: "1.2rem",
          color: "#555",
          fontSize: "0.98rem",
        }}
      >
        Tap a subject to view and download past Grade 12 exam questions.
      </p>
      <div>
        {subjects.map((subject, idx) => (
          <div
            key={subject.name}
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              maxWidth: "100%",
              marginBottom: 14,
              boxShadow: "0 1px 4px #318deaff",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              border:
                openIndex === idx
                  ? "2px solid #2563eb"
                  : "2px solid transparent",
            }}
            onClick={() => handleToggle(idx)}
          >
            <div
              style={{
                padding: "0.9rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#2a5a95ff",
              }}
            >
              {subject.name}
              <span
                style={{
                  fontSize: "1.1rem",
                  color: openIndex === idx ? "#2563eb" : "#bbb",
                  transition: "transform 0.2s",
                  transform:
                    openIndex === idx ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                ▶
              </span>
            </div>
            {openIndex === idx && (
              <ul
                style={{
                  listStyle: "none",
                  padding: "0 1rem 0.7rem 1rem",
                  margin: 0,
                  animation: "fadeIn 0.3s",
                }}
              >
                {subject.papers.map((paper) => (
                  <li key={paper.year} style={{ marginBottom: 6 }}>
                    <a
                      href={paper.url}
                      download
                      style={{
                        color: "#2563eb",
                        textDecoration: "underline",
                        fontWeight: 500,
                        fontSize: "0.97rem",
                        wordBreak: "break-word",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Download {subject.name} {paper.year} Paper
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {/* Responsive and fadeIn animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @media (max-width: 600px) {
          div[style*="max-width"] {
            max-width: 98vw !important;
            padding: 0.5rem !important;
          }
          h1 {
            font-size: 1.1rem !important;
          }
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

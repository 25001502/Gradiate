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
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=M_7mZq2zE5o%3d&tabid=4682&portalid=0&mid=12681&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Zoios-rCurI%3d&tabid=4682&portalid=0&mid=12681&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Juy5nA5N3fM%3d&tabid=3294&portalid=0&mid=10986&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=DqfP-i10rEE%3d&tabid=3294&portalid=0&mid=10986&forcedownload=true" },
      { year: 2021, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=sGgq9FNv0lQ%3d&tabid=2922&portalid=0&mid=10135&forcedownload=true" },
      { year: 2021, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=jgMJbW3Aa0o%3d&tabid=2922&portalid=0&mid=10135&forcedownload=true" },
    ],
  },
  {
    name: "Physical Sciences",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=oTJzzXEU6Ng%3d&tabid=4682&portalid=0&mid=12685&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Gs2cDJBpRR0%3d&tabid=4682&portalid=0&mid=12685&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=5l5vQTQBaU4%3d&tabid=3294&portalid=0&mid=10990&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=_7CRVUkWGMA%3d&tabid=3294&portalid=0&mid=10990&forcedownload=true" },
    ],
  },
  {
    name: "Life Sciences",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=5Xc2L4uffmA%3d&tabid=4682&portalid=0&mid=12679&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=4yWO4CegNNE%3d&tabid=4682&portalid=0&mid=12679&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Fg44KuXQ8Es%3d&tabid=3294&portalid=0&mid=10984&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=FPGyIKhYDUw%3d&tabid=3294&portalid=0&mid=10984&forcedownload=true" },
    ],
  },
  {
    name: "Geography",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=sOLlvteQCeM%3d&tabid=4682&portalid=0&mid=12674&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=qCvbCunZPCY%3d&tabid=4682&portalid=0&mid=12674&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=T4gsWEf6_A0%3d&tabid=3294&portalid=0&mid=10979&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=yFfqSPQtFNw%3d&tabid=3294&portalid=0&mid=10979&forcedownload=true" },
    ],
  },
  {
    name: "History",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=DrznBkYP4P0%3d&tabid=4682&portalid=0&mid=12675&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=YIVtG2z_yWE%3d&tabid=4682&portalid=0&mid=12675&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=y2jZuQHPLLs%3d&tabid=3294&portalid=0&mid=10980&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=zuyAs-Eq55E%3d&tabid=3294&portalid=0&mid=10980&forcedownload=true" },
    ],
  },
  {
    name: "Accounting",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=I3ZOntNTjjo%3d&tabid=4682&portalid=0&mid=12660&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=89AYULMK6WY%3d&tabid=4682&portalid=0&mid=12660&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=l3HgEye_Xg8%3d&tabid=3294&portalid=0&mid=10965&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=rEzVzZbaHTs%3d&tabid=3294&portalid=0&mid=10965&forcedownload=true" },
    ],
  },
  {
    name: "English FAL",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=rzKvzSdEjAU%3d&tabid=4682&portalid=0&mid=12648&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=8l6DnwdLPXY%3d&tabid=4682&portalid=0&mid=12648&forcedownload=true" },
      { year: 2023, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=ehLuStOw2jA%3d&tabid=4682&portalid=0&mid=12648&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=6u3vvGSi-40%3d&tabid=3294&portalid=0&mid=10953&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=7MabwVLlFcQ%3d&tabid=3294&portalid=0&mid=10953&forcedownload=true" },
      { year: 2022, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=gFBCYV3CPk0%3d&tabid=3294&portalid=0&mid=10953&forcedownload=true" },
    ],
  },
  {
    name: "Economics",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Dlshc30RtYk%3d&tabid=4682&portalid=0&mid=12671&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=sct4D9kRRhY%3d&tabid=4682&portalid=0&mid=12671&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=ZbwLwi4Nbbk%3d&tabid=3294&portalid=0&mid=10976&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=mz3AECevBTo%3d&tabid=3294&portalid=0&mid=10976&forcedownload=true" },
    ],
  },
  {
    name: "Tshivenda",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=wCCGQHOQMJw%3d&tabid=4682&portalid=0&mid=12657&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=JG3CRnCamJU%3d&tabid=4682&portalid=0&mid=12657&forcedownload=true" },
      { year: 2023, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=Zc--UDPGU-k%3d&tabid=4682&portalid=0&mid=12657&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=DDfl_Fd0ruE%3d&tabid=3294&portalid=0&mid=10962&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=g5wCgeulASo%3d&tabid=3294&portalid=0&mid=10962&forcedownload=true" },
      { year: 2023, type: "P3", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=-2P9opC9-Jw%3d&tabid=3294&portalid=0&mid=10962&forcedownload=true" },
    ],
  },
  {
    name: "Business Studies",
    papers: [
      { year: 2023, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=j-o_oRFFS7A%3d&tabid=4682&portalid=0&mid=12664&forcedownload=true" },
      { year: 2023, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=d0WgLcInBU8%3d&tabid=4682&portalid=0&mid=12664&forcedownload=true" },
      { year: 2022, type: "P1", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=XKSOkexd5ho%3d&tabid=3294&portalid=0&mid=10969&forcedownload=true" },
      { year: 2022, type: "P2", url: "https://www.education.gov.za/LinkClick.aspx?fileticket=j4GWWzHMKt4%3d&tabid=3294&portalid=0&mid=10969&forcedownload=true" },
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
              <a onClick={() => navigate("/Profile")}>{user?.displayName || user?.email || "Guest"}</a>

             <a onClick={() => navigate("/Aplication")}>Application</a>
            

              <a onClick={() => alert("Sorry! this feature is not yet available")} className="active">
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
        Grade 12 NSC Past Exam Papers
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
                  <li key={`${paper.year}-${paper.type}`} style={{ marginBottom: 6 }}>
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
                      Download {subject.name} {paper.year} {paper.type}
                      
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

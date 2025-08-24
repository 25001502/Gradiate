import React, { useState } from "react";
import {FaTwitter,
        FaInstagram,
        FaLinkedin,FaFacebookF} from 'react-icons/fa';

export default function Aplication() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <nav className="navbar">
        <div className="container" style={{ position: "relative" }}>
          <a href="/" className="logo">
            Grad<span>iate</span>
          </a>
          {/* Burger icon */}
          <button
            className="burger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {/* Simple burger icon */}
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
          {/* Menu options */}
          {menuOpen && (
            <div className="burger-menu">
              <a onClick={()=> alert("Profile Manager  is Comming soon")}>Me</a>
              <a onClick={()=> alert("Academic Helper is Comming soon")}>Academic Helper</a>
              <a  onClick={()=> alert("Gradiate Beta is Comming soon")}>Gradiate Beta</a>
              
            </div>
          )}
        </div>
      </nav>

      <div className="container">
        <div className="card1">
          <img
            clasName="img1"
            src="https://www.univen.ac.za/docs/univen-logo.png"
            alt="Univen Logo"
          />
          <p className="description1">Apply to the University of Venda</p>
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
            clasName="img2"
            src="https://edurank.org/assets/img/uni-logos/university-of-limpopo-logo.png"
            alt="University of Limpopo"
          />
          <p className="description2">Apply to the University of Limpopo</p>
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
            clasName="img3"
            src="https://public.flourish.studio/uploads/70accd09-8527-4e3a-8c5c-af8fed4825d2.png"
            alt="University of Johannesburg"
          />
          <p className="description3">Apply to the University of Johannesburg</p>
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
            clasName="img4"
            src="https://th.bing.com/th/id/OIP.QF-zHDVgl2X_DmzSc_nc5wAAAA?r=0&rs=1&pid=ImgDetMain&cb=idpwebpc2"
            alt="University of Witswatersrand"
          />
          <p className="description4">Apply to the University of Witswatersrand</p>
          <button
            className="button4"
            onClick={() =>
              window.open("https://www.wits.ac.za/undergraduate/apply-to-wits/")
            }
          >
            Apply Now
          </button>
        </div>

        <div className="card5">
          <img
            clasName="img5"
            src="https://wikisouthafrica.co.za/wp-content/uploads/2020/08/Tshwane-University-of-Technology-1024x986.png"
            alt="Tshwane University of Technology"
          />
          <p className="description5">Apply to Tshwane University of Technology</p>
          <button className="button5" onClick={() => window.open("https://www.tut.ac.za/")}>
            Apply Now
          </button>
        </div>

        <div className="card6">
          <img
            clasName="img6"
            src="https://www.freelogovectors.net/wp-content/uploads/2021/04/university-of-cape-town-logo-freelogovectors.net_.png"
            alt="University of CapeTown"
          />
          <p className="description6">Apply to University of CapeTown</p>
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

         <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <a href="index.html" class="logo"
                            >Grad<span>iate</span></a
                        >
                        <p>Smart education matching for everyone.</p>
                    </div>
                    <div class="footer-links">
                        <div class="link-group">
                            <h4>Platform</h4>
                            <a href="#">How It Works</a>
                            <a href="#">Features</a>
                        </div>
                        <div class="link-group">
                            <h4>Resources</h4>
                            <a href="#">Help Center</a>
                            <a href="#">Contact</a>
                        </div>
                        <div class="link-group">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <div class="social-links">
                         <a href="#" title="Facebook" aria-label="Facebook"><FaFacebookF/></a>
                                                <a href="#" title="Twitter" aria-label="Twitter"><FaTwitter/></a>
                                                <a href="#" title="LinkedIn" aria-label="LinkedIn"><FaLinkedin/></a>
                                                <a href="#" title="Instagram" aria-label="Instagram"><FaInstagram/></a>
                    </div>
                    <p class="copyright">
                        &copy; 2025 Gradiate. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>


    </div>
  );
}
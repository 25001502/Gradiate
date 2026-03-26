import React, { useState } from "react";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
} from "react-icons/fa";

import toast, { Toaster } from "react-hot-toast";

export default function AuthForm() {
  const verificationEndpoint =
    import.meta.env.VITE_SEND_VERIFICATION_ENDPOINT || "/api/send-verification";

  const [isLogin, setIsLogin] = useState(true);

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [loading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const sendCustomVerificationEmail = async (targetEmail) => {
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    const response = await fetch(verificationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: targetEmail,
        idToken,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Verification service is unavailable. Start Firebase Functions emulator or deploy functions.");
      }
      throw new Error(data.error || "Failed to send verification email.");
    }
  };

  // Email/password handlers
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !username.trim()) {
      toast.error("Please enter a username.");
      return;
    }
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          toast.error("Please verify your email before logging in.");
          await sendCustomVerificationEmail(userCredential.user.email);
          toast.success("Verification email re-sent!");
          return;
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        await sendCustomVerificationEmail(userCredential.user.email);
        toast.success("Verification email sent! Please verify before logging in.");
        return;
      }
      navigate("/application"); // ✅ fixed spelling
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resendVerificationEmail = async () => {
    const targetEmail = auth.currentUser?.email || email;
    if (!targetEmail) {
      toast.error("Enter your email first.");
      return;
    }

    try {
      await sendCustomVerificationEmail(targetEmail);
      toast.success("Verification email sent.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      {/* NAVBAR */}
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

      {/* MAIN FORM */}
      <div
        className="auth-shell"
        style={{
          maxWidth: 430,
          width: "94vw",
          margin: "2.2rem auto",
          padding: "1.35rem",
          background: "linear-gradient(180deg, #ffffff 0%, #f9fcff 100%)",
          borderRadius: 20,
          border: "1px solid #dbeafe",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
        }}
      >
        <form className="login-form" onSubmit={handleEmailSubmit}>
            <div className="auth-badge">Hey! </div>
            <h2 className="auth-title">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="auth-subtitle">
              {isLogin
                ? "Sign in to continue your learning journey."
                : "Join Gradiate and unlock personalized education matching."}
            </p>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group password-input">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-login" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
            </button>
            <div className="auth-actions">
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                className="auth-link-btn"
              >
                {isLogin
                  ? "Need an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
              {isLogin && (
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  className="auth-link-btn auth-link-btn-secondary"
                >
                  Resend verification email
                </button>
              )}
            </div>
          </form>
      </div>

      {/* FOOTER */}
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
              &copy; 2026 THANDULULO TECHNOLOGIES. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <style>{`
  .auth-shell {
    position: relative;
    overflow: hidden;
  }

  .auth-shell::before {
    content: "";
    position: absolute;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 70%);
    top: -70px;
    right: -70px;
    pointer-events: none;
  }

  .login-form {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .auth-badge {
    align-self: center;
    background: #e0f2fe;
    color: #0f4c81;
    border: 1px solid #bae6fd;
    border-radius: 999px;
    padding: 0.25rem 0.8rem;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 700;
  }

  .auth-title {
    text-align: center;
    margin: 0.2rem 0 0;
    font-size: 1.85rem;
    line-height: 1.1;
    color: #0f172a;
  }

  .auth-subtitle {
    margin: 0;
    text-align: center;
    color: #475569;
    font-size: 0.96rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .form-group label {
    font-size: 0.86rem;
    font-weight: 700;
    color: #1e3a5f;
  }

  .form-group input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 0.72rem 0.85rem;
    font-size: 0.95rem;
    color: #0f172a;
    background: #ffffff;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.16);
    transform: translateY(-1px);
  }

  .btn.btn-login {
    margin-top: 0.35rem;
    border: 0;
    border-radius: 12px;
    padding: 0.78rem 1rem;
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.01em;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(37, 99, 235, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }

  .btn.btn-login:hover {
    transform: translateY(-2px);
    filter: saturate(1.06);
    box-shadow: 0 14px 28px rgba(37, 99, 235, 0.3);
  }

  .btn.btn-login:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    transform: none;
  }

  .auth-actions {
    text-align: center;
    margin-top: 0.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .auth-link-btn {
    align-self: center;
    background: none;
    border: none;
    color: #1d4ed8;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: color 0.18s ease, border-color 0.18s ease;
  }

  .auth-link-btn:hover {
    color: #1e40af;
    border-color: #93c5fd;
  }

  .auth-link-btn-secondary {
    font-size: 0.88rem;
    color: #2563eb;
  }

  @media (max-width: 500px) {
    .auth-title {
      font-size: 1.55rem;
    }

    .auth-shell {
      margin: 1.4rem auto;
      padding: 1rem;
      border-radius: 16px;
    }

    .login-form input,
    .login-form button {
      font-size: 0.97rem !important;
      padding: 0.6rem !important;
    }
    .login-form label {
      font-size: 0.97rem !important;
    }
  }
`}</style>
    </>
  );
}

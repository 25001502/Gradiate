import React, { useState } from "react";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
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

  const [authMode, setAuthMode] = useState("email"); // "email" or "phone"
  const [isLogin, setIsLogin] = useState(true);

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Phone/SMS state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" or "otp"
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [loading, setLoading] = useState(false);
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

  // Reset phone step when switching modes
  const handleAuthModeSwitch = (mode) => {
    setAuthMode(mode);
    setStep("phone");
    setPhone("");
    setOtp("");
    setConfirmationResult(null);
    setLoading(false);
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
      navigate("/Aplication"); // ✅ fixed spelling
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

  // Setup Recaptcha
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha solved");
        },
      },
      auth
    );

    window.recaptchaVerifier.render().catch(console.error);
  };

  // Phone/SMS handlers
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setupRecaptcha();
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast.success("OTP sent! Please check your SMS.");
    } catch (error) {
      toast.error(error.message);
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast.success("Phone verified! You are now logged in.");
      navigate("/Aplication");
    } catch (error) {
      console.error(error);
      toast.error("Invalid code. Please try again.");
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    setStep("phone");
    setOtp("");
    toast("You can now resend OTP.");
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
              <a onClick={() => navigate("/Bursaryguest")} className="active">
                Bursaries
              </a>
              <a onClick={() => navigate("/Programsguest")}>Programs</a>
              <a onClick={() => navigate("/How")}>How It Works</a>
              <a onClick={() => navigate("/About")}>About</a>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN FORM */}
      <div
        style={{
          maxWidth: 340,
          width: "95vw",
          margin: "1.2rem auto",
          padding: "1rem",
          background: "#f8fafc",
          borderRadius: 10,
          boxShadow: "0 2px 8px #e0e7ef",
        }}
      >
        {/* Auth mode switcher */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => handleAuthModeSwitch("email")}
            style={{
              background: authMode === "email" ? "#2563eb" : "#e0e7ef",
              color: authMode === "email" ? "#fff" : "#222",
              border: "none",
              borderRadius: "6px 0 0 6px",
              padding: "0.5rem 1.2rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Email
          </button>
          <button
            onClick={() => handleAuthModeSwitch("phone")}
            style={{
              background: authMode === "phone" ? "#2563eb" : "#e0e7ef",
              color: authMode === "phone" ? "#fff" : "#222",
              border: "none",
              borderRadius: "0 6px 6px 0",
              padding: "0.5rem 1.2rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Phone
          </button>
        </div>

        {/* Email/password form */}
        {authMode === "email" ? (
          <form className="login-form" onSubmit={handleEmailSubmit}>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>
              {isLogin ? "Login" : "Create Account"}
            </h2>
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
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={() => setIsLogin(!isLogin)}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.95rem",
                }}
              >
                {isLogin
                  ? "Need an account? Sign up"
                  : "Already have an account? Log in"}
              </button>
              {isLogin && (
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  style={{
                    display: "block",
                    margin: "0.75rem auto 0",
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.95rem",
                  }}
                >
                  Resend verification email
                </button>
              )}
            </div>
          </form>
        ) : (
          // Phone/SMS form
          <div>
            <h2 style={{ textAlign: "center", marginBottom: 100 }}>
              Sign In / Sign Up with Phone
            </h2>
            {step === "phone" && (
              <form onSubmit={handlePhoneSubmit}>
                <label
                  htmlFor="phone"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  Phone Number (with country code)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 82 123 4567"
                  required
                  style={{
                    width: "100%",
                    padding: 8,
                    marginBottom: 16,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
                <div id="recaptcha-container" style={{ marginBottom: 16 }}></div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit}>
                <label
                  htmlFor="otp"
                  style={{ display: "block", marginBottom: 8 }}
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the code you received"
                  required
                  style={{
                    width: "100%",
                    padding: 8,
                    marginBottom: 16,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  style={{
                    marginTop: 10,
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Resend OTP
                </button>
              </form>
            )}
          </div>
        )}
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
  @media (max-width: 500px) {
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

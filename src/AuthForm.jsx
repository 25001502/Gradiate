import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAvatarUrl, DEFAULT_AVATAR_STYLE } from "./utils/avatarUtils";
import SmartImage from "./components/SmartImage";
import { auth } from "./lib/firebase/auth";
import { db } from "./lib/firebase/firestore";
import { routes } from "./lib/routes";

import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebookF,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import toast, { Toaster } from "react-hot-toast";
import SEO from './components/SEO';

const PASSWORD_RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    key: "upper",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: "lower",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: "number",
    label: "One number",
    test: (value) => /\d/.test(value),
  },
  {
    key: "symbol",
    label: "One special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const VERIFICATION_CLIENT_ID_KEY = "gradiate_verification_client_id";
const VERIFICATION_COOLDOWN_KEY = "gradiate_verification_resend_available_at";

const createFallbackClientId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const getVerificationClientId = () => {
  try {
    const existingClientId = window.localStorage.getItem(VERIFICATION_CLIENT_ID_KEY);
    if (existingClientId) {
      return existingClientId;
    }

    const newClientId =
      window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : createFallbackClientId();

    window.localStorage.setItem(VERIFICATION_CLIENT_ID_KEY, newClientId);
    return newClientId;
  } catch {
    return createFallbackClientId();
  }
};

const getStoredVerificationCooldown = () => {
  try {
    return Number(window.localStorage.getItem(VERIFICATION_COOLDOWN_KEY)) || 0;
  } catch {
    return 0;
  }
};

const formatCooldown = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
  return `${totalSeconds}s`;
};

const getPasswordStrength = (password = "") => {
  const checks = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(password),
  }));

  const passedCount = checks.filter((check) => check.passed).length;
  const ratio = checks.length ? passedCount / checks.length : 0;

  let label = "Very Weak";
  let color = "#dc2626";

  if (ratio >= 1) {
    label = "Strong";
    color = "#16a34a";
  } else if (ratio >= 0.8) {
    label = "Good";
    color = "#65a30d";
  } else if (ratio >= 0.6) {
    label = "Fair";
    color = "#d97706";
  } else if (ratio >= 0.4) {
    label = "Weak";
    color = "#ea580c";
  }

  return {
    checks,
    ratio,
    label,
    color,
    isValid: checks.every((check) => check.passed),
  };
};

export default function AuthForm() {
  const verificationEndpoint =
    import.meta.env.VITE_SEND_VERIFICATION_ENDPOINT || "/api/send-verification";

  const [isLogin, setIsLogin] = useState(true);

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(getStoredVerificationCooldown);
  const [resendNow, setResendNow] = useState(Date.now());
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const navigate = useNavigate();
  const resendCooldownMs = Math.max(0, resendAvailableAt - resendNow);

  useEffect(() => {
    if (resendAvailableAt <= Date.now()) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      const now = Date.now();
      setResendNow(now);
      if (now >= resendAvailableAt) {
        window.clearInterval(timerId);
      }
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [resendAvailableAt]);

  const saveVerificationCooldown = (seconds) => {
    const cooldownSeconds = Number(seconds);
    if (!Number.isFinite(cooldownSeconds) || cooldownSeconds <= 0) {
      return;
    }

    const nextAvailableAt = Date.now() + cooldownSeconds * 1000;
    setResendNow(Date.now());
    setResendAvailableAt(nextAvailableAt);

    try {
      window.localStorage.setItem(VERIFICATION_COOLDOWN_KEY, String(nextAvailableAt));
    } catch {
      // Local storage can be blocked; server-side throttling still applies.
    }
  };

  const sendCustomVerificationEmail = async (targetEmail, reason = "manual") => {
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
    const response = await fetch(verificationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: targetEmail,
        idToken,
        clientId: getVerificationClientId(),
        reason,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (data.retryAfterSeconds) {
        saveVerificationCooldown(data.retryAfterSeconds);
      }
      if (response.status === 404) {
        throw new Error("Verification service is unavailable. Start Firebase Functions emulator or deploy functions.");
      }
      if (response.status === 429) {
        throw new Error(data.error || "Please wait before requesting another verification email.");
      }
      throw new Error(data.error || "Failed to send verification email.");
    }

    if (data.cooldownSeconds) {
      saveVerificationCooldown(data.cooldownSeconds);
    }

    return data;
  };

  // Email/password handlers
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!isLogin && !username.trim()) {
      toast.error("Please enter a username.");
      return;
    }

    if (!isLogin && !passwordStrength.isValid) {
      toast.error(
        "Password must have 8+ chars, uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          const unverifiedEmail = userCredential.user.email || email.trim();
          setPendingVerificationEmail(unverifiedEmail);
          toast.error("Your email is not verified. Check your inbox or request a new verification email.");
          await signOut(auth);
          return;
        }
        setPendingVerificationEmail("");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        // Save default generated avatar seed to Firestore (no Storage upload needed)
        const newUid = userCredential.user.uid;
        await setDoc(
          doc(db, "users", newUid),
          {
            uid: newUid,
            displayName: username,
            email,
            avatarSeed: newUid,
            avatarStyle: DEFAULT_AVATAR_STYLE,
            photoURL: getAvatarUrl(newUid, DEFAULT_AVATAR_STYLE),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        const createdEmail = userCredential.user.email || email.trim();
        setPendingVerificationEmail(createdEmail);
        try {
          await sendCustomVerificationEmail(createdEmail, "signup");
          toast.success("Verification email sent! Please verify before logging in.");
        } finally {
          await signOut(auth);
        }
        return;
      }
      navigate(routes.application);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    const targetEmail = pendingVerificationEmail || email.trim();
    if (!targetEmail) {
      toast.error("Enter your email first.");
      return;
    }

    const remainingCooldownMs = Math.max(0, resendAvailableAt - Date.now());
    if (remainingCooldownMs > 0) {
      toast.error(`Please wait ${formatCooldown(remainingCooldownMs)} before requesting another email.`);
      return;
    }

    setPendingVerificationEmail(targetEmail);
    setResendingVerification(true);
    try {
      const result = await sendCustomVerificationEmail(targetEmail, "manual");
      if (result.alreadyVerified) {
        toast.success("Email is already verified. You can log in now.");
      } else {
        toast.success("Verification email sent. Check your inbox.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send verification email.");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleGuestAccess = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      // Always clear an existing account session before entering guest mode.
      await signOut(auth);
      navigate(routes.application);
    } catch (error) {
      toast.error(error.message || "Unable to continue as guest right now.");
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
      <SEO
        title="Sign In"
        canonical="/auth"
        noindex
      />
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
                type="button"
                onClick={handleGuestAccess}
                className="btn btn-primary"
                disabled={loading}
              >
                Guest
              </button>

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
              <a onClick={() => navigate(routes.home)}>Home</a>
              <a onClick={() => navigate(routes.bursaries)} className="active">
                Bursaries
              </a>
              <a onClick={() => navigate(routes.programs)}>Programs</a>
              <a onClick={() => navigate(routes.howItWorks)}>How It Works</a>
              <a onClick={() => navigate(routes.community)}>Community</a>
              <a onClick={() => navigate(routes.about)}>About</a>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN FORM */}
      <div className="auth-3d-stage">
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
            <div className="auth-badge auth-3d-pop">
              <SmartImage
                src="https://firebasestorage.googleapis.com/v0/b/my-univen-project.firebasestorage.app/o/ChatGPT%20Image%20Feb%2016%2C%202026%2C%2010_40_33%20AM.png?alt=media&token=99a62911-665e-4997-94cb-46f47f56d17e"
                alt="Gradiate badge"
                className="auth-badge__image"
                width={512}
                height={512}
                referrerPolicy="no-referrer"
                fetchPriority="high"
                loading="eager"
              />
            </div>
            <h2 className="auth-title auth-3d-pop">
              {isLogin ? <div className="loginhead">Welcome Back</div> : <div className="loginhead">Create Your Account</div>}
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
              <div className="password-field-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={isLogin ? 6 : 8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-login auth-3d-pop" disabled={loading}>
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
              {pendingVerificationEmail && (
                <div className="verification-resend-card" role="status">
                  <span>
                    Not verified? Check <strong>{pendingVerificationEmail}</strong>.
                  </span>
                  <button
                    type="button"
                    className="auth-link-btn auth-link-btn-secondary verification-resend-button"
                    onClick={handleResendVerificationEmail}
                    disabled={loading || resendingVerification || resendCooldownMs > 0}
                  >
                    {resendingVerification
                      ? "Sending..."
                      : resendCooldownMs > 0
                        ? `Resend in ${formatCooldown(resendCooldownMs)}`
                        : "Resend verification email"}
                  </button>
                </div>
              )}
             
              
              
            </div>
          </form>
      </div>
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
  @keyframes authCardIn {
    0% {
      opacity: 0;
      transform: translateY(22px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes formItemIn {
    0% {
      opacity: 0;
      transform: translateY(14px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes orbFloat {
    0% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-6px, 6px) scale(1.05);
    }
    100% {
      transform: translate(0, 0) scale(1);
    }
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 10px 22px rgba(39, 174, 96, 0.35);
    }
    50% {
      box-shadow: 0 14px 28px rgba(39, 174, 96, 0.42);
    }
  }

  .auth-shell {
    position: relative;
    overflow: hidden;
    animation: authCardIn 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
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
    animation: orbFloat 8s ease-in-out infinite;
  }

  .auth-shell::after {
    content: "";
    position: absolute;
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%);
    bottom: -80px;
    left: -60px;
    pointer-events: none;
    animation: orbFloat 10s ease-in-out infinite reverse;
  }

  .login-form {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .login-form > * {
    opacity: 1;
    animation: formItemIn 460ms ease-out both;
  }

  .login-form > *:nth-child(1) { animation-delay: 80ms; }
  .login-form > *:nth-child(2) { animation-delay: 120ms; }
  .login-form > *:nth-child(3) { animation-delay: 170ms; }
  .login-form > *:nth-child(4) { animation-delay: 220ms; }
  .login-form > *:nth-child(5) { animation-delay: 270ms; }
  .login-form > *:nth-child(6) { animation-delay: 320ms; }
  .login-form > *:nth-child(7) { animation-delay: 370ms; }
  .login-form > *:nth-child(8) { animation-delay: 420ms; }

  .auth-badge {
    align-self: center;
    background: #ffffff;
    border: 1px solid #bae6fd;
    border-radius: 999px;
    width: 76px;
    height: 76px;
    overflow: hidden;
  }

  .auth-badge__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(1.85);
    display: block;
    margin-top: 6px;
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

  .password-field-wrap {
    position: relative;
  }

  .password-field-wrap input {
    padding-right: 2.7rem;
  }

  .password-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: #475569;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .password-toggle:hover {
    background: #eef2ff;
    color: #1e40af;
  }

  .password-policy-card {
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background: #f8fbff;
    padding: 0.72rem 0.8rem;
    display: grid;
    gap: 0.5rem;
  }

  .password-policy-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #475569;
    font-weight: 600;
  }

  .password-strength-track {
    height: 8px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
  }

  .password-strength-fill {
    height: 100%;
    border-radius: inherit;
    transition: width 0.2s ease;
  }

  .password-policy-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.32rem 0.6rem;
  }

  .password-policy-item {
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .password-policy-item--ok {
    color: #166534;
    font-weight: 600;
  }

  .btn.btn-login {
    margin-top: 0.35rem;
    width: 100%;
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    border: 0;
    border-radius: 12px;
    padding: 0.78rem 1rem;
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: #ffffff !important;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.01em;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(39, 174, 96, 0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    animation: pulseGlow 2.8s ease-in-out infinite;
  }

  .btn.btn-login::after {
    content: "";
    position: absolute;
    top: -120%;
    left: -30%;
    width: 40%;
    height: 340%;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.35), transparent);
    transform: rotate(18deg);
    transition: left 0.5s ease;
  }

  .btn.btn-login:hover {
    transform: translateY(-2px);
    filter: saturate(1.06);
    box-shadow: 0 14px 28px rgba(39, 174, 96, 0.3);
  }

  .btn.btn-login:hover::after {
    left: 120%;
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
    transform: translateY(-1px);
  }

  .auth-link-btn-secondary {
    font-size: 0.88rem;
    color: #2563eb;
  }

  .verification-resend-card {
    width: 100%;
    display: grid;
    gap: 0.45rem;
    text-align: left;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    background: #f8fbff;
    padding: 0.72rem 0.8rem;
    color: #475569;
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .verification-resend-card strong {
    color: #0f172a;
    word-break: break-word;
  }

  .verification-resend-button {
    align-self: start;
    justify-self: start;
    padding: 0;
  }

  .verification-resend-button:disabled {
    color: #94a3b8;
    cursor: not-allowed;
    border-color: transparent;
    transform: none;
  }

  .auth-link-btn {
    transition: color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-shell,
    .auth-shell::before,
    .auth-shell::after,
    .login-form > *,
    .btn.btn-login {
      animation: none !important;
    }

    .btn.btn-login::after,
    .auth-link-btn,
    .form-group input,
    .btn.btn-login {
      transition: none !important;
    }
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

    .verification-resend-button {
      padding: 0 !important;
      font-size: 0.88rem !important;
    }
  }
`}</style>

      <style>{`
  .auth-3d-stage {
    perspective: none;
  }

  .auth-3d-stage .auth-shell {
    transform: none;
    transition: box-shadow 420ms ease;
  }

  .auth-3d-stage:hover .auth-shell {
    transform: none;
    box-shadow: 0 26px 48px rgba(15, 23, 42, 0.2);
  }

  .auth-3d-stage .auth-shell::before,
  .auth-3d-stage .auth-shell::after {
    transform: none;
  }

  .auth-3d-pop {
    transform: none;
  }

  @media (max-width: 700px) {
    .auth-3d-stage .auth-shell,
    .auth-3d-stage:hover .auth-shell {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-3d-stage .auth-shell,
    .auth-3d-stage:hover .auth-shell {
      transform: none;
      transition: none;
    }
  }
`}</style>
    </>
  );
}

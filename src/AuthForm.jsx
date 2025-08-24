import React, { useState } from "react";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {FaTwitter,
        FaInstagram,
        FaLinkedin,FaFacebookF} from 'react-icons/fa';

 // 👈 Your CSS file

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !username.trim()) {
      alert("Please enter a username.");
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: username });
      }
      navigate("/welcome"); // ✅ redirect after login/signup
    } catch (error) {
      alert(error.message);
    }
  };

  return (

   
  <>
    <nav className="navbar">
      <div className="container">
        <a href="/" className="logo">
          Grad<span>iate</span>
        </a>
        <div className="auth-buttons">
          <span>For some extra features</span>
          <a  className="btn btn-primary">
            Join us 
          </a>
        </div>
      </div>
    </nav>

    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? "Login" : "Create Account"}</h1>
          <p>
            {isLogin
              ? "Enter your credentials to access your account"
              : "Fill in the details to create a new account"}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
            />
          </div>

          <button type="submit" className="btn btn-login">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

       

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: "none",
              border: "none",
              color: "var(--secondary-blue)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.95rem",
            }}
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>

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

  </>


  );
}

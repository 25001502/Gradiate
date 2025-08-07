import React, { useState } from 'react';
import { database, ref, set } from './firebase';

function Login() {
  const [name, setNameValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (name.trim()) {
      setIsLoading(true);
      const userRef = ref(database, 'students/' + name);
      set(userRef, {
        name,
        loggedInAt: new Date().toISOString(),
      }).then(() => {
        alert('Student saved!');
        localStorage.setItem('studentName', name);
        window.location.href = 'https://my-reacr-app.vercel.app/';
      }).finally(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleLogin}>
        <img
          src="https://www.univen.ac.za/docs/univen-logo.png"
          alt="University of Venda Logo"
          className="login-logo"
        />
        <h2 className="login-title">Student Login</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Enter your name"
          required
          className="login-input"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="login-btn"
        >
          {isLoading ? (
            <span className="login-spinner" />
          ) : (
            'Log In'
          )}
        </button>
        <style>
          {`
            .login-bg {
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
              padding: 1rem;
            }
            .login-form {
              background: #fff;
              padding: 2rem 2.5rem;
              border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.15);
              display: flex;
              flex-direction: column;
              align-items: center;
              min-width: 320px;
              width: 100%;
              max-width: 370px;
            }
            .login-logo {
              width: 70px;
              margin-bottom: 1.2rem;
            }
            .login-title {
              margin-bottom: 1.5rem;
              color: #2575fc;
              font-weight: 700;
              letter-spacing: 1px;
              font-size: 1.4rem;
              text-align: center;
            }
            .login-input {
              padding: 0.75rem 1rem;
              border-radius: 8px;
              border: 1px solid #ccc;
              margin-bottom: 1.25rem;
              width: 100%;
              font-size: 1rem;
              box-sizing: border-box;
            }
            .login-btn {
              background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
              color: #fff;
              border: none;
              border-radius: 8px;
              padding: 0.75rem 2rem;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s, transform 0.2s;
              transform: scale(1);
              opacity: 1;
              position: relative;
              overflow: hidden;
              width: 100%;
              margin-top: 0.5rem;
            }
            .login-btn:disabled {
              cursor: not-allowed;
              opacity: 0.7;
              transform: scale(0.96);
            }
            .login-spinner {
              display: inline-block;
              width: 22px;
              height: 22px;
              border: 3px solid #fff;
              border-top: 3px solid #2575fc;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              vertical-align: middle;
            }
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
            @media (max-width: 480px) {
              .login-form {
                padding: 1.2rem 0.8rem;
                min-width: unset;
                max-width: 100%;
                border-radius: 10px;
              }
              .login-title {
                font-size: 1.1rem;
              }
              .login-logo {
                width: 54px;
              }
              .login-btn {
                padding: 0.7rem 1rem;
                font-size: 0.98rem;
              }
            }
          `}
        </style>
      </form>
    </div>
  );
}

export default Login;

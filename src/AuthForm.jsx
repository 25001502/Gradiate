import React, { useState } from 'react';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';

export default function AuthForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLogin, setIsLogin] = useState(true);


    const navigate = useNavigate(); 

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && !username.trim()) {
            alert('Please enter a username.');
            return;
        }
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
            }
            navigate('/welcome'); // ✅ redirect after login/signup
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #e3f0ff 0%, #f9e7ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '1rem',
            }}
        >
            <img
                className="bounce-in"
                src="https://png.pngtree.com/png-clipart/20240921/original/pngtree-a-beautiful-logo-for-letter-n-png-image_16054834.png"
                alt="Nengovhela Logo"
                style={{
                    width: 64,
                    height: 64,
                    objectFit: 'contain',
                    marginBottom: '1rem',
                    borderRadius: 10,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                    background: '#fff',
                    padding: 6,
                    Animation: '',
                }}
            />
            <h1
                style={{
                    color: '#1976d2',
                    marginBottom: '1.2rem',
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    letterSpacing: 1,
                    textAlign: 'center',
                    fontFamily: 'Segoe UI, sans-serif',
                    textShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                    lineHeight: 1.2,
                    
                }}
            >
                Nengovhela Application Assistance
            </h1>
            <div
                style={{
                    padding: '1.2rem',
                    maxWidth: 360,
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 14,
                    boxShadow: '0 4px 16px rgba(25,118,210,0.10), 0 1.5px 8px rgba(249,231,255,0.12)',
                    fontFamily: 'Segoe UI, sans-serif',
                    backdropFilter: 'blur(2px)',
                    margin: '0 auto',
                    
                }}
            >
                <h2
                    style={{
                        textAlign: 'center',
                        color: '#1976d2',
                        marginBottom: '1rem',
                        letterSpacing: 1,
                        fontSize: '1.1rem',
                    }}
                >
                    {isLogin ? 'Login' : 'Create Account'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            marginBottom: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            fontSize: 15,
                            outline: 'none',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                            display: isLogin ? 'none' : 'block',
                        }}
                        autoComplete="username"
                        disabled={isLogin}
                        required={!isLogin}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            marginBottom: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            fontSize: 15,
                            outline: 'none',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            marginBottom: '1.1rem',
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            fontSize: 15,
                            outline: 'none',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        autoComplete="current-password"
                    />
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            marginBottom: '0.8rem',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                            transition: 'background 0.2s',
                            
                        }}
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'none',
                        color: '#1976d2',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 500,
                        fontSize: 14,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                    }}
                >
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                </button>
            </div>
            <style>{`
                @keyframes bounceIn {
                  0% { transform: scale(0.8); opacity: 0.7; }
                  60% { transform: scale(1.05); opacity: 1; }
                  80% { transform: scale(0.97); }
                  100% { transform: scale(1); }
                }
                .bounce-in {
                  animation: bounceIn 1.2s infinite alternate;
                }
                button[type="submit"]:hover {
                  background: #1256a0;
                  transform: scale(1.04);
                  transition: background 0.2s, transform 0.2s;
                }
                @media (max-width: 480px) {
                    div[style*="min-height"] {
                        padding: 0.5rem !important;
                    }
                    h1 {
                        font-size: 1rem !important;
                    }
                    div[style*="padding: 1.2rem"] {
                        padding: 0.7rem !important;
                        max-width: 98vw !important;
                    }
                }
            `
            }</style>
        </div>
    );
}       
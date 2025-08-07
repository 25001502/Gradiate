import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';



export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Segoe UI, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
      }}
    >
      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .welcome-animate {
            animation: fadeInUp 1s cubic-bezier(0.23, 1, 0.32, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          }
          .emoji-bounce {
            display: inline-block;
            animation: bounce 1.2s infinite alternate;
          }
          @keyframes bounce {
            0% { transform: translateY(0);}
            100% { transform: translateY(-18px);}
          }
          .rocket, .balloon {
            user-select: none;
            pointer-events: none;
          }
          .rocket {
            position: absolute;
            font-size: 2.2rem;
            left: 10%;
            bottom: -60px;
            animation: rocket-fly 6s linear infinite;
            filter: drop-shadow(0 4px 12px #0008);
          }
          .rocket2 {
            left: 80%;
            font-size: 2.5rem;
            animation-delay: 2s;
            animation-duration: 7s;
          }
          .rocket3 {
            left: 50%;
            font-size: 1.8rem;
            animation-delay: 4s;
            animation-duration: 5.5s;
          }
          @keyframes rocket-fly {
            0% {
              transform: translateY(0) scale(1) rotate(-10deg);
              opacity: 0.7;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translateY(-110vh) scale(1.1) rotate(10deg);
              opacity: 0;
            }
          }
          .balloon {
            position: absolute;
            font-size: 2.5rem;
            left: 25%;
            bottom: -80px;
            animation: balloon-float 8s linear infinite;
            filter: drop-shadow(0 2px 8px #0004);
          }
          .balloon2 {
            left: 65%;
            font-size: 2.8rem;
            animation-delay: 3s;
            animation-duration: 9s;
          }
          .balloon3 {
            left: 40%;
            font-size: 2rem;
            animation-delay: 1.5s;
            animation-duration: 7.5s;
          }
          @keyframes balloon-float {
            0% {
              transform: translateY(0) scale(1) rotate(-6deg);
              opacity: 0.8;
            }
            10% {
              opacity: 1;
            }
            100% {
              transform: translateY(-120vh) scale(1.05) rotate(6deg);
              opacity: 0;
            }
          }
          /* Responsive styles */
          @media (max-width: 600px) {
            .welcome-animate {
              padding: 1.5rem 0.8rem !important;
              width: 310px !important;
              min-width: 0 !important;
              max-width: 400px !important;
            }
            .rocket, .rocket2, .rocket3, .balloon, .balloon2, .balloon3 {
              font-size: 1.3rem !important;
            }
            h1 {
              font-size: 1.4rem !important;
            }
            p {
              font-size: 1rem !important;
            }
            button {
              width: 100%;
              font-size: 1rem !important;
              padding: 0.7rem 0 !important;
            }
          }
        `}
      </style>
      {/* Animated Rockets */}
      <span className="rocket" role="img" aria-label="rocket">🚀</span>
      <span className="rocket rocket2" role="img" aria-label="rocket">🚀</span>
      <span className="rocket rocket3" role="img" aria-label="rocket">🚀</span>
      {/* Animated Balloons */}
      <span className="balloon" role="img" aria-label="balloon">🎈</span>
      <span className="balloon balloon2" role="img" aria-label="balloon">🎈</span>
      <span className="balloon balloon3" role="img" aria-label="balloon">🎈</span>
      <div
        className="welcome-animate"
        style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(6px)',
          padding: '3rem 4rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '400px',
          minWidth: '0',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '1px', textAlign: 'center' }}>
          <span className="emoji-bounce" role="img" aria-label="party">🎉</span>
          &nbsp;Welcome, {user?.displayName || user?.email || 'Guest'}!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          You have successfully logged in.
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.85, textAlign: 'center' }}>
          We now allow you to apply in your desired University.
        </p>
        <button
          onClick={() => navigate('/Aplication')}
          style={{
            marginTop: '2rem',
            padding: '0.8rem 2.2rem',
            background: '#fff',
            color: '#764ba2',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(31,38,135,0.10)',
            transition: 'background 0.2s, color 0.2s',
            width: '100%',
            maxWidth: '320px',
            alignSelf: 'center',
          }}
        >
          Continue your journey
        </button>
      </div>
    </div>
  );
}

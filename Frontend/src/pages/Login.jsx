import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function SocialLoginButtons({ setError }) {
  const navigate = useNavigate();
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${codeResponse.access_token}` },
      })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, picture: data.picture }));
        navigate('/home');
      })
      .catch(err => {
        console.error('Failed to fetch user info', err);
        setError('Failed to fetch Google user information.');
      });
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setError('Google Sign-In failed or was cancelled.');
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button type="button" onClick={() => loginWithGoogle()} className="btn-social" style={{ position: 'relative', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
        </div>
        Continue with Google
      </button>
      <button type="button" onClick={() => loginWithGoogle()} className="btn-social" style={{ position: 'relative', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center', color: '#EA4335' }}>
          <Mail size={24} />
        </div>
        Continue with Gmail
      </button>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!patientId) {
      setError('Please enter your Patient ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (patientId === 'PAT001' && password === '1234') {
      setError('');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/home');
    } else {
      setError('Invalid Patient ID or password.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', margin: '0 auto', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>MindCare App</h1>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Welcome Back</h2>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--nav-text)' }}>Please enter your details to sign in safely.</p>

        {error && (
          <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: '#e2e8f0', color: '#4a5568', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '1rem', textAlign: 'center' }}>
          <strong>Demo login:</strong> PAT001 / 1234
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="patientId" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Patient ID</label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. PAT001"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid var(--secondary-color)', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '1rem', paddingRight: '4rem', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid var(--secondary-color)', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--primary-color)', padding: '0.5rem', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.9rem', color: 'var(--nav-text)', textDecoration: 'none', fontWeight: 'normal' }}>Forgot Password?</a>
            </div>
          </div>
          <button type="submit" style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', fontSize: '1.2rem', borderRadius: '8px' }}>Sign In</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--secondary-color)' }}></div>
          <span style={{ padding: '0 1rem', color: 'var(--nav-text)', fontSize: '0.9rem' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--secondary-color)' }}></div>
        </div>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <ErrorBoundary fallback={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button type="button" onClick={() => setError('Google Sign-In failed to load. Please check your connection or configuration.')} className="btn-social" style={{ position: 'relative', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                </div>
                Continue with Google
              </button>
              <button type="button" onClick={() => setError('Google Sign-In failed to load. Please check your connection or configuration.')} className="btn-social" style={{ position: 'relative', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center', color: '#EA4335' }}>
                  <Mail size={24} />
                </div>
                Continue with Gmail
              </button>
            </div>
          }>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <SocialLoginButtons setError={setError} />
            </GoogleOAuthProvider>
          </ErrorBoundary>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button type="button" onClick={() => setError('Google Sign-In is not configured. Please add a valid VITE_GOOGLE_CLIENT_ID to your .env file.')} className="btn-social" style={{ position: 'relative', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none"/>
                </svg>
              </div>
              Continue with Google
            </button>
            <button type="button" onClick={() => setError('Google Sign-In is not configured. Please add a valid VITE_GOOGLE_CLIENT_ID to your .env file.')} className="btn-social" style={{ position: 'relative', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center', color: '#EA4335' }}>
                <Mail size={24} />
              </div>
              Continue with Gmail
            </button>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', fontSize: '1rem', color: 'var(--nav-text)' }}>
          New to MindCare? <a href="#" style={{ color: 'var(--primary-color)' }}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}

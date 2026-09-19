import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${codeResponse.access_token}` },
      })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authToken', 'mock_google_jwt_' + data.sub);
        localStorage.setItem('authUser', JSON.stringify({ name: data.name, email: data.email, role: 'patient' }));
        navigate('/home');
      })
      .catch(err => {
        console.error('Failed to fetch user info', err);
        setError(t('login.errorGoogleFetch'));
      });
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setError(t('login.errorGoogleFail'));
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        type="button"
        onClick={() => loginWithGoogle()}
        className="btn-social"
        style={{
          position: 'relative',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #cbd5e0',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
        <div style={{ position: 'absolute', left: '1rem', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <span>{t('login.continueWithGoogle')}</span>
      </button>
    </div>
  );
}

export default function Login() {
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrId.trim()) {
      setError(t('login.errorNoPatientId'));
      return;
    }
    if (!password.trim()) {
      setError(t('login.errorNoPassword'));
      return;
    }

    setLoading(true);
    try {
      // Handles both email or patientId (formats into email for API client)
      const email = emailOrId.includes('@') ? emailOrId : `${emailOrId.toLowerCase()}@eldercare.in`;
      const res = await login(email, password);
      if (res.user?.role === 'caregiver') {
        navigate('/caregiver');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || t('login.errorInvalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <LanguageSwitcher />
      </div>
      <div className="card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', border: '1px solid var(--secondary-color)', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: 'var(--card-bg, #ffffff)' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          <img src="/ner_senior_avatar.png" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>{t('login.welcome')}</h1>
        <p style={{ fontSize: '1rem', color: 'var(--nav-text)', marginBottom: '1.5rem' }}>{t('login.subtitle')}</p>

        {error && (
          <div style={{ backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label htmlFor="emailOrId" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              {t('login.patientId')} / Email
            </label>
            <input
              type="text"
              id="emailOrId"
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              placeholder="e.g. PAT001 or name@example.com"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid var(--secondary-color)', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="password" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              {t('login.password')}
            </label>
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
              <Link to="/forgot-password" style={{ fontSize: '0.95rem', color: 'var(--nav-text)', textDecoration: 'none' }}>
                {t('login.forgotPassword')}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%', padding: '1rem', fontSize: '1.2rem', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: '#ffffff', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Signing in...' : t('login.loginButton')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.8rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--secondary-color)' }}></div>
          <span style={{ padding: '0 1rem', color: 'var(--nav-text)', fontSize: '0.9rem' }}>{t('login.orContinueWith')}</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--secondary-color)' }}></div>
        </div>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <ErrorBoundary fallback={<button type="button" onClick={() => setError(t('login.errorGoogleLoad'))} className="btn-social">Google Sign In</button>}>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <SocialLoginButtons setError={setError} />
            </GoogleOAuthProvider>
          </ErrorBoundary>
        ) : null}

        <div style={{ marginTop: '1.5rem', color: 'var(--nav-text)', fontSize: '1rem' }}>
          {t('login.newToMindCare')}{' '}
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
            {t('login.signUp')}
          </Link>
        </div>
      </div>
    </div>
  );
}

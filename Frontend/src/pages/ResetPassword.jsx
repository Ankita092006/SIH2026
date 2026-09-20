import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { AlertCircle, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'mock_token';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      setMessage(res.message || 'Password successfully reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '2rem', backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
          Choose New Password
        </h1>
        <p style={{ color: 'var(--nav-text)', margin: 0, fontSize: '1rem' }}>
          Please choose a strong password with at least 6 characters.
        </p>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', backgroundColor: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '8px', color: '#276749', marginBottom: '1.5rem' }}>
          <CheckCircle size={20} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--text-color)' }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e0)', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', color: 'var(--text-color)' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e0)', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.9rem',
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <Lock size={18} />
          {loading ? 'Resetting...' : 'Save New Password'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--nav-text)', textDecoration: 'none', fontWeight: 'bold' }}>
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

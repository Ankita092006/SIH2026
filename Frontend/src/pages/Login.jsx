import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already authenticated, redirect to home
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
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>MindCare App</h1>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Welcome</h2>
        <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>Please enter your details to sign in safely.</p>
        
        {error && (
          <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: '#e2e8f0', color: '#4a5568', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '1rem', textAlign: 'center' }}>
          <strong>Demo login:</strong> PAT001 / 1234
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="patientId" style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Patient ID</label>
            <input 
              type="text" 
              id="patientId" 
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="e.g. PAT001" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', borderRadius: '4px', border: '2px solid var(--secondary-color)', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', textAlign: 'left', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', borderRadius: '4px', border: '2px solid var(--secondary-color)', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{ marginTop: '1rem', width: '100%', padding: '1.2rem', fontSize: '1.5rem' }}>Sign In</button>
        </form>
      </div>
    </div>
  );
}

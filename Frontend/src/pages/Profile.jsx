import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientProfile, updatePatientProfile } from '../services/patientService';
import { useAccessibility } from '../context/AccessibilityContext';
import { LogOut, Settings, Type, Contrast, MonitorPlay, Bell as LucideBell, Camera, Edit2, Check } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(getPatientProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [error, setError] = useState('');

  const { 
    textSize, setTextSize, 
    highContrast, setHighContrast, 
    reduceMotion, setReduceMotion,
    soundEnabled, setSoundEnabled
  } = useAccessibility();

  // Reload profile if needed
  useEffect(() => {
    setProfile(getPatientProfile());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB.');
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target.result;
      updatePatientProfile({ avatar: base64Str });
      setProfile({ ...profile, avatar: base64Str });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (editName.trim().length === 0) {
      setError('Name cannot be empty.');
      return;
    }
    setError('');
    updatePatientProfile({ name: editName });
    setProfile({ ...profile, name: editName });
    setIsEditingName(false);
  };

  const handleResetAvatar = () => {
    const defaultAvatar = "/senior_avatar.png";
    updatePatientProfile({ avatar: defaultAvatar });
    setProfile({ ...profile, avatar: defaultAvatar });
  };

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My Profile</h1>
      
      {error && (
        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <img src={profile.avatar} alt="Profile Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }} />
            <button 
              onClick={() => fileInputRef.current.click()} 
              style={{ position: 'absolute', bottom: -10, right: -10, padding: '0.5rem', borderRadius: '50%', border: '2px solid white' }}
              aria-label="Change Avatar"
            >
              <Camera size={20} />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1 }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  style={{ fontSize: '1.5rem', padding: '0.5rem', width: '100%', maxWidth: '200px' }}
                />
                <button onClick={handleSaveName} style={{ padding: '0.5rem' }} aria-label="Save Name"><Check size={20}/></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>{profile.name}</h2>
                <button onClick={() => setIsEditingName(true)} style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary-color)', border: 'none' }} aria-label="Edit Name"><Edit2 size={20}/></button>
              </div>
            )}
            
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', margin: '0.5rem 0' }}>Patient ID: {profile.id}</p>
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', margin: '0' }}>Age: {profile.age}</p>
          </div>
        </div>

        <button onClick={handleResetAvatar} style={{ backgroundColor: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', padding: '0.5rem 1rem', width: 'fit-content' }}>
          Reset Default Picture
        </button>

      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings /> Accessibility Settings
        </h2>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              <Type /> Text Size
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <input type="radio" name="textSize" value="normal" checked={textSize === 'normal'} onChange={() => setTextSize('normal')} style={{ transform: 'scale(1.5)' }} /> Normal
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <input type="radio" name="textSize" value="large" checked={textSize === 'large'} onChange={() => setTextSize('large')} style={{ transform: 'scale(1.5)' }} /> Large
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                <input type="radio" name="textSize" value="extra-large" checked={textSize === 'extra-large'} onChange={() => setTextSize('extra-large')} style={{ transform: 'scale(1.5)' }} /> Extra Large
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Contrast /> <strong>High Contrast Mode</strong>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MonitorPlay /> <strong>Reduce Motion & Animations</strong>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Sound Feedback</strong>
              </div>
            </label>
          </div>

        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LucideBell size={28} /> Notification Preferences
        </h2>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.5)' }} />
            <div>
              <strong>Email Notifications</strong>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--nav-text)' }}>Receive daily summaries and alerts</p>
            </div>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', cursor: 'pointer' }}>
            <input type="checkbox" style={{ transform: 'scale(1.5)' }} />
            <div>
              <strong>SMS Alerts</strong>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--nav-text)' }}>Receive instant reminder texts</p>
            </div>
          </label>
        </div>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '2rem', width: '100%', backgroundColor: '#e53e3e', padding: '1.2rem', marginBottom: '4rem' }}>
        <LogOut /> Log Out
      </button>
    </div>
  );
}

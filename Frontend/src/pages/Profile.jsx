import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientProfile, updatePatientProfile } from '../services/patientService';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, Settings, Type, Contrast, MonitorPlay, Bell as LucideBell, Camera, Edit2, Check } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      setError(t('profile.selectImage'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t('profile.imageSize'));
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
      setError(t('profile.nameEmpty'));
      return;
    }
    setError('');
    updatePatientProfile({ name: editName });
    setProfile({ ...profile, name: editName });
    setIsEditingName(false);
  };

  const handleResetAvatar = () => {
    const defaultAvatar = "/ner_senior_avatar.png";
    updatePatientProfile({ avatar: defaultAvatar });
    setProfile({ ...profile, avatar: defaultAvatar });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{t('profile.title')}</h1>
      </div>
      
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
            
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', margin: '0.5rem 0' }}>{t('profile.patientId')} {profile.id}</p>
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', margin: '0' }}>{t('profile.ageText')} {profile.age}</p>
          </div>
        </div>

        <button onClick={handleResetAvatar} style={{ backgroundColor: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', padding: '0.5rem 1rem', width: 'fit-content' }}>
          {t('profile.resetAvatar')}
        </button>

      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings /> {t('profile.settings')}
        </h2>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <LanguageSwitcher />

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              <Type /> {t('profile.textSize')}
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', padding: '0.5rem 1rem', border: '2px solid var(--secondary-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: textSize === 'normal' ? 'rgba(39, 103, 73, 0.1)' : 'transparent' }}>
                <input type="radio" name="textSize" value="normal" checked={textSize === 'normal'} onChange={() => setTextSize('normal')} style={{ transform: 'scale(1.5)' }} /> {t('profile.normal')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', padding: '0.5rem 1rem', border: '2px solid var(--secondary-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: textSize === 'large' ? 'rgba(39, 103, 73, 0.1)' : 'transparent' }}>
                <input type="radio" name="textSize" value="large" checked={textSize === 'large'} onChange={() => setTextSize('large')} style={{ transform: 'scale(1.5)' }} /> {t('profile.largeText')}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', padding: '0.5rem 1rem', border: '2px solid var(--secondary-color)', borderRadius: '8px', cursor: 'pointer', backgroundColor: textSize === 'extra-large' ? 'rgba(39, 103, 73, 0.1)' : 'transparent' }}>
                <input type="radio" name="textSize" value="extra-large" checked={textSize === 'extra-large'} onChange={() => setTextSize('extra-large')} style={{ transform: 'scale(1.5)' }} /> {t('profile.extraLarge')}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Contrast /> <strong>{t('profile.highContrastMode')}</strong>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} aria-label={t('profile.highContrastMode')} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MonitorPlay /> <strong>{t('profile.reduceMotion')}</strong>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)} aria-label={t('profile.reduceMotion')} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{t('profile.soundFeedback')}</strong>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={soundEnabled} onChange={e => setSoundEnabled(e.target.checked)} aria-label="Sound Feedback" />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LucideBell size={28} /> {t('profile.notificationPrefs')}
        </h2>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.2rem' }}>
            <div>
              <strong>{t('profile.emailNotif')}</strong>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--nav-text)' }}>{t('profile.emailNotifDesc')}</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked aria-label={t('profile.emailNotif')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.2rem' }}>
            <div>
              <strong>{t('profile.smsNotif')}</strong>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--nav-text)' }}>{t('profile.smsNotifDesc')}</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" aria-label={t('profile.smsNotif')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '2rem', width: '100%', backgroundColor: '#e53e3e', padding: '1.2rem', marginBottom: '4rem' }}>
        <LogOut /> {t('profile.logout')}
      </button>
    </div>
  );
}

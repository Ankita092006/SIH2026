import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../api/patient.api';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Type, Contrast, MonitorPlay, Bell as LucideBell, Edit2, Check } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoadingState from '../components/common/LoadingState';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { logout, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const {
    textSize, setTextSize,
    highContrast, setHighContrast,
    reduceMotion, setReduceMotion,
    soundEnabled, setSoundEnabled
  } = useAccessibility();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await patientApi.getProfile();
        if (res.patient) {
          setProfile(res.patient);
          setEditName(res.patient.name);
        }
      } catch (err) {
        console.warn('Using fallback profile data:', err);
        setProfile({
          id: 'PAT001',
          name: user?.name || 'Bhaben Barua',
          age: 72,
          avatarUrl: '/ner_senior_avatar.png'
        });
        setEditName(user?.name || 'Bhaben Barua');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveName = async () => {
    if (editName.trim().length === 0) {
      setError(t('profile.nameEmpty'));
      return;
    }
    setError('');
    try {
      await patientApi.updateProfile({ name: editName });
      setProfile(prev => ({ ...prev, name: editName }));
      setIsEditingName(false);
    } catch (err) {
      setError('Failed to update name.');
    }
  };

  const handleResetAvatar = async () => {
    const defaultAvatar = "/ner_senior_avatar.png";
    try {
      await patientApi.updateProfile({ avatarUrl: defaultAvatar });
      setProfile(prev => ({ ...prev, avatarUrl: defaultAvatar }));
    } catch (err) {
      console.warn('Failed to reset avatar');
    }
  };

  if (loading) return <LoadingState message="Loading your profile..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{t('profile.title')}</h1>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profile?.avatarUrl || profile?.avatar || "/ner_senior_avatar.png"}
              alt="Profile Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ fontSize: '1.5rem', padding: '0.5rem', width: '100%', maxWidth: '240px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                />
                <button onClick={handleSaveName} style={{ padding: '0.5rem' }} aria-label="Save Name">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>{profile?.name}</h2>
                <button
                  onClick={() => setIsEditingName(true)}
                  style={{ padding: '0.5rem', background: 'transparent', color: 'var(--primary-color)', border: 'none', cursor: 'pointer' }}
                  aria-label="Edit Name"
                >
                  <Edit2 size={20} />
                </button>
              </div>
            )}

            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', margin: '0.5rem 0' }}>
              {t('profile.patientId')} {profile?.id || 'PAT001'}
            </p>
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', margin: '0' }}>
              {t('profile.ageText')} {profile?.age || 72}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetAvatar}
          style={{ backgroundColor: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', padding: '0.5rem 1rem', width: 'fit-content', borderRadius: '8px', cursor: 'pointer' }}
        >
          {t('profile.resetAvatar')}
        </button>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings /> {t('profile.settings')}
        </h2>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <LanguageSwitcher />

          {/* Text Size Control */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Type /> {t('profile.textSize')}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setTextSize('normal')}
                style={{ backgroundColor: textSize === 'normal' ? 'var(--primary-color)' : '#e2e8f0', color: textSize === 'normal' ? 'white' : 'black', padding: '0.5rem 1rem' }}
              >
                {t('profile.normal')}
              </button>
              <button
                onClick={() => setTextSize('large')}
                style={{ backgroundColor: textSize === 'large' ? 'var(--primary-color)' : '#e2e8f0', color: textSize === 'large' ? 'white' : 'black', padding: '0.5rem 1rem' }}
              >
                {t('profile.large')}
              </button>
              <button
                onClick={() => setTextSize('extra-large')}
                style={{ backgroundColor: textSize === 'extra-large' ? 'var(--primary-color)' : '#e2e8f0', color: textSize === 'extra-large' ? 'white' : 'black', padding: '0.5rem 1rem' }}
              >
                {t('profile.extraLarge')}
              </button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Contrast /> {t('profile.highContrast')}
            </span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{ width: '28px', height: '28px', cursor: 'pointer' }}
              aria-label={t('profile.highContrast')}
            />
          </div>

          {/* Reduce Motion Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MonitorPlay /> {t('profile.reduceMotion')}
            </span>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              style={{ width: '28px', height: '28px', cursor: 'pointer' }}
              aria-label={t('profile.reduceMotion')}
            />
          </div>

          {/* Sound Feedback Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LucideBell /> {t('profile.soundFeedback')}
            </span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              style={{ width: '28px', height: '28px', cursor: 'pointer' }}
              aria-label={t('profile.soundFeedback')}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={20} />
          {t('profile.logout')}
        </button>
      </div>
    </div>
  );
}

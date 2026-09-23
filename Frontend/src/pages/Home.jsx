import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mic, Brain } from 'lucide-react';
import { NERBellIcon, NERTrophyIcon } from '../components/NERIcons';
import { patientApi } from '../api/patient.api';
import { dashboardApi } from '../api/dashboard.api';
import { reminderApi } from '../api/reminder.api';
import { resultsApi } from '../api/results.api';
import { useLanguage } from '../context/LanguageContext';
import { formatResultDateTime } from '../utils/timeUtils';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [pendingReminders, setPendingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, summaryRes, remindersRes, resultsRes] = await Promise.all([
        patientApi.getProfile().catch(() => ({ patient: { name: 'Bhaben Barua', avatarUrl: '/ner_senior_avatar.png' } })),
        dashboardApi.getSummary().catch(() => null),
        reminderApi.getReminders().catch(() => ({ reminders: [] })),
        resultsApi.getResults().catch(() => ({ results: [] }))
      ]);

      setProfile(profileRes.patient || { name: 'Bhaben Barua', avatarUrl: '/ner_senior_avatar.png' });
      setRecentResults(resultsRes.results?.slice(0, 3) || []);
      const rems = remindersRes.reminders || [];
      setPendingReminders(rems.filter(r => !r.completed).slice(0, 3));
    } catch (err) {
      setError(err.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading your personal health companion..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={loadDashboard} />;

  return (
    <div>
      {/* Greeting Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px' }}>
        <img src={profile?.avatarUrl || profile?.avatar || "/ner_senior_avatar.png"} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', padding: '5px', objectFit: 'cover' }} />
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>
            {t('home.greeting').replace('{name}', (profile?.name || 'Friend').split(' ')[0])}
          </h1>
          <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0 0', color: 'var(--nav-text)' }}>{t('home.howAreYou')}</p>
        </div>
      </div>

      {/* Quick Access Voice & Memory Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/voice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '1rem',
            padding: '1.2rem',
            backgroundColor: '#ffffff',
            border: '2px solid var(--primary-color)',
            borderRadius: '16px',
            color: 'var(--primary-color)',
            textAlign: 'left'
          }}
        >
          <div style={{ padding: '0.6rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px' }}>
            <Mic size={28} />
          </div>
          <div>
            <strong style={{ fontSize: '1.15rem', display: 'block' }}>Voice Assistant</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--nav-text)', fontWeight: 'normal' }}>Tap to speak in English/Assamese</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/memory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '1rem',
            padding: '1.2rem',
            backgroundColor: '#ffffff',
            border: '2px solid #805ad5',
            borderRadius: '16px',
            color: '#805ad5',
            textAlign: 'left'
          }}
        >
          <div style={{ padding: '0.6rem', backgroundColor: '#faf5ff', borderRadius: '12px' }}>
            <Brain size={28} />
          </div>
          <div>
            <strong style={{ fontSize: '1.15rem', display: 'block' }}>Personal Memory Vault</strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--nav-text)', fontWeight: 'normal' }}>Photos & recall practice</span>
          </div>
        </button>
      </div>

      {/* Recommended Activity */}
      <div className="card" style={{ borderLeft: '8px solid var(--nav-active)' }}>
        <h2 style={{ fontSize: '1.8rem', marginTop: 0, color: 'var(--primary-color)' }}>{t('home.recommendedActivity')}</h2>
        <h3 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>Northeast Memory Match</h3>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Pair traditional North Eastern cultural motifs to strengthen visual retention.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/games/memory-match/instructions')}>
            <Play /> {t('home.startGame')}
          </button>
          <button onClick={() => navigate('/games')} style={{ backgroundColor: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>
            {t('home.viewAllGames')}
          </button>
        </div>
      </div>

      {/* Reminders & Recent Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><NERBellIcon /> {t('home.reminders')}</h2>
            <button onClick={() => navigate('/reminders')} style={{ padding: '0.5rem', margin: 0, backgroundColor: 'transparent', color: 'var(--primary-color)', border: 'none' }}>
              {t('common.seeAll')}
            </button>
          </div>
          {pendingReminders.length === 0 ? (
            <p style={{ margin: 'auto 0', color: 'var(--nav-text)', textAlign: 'center', fontSize: '1.1rem' }}>{t('home.noPendingReminders')}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', textAlign: 'left', margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
              {pendingReminders.map(r => (
                <li key={r.id} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--secondary-color)' }}>
                  <strong>{r.time}:</strong> {r.title || r.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><NERTrophyIcon /> {t('home.recentResults')}</h2>
            <button onClick={() => navigate('/results')} style={{ padding: '0.5rem', margin: 0, backgroundColor: 'transparent', color: 'var(--primary-color)', border: 'none' }}>
              {t('common.seeAll')}
            </button>
          </div>
          {recentResults.length === 0 ? (
            <p style={{ margin: 'auto 0', color: 'var(--nav-text)', textAlign: 'center', fontSize: '1.1rem' }}>{t('home.noRecentGames')}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', textAlign: 'left', margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
              {recentResults.map(res => (
                <li key={res.id} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--secondary-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{res.gameTitle || res.gameId}</strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--nav-text)' }}>{formatResultDateTime(res.timestamp || res.date, language)}</span>
                  </div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{res.score}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

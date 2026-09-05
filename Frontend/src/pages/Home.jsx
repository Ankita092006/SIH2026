import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { NERBellIcon, NERTrophyIcon } from '../components/NERIcons';
import { getPatientProfile } from '../services/patientService';
import { getRecentResults } from '../services/gameService';
import { getReminders } from '../services/reminderService';
import { cognitiveGames } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { formatReminderTime, formatResultDateTime } from '../utils/timeUtils';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [profile, setProfile] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [pendingReminders, setPendingReminders] = useState([]);
  
  const recommendedGame = cognitiveGames[0]; // Memory Match

  useEffect(() => {
    setProfile(getPatientProfile());
    setRecentResults(getRecentResults(3));
    const allReminders = getReminders();
    setPendingReminders(allReminders.filter(r => r.status === 'pending' || r.status === 'upcoming').slice(0, 3));
  }, []);

  if (!profile) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: '12px' }}>
        <img src={profile.avatar} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', padding: '5px', objectFit: 'cover' }} />
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>
            {t('home.greeting').replace('{name}', profile.name.split(' ')[0])}
          </h1>
          <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0 0', color: 'var(--nav-text)' }}>{t('home.howAreYou')}</p>
        </div>
      </div>

      <div className="card" style={{ borderLeft: '8px solid var(--nav-active)' }}>
        <h2 style={{ fontSize: '1.8rem', marginTop: 0, color: 'var(--primary-color)' }}>{t('home.recommendedActivity')}</h2>
        <h3 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>{t(`games.${recommendedGame.id.replace(/-([a-z])/g, g => g[1].toUpperCase())}`)}</h3>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{t(`games.${recommendedGame.id.replace(/-([a-z])/g, g => g[1].toUpperCase())}Desc`)}</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/games/${recommendedGame.id}/instructions`)}>
            <Play /> {t('home.startGame')}
          </button>
          <button onClick={() => navigate('/games')} style={{ backgroundColor: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>
            {t('home.viewAllGames')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><NERBellIcon /> {t('home.reminders')}</h2>
            <button onClick={() => navigate('/reminders')} style={{ padding: '0.5rem', margin: 0, backgroundColor: 'transparent', color: 'var(--primary-color)', border: 'none' }}>
              {t('common.seeAll')}
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.2rem', textAlign: 'left', margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
            {pendingReminders.map(r => (
              <li key={r.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--secondary-color)' }}>
                <strong>{formatReminderTime(r.time, language)}:</strong> {r.translationKey ? t(r.translationKey) : r.text}
              </li>
            ))}
            {pendingReminders.length === 0 && <p>{t('home.noPendingReminders')}</p>}
          </ul>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><NERTrophyIcon /> {t('home.recentResults')}</h2>
            <button onClick={() => navigate('/results')} style={{ padding: '0.5rem', margin: 0, backgroundColor: 'transparent', color: 'var(--primary-color)', border: 'none' }}>
              {t('common.seeAll')}
            </button>
          </div>
          {recentResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-evenly' }}>
              {recentResults.map(res => (
                <div key={res.id} style={{ borderBottom: '1px solid var(--secondary-color)', paddingBottom: '0.5rem' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}><strong>{res.gameId ? t(`games.${res.gameId.replace(/-([a-z])/g, g => g[1].toUpperCase())}`) : "Game"}</strong></p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.1rem' }}>{t('games.score')}: {res.score}</span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--nav-text)' }}>{res.completedAt ? formatResultDateTime(res.completedAt, language) : (res.date ? `${res.date === 'Today' ? t('common.today') : (res.date === 'Yesterday' ? t('common.yesterday') : res.date)} • ${t('games.timeNotRecorded')}` : t('games.timeNotRecorded'))}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '1.2rem' }}>{t('home.noRecentGames')}</p>
          )}
        </div>

      </div>
    </div>
  );
}

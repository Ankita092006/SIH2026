import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { NERBellIcon, NERTrophyIcon } from '../components/NERIcons';
import { getPatientProfile } from '../services/patientService';
import { getRecentResults } from '../services/gameService';
import { getReminders } from '../services/reminderService';
import { cognitiveGames } from '../data/mockData';

export default function Home() {
  const navigate = useNavigate();
  
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
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--primary-color)' }}>Hello, {profile.name.split(' ')[0]}</h1>
          <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0 0', color: 'var(--nav-text)' }}>How are you feeling today?</p>
        </div>
      </div>

      <div className="card" style={{ borderLeft: '8px solid var(--nav-active)' }}>
        <h2 style={{ fontSize: '1.8rem', marginTop: 0, color: 'var(--primary-color)' }}>Today's Recommended Activity</h2>
        <h3 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>{recommendedGame.title}</h3>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{recommendedGame.description}</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/games/${recommendedGame.id}/instructions`)}>
            <Play /> Start Game
          </button>
          <button onClick={() => navigate('/games')} style={{ backgroundColor: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>
            View All Games
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><NERBellIcon /> Reminders</h2>
            <button onClick={() => navigate('/reminders')} style={{ padding: '0.5rem', margin: 0, backgroundColor: 'transparent', color: 'var(--primary-color)', border: 'none' }}>
              See All
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.2rem', textAlign: 'left', margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
            {pendingReminders.map(r => (
              <li key={r.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--secondary-color)' }}>
                <strong>{r.time}:</strong> {r.text}
              </li>
            ))}
            {pendingReminders.length === 0 && <p>You have no pending reminders!</p>}
          </ul>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}><NERTrophyIcon /> Recent Results</h2>
            <button onClick={() => navigate('/results')} style={{ padding: '0.5rem', margin: 0, backgroundColor: 'transparent', color: 'var(--primary-color)', border: 'none' }}>
              See All
            </button>
          </div>
          {recentResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-evenly' }}>
              {recentResults.map(res => (
                <div key={res.id} style={{ borderBottom: '1px solid var(--secondary-color)', paddingBottom: '0.5rem' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}><strong>{cognitiveGames.find(g => g.id === res.gameId)?.title || "Game"}</strong></p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.1rem' }}>Score: {res.score}</span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--nav-text)' }}>{res.completedAt || (res.date ? `${res.date} • Time not recorded` : "Time not recorded")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '1.2rem' }}>No recent games played.</p>
          )}
        </div>

      </div>
    </div>
  );
}

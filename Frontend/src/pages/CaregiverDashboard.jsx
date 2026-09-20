import React, { useState, useEffect } from 'react';
import { caregiverApi } from '../api/caregiver.api';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { Users, TrendingUp, Bell, Activity, Brain, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CaregiverDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('PAT001');
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCaregiverData() {
      setLoading(true);
      setError(null);
      try {
        const patientsRes = await caregiverApi.getPatients();
        setPatients(patientsRes.patients || []);

        if (patientsRes.patients?.length > 0) {
          const firstId = patientsRes.patients[0].id;
          setSelectedPatientId(firstId);
          const trendsRes = await caregiverApi.getTrends(firstId);
          setTrends(trendsRes.metrics);
        }
      } catch (err) {
        setError(err.message || 'Failed to load caregiver data.');
      } finally {
        setLoading(false);
      }
    }
    loadCaregiverData();
  }, []);

  const handleSelectPatient = async (id) => {
    setSelectedPatientId(id);
    try {
      const res = await caregiverApi.getTrends(id);
      setTrends(res.metrics);
    } catch (err) {
      console.warn('Failed to load patient trends:', err);
    }
  };

  if (loading) return <LoadingState message="Loading Caregiver Dashboard..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={() => window.location.reload()} />;

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>
          Caregiver Companion Dashboard
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--nav-text)', margin: 0 }}>
          Monitor cognitive engagement, routine adherence, and memory assistance
        </p>
      </div>

      {/* Patient Selector */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '2rem' }}>
        {patients.map(p => (
          <button
            key={p.id}
            onClick={() => handleSelectPatient(p.id)}
            style={{
              padding: '1rem 1.4rem',
              borderRadius: '16px',
              border: selectedPatientId === p.id ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
              backgroundColor: selectedPatientId === p.id ? 'var(--secondary-color)' : '#ffffff',
              color: 'var(--text-color)',
              textAlign: 'left',
              cursor: 'pointer',
              minWidth: '200px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Users size={18} color="var(--primary-color)" />
              <strong style={{ fontSize: '1.1rem' }}>{p.name}</strong>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--nav-text)' }}>
              Age {p.age} • Patient ID: {p.id}
            </div>
          </button>
        ))}
      </div>

      {/* Metric Cards - Non-Medical Terminology */}
      {trends && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-color)', marginBottom: '0.6rem' }}>
              <Activity size={22} />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Cognitive Activity</h3>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.3rem 0', color: 'var(--text-color)' }}>
              {trends.cognitiveActivity}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: 0 }}>
              {trends.activityChange}
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#2b6cb0', marginBottom: '0.6rem' }}>
              <TrendingUp size={22} />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Performance Trend</h3>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.3rem 0', color: '#2f855a' }}>
              {trends.performanceTrend}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: 0 }}>
              {trends.recentPerformance}
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--card-bg, #ffffff)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#d69e2e', marginBottom: '0.6rem' }}>
              <Bell size={22} />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Daily Engagement</h3>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.3rem 0', color: 'var(--text-color)' }}>
              {activePatient?.adherenceRate || 90}%
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: 0 }}>
              Reminders and activities completed
            </p>
          </div>
        </div>
      )}

      {/* Quick Navigation Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link
          to="/memory"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: '#faf5ff',
            border: '2px solid #e9d8fd',
            borderRadius: '16px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{ padding: '1rem', backgroundColor: '#805ad5', borderRadius: '12px', color: '#ffffff' }}>
            <Brain size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0', color: '#44337a' }}>Manage Memory Vault</h4>
            <p style={{ fontSize: '0.95rem', margin: 0, color: '#6b46c1' }}>Add photos & verify recall milestones</p>
          </div>
        </Link>

        <Link
          to="/reminders"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: '#ebf8ff',
            border: '2px solid #bee3f8',
            borderRadius: '16px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-color)', borderRadius: '12px', color: '#ffffff' }}>
            <Heart size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem 0', color: '#2b6cb0' }}>Medication & Reminders</h4>
            <p style={{ fontSize: '0.95rem', margin: 0, color: '#3182ce' }}>Set reminders for daily routines</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

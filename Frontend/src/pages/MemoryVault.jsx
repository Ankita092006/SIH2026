import React, { useState, useEffect } from 'react';
import { memoryApi } from '../api/memory.api';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { Sparkles, Plus, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function MemoryVault() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activityFeedback, setActivityFeedback] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New memory form
  const [newTitle, setNewTitle] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchMemories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memoryApi.getMemories();
      setMemories(res.memories || []);
    } catch (err) {
      setError(err.message || 'Failed to load personal memories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleStartRecallActivity = async () => {
    try {
      const res = await memoryApi.generateRecallActivity();
      if (res.success && res.activity) {
        setActiveActivity(res.activity);
        setSelectedOption(null);
        setActivityFeedback(null);
      }
    } catch (err) {
      alert('Unable to generate recall activity at this time.');
    }
  };

  const handleAnswerActivity = (option) => {
    if (!activeActivity || activityFeedback) return;
    setSelectedOption(option);
    const isCorrect = option === activeActivity.answer;
    setActivityFeedback(isCorrect ? 'correct' : 'incorrect');
  };

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    try {
      const res = await memoryApi.createMemory({
        title: newTitle,
        person: newPerson,
        relationship: newRelationship,
        location: newLocation,
        description: newDesc,
        image_url: '/ner_senior_avatar.png'
      });
      if (res.success && res.memory) {
        setMemories(prev => [res.memory, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        setNewPerson('');
        setNewRelationship('');
        setNewLocation('');
        setNewDesc('');
      }
    } catch (err) {
      alert('Failed to save memory.');
    }
  };

  if (loading) return <LoadingState message="Loading your personal memory vault..." />;
  if (error) return <ErrorState title="Memory Vault Error" message={error} onRetry={fetchMemories} />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>
            Personal Memory Vault
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--nav-text)', margin: 0 }}>
            Cherished family moments and personalized memory recall activities
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={handleStartRecallActivity}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.4rem',
              backgroundColor: '#805ad5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={20} />
            Practice Recall
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.4rem',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <Plus size={20} />
            Add Memory
          </button>
        </div>
      </div>

      {/* Interactive Recall Activity Card */}
      {activeActivity && (
        <div
          style={{
            backgroundColor: '#faf5ff',
            border: '2px solid #d6bcfa',
            borderRadius: '16px',
            padding: '1.8rem',
            marginBottom: '2.5rem',
            boxShadow: '0 4px 12px rgba(128,90,213,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ backgroundColor: '#805ad5', color: '#ffffff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Memory Recall Exercise
            </span>
            <button
              onClick={() => setActiveActivity(null)}
              style={{ background: 'none', border: 'none', color: '#6b46c1', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>

          <h3 style={{ fontSize: '1.4rem', color: '#44337a', margin: '0 0 1.2rem 0' }}>
            {activeActivity.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {activeActivity.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === activeActivity.answer;
              let bg = '#ffffff';
              let border = '2px solid #e2e8f0';

              if (activityFeedback) {
                if (isCorrectAnswer) {
                  bg = '#c6f6d5';
                  border = '2px solid #38a169';
                } else if (isSelected) {
                  bg = '#fed7d7';
                  border = '2px solid #e53e3e';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerActivity(opt)}
                  disabled={!!activityFeedback}
                  style={{
                    padding: '1.2rem 1rem',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    backgroundColor: bg,
                    border,
                    borderRadius: '12px',
                    cursor: activityFeedback ? 'default' : 'pointer',
                    color: 'var(--text-color)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {activityFeedback && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: activityFeedback === 'correct' ? '#2f855a' : '#c53030' }}>
                {activityFeedback === 'correct' ? 'Wonderful! You remembered correctly.' : `Good effort! That was ${activeActivity.answer}.`}
              </p>
              <button
                onClick={handleStartRecallActivity}
                style={{ marginTop: '0.5rem', padding: '0.6rem 1.4rem', backgroundColor: '#805ad5', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Next Memory Question
              </button>
            </div>
          )}
        </div>
      )}

      {/* Memory Gallery */}
      {memories.length === 0 ? (
        <EmptyState
          title="No Memories Saved"
          message="Your family or caregiver can upload photos and stories to build your personalized memory vault."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {memories.map((m) => (
            <div
              key={m.memory_id}
              style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ height: '180px', backgroundColor: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={m.image_url || '/ner_senior_avatar.png'}
                  alt={m.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'uppercase' }}>
                    {m.relationship || m.memory_type}
                  </span>
                  {m.caregiver_verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#38a169', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <CheckCircle2 size={14} /> Verified
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--nav-text)', margin: '0 0 0.8rem 0', lineHeight: 1.4 }}>
                  {m.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.85rem', color: '#718096' }}>
                  {m.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {m.location}
                    </span>
                  )}
                  {m.date && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {m.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0' }}>
              Add Personal Memory
            </h2>
            <form onSubmit={handleCreateMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Title (e.g. Maya's Wedding)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
              />
              <input
                type="text"
                placeholder="Person in memory (e.g. Maya Barua)"
                value={newPerson}
                onChange={e => setNewPerson(e.target.value)}
                required
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Sister, Daughter)"
                value={newRelationship}
                onChange={e => setNewRelationship(e.target.value)}
                required
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
              />
              <input
                type="text"
                placeholder="Location (e.g. Jorhat, Assam)"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
              />
              <textarea
                placeholder="Brief description or happy story..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.8rem 1.4rem', border: '1px solid #cbd5e0', borderRadius: '8px', backgroundColor: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.8rem 1.6rem', backgroundColor: 'var(--primary-color)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

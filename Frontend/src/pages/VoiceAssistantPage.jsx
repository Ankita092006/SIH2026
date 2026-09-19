import React, { useState } from 'react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useLanguage } from '../context/LanguageContext';
import { Mic, MicOff, Volume2, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

export default function VoiceAssistantPage() {
  const {
    voiceState,
    transcription,
    lastResponse,
    lastIntent,
    processCommand,
    resetVoiceState
  } = useVoiceAssistant();

  const [simulatedText, setSimulatedText] = useState('');
  const { t } = useLanguage();

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    if (simulatedText.trim()) {
      processCommand(simulatedText.trim());
      setSimulatedText('');
    }
  };

  const sampleCommands = [
    { label: '"Start memory game"', phrase: "Start memory game", type: "allowed" },
    { label: '"Show reminders"', phrase: "Show reminders", type: "allowed" },
    { label: '"Go home"', phrase: "Go home", type: "allowed" },
    { label: '"Help"', phrase: "Help", type: "allowed" },
    { label: '"Stop game"', phrase: "Stop game", type: "allowed" },
    { label: '"Change language"', phrase: "Change language", type: "allowed" },
    { label: '"Call my son" (Rejected <0.47)', phrase: "Call my son", type: "rejected" },
    { label: '"Buy groceries" (Rejected <0.47)', phrase: "Buy groceries online", type: "rejected" }
  ];

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.4rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
        Voice Assistant
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', marginBottom: '2.5rem' }}>
        Speak naturally in English or Assamese to navigate and control your activities
      </p>

      {/* Main Microphone Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => processCommand("Start memory game")}
          disabled={voiceState === 'PROCESSING'}
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            backgroundColor: voiceState === 'PROCESSING' ? '#ed8936' : voiceState === 'LISTENING' ? '#e53e3e' : 'var(--primary-color)',
            color: '#ffffff',
            border: '8px solid rgba(43, 108, 176, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}
          aria-label="Tap to speak"
        >
          <Mic size={56} />
        </button>
      </div>

      {/* Dynamic Status Text */}
      <div style={{ minHeight: '80px', marginBottom: '2rem' }}>
        {voiceState === 'IDLE' && (
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
            Tap the microphone to speak
          </p>
        )}
        {voiceState === 'LISTENING' && (
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#c53030' }}>
            I'm listening...
          </p>
        )}
        {voiceState === 'PROCESSING' && (
          <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#dd6b20' }}>
            Understanding your request...
          </p>
        )}
        {voiceState === 'SUCCESS' && (
          <div>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2f855a' }}>
              ✓ {lastResponse}
            </p>
            {transcription && <p style={{ fontSize: '1rem', color: '#718096' }}>Heard: "{transcription}"</p>}
          </div>
        )}
        {voiceState === 'REJECTED' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#c53030' }}>
              {lastResponse}
            </p>
            <p style={{ fontSize: '0.95rem', color: '#a0aec0' }}>
              (Safety Filter: Unrecognized command or confidence below safety threshold)
            </p>
          </div>
        )}
        {voiceState === 'ERROR' && (
          <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#c53030' }}>
            Voice assistance is temporarily unavailable.
          </p>
        )}
      </div>

      {/* Simulated Speech Tester (for environments without mic permission) */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '2rem'
        }}
      >
        <h3 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary-color)" />
          Simulate Voice Command (SraVaani & MiniLM Intent Pipeline)
        </h3>

        <form onSubmit={handleSimulatedSubmit} style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <input
            type="text"
            placeholder="Type a voice command (e.g. 'Start memory game' or 'Call someone')..."
            value={simulatedText}
            onChange={(e) => setSimulatedText(e.target.value)}
            style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem' }}
          />
          <button
            type="submit"
            style={{ padding: '0.8rem 1.4rem', backgroundColor: 'var(--primary-color)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Send
          </button>
        </form>

        <div>
          <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--nav-text)', marginBottom: '0.6rem' }}>
            Quick Test Examples:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sampleCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => processCommand(cmd.phrase)}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '20px',
                  border: cmd.type === 'allowed' ? '1px solid #9ae6b4' : '1px solid #feb2b2',
                  backgroundColor: cmd.type === 'allowed' ? '#f0fff4' : '#fff5f5',
                  color: cmd.type === 'allowed' ? '#22543d' : '#822727',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { voiceApi, ALLOWED_VOICE_ACTIONS } from '../api/voice.api';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook to manage Voice Assistant states and dispatch allow-listed actions safely
 * States: IDLE, LISTENING, PROCESSING, SUCCESS, REJECTED, ERROR
 */
export function useVoiceAssistant() {
  const [voiceState, setVoiceState] = useState('IDLE');
  const [transcription, setTranscription] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [lastIntent, setLastIntent] = useState(null);
  const navigate = useNavigate();
  const { setLanguage, language } = useLanguage();

  /**
   * Execute allowed action securely from allow-list
   */
  const executeAllowedAction = useCallback((action) => {
    switch (action) {
      case 'start_memory_game':
        navigate('/games/memory-match/play');
        break;
      case 'start_attention_game':
        navigate('/games/attention-test/play');
        break;
      case 'start_recall_game':
        navigate('/games/number-recall/play');
        break;
      case 'stop_game':
        navigate('/games');
        break;
      case 'show_score':
      case 'show_history':
        navigate('/results');
        break;
      case 'show_reminders':
      case 'set_reminder':
        navigate('/reminders');
        break;
      case 'go_home':
        navigate('/home');
        break;
      case 'go_back':
        navigate(-1);
        break;
      case 'change_language':
        setLanguage(language === 'en' ? 'as' : 'en');
        break;
      case 'help':
        navigate('/games');
        break;
      default:
        console.warn(`[Voice Action] Action ${action} permitted by ML but not mapped to UI routing.`);
        break;
    }
  }, [navigate, setLanguage, language]);

  /**
   * Process speech transcript or simulated phrase
   */
  const processCommand = useCallback(async (phraseOrPayload) => {
    setVoiceState('PROCESSING');
    try {
      const payload = typeof phraseOrPayload === 'string'
        ? { simulatedPhrase: phraseOrPayload }
        : phraseOrPayload;

      const result = await voiceApi.processVoice(payload);

      setTranscription(result.transcription || '');
      setLastResponse(result.response || '');
      setLastIntent(result.intent);

      if (result.allowed && result.action && ALLOWED_VOICE_ACTIONS.includes(result.action)) {
        setVoiceState('SUCCESS');
        executeAllowedAction(result.action);
        return result;
      }

      // Rejection: intent was UNKNOWN or below 0.47 threshold
      setVoiceState('REJECTED');
      return result;
    } catch (err) {
      setVoiceState('ERROR');
      setLastResponse('Voice assistance is temporarily unavailable.');
      return { allowed: false, error: err.message };
    }
  }, [executeAllowedAction]);

  const resetVoiceState = useCallback(() => {
    setVoiceState('IDLE');
    setTranscription('');
    setLastResponse('');
    setLastIntent(null);
  }, []);

  return {
    voiceState,
    transcription,
    lastResponse,
    lastIntent,
    setVoiceState,
    processCommand,
    resetVoiceState
  };
}

export default useVoiceAssistant;

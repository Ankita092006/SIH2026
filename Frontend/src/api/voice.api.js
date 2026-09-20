/**
 * Voice Assistant API Service
 * Conforms to SraVaani 1.0 ASR + paraphrase-multilingual-MiniLM-L12-v2 Intent Classification.
 * Employs strict 0.47 cosine similarity threshold and explicit allow-list.
 */

import { apiClient } from './client';
import { SAFE_VOICE_ACTIONS } from './mockAdapter';

export const ALLOWED_VOICE_ACTIONS = Object.values(SAFE_VOICE_ACTIONS);

export const voiceApi = {
  /**
   * Process voice audio or simulated speech input
   * @param {Object} payload { audio, simulatedPhrase, simulateError }
   */
  async processVoice(payload = {}) {
    try {
      const response = await apiClient('/api/voice/process', {
        method: 'POST',
        body: payload
      });

      // Strict client-side validation guard:
      // 1. Verify similarity >= 0.47 threshold
      const similarity = Number(response.similarity || 0);
      if (similarity < 0.47 || response.intent === 'UNKNOWN') {
        return {
          transcription: response.transcription || '',
          intent: 'UNKNOWN',
          similarity,
          action: null,
          allowed: false,
          response: "I didn't understand that command."
        };
      }

      // 2. Verify that action exists in explicit ALLOWED_ACTIONS registry
      const action = response.action;
      const isAllowed = ALLOWED_VOICE_ACTIONS.includes(action);

      if (!isAllowed) {
        console.warn(`[Voice Security] Disallowed action rejected: ${action}`);
        return {
          transcription: response.transcription,
          intent: 'UNKNOWN',
          similarity,
          action: null,
          allowed: false,
          response: "That action is not permitted."
        };
      }

      return {
        transcription: response.transcription,
        intent: response.intent,
        similarity,
        action,
        allowed: true,
        response: response.response || 'Executing requested action.'
      };
    } catch (err) {
      console.warn('[Voice API] Gateway error:', err.message);
      return {
        transcription: '',
        intent: 'ERROR',
        similarity: 0,
        action: null,
        allowed: false,
        response: 'Voice assistance is temporarily unavailable.'
      };
    }
  }
};

export default voiceApi;

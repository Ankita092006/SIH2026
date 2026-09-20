import { describe, it, expect, vi } from 'vitest';
import { voiceApi, ALLOWED_VOICE_ACTIONS } from '../api/voice.api';
import * as clientModule from '../api/client';

describe('System B: Voice Assistant Security, Threshold & Safe Action Registry', () => {
  it('allows safe voice command from registry with high similarity (>=0.47)', async () => {
    const result = await voiceApi.processVoice({
      simulatedPhrase: 'Start memory game'
    });

    expect(result.allowed).toBe(true);
    expect(result.intent).toBe('START_MEMORY_GAME');
    expect(result.action).toBe('start_memory_game');
    expect(ALLOWED_VOICE_ACTIONS).toContain(result.action);
    expect(result.similarity).toBeGreaterThanOrEqual(0.47);
  });

  it('rejects unknown or unsupported voice commands (< 0.47 safety threshold)', async () => {
    const result = await voiceApi.processVoice({
      simulatedPhrase: 'Call my son now'
    });

    expect(result.allowed).toBe(false);
    expect(result.action).toBeNull();
    expect(result.intent).toBe('UNKNOWN');
    expect(result.response).toContain("didn't understand");
  });

  it('rejects an action that is not in the explicit allow-list even if returned by backend', async () => {
    // Simulate compromised or rogue backend returning an unpermitted action
    vi.spyOn(clientModule, 'apiClient').mockResolvedValueOnce({
      success: true,
      transcription: 'Delete all records',
      intent: 'DELETE_DATABASE',
      similarity: 0.95,
      action: 'delete_database',
      allowed: true
    });

    const result = await voiceApi.processVoice({ simulatedPhrase: 'Delete all records' });
    expect(result.allowed).toBe(false);
    expect(result.action).toBeNull();
    expect(result.response).toContain('not permitted');
    vi.restoreAllMocks();
  });

  it('handles voice API 503 gateway outage gracefully without crash', async () => {
    const result = await voiceApi.processVoice({
      simulateError: true
    });

    expect(result.allowed).toBe(false);
    expect(result.intent).toBe('ERROR');
    expect(result.response).toBe('Voice assistance is temporarily unavailable.');
  });
});

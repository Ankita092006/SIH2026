import { describe, it, expect } from 'vitest';
import { memoryApi } from '../api/memory.api';

describe('System C: Personal Memory Vault & Recall Activity Generator', () => {
  it('retrieves caregiver-verified memories matching memory_schema.py', async () => {
    const res = await memoryApi.getMemories();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.memories)).toBe(true);
    expect(res.memories.length).toBeGreaterThan(0);

    const first = res.memories[0];
    expect(first.memory_id).toBeDefined();
    expect(first.person).toBeDefined();
    expect(first.relationship).toBeDefined();
    expect(first.caregiver_verified).toBe(true);
  });

  it('successfully creates a new memory record', async () => {
    const newRecord = {
      title: 'Majuli Island Trip',
      person: 'Rina Barua',
      relationship: 'Daughter',
      location: 'Majuli, Assam',
      description: 'Traditional pottery workshop visit.',
      tags: ['majuli', 'family', 'pottery']
    };

    const res = await memoryApi.createMemory(newRecord);
    expect(res.success).toBe(true);
    expect(res.memory.title).toBe('Majuli Island Trip');
    expect(res.memory.caregiver_verified).toBe(true);
  });

  it('generates an interactive recall activity from memory records', async () => {
    const res = await memoryApi.generateRecallActivity('PAT001');
    expect(res.success).toBe(true);
    expect(res.activity).toBeDefined();
    expect(res.activity.question).toBeDefined();
    expect(res.activity.answer).toBeDefined();
    expect(Array.isArray(res.activity.options)).toBe(true);
    expect(res.activity.options).toContain(res.activity.answer);
  });
});

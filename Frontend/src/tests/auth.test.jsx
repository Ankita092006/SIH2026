import { describe, it, expect } from 'vitest';
import { authApi } from '../api/auth.api';

describe('Authentication API & Token Management', () => {
  it('successfully logs in with valid patient credentials', async () => {
    const res = await authApi.login('bhaben@eldercare.in', 'password123');
    expect(res.success).toBe(true);
    expect(res.token).toBeDefined();
    expect(res.user.email).toBe('bhaben@eldercare.in');
    expect(res.user.role).toBe('patient');
  });

  it('rejects registration if password is shorter than 6 characters', async () => {
    await expect(authApi.register({
      name: 'Test Patient',
      email: 'test@example.com',
      password: '123',
      role: 'patient'
    })).rejects.toThrow(/at least 6 characters/i);
  });

  it('successfully registers new user with caregiver role', async () => {
    const res = await authApi.register({
      name: 'Dr. Jonali Phukan',
      email: `caregiver_${Date.now()}@eldercare.in`,
      password: 'password123',
      role: 'caregiver'
    });

    expect(res.success).toBe(true);
    expect(res.user.role).toBe('caregiver');
    expect(res.token).toBeDefined();
  });

  it('successfully logs out', async () => {
    const res = await authApi.logout();
    expect(res.success).toBe(true);
  });
});

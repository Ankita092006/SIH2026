import { getStorage, setStorage } from './storage';

const PATIENT_KEY = 'sih_patient_profile';
const SETTINGS_KEY = 'sih_patient_settings';

const MOCK_PATIENT = {
  id: 'PAT001',
  name: 'Rajiv Sharma',
  age: 72,
  avatar: '/ner_senior_avatar.png',
  medicalNotes: [
    'Mild cognitive impairment observed',
    'Needs frequent reminders for daily medication',
    'Enjoys visual pattern games'
  ]
};

export const getPatientProfile = () => {
  return getStorage(PATIENT_KEY, MOCK_PATIENT);
};

export const updatePatientProfile = (updates) => {
  const current = getPatientProfile();
  setStorage(PATIENT_KEY, { ...current, ...updates });
};

export const getAccessibilitySettings = () => {
  return getStorage(SETTINGS_KEY, {
    textSize: 'normal',
    highContrast: false,
    reduceMotion: false,
    soundEnabled: false
  });
};

export const updateAccessibilitySettings = (updates) => {
  const current = getAccessibilitySettings();
  setStorage(SETTINGS_KEY, { ...current, ...updates });
};

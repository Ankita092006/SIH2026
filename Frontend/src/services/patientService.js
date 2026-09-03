import { getStorage, setStorage } from './storage';

const PATIENT_KEY = 'sih_patient_profile';
const SETTINGS_KEY = 'sih_patient_settings';

export const getPatientProfile = () => {
  return getStorage(PATIENT_KEY, {
    id: "PT-8472",
    name: "Robert Smith",
    age: 72,
    avatar: "/senior_avatar.png",
    lastLogin: new Date().toISOString()
  });
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

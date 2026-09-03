import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessibilitySettings, updateAccessibilitySettings } from '../services/patientService';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  return useContext(AccessibilityContext);
};

export const AccessibilityProvider = ({ children }) => {
  const initialSettings = getAccessibilitySettings();
  const [textSize, setTextSize] = useState(initialSettings.textSize);
  const [highContrast, setHighContrast] = useState(initialSettings.highContrast);
  const [reduceMotion, setReduceMotion] = useState(initialSettings.reduceMotion);
  const [soundEnabled, setSoundEnabled] = useState(initialSettings.soundEnabled);

  useEffect(() => {
    document.documentElement.classList.remove('large-text', 'extra-large-text');
    if (textSize === 'large') {
      document.documentElement.classList.add('large-text');
    } else if (textSize === 'extra-large') {
      document.documentElement.classList.add('extra-large-text');
    }
    updateAccessibilitySettings({ textSize });
  }, [textSize]);

  useEffect(() => {
    if (highContrast) document.documentElement.classList.add('high-contrast');
    else document.documentElement.classList.remove('high-contrast');
    updateAccessibilitySettings({ highContrast });
  }, [highContrast]);

  useEffect(() => {
    if (reduceMotion) document.documentElement.classList.add('reduce-motion');
    else document.documentElement.classList.remove('reduce-motion');
    updateAccessibilitySettings({ reduceMotion });
  }, [reduceMotion]);

  useEffect(() => {
    updateAccessibilitySettings({ soundEnabled });
  }, [soundEnabled]);

  const value = {
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    soundEnabled,
    setSoundEnabled
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
      <label htmlFor="language-select" style={{ fontWeight: 'bold' }}>
        🌐 {t('profile.language')}:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--secondary-color)',
          fontSize: '1rem',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}
        aria-label={t('profile.language')}
      >
        <option value="en">English</option>
        <option value="as">অসমীয়া (Assamese)</option>
      </select>
    </div>
  );
}

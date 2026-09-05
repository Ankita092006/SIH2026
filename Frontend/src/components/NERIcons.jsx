import React from 'react';

// A house inspired by a traditional bamboo hut silhouette with a subtle woven line
export const NERHomeIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10L12 3l9 7" />
    <path d="M4 10v11h16V10" />
    <path d="M9 21v-6h6v6" />
    {/* Subtle bamboo/weave motif */}
    <path d="M4 14h16" opacity="0.3" strokeDasharray="2 2" />
    <path d="M4 17h16" opacity="0.3" strokeDasharray="2 2" />
  </svg>
);

// A game controller with a subtle geometric cross pattern
export const NERGameIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M6 12h4" />
    <path d="M8 10v4" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="18" cy="12" r="1" />
    {/* Subtle woven pattern on the body */}
    <path d="M12 6v12" opacity="0.3" strokeDasharray="2 2" />
    <path d="M6 16l12-8" opacity="0.2" />
  </svg>
);

// A friendly bell with a small textile diamond
export const NERBellIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    {/* Small geometric diamond pattern */}
    <polygon points="12 11 13 13 12 15 11 13" opacity="0.5" />
  </svg>
);

// A traditional respectful senior profile
export const NERProfileIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    {/* Subtle scarf/shawl fold */}
    <path d="M7 21v-3" opacity="0.5" />
    <path d="M17 21v-3" opacity="0.5" />
    <path d="M10 16l2 2 2-2" opacity="0.4" />
  </svg>
);

// A trophy with geometric tribal motif
export const NERTrophyIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 1.1-.9 2-2 2H16c-1.1 0-2-.9-2-2v-2.34" />
    <path d="M16 4H8a2 2 0 0 0-2 2v3a6 6 0 0 0 12 0V6a2 2 0 0 0-2-2z" />
    {/* Pattern on the cup */}
    <path d="M8 8l2 2 2-2 2 2 2-2" opacity="0.4" />
  </svg>
);

// Game-specific icons with subtle patterns
export const NERMemoryIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    <path d="M12 4.5v15" opacity="0.3" strokeDasharray="2 2" />
  </svg>
);

export const NERPatternIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" opacity="0.5" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" opacity="0.5" />
  </svg>
);

export const NERAttentionIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" opacity="0.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v2" opacity="0.3" />
    <path d="M12 20v2" opacity="0.3" />
    <path d="M2 12h2" opacity="0.3" />
    <path d="M20 12h2" opacity="0.3" />
  </svg>
);

export const NERRecallIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M8 7h6" opacity="0.5" />
    <path d="M8 11h8" opacity="0.5" />
    <path d="M8 15h4" opacity="0.5" />
  </svg>
);

// A history clock-arrow icon with subtle pattern
export const NERHistoryIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
    {/* Subtle dots representing time passing */}
    <circle cx="16" cy="7" r="1" opacity="0.3" fill="currentColor" stroke="none" />
    <circle cx="18" cy="10" r="1" opacity="0.3" fill="currentColor" stroke="none" />
  </svg>
);

// A simple utility to generate gentle feedback tones using Web Audio API
// This avoids needing external mp3 files and guarantees playback

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (frequency, type, duration, vol) => {
  try {
    initAudio();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Fade out to avoid clicks
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export const playCorrectSound = (isEnabled) => {
  if (!isEnabled) return;
  // Soft, pleasant high chime (sine wave)
  playTone(600, 'sine', 0.3, 0.1);
  setTimeout(() => playTone(800, 'sine', 0.4, 0.1), 100);
};

export const playIncorrectSound = (isEnabled) => {
  if (!isEnabled) return;
  // Low, muffled gentle boop (triangle wave)
  playTone(200, 'triangle', 0.4, 0.1);
};

export const playCompletionSound = (isEnabled) => {
  if (!isEnabled) return;
  // Gentle ascending chord
  playTone(400, 'sine', 0.5, 0.1);
  setTimeout(() => playTone(500, 'sine', 0.5, 0.1), 150);
  setTimeout(() => playTone(600, 'sine', 0.6, 0.1), 300);
};

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveGameResult } from '../services/gameService';
import { useAccessibility } from '../context/AccessibilityContext';
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '../utils/audioUtils';
// Removed RegionalIcons
import { RefreshCw } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

/* =========================================================================
   Memory Match
========================================================================= */
const SYMBOLS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🥑'];

function generateDeck() {
  const deck = [...SYMBOLS, ...SYMBOLS];
  return deck.sort(() => Math.random() - 0.5).map((symbol, id) => ({ id, symbol, isFlipped: false, isMatched: false }));
}

function MemoryMatch({ onComplete, soundEnabled }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [turns, setTurns] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => { setCards(generateDeck()); }, []);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      const timeTakenMs = Date.now() - startTime.current;
      const accuracy = turns > 0 ? Math.round((matches / turns) * 100) : 100;
      const avgResponseTime = turns > 0 ? (timeTakenMs / turns / 1000).toFixed(1) + 's' : '—';
      setTimeout(() => onComplete(Math.max(10, 100 - (turns * 2)), accuracy, `${Math.floor(timeTakenMs/1000)}s`, matches, turns - matches, avgResponseTime), 1000);
    }
  }, [cards, turns, matches, onComplete]);

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setTurns(t => t + 1);
      const [i1, i2] = newFlipped;
      if (newCards[i1].symbol === newCards[i2].symbol) {
        setMatches(m => m + 1);
        playCorrectSound(soundEnabled);
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[i1].isMatched = true; next[i2].isMatched = true;
            return next;
          });
          setFlippedIndices([]);
        }, 800);
      } else {
        playIncorrectSound(soundEnabled);
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[i1].isFlipped = false; next[i2].isFlipped = false;
            return next;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--bg-color)', border: '1px solid var(--secondary-color)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: '0 0 0.3rem 0' }}>Memory Match</h2>
          <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: 0 }}>Match identical pairs</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '1rem' }}>
            Attempts: {turns}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            Pairs found: {matches} of 6
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
        {cards.map((c, i) => (
          <button 
            key={c.id} 
            onClick={() => handleCardClick(i)} 
            style={{ 
              height: '110px', 
              margin: 0, 
              backgroundColor: c.isFlipped || c.isMatched ? 'white' : 'var(--primary-color)', 
              border: '2px solid ' + (c.isFlipped || c.isMatched ? 'var(--secondary-color)' : 'var(--primary-color)'),
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              opacity: c.isMatched ? 0.7 : 1,
              transform: c.isFlipped || c.isMatched ? 'scale(1.02)' : 'scale(1)',
              boxShadow: c.isFlipped || c.isMatched ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
              cursor: c.isMatched ? 'default' : 'pointer'
            }}
            aria-label={`Card ${i}`}
          >
            <div style={{ transition: 'opacity 0.3s ease', opacity: c.isFlipped || c.isMatched ? 1 : 0, display: 'flex', fontSize: '4rem' }}>
              {(c.isFlipped || c.isMatched) ? c.symbol : null}
            </div>
          </button>
        ))}
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => { 
            if (turns === 0) {
              setCards(generateDeck());
              setFlippedIndices([]);
              setTurns(0);
              setMatches(0);
              startTime.current = Date.now();
            } else {
              setIsRestartModalOpen(true);
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(39, 103, 73, 0.1)', border: 'none', color: 'var(--primary-color)', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <RefreshCw size={18} />
          Restart Game
        </button>
      </div>

      <ConfirmModal 
        isOpen={isRestartModalOpen} 
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => {
          setCards(generateDeck());
          setFlippedIndices([]);
          setTurns(0);
          setMatches(0);
          startTime.current = Date.now();
        }}
        title="Restart this activity?"
        message="Your current progress will be lost."
        confirmText="Restart Game"
        cancelText="Keep Playing"
      />
    </div>
  );
}

/* =========================================================================
   Number Recall
========================================================================= */
function NumberRecall({ onComplete, soundEnabled, triggerFeedback }) {
  const [round, setRound] = useState(1);
  const [number, setNumber] = useState('');
  const [showNumber, setShowNumber] = useState(true);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const startTime = useRef(Date.now());
  const maxRounds = 5;

  const generateNumber = (length) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  };

  const startRound = () => {
    setNumber(generateNumber(2 + round)); // Starts at 3 digits, grows to 7
    setShowNumber(true);
    setInput('');
    setTimeout(() => setShowNumber(false), 3000 + (round * 500)); 
  };

  useEffect(() => {
    startRound();
  }, [round]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isCorrect = input === number;
    if (isCorrect) {
      setCorrect(c => c + 1);
      triggerFeedback(true);
    } else {
      triggerFeedback(false);
    }

    if (round < maxRounds) {
      setTimeout(() => setRound(r => r + 1), 1000); // Increased delay slightly to show feedback
    } else {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      const timeTakenMs = Date.now() - startTime.current;
      const accuracy = Math.round((finalCorrect / maxRounds) * 100);
      const avgResponseTime = (timeTakenMs / maxRounds / 1000).toFixed(1) + 's';
      setTimeout(() => onComplete(accuracy, accuracy, `${Math.floor(timeTakenMs/1000)}s`, finalCorrect, maxRounds - finalCorrect, avgResponseTime), 1000);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--nav-text)' }}>Round {round} of {maxRounds}</h2>
      {showNumber ? (
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Memorize this number:</h2>
          <h1 style={{ fontSize: '4rem', letterSpacing: '0.5rem', color: 'var(--primary-color)' }}>{number}</h1>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <label style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>What was the number?</label>
          <input type="number" value={input} onChange={e => setInput(e.target.value)} required autoFocus style={{ fontSize: '2rem', padding: '1rem', width: 'min(100%, 250px)', textAlign: 'center', borderRadius: '8px', border: '2px solid var(--secondary-color)' }} />
          <button type="submit" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }}>Submit</button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={() => { 
            if (round === 1 && showNumber && input === '') {
              setRound(1);
              setCorrect(0);
              startTime.current = Date.now();
              setNumber(generateNumber(3));
              setShowNumber(true);
              setInput('');
              setTimeout(() => setShowNumber(false), 3500);
            } else {
              setIsRestartModalOpen(true);
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(39, 103, 73, 0.1)', border: 'none', color: 'var(--primary-color)', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <RefreshCw size={18} />
          Restart Game
        </button>
      </div>

      <ConfirmModal 
        isOpen={isRestartModalOpen} 
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => {
          setRound(1);
          setCorrect(0);
          startTime.current = Date.now();
          setNumber(generateNumber(3));
          setShowNumber(true);
          setInput('');
          setTimeout(() => setShowNumber(false), 3500);
        }}
        title="Restart this activity?"
        message="Your current progress will be lost."
        confirmText="Restart Game"
        cancelText="Keep Playing"
      />
    </div>
  );
}

/* =========================================================================
   Word Recall
========================================================================= */
const WORDS = ["APPLE", "HOUSE", "CHAIR", "WATER", "BREAD", "RIVER", "STONE", "CLOUD", "TABLE", "GRASS", "TRAIN", "SMILE"];
function WordRecall({ onComplete, soundEnabled, triggerFeedback }) {
  const [targetWords, setTargetWords] = useState([]);
  const [options, setOptions] = useState([]);
  const [showWords, setShowWords] = useState(true);
  const [selected, setSelected] = useState([]);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  const startRound = () => {
    const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
    const targets = shuffled.slice(0, 3);
    setTargetWords(targets);
    
    const distractorPool = WORDS.filter(w => !targets.includes(w)).sort(() => 0.5 - Math.random());
    const fullOptions = [...targets, ...distractorPool.slice(0, 6)].sort(() => 0.5 - Math.random());
    setOptions(fullOptions);
    
    setShowWords(true);
    setSelected([]);
    startTime.current = Date.now();
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowWords(false), 5000);
  };

  useEffect(() => {
    startRound();
    return () => clearTimeout(timerRef.current);
  }, []);

  const toggleWord = (word) => {
    if (selected.includes(word)) setSelected(selected.filter(w => w !== word));
    else if (selected.length < 3) setSelected([...selected, word]);
  };

  const handleSubmit = () => {
    const correctCount = selected.filter(w => targetWords.includes(w)).length;
    if (correctCount === 3) triggerFeedback(true);
    else triggerFeedback(false);

    const timeTakenMs = Date.now() - startTime.current;
    const accuracy = Math.round((correctCount / 3) * 100);
    const avgResponseTime = (timeTakenMs / 1 / 1000).toFixed(1) + 's';
    setTimeout(() => onComplete(accuracy, accuracy, `${Math.floor(timeTakenMs/1000)}s`, correctCount, 3 - correctCount, avgResponseTime), 1000);
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
      {showWords ? (
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Memorize these 3 words:</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '3rem 0' }}>
            {targetWords.map(w => <h1 key={w} style={{ color: 'var(--primary-color)', margin: 0, fontSize: '3rem' }}>{w}</h1>)}
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Select the 3 words you saw:</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', marginBottom: '2rem' }}>You have selected {selected.length} of 3</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
            {options.map(w => (
              <button 
                key={w} 
                onClick={() => toggleWord(w)}
                style={{ 
                  backgroundColor: selected.includes(w) ? 'var(--primary-color)' : 'white', 
                  color: selected.includes(w) ? 'white' : 'var(--text-color)', 
                  border: '2px solid var(--primary-color)',
                  fontSize: '1.2rem',
                  padding: '1rem',
                  margin: 0
                }}
              >
                {w}
              </button>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={selected.length !== 3} style={{ width: '100%', fontSize: '1.5rem', padding: '1rem' }}>Submit Answers</button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={() => { 
            if (showWords && selected.length === 0) {
              startRound();
            } else {
              setIsRestartModalOpen(true);
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(39, 103, 73, 0.1)', border: 'none', color: 'var(--primary-color)', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <RefreshCw size={18} />
          Restart Game
        </button>
      </div>

      <ConfirmModal 
        isOpen={isRestartModalOpen} 
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => {
          startRound();
        }}
        title="Restart this activity?"
        message="Your current progress will be lost."
        confirmText="Restart Game"
        cancelText="Keep Playing"
      />
    </div>
  );
}

/* =========================================================================
   Pattern Recognition
========================================================================= */
function PatternRecall({ onComplete, soundEnabled, triggerFeedback }) {
  const [round, setRound] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const startTime = useRef(Date.now());
  const maxRounds = 4;

  const SHAPES = ['●', '▲', '■', '★'];

  const generatePattern = () => {
    const s1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let s2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    while(s2 === s1) s2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    
    const seq = [s1, s2, s1, s2, s1];
    const answer = s2;
    
    setPattern(seq);
    
    const opts = [answer];
    while(opts.length < 3) {
      const rnd = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if(!opts.includes(rnd)) opts.push(rnd);
    }
    setOptions(opts.sort(() => 0.5 - Math.random()));
  };

  useEffect(() => {
    generatePattern();
  }, [round]);

  const handleSelection = (selectedShape) => {
    const answer = pattern[1]; 
    const isCorrect = selectedShape === answer;
    
    if (isCorrect) {
      setCorrect(c => c + 1);
      triggerFeedback(true);
    } else {
      triggerFeedback(false);
    }

    if (round < maxRounds) {
      setTimeout(() => setRound(r => r + 1), 1000);
    } else {
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      const timeTakenMs = Date.now() - startTime.current;
      const accuracy = Math.round((finalCorrect / maxRounds) * 100);
      const avgResponseTime = (timeTakenMs / maxRounds / 1000).toFixed(1) + 's';
      setTimeout(() => onComplete(accuracy, accuracy, `${Math.floor(timeTakenMs/1000)}s`, finalCorrect, maxRounds - finalCorrect, avgResponseTime), 1000);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--nav-text)' }}>Round {round} of {maxRounds}</h2>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>What comes next in the pattern?</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '3rem', marginBottom: '3rem', color: 'var(--primary-color)' }}>
        {pattern.map((p, i) => <span key={i}>{p}</span>)}
        <span>?</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleSelection(opt)} style={{ fontSize: '3rem', padding: '1rem 2rem', backgroundColor: 'white', color: 'var(--text-color)', border: '2px solid var(--secondary-color)' }}>
            {opt}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button 
          onClick={() => { 
            if (round === 1) {
              setRound(1);
              setCorrect(0);
              startTime.current = Date.now();
              generatePattern();
            } else {
              setIsRestartModalOpen(true);
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(39, 103, 73, 0.1)', border: 'none', color: 'var(--primary-color)', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <RefreshCw size={18} />
          Restart Game
        </button>
      </div>

      <ConfirmModal 
        isOpen={isRestartModalOpen} 
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => {
          setRound(1);
          setCorrect(0);
          startTime.current = Date.now();
          generatePattern();
        }}
        title="Restart this activity?"
        message="Your current progress will be lost."
        confirmText="Restart Game"
        cancelText="Keep Playing"
      />
    </div>
  );
}

/* =========================================================================
   Attention Test
========================================================================= */
function AttentionTest({ onComplete, soundEnabled, triggerFeedback }) {
  const [round, setRound] = useState(0);
  const [currentObject, setCurrentObject] = useState(null);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [incorrectTaps, setIncorrectTaps] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, finished
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const startTime = useRef(Date.now());
  const maxObjects = 10;
  
  const TARGET = "🔵";
  const DISTRACTORS = ["🔴", "🟩", "⭐", "🍎"];

  const [sequence, setSequence] = useState(() => {
    const seq = Array(4).fill(TARGET).concat(Array(6).fill(null).map(() => DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]));
    return seq.sort(() => 0.5 - Math.random());
  });

  const restart = () => {
    setRound(0);
    setCurrentObject(null);
    setCorrectTaps(0);
    setIncorrectTaps(0);
    setGameState('playing');
    startTime.current = Date.now();
    const newSeq = Array(4).fill(TARGET).concat(Array(6).fill(null).map(() => DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]));
    setSequence(newSeq.sort(() => 0.5 - Math.random()));
  };

  useEffect(() => {
    if (round >= maxObjects) {
      setGameState('finished');
      return;
    }

    setCurrentObject(sequence[round]);
    const timer = setTimeout(() => {
      setRound(r => r + 1);
    }, 1500); 

    return () => clearTimeout(timer);
  }, [round, sequence]);

  useEffect(() => {
    if (gameState === 'finished') {
      const timeTakenMs = Date.now() - startTime.current;
      const missed = 4 - correctTaps; 
      const accuracy = Math.max(0, Math.round(((4 - incorrectTaps - missed) / 4) * 100));
      const totalTaps = correctTaps + incorrectTaps;
      const avgResponseTime = totalTaps > 0 ? (timeTakenMs / totalTaps / 1000).toFixed(1) + 's' : '—';
      setTimeout(() => onComplete(Math.max(0, accuracy), accuracy, `${Math.floor(timeTakenMs/1000)}s`, correctTaps, incorrectTaps + missed, avgResponseTime), 1000);
    }
  }, [gameState, correctTaps, incorrectTaps, onComplete]);

  const handleTap = () => {
    if (!currentObject) return;
    if (currentObject === TARGET) {
      setCorrectTaps(c => c + 1);
      triggerFeedback(true);
    } else {
      setIncorrectTaps(i => i + 1);
      triggerFeedback(false);
    }
    setCurrentObject(null); 
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Attention Test</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Tap the button <strong>ONLY</strong> when you see the <strong>BLUE CIRCLE (🔵)</strong>.</p>
      </div>

      <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {currentObject && gameState === 'playing' ? (
          <span style={{ fontSize: '6rem', animation: 'fadeIn 0.2s' }}>{currentObject}</span>
        ) : null}
      </div>

      <button onClick={handleTap} disabled={gameState === 'finished' || !currentObject} style={{ fontSize: '1.5rem', padding: '1.5rem', marginTop: '2rem' }}>
        TAP HERE
      </button>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          onClick={() => { 
            if (round === 0) {
              restart();
            } else {
              setIsRestartModalOpen(true);
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(39, 103, 73, 0.1)', border: 'none', color: 'var(--primary-color)', padding: '0.6rem 1.5rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <RefreshCw size={18} />
          Restart Game
        </button>
      </div>

      <ConfirmModal 
        isOpen={isRestartModalOpen} 
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={restart}
        title="Restart this activity?"
        message="Your current progress will be lost."
        confirmText="Restart Game"
        cancelText="Keep Playing"
      />
    </div>
  );
}

/* =========================================================================
   Main GameView Controller
========================================================================= */
function FeedbackOverlay({ message }) {
  if (!message) return null;
  const isCorrect = message === 'correct';
  return (
    <div style={{
      position: 'fixed', top: '2rem', left: '50%', transform: 'translateX(-50%)',
      backgroundColor: isCorrect ? '#c6f6d5' : '#fed7d7',
      color: isCorrect ? '#22543d' : '#822727',
      padding: '1rem 2rem', borderRadius: '50px',
      fontSize: '1.2rem', fontWeight: 'bold', zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      pointerEvents: 'none',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
    </div>
  );
}

export default function GameView() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { soundEnabled } = useAccessibility();
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const showFeedback = (isCorrect) => {
    setFeedbackMessage(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setFeedbackMessage(null), 1000);
  };

  // Provide a wrapper for sound/visuals so games can call it easily
  const triggerFeedback = (isCorrect) => {
    showFeedback(isCorrect);
    if (isCorrect) playCorrectSound(soundEnabled);
    else playIncorrectSound(soundEnabled);
  };

  const handleGameComplete = (score, accuracy, timeTaken, correct, incorrect, avgResponseTime = "—") => {
    playCompletionSound(soundEnabled);
    saveGameResult({
      gameId,
      score,
      accuracy,
      timeTaken,
      averageResponseTime: avgResponseTime,
      summary: accuracy >= 80 ? "Excellent performance!" : "Good effort, keep practicing."
    });
    navigate(`/games/${gameId}/results`, { state: { score, accuracy, timeTaken, correct, incorrect, averageResponseTime: avgResponseTime } });
  };

  const renderGame = () => {
    switch (gameId) {
      case 'memory-match': return <MemoryMatch onComplete={handleGameComplete} soundEnabled={soundEnabled} />;
      case 'number-recall': return <NumberRecall onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      case 'word-recall': return <WordRecall onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      case 'pattern-recall': return <PatternRecall onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      case 'attention-test': return <AttentionTest onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      default:
        return (
          <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>Game Not Found</h2>
            <button onClick={() => navigate('/games')}>Return to Games</button>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/games')} style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', border: '2px solid var(--text-color)' }}>
          Quit Game
        </button>
      </div>
      <FeedbackOverlay message={feedbackMessage} />
      {renderGame()}
    </div>
  );
}

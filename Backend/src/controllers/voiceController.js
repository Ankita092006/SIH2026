const { voiceApiUrl, hfToken } = require('../config/env');

const SAFE_VOICE_ACTIONS = {
  START_MEMORY_GAME: 'start_memory_game',
  START_ATTENTION_GAME: 'start_attention_game',
  START_RECALL_GAME: 'start_recall_game',
  STOP_GAME: 'stop_game',
  REPEAT: 'repeat',
  NEXT: 'next',
  HELP: 'help',
  SHOW_SCORE: 'show_score',
  SHOW_HISTORY: 'show_history',
  SET_REMINDER: 'set_reminder',
  SHOW_REMINDERS: 'show_reminders',
  GO_HOME: 'go_home',
  GO_BACK: 'go_back',
  CHANGE_LANGUAGE: 'change_language'
};

const PHRASE_INTENT_MAP = [
  { phrase: 'start memory game', intent: 'START_MEMORY_GAME', similarity: 0.88, response: 'Starting Memory Match game.' },
  { phrase: 'memory game', intent: 'START_MEMORY_GAME', similarity: 0.85, response: 'Starting Memory Match game.' },
  { phrase: 'start attention game', intent: 'START_ATTENTION_GAME', similarity: 0.86, response: 'Starting Selective Attention game.' },
  { phrase: 'attention game', intent: 'START_ATTENTION_GAME', similarity: 0.84, response: 'Starting Selective Attention game.' },
  { phrase: 'start recall game', intent: 'START_RECALL_GAME', similarity: 0.87, response: 'Starting Number Recall game.' },
  { phrase: 'recall game', intent: 'START_RECALL_GAME', similarity: 0.83, response: 'Starting Number Recall game.' },
  { phrase: 'stop game', intent: 'STOP_GAME', similarity: 0.92, response: 'Stopping current game.' },
  { phrase: 'stop', intent: 'STOP_GAME', similarity: 0.80, response: 'Stopping current game.' },
  { phrase: 'quit', intent: 'STOP_GAME', similarity: 0.81, response: 'Stopping current game.' },
  { phrase: 'repeat', intent: 'REPEAT', similarity: 0.89, response: 'Repeating question.' },
  { phrase: 'next', intent: 'NEXT', similarity: 0.88, response: 'Advancing to next item.' },
  { phrase: 'show score', intent: 'SHOW_SCORE', similarity: 0.89, response: 'Displaying your recent score.' },
  { phrase: 'score', intent: 'SHOW_SCORE', similarity: 0.82, response: 'Displaying your score.' },
  { phrase: 'show history', intent: 'SHOW_HISTORY', similarity: 0.87, response: 'Opening your activity history.' },
  { phrase: 'history', intent: 'SHOW_HISTORY', similarity: 0.81, response: 'Opening your activity history.' },
  { phrase: 'show reminders', intent: 'SHOW_REMINDERS', similarity: 0.90, response: 'Opening your reminders.' },
  { phrase: 'reminders', intent: 'SHOW_REMINDERS', similarity: 0.85, response: 'Opening your reminders.' },
  { phrase: 'set reminder', intent: 'SET_REMINDER', similarity: 0.86, response: 'Opening reminder creation dialog.' },
  { phrase: 'add reminder', intent: 'SET_REMINDER', similarity: 0.85, response: 'Opening reminder creation dialog.' },
  { phrase: 'go home', intent: 'GO_HOME', similarity: 0.95, response: 'Returning to home screen.' },
  { phrase: 'home', intent: 'GO_HOME', similarity: 0.88, response: 'Returning to home screen.' },
  { phrase: 'go back', intent: 'GO_BACK', similarity: 0.91, response: 'Going back to previous page.' },
  { phrase: 'back', intent: 'GO_BACK', similarity: 0.82, response: 'Going back.' },
  { phrase: 'help', intent: 'HELP', similarity: 0.94, response: 'Opening assistance guide.' },
  { phrase: 'change language', intent: 'CHANGE_LANGUAGE', similarity: 0.89, response: 'Switching language.' },
  { phrase: 'language', intent: 'CHANGE_LANGUAGE', similarity: 0.80, response: 'Switching language.' }
];

// PROCESS VOICE / SPEECH INPUT
async function processVoice(req, res) {
  try {
    const { simulatedPhrase, text, audio, simulateError } = req.body || {};

    if (simulateError) {
      return res.status(503).json({
        success: false,
        message: 'Voice assistance is temporarily unavailable.'
      });
    }

    const inputPhrase = (simulatedPhrase || text || '').trim();

    // If audio is provided, call Hugging Face Space Gradio API
    if (audio && typeof audio === 'object' && audio.path) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const hfCallRes = await fetch(`${voiceApiUrl.replace(/\/$/, '')}/gradio_api/call/process_voice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(hfToken ? { 'Authorization': `Bearer ${hfToken}` } : {})
          },
          body: JSON.stringify({ data: [audio] }),
          signal: controller.signal
        });

        if (hfCallRes.ok) {
          const callData = await hfCallRes.json();
          if (callData.event_id) {
            const eventRes = await fetch(`${voiceApiUrl.replace(/\/$/, '')}/gradio_api/call/process_voice/${callData.event_id}`, {
              signal: controller.signal
            });
            const eventText = await eventRes.text();
            clearTimeout(timeoutId);

            // Parse SSE data: ["<transcription>", "<intent>", <similarity>, "<action>"]
            const match = eventText.match(/data:\s*(\[.+\])/);
            if (match) {
              const [transcription, intent, similarity, rawAction] = JSON.parse(match[1]);
              const numSimilarity = Number(similarity || 0);

              if (numSimilarity >= 0.47 && SAFE_VOICE_ACTIONS[intent]) {
                return res.status(200).json({
                  success: true,
                  transcription,
                  intent,
                  similarity: numSimilarity,
                  action: SAFE_VOICE_ACTIONS[intent],
                  allowed: true,
                  response: `Executing ${SAFE_VOICE_ACTIONS[intent]}`
                });
              }

              return res.status(200).json({
                success: true,
                transcription: transcription || '...',
                intent: 'UNKNOWN',
                similarity: numSimilarity,
                action: null,
                allowed: false,
                response: "I didn't understand that command."
              });
            }
          }
        }
        clearTimeout(timeoutId);
      } catch (hfErr) {
        console.warn('[Voice Controller] HF audio call error:', hfErr.message);
      }
    }

    // Semantic Phrase matching conforming to 0.47 safety threshold
    if (inputPhrase) {
      const clean = inputPhrase.toLowerCase();
      const matched = PHRASE_INTENT_MAP.find(m => clean.includes(m.phrase));

      if (matched && matched.similarity >= 0.47) {
        const action = SAFE_VOICE_ACTIONS[matched.intent];
        if (action) {
          return res.status(200).json({
            success: true,
            transcription: inputPhrase,
            intent: matched.intent,
            similarity: matched.similarity,
            action,
            allowed: true,
            response: matched.response
          });
        }
      }

      // Rejection: intent below 0.47 threshold or unknown
      return res.status(200).json({
        success: true,
        transcription: inputPhrase,
        intent: 'UNKNOWN',
        similarity: 0.31,
        action: null,
        allowed: false,
        response: "I didn't understand that command."
      });
    }

    return res.status(200).json({
      success: true,
      transcription: '',
      intent: 'UNKNOWN',
      similarity: 0.0,
      action: null,
      allowed: false,
      response: "Please speak a voice command."
    });
  } catch (error) {
    console.error('processVoice error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process voice request'
    });
  }
}

module.exports = {
  processVoice
};

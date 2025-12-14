/**
 * Speech Recognition & Synthesis Wrapper
 * Nutzt Browser Web Speech API für Voice Agent
 */

export type SpeechLanguage = 'de-DE' | 'en-US' | 'en-GB';

export type SpeechRecognitionResult = {
  transcript: string;
  confidence: number;
  isFinal: boolean;
};

export type SpeechSynthesisOptions = {
  lang?: SpeechLanguage;
  pitch?: number; // 0-2
  rate?: number; // 0.1-10
  volume?: number; // 0-1
  voice?: SpeechSynthesisVoice;
};

class SpeechManager {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initRecognition();
      this.initSynthesis();
    }
  }

  // ===== RECOGNITION (Speech-to-Text) =====

  private initRecognition() {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'de-DE';
  }

  /**
   * Prüft ob Speech Recognition verfügbar ist
   */
  isRecognitionAvailable(): boolean {
    return this.recognition !== null;
  }

  /**
   * Startet Speech Recognition
   */
  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech Recognition not available');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const latest = results[results.length - 1];
      
      if (latest && latest[0]) {
        onResult({
          transcript: latest[0].transcript,
          confidence: latest[0].confidence,
          isFinal: latest.isFinal,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      onError?.('Failed to start recognition');
    }
  }

  /**
   * Stoppt Speech Recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Gibt zurück ob gerade zugehört wird
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Setzt die Sprache für Recognition
   */
  setRecognitionLanguage(lang: SpeechLanguage): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  // ===== SYNTHESIS (Text-to-Speech) =====

  private initSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices
      this.loadVoices();
      
      // Voices might load async
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('Speech Synthesis not supported in this browser');
    }
  }

  private loadVoices() {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices();
    }
  }

  /**
   * Prüft ob Speech Synthesis verfügbar ist
   */
  isSynthesisAvailable(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Spricht einen Text aus
   */
  speak(
    text: string, 
    options: SpeechSynthesisOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech Synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = options.lang || 'de-DE';
      utterance.pitch = options.pitch ?? 1;
      utterance.rate = options.rate ?? 1;
      utterance.volume = options.volume ?? 1;

      // Set voice if specified
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        // Try to find a German voice
        const germanVoice = this.voices.find(v => 
          v.lang.startsWith('de')
        );
        if (germanVoice) {
          utterance.voice = germanVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        reject(new Error(event.error));
      };

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stoppt die aktuelle Sprachausgabe
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Pausiert die Sprachausgabe
   */
  pauseSpeaking(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Setzt pausierte Sprachausgabe fort
   */
  resumeSpeaking(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Gibt verfügbare Stimmen zurück
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Gibt Deutsche Stimmen zurück
   */
  getGermanVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith('de'));
  }

  /**
   * Gibt Englische Stimmen zurück
   */
  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith('en'));
  }

  /**
   * Prüft ob gerade gesprochen wird
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  /**
   * Prüft ob Speech pausiert ist
   */
  isPaused(): boolean {
    return this.synthesis?.paused ?? false;
  }
}

// Singleton instance
export const speechManager = new SpeechManager();

// ===== HELPER FUNCTIONS =====

/**
 * Quick speak function
 */
export function speak(text: string, options?: SpeechSynthesisOptions): Promise<void> {
  return speechManager.speak(text, options);
}

/**
 * Quick listen function
 */
export function listen(
  onResult: (result: SpeechRecognitionResult) => void,
  onError?: (error: string) => void
): () => void {
  speechManager.startListening(onResult, onError);
  return () => speechManager.stopListening();
}

/**
 * Check if speech features are available
 */
export function checkSpeechSupport() {
  return {
    recognition: speechManager.isRecognitionAvailable(),
    synthesis: speechManager.isSynthesisAvailable(),
  };
}

/**
 * Get preferred voice for language
 */
export function getPreferredVoice(lang: SpeechLanguage): SpeechSynthesisVoice | null {
  const voices = speechManager.getVoices();
  
  // Try to find exact match
  let voice = voices.find(v => v.lang === lang);
  
  // Try to find language match (e.g., de-DE matches de-*)
  if (!voice) {
    const langPrefix = lang.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(langPrefix));
  }
  
  // Try to find any voice
  if (!voice) {
    voice = voices[0];
  }
  
  return voice || null;
}

/**
 * Convert speech result to command
 * Parses common workflow commands from speech
 */
export function parseVoiceCommand(transcript: string): {
  type: 'add_node' | 'connect' | 'delete' | 'run' | 'save' | 'unknown';
  params?: any;
} {
  const lower = transcript.toLowerCase().trim();

  // Add node commands
  if (lower.includes('add') || lower.includes('hinzufügen') || lower.includes('erstelle')) {
    const nodeTypes = [
      'http', 'function', 'log', 'email', 'database', 'router', 
      'condition', 'filter', 'code', 'response'
    ];
    
    for (const type of nodeTypes) {
      if (lower.includes(type)) {
        return { type: 'add_node', params: { nodeType: type } };
      }
    }
    
    return { type: 'add_node' };
  }

  // Connect nodes
  if (lower.includes('connect') || lower.includes('verbinde')) {
    return { type: 'connect' };
  }

  // Delete
  if (lower.includes('delete') || lower.includes('lösche') || lower.includes('entferne')) {
    return { type: 'delete' };
  }

  // Run workflow
  if (lower.includes('run') || lower.includes('execute') || lower.includes('ausführen') || lower.includes('starte')) {
    return { type: 'run' };
  }

  // Save workflow
  if (lower.includes('save') || lower.includes('speichere') || lower.includes('speichern')) {
    return { type: 'save' };
  }

  return { type: 'unknown' };
}

/**
 * Service de détection vocale automatique pour assistant conversationnel
 */
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onnomatch:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface VoiceDetectionCallbacks {
  onSpeechStart: () => void;
  onSpeechEnd: (transcript: string) => void;
  onSilenceTimeout: () => void;
  onError: (error: string) => void;
}

export class VoiceDetectionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private isDetecting: boolean = false;
  private isStarting: boolean = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private speechTimer: NodeJS.Timeout | null = null;
  private lastSpeechTime: number = 0;
  private currentTranscript: string = '';
  private callbacks: VoiceDetectionCallbacks | null = null;

  // Configuration
  private readonly SILENCE_TIMEOUT = 2000; // 2 secondes de silence avant arrêt
  private readonly MIN_SPEECH_DURATION = 500; // 500ms minimum de parole
  private readonly SPEECH_DETECTION_THRESHOLD = 3; // 3 caractères minimum

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        console.warn("Speech recognition not supported in this browser");
        return;
      }

      this.recognition = new SpeechRecognitionAPI();
      this.setupRecognitionEvents();
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
    }
  }

  private setupRecognitionEvents(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "fr-FR";
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      console.log("🎤 Voice detection started");
      this.isListening = true;
      this.isStarting = false;
      this.lastSpeechTime = Date.now();
      this.currentTranscript = '';
    };

    this.recognition.onresult = (event) => {
      this.processSpeechResults(event);
    };

    this.recognition.onerror = (event) => {
      console.warn("Voice detection error:", event.error);
      this.handleError(event.error);
    };

    this.recognition.onend = () => {
      console.log("Voice detection ended");
      this.isListening = false;
      this.isStarting = false;

      // Redémarrage automatique si toujours en mode détection
      if (this.isDetecting) {
        setTimeout(() => {
          if (this.isDetecting && !this.isListening && !this.isStarting) {
            this.startDetection(this.callbacks!);
          }
        }, 100);
      }
    };

    this.recognition.onspeechstart = () => {
      console.log("🗣️ Speech detected");
      this.startSpeechDetection();
    };

    this.recognition.onspeechend = () => {
      console.log("🔇 Speech ended");
      this.stopSpeechDetection();
    };

    this.recognition.onsoundstart = () => {
      console.log("🔊 Sound detected");
    };

    this.recognition.onsoundend = () => {
      console.log("🔈 Sound ended");
    };
  }

  private processSpeechResults(event: SpeechRecognitionEvent): void {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      // Ignorer si ça ressemble à la voix de l'IA (confiance très élevée + très régulier)
      const confidence = event.results[i][0].confidence;
      if (confidence && confidence > 0.95 && transcript.length > 10) {
        console.log("🤖 Possible IA voice detected - ignoring:", transcript);
        continue;
      }

      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Mettre à jour le transcript courant
    this.currentTranscript = (this.currentTranscript + ' ' + finalTranscript).trim();

    if (finalTranscript) {
      console.log("📝 Final transcript segment:", finalTranscript);
      this.lastSpeechTime = Date.now();
      this.resetSilenceTimer();
    }

    if (interimTranscript) {
      console.log("⏳ Interim transcript:", interimTranscript);
      this.lastSpeechTime = Date.now();
    }
  }

  private startSpeechDetection(): void {
    if (this.speechTimer) {
      clearTimeout(this.speechTimer);
    }

    this.speechTimer = setTimeout(() => {
      const speechDuration = Date.now() - this.lastSpeechTime;
      if (speechDuration >= this.MIN_SPEECH_DURATION && this.currentTranscript.length >= this.SPEECH_DETECTION_THRESHOLD) {
        console.log("✅ Significant speech detected, notifying...");
        this.callbacks?.onSpeechStart();
      }
    }, this.MIN_SPEECH_DURATION);

    this.resetSilenceTimer();
  }

  private stopSpeechDetection(): void {
    if (this.speechTimer) {
      clearTimeout(this.speechTimer);
      this.speechTimer = null;
    }
  }

  private resetSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      console.log("⏰ Silence timeout detected");
      this.handleSilenceTimeout();
    }, this.SILENCE_TIMEOUT);
  }

  private handleSilenceTimeout(): void {
    if (this.currentTranscript.trim().length >= this.SPEECH_DETECTION_THRESHOLD) {
      console.log("🎯 Final transcript:", this.currentTranscript);
      this.callbacks?.onSpeechEnd(this.currentTranscript);
    } else {
      console.log("❌ Speech too short, ignoring");
    }

    // Réinitialiser pour la prochaine détection
    this.currentTranscript = '';
    this.stopSilenceTimer();
  }

  private stopSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private handleError(error: string): void {
    this.isListening = false;
    this.callbacks?.onError(error);

    // Redémarrage automatique pour les erreurs non critiques
    if (error !== "aborted" && error !== "no-speech") {
      setTimeout(() => {
        if (this.isDetecting && !this.isListening && !this.isStarting) {
          this.startDetection(this.callbacks!);
        }
      }, 1000);
    }
  }

  public startDetection(callbacks: VoiceDetectionCallbacks): void {
    if (!this.recognition) {
      callbacks.onError("Speech recognition not supported");
      return;
    }

    // Si déjà en cours ou en démarrage, ne pas tenter de démarrer à nouveau
    if (this.isListening || this.isStarting) {
      console.log("🔇 Voice detection already running or starting");
      return;
    }

    console.log("🚀 Starting voice detection...");
    this.callbacks = callbacks;
    this.isDetecting = true;
    this.isStarting = true;
    this.currentTranscript = '';
    this.lastSpeechTime = Date.now();

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Error starting voice detection:", error);
      this.isStarting = false;
      // Si déjà en cours, forcer l'arrêt
      try {
        if (this.recognition) {
          this.recognition.abort();
          this.recognition = null;
        }
      } catch (abortError) {
        callbacks.onError("Failed to start voice detection");
      }
    }
  }

  public stopDetection(): void {
    console.log("🛑 Stopping voice detection...");
    this.isDetecting = false;
    this.isStarting = false;

    this.stopSilenceTimer();
    this.stopSpeechDetection();

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn("Error stopping recognition:", error);
        this.recognition.abort();
      }
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public isCurrentlyDetecting(): boolean {
    return this.isDetecting;
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }
}

export const voiceDetectionService = new VoiceDetectionService();
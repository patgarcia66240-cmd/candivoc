declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
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

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Initialize speech synthesis if available
    if ("speechSynthesis" in window) {
      this.speechSynthesis = window.speechSynthesis;
      // Force voices loading
      this.initializeVoices();
    }
  }

  private initializeVoices(): void {
    // Force loading of voices on some browsers
    if (this.speechSynthesis && this.speechSynthesis.getVoices().length === 0) {
      this.speechSynthesis.onvoiceschanged = () => {
        console.log("🗣️ Voices loaded:", this.speechSynthesis?.getVoices().length);
        // List available French voices for debugging
        const frenchVoices = this.speechSynthesis?.getVoices().filter(v => v.lang.startsWith("fr"));
        if (frenchVoices && frenchVoices.length > 0) {
          console.log("🇫🇷 Available French voices:", frenchVoices.map(v => `${v.name} (${v.lang})`));
        }
      };
    }
  }

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Enregistrer des chunks toutes les 100ms
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error("Impossible d'accéder au microphone");
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No active recording"));
        return;
      }

      // Accept both 'recording' and 'paused' states
      if (
        this.mediaRecorder.state !== "recording" &&
        this.mediaRecorder.state !== "paused"
      ) {
        reject(new Error("No active recording"));
        return;
      }

      // If paused, resume first to ensure proper stopping
      if (this.mediaRecorder.state === "paused") {
        this.mediaRecorder.resume();
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: "audio/webm;codecs=opus",
        });
        this.cleanup();
        resolve(audioBlob);
      };

      // Force stop after timeout if onstop doesn't fire
      const timeoutId = setTimeout(() => {
        console.warn("MediaRecorder stop timeout, forcing cleanup");
        const audioBlob = new Blob(this.audioChunks, {
          type: "audio/webm;codecs=opus",
        });
        this.cleanup();
        resolve(audioBlob);
      }, 2000);

      this.mediaRecorder.onstop = () => {
        clearTimeout(timeoutId);
        const audioBlob = new Blob(this.audioChunks, {
          type: "audio/webm;codecs=opus",
        });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }

  getRecordingDuration(): number {
    // Implémenter le calcul de la durée d'enregistrement
    return 0;
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    try {
      const audioContext = new (window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Error playing audio:", error);
      throw new Error("Impossible de jouer l'audio");
    }
  }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audioinput");
    } catch (error) {
      console.error("Error getting audio devices:", error);
      return [];
    }
  }

  async testMicrophone(): Promise<boolean> {
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      testStream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone test failed:", error);
      return false;
    }
  }

  // Speech Recognition methods
  startSpeechRecognition(
    onResult: (transcript: string, isFinal: boolean) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if speech recognition is supported
        const SpeechRecognitionAPI =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
          reject(new Error("Speech recognition not supported in this browser"));
          return;
        }

        // Nettoyer toute instance précédente
        if (this.recognition) {
          this.recognition.abort();
          this.recognition = null;
        }

        this.recognition = new SpeechRecognitionAPI();
        this.isListening = true;

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "fr-FR"; // French language
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          console.log("🎤 Speech recognition started successfully");
          resolve();
        };

        this.recognition.onresult = (event) => {
          try {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            if (finalTranscript) {
              console.log("📝 Final transcript:", finalTranscript);
              onResult(finalTranscript, true);
            } else if (interimTranscript) {
              onResult(interimTranscript, false);
            }
          } catch (error) {
            console.error("Error processing speech recognition result:", error);
          }
        };

        this.recognition.onerror = (event) => {
          console.error(
            "❌ Speech recognition error:",
            event.error,
            event.message
          );
          this.isListening = false;

          // Ne pas rejeter la promesse pour les erreurs "aborted" normales
          if (event.error !== "aborted") {
            reject(new Error(`Speech recognition error: ${event.error}`));
          }
        };

        this.recognition.onend = () => {
          console.log("🔚 Speech recognition ended");
          this.isListening = false;
        };

        this.recognition.start();
      } catch (error) {
        console.error("❌ Error starting speech recognition:", error);
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopSpeechRecognition(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.recognition = null; // Clear the reference
    }
  }

  isSpeechRecognitionActive(): boolean {
    return this.isListening;
  }

  abortSpeechRecognition(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  // Text-to-Speech methods

  /**
   * Nettoie le texte pour le rendre adapté à la synthèse vocale
   * @param text Le texte à nettoyer
   * @returns Le texte nettoyé
   */
  private cleanTextForSpeech(text: string): string {
    if (!text) return "";

    return (
      text
        // Supprimer les emojis (plages Unicode complètes)
        .replace(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu,
          ""
        )
        // Supprimer les symboles markdown et caractères spéciaux
        .replace(/\*\*(.*?)\*\*/g, "$1") // Gras
        .replace(/\*(.*?)\*/g, "$1") // Italique
        .replace(/`(.*?)`/g, "$1") // Code inline
        .replace(/```[\s\S]*?```/g, "") // Blocs de code
        .replace(/#{1,6}\s/g, "") // Headers
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Liens markdown
        .replace(/[|*#•]/g, "") // Caractères spéciaux
        .replace(/\s*[-•]\s*/g, ", ") // Puces transformées en virgules
        // Nettoyer les espaces et sauts de ligne
        .replace(/\n+/g, " ") // Sauts de ligne en espaces
        .replace(/\s+/g, " ") // Espaces multiples en un seul
        .trim()
    );
  }

  async speakText(
    text: string,
    options?: {
      voice?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      lang?: string;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error("Speech synthesis not supported in this browser"));
        return;
      }

      // Cancel any current speech
      this.stopSpeaking();

      // Nettoyer le texte comme filet de sécurité (au cas où le texte n'aurait pas été nettoyé avant)
      const cleanedText = this.cleanTextForSpeech(text);

      // Wait for voices to be loaded if needed
      let voices = this.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // If voices are not loaded yet, set up a listener and wait
        const handleVoicesChanged = () => {
          voices = this.speechSynthesis?.getVoices() || [];
          this.speechSynthesis!.onvoiceschanged = null;
          this.speakWithVoice(voices, cleanedText, resolve, reject, options);
        };
        this.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        // Trigger voice loading on some browsers
        this.speechSynthesis.getVoices();
        return;
      }

      this.speakWithVoice(voices, cleanedText, resolve, reject, options);
    });
  }

  private speakWithVoice(
    voices: SpeechSynthesisVoice[],
    cleanedText: string,
    resolve: () => void,
    reject: (error: Error) => void,
    options?: { voice?: string; rate?: number; pitch?: number; volume?: number; lang?: string }
  ): void {
    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(cleanedText);

    // Try to find the best French voice (priority order)
    const selectedVoice = voices.find(voice =>
      voice.name.includes("Google français") ||
      voice.name.includes("French") ||
      voice.name.includes("fr-FR")
    ) || voices.find(voice =>
      voice.lang.startsWith("fr") && voice.localService
    ) || voices.find(voice =>
      voice.lang.startsWith("fr")
    );

    // Apply voice selection
    if (selectedVoice) {
      this.currentUtterance.voice = selectedVoice;
      console.log("🎤 Selected voice:", selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn("⚠️ No French voice found, using default voice");
    }

    // Apply options with better defaults for natural speech
    this.currentUtterance.rate = options?.rate ?? 0.95; // Vitesse légèrement plus lente pour plus naturel
    this.currentUtterance.pitch = options?.pitch ?? 1.0; // Pitch neutre
    this.currentUtterance.volume = options?.volume ?? 0.9; // Volume légèrement plus élevé

    // Override with specific options if provided
    if (options) {
      if (options.rate !== undefined) this.currentUtterance.rate = options.rate;
      if (options.pitch !== undefined) this.currentUtterance.pitch = options.pitch;
      if (options.volume !== undefined) this.currentUtterance.volume = options.volume;
      if (options.lang !== undefined) this.currentUtterance.lang = options.lang;
    }

    // Set default language to French if not specified
    if (!this.currentUtterance.lang) {
      this.currentUtterance.lang = "fr-FR";
    }

    // Add small pauses for more natural speech (using SSML-like pauses)
    const enhancedText = cleanedText
      .replace(/\./g, ". ")
      .replace(/,/g, ", ")
      .replace(/\?/g, "? ")
      .replace(/!/g, "! ")
      .replace(/\s+/g, " ")
      .trim();

    this.currentUtterance.text = enhancedText;

    // Set up event handlers
    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
      resolve();
    };

    this.currentUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      this.currentUtterance = null;
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    // Start speaking
    if (!this.speechSynthesis) {
      reject(new Error("Speech synthesis not available"));
      return;
    }

    this.speechSynthesis.speak(this.currentUtterance);
  }

  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.speechSynthesis?.speaking || false;
  }

  // Arrête la parole de l'IA et retourne un état indiquant si quelque chose a été arrêté
  stopAIVoice(): { stopped: boolean; wasSpeaking: boolean } {
    const wasSpeaking = this.isSpeaking();

    if (wasSpeaking) {
      this.stopSpeaking();
      console.log("🔇 IA voice stopped - user started speaking");
    }

    return { stopped: wasSpeaking, wasSpeaking };
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return [];
    return this.speechSynthesis.getVoices();
  }

  async getFrenchVoice(): Promise<SpeechSynthesisVoice | null> {
    return new Promise((resolve) => {
      if (!this.speechSynthesis) {
        resolve(null);
        return;
      }

      const voices = this.speechSynthesis.getVoices();

      // Try to find a French voice
      const frenchVoice =
        voices.find(
          (voice) => voice.lang.startsWith("fr") && voice.localService
        ) || voices.find((voice) => voice.lang.startsWith("fr"));

      if (frenchVoice) {
        resolve(frenchVoice);
        return;
      }

      // If no French voice found immediately, wait for voices to be loaded
      if (voices.length === 0) {
        this.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = this.speechSynthesis?.getVoices() || [];
          const frenchVoice =
            updatedVoices.find(
              (voice) => voice.lang.startsWith("fr") && voice.localService
            ) || updatedVoices.find((voice) => voice.lang.startsWith("fr"));
          resolve(frenchVoice || null);
        };
      } else {
        resolve(null);
      }
    });
  }
}

export const audioService = new AudioService();

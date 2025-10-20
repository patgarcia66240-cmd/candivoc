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
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
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

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
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
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
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
        mimeType: 'audio/webm;codecs=opus',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Enregistrer des chunks toutes les 100ms
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Impossible d\'accéder au microphone');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      // Accept both 'recording' and 'paused' states
      if (this.mediaRecorder.state !== 'recording' && this.mediaRecorder.state !== 'paused') {
        reject(new Error('No active recording'));
        return;
      }

      // If paused, resume first to ensure proper stopping
      if (this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/webm;codecs=opus',
        });
        this.cleanup();
        resolve(audioBlob);
      };

      // Force stop after timeout if onstop doesn't fire
      const timeoutId = setTimeout(() => {
        console.warn('MediaRecorder stop timeout, forcing cleanup');
        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/webm;codecs=opus',
        });
        this.cleanup();
        resolve(audioBlob);
      }, 2000);

      this.mediaRecorder.onstop = () => {
        clearTimeout(timeoutId);
        const audioBlob = new Blob(this.audioChunks, {
          type: 'audio/webm;codecs=opus',
        });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  getRecordingDuration(): number {
    // Implémenter le calcul de la durée d'enregistrement
    return 0;
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw new Error('Impossible de jouer l\'audio');
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
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return [];
    }
  }

  async testMicrophone(): Promise<boolean> {
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone test failed:', error);
      return false;
    }
  }

  // Speech Recognition methods
  startSpeechRecognition(onResult: (transcript: string, isFinal: boolean) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if speech recognition is supported
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
          reject(new Error('Speech recognition not supported in this browser'));
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
        this.recognition.lang = 'fr-FR'; // French language
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          console.log('🎤 Speech recognition started successfully');
          resolve();
        };

        this.recognition.onresult = (event) => {
          try {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            if (finalTranscript) {
              console.log('📝 Final transcript:', finalTranscript);
              onResult(finalTranscript, true);
            } else if (interimTranscript) {
              onResult(interimTranscript, false);
            }
          } catch (error) {
            console.error('Error processing speech recognition result:', error);
          }
        };

        this.recognition.onerror = (event) => {
          console.error('❌ Speech recognition error:', event.error, event.message);
          this.isListening = false;

          // Ne pas rejeter la promesse pour les erreurs "aborted" normales
          if (event.error !== 'aborted') {
            reject(new Error(`Speech recognition error: ${event.error}`));
          }
        };

        this.recognition.onend = () => {
          console.log('🔚 Speech recognition ended');
          this.isListening = false;
        };

        this.recognition.start();
      } catch (error) {
        console.error('❌ Error starting speech recognition:', error);
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
  async speakText(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }

      // Cancel any current speech
      this.stopSpeaking();

      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);

      // Apply options
      if (options) {
        if (options.voice) {
          const voices = this.speechSynthesis.getVoices();
          const selectedVoice = voices.find(voice => voice.name === options.voice || voice.lang === options.voice);
          if (selectedVoice) {
            this.currentUtterance.voice = selectedVoice;
          }
        }
        if (options.rate !== undefined) this.currentUtterance.rate = options.rate;
        if (options.pitch !== undefined) this.currentUtterance.pitch = options.pitch;
        if (options.volume !== undefined) this.currentUtterance.volume = options.volume;
        if (options.lang !== undefined) this.currentUtterance.lang = options.lang;
      }

      // Set default language to French
      if (!this.currentUtterance.lang) {
        this.currentUtterance.lang = 'fr-FR';
      }

      // Set up event handlers
      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      this.speechSynthesis.speak(this.currentUtterance);
    });
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
      console.log('🔇 IA voice stopped - user started speaking');
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
      const frenchVoice = voices.find(voice =>
        voice.lang.startsWith('fr') && voice.localService
      ) || voices.find(voice =>
        voice.lang.startsWith('fr')
      );

      if (frenchVoice) {
        resolve(frenchVoice);
        return;
      }

      // If no French voice found immediately, wait for voices to be loaded
      if (voices.length === 0) {
        this.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = this.speechSynthesis?.getVoices() || [];
          const frenchVoice = updatedVoices.find(voice =>
            voice.lang.startsWith('fr') && voice.localService
          ) || updatedVoices.find(voice =>
            voice.lang.startsWith('fr')
          );
          resolve(frenchVoice || null);
        };
      } else {
        resolve(null);
      }
    });
  }
}

export const audioService = new AudioService();

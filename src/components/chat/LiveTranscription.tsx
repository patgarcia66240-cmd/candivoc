import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Clock, User } from 'lucide-react';

interface TranscriptEntry {
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface LiveTranscriptionProps {
  currentTranscript: string;
  transcriptHistory: TranscriptEntry[];
  isRecording: boolean;
}

export const LiveTranscription: React.FC<LiveTranscriptionProps> = ({
  currentTranscript,
  transcriptHistory,
  isRecording
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcriptHistory, currentTranscript]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-slate-200/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/50 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              isRecording
                ? 'bg-red-500 animate-pulse'
                : 'bg-gray-400'
            }`}>
              {isRecording ? (
                <Mic className="w-4 h-4 text-white" />
              ) : (
                <MicOff className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Transcription en direct</h3>
              <p className="text-sm text-slate-500">
                {isRecording ? '🎤 Enregistrement en cours...' : '⏸️ En pause'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcriptHistory.length === 0 && !currentTranscript ? (
          <div className="text-center text-slate-500 py-12">
            <div className="w-16 h-16 bg-linear-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-slate-700">Commencez à parler</p>
            <p className="text-sm mt-2 text-slate-500">Votre voix sera transcrite en temps réel ici</p>
          </div>
        ) : (
          <>
            {/* Transcription en cours */}
            {currentTranscript && (
              <div className="flex items-start space-x-3 animate-pulse">
                <div className="shrink-0 w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 max-w-xs lg:max-w-md">
                  <div className="bg-linear-to-br from-blue-100 to-blue-200 text-blue-900 border border-blue-300/50 px-4 py-3 rounded-2xl shadow-lg">
                    <p className="text-sm leading-relaxed">{currentTranscript}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <span className="text-xs text-blue-600">En cours...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Historique des transcriptions */}
            {transcriptHistory.map((entry, index) => (
              <div
                key={`${entry.timestamp.getTime()}-${index}`}
                className="flex items-start space-x-3"
              >
                <div className="shrink-0 w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 max-w-xs lg:max-w-md">
                  <div className="bg-linear-to-br from-slate-100 to-slate-200 text-slate-900 border border-slate-300/50 px-4 py-3 rounded-2xl shadow-lg">
                    <p className="text-sm leading-relaxed">{entry.text}</p>
                    <p className="text-xs mt-2 text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(entry.timestamp)}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/50 bg-linear-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-500">
            <span className="font-medium">{transcriptHistory.length}</span> message{transcriptHistory.length !== 1 ? 's' : ''} transcrit{transcriptHistory.length !== 1 ? 's' : ''}
          </div>
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">ENREGISTREMENT</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

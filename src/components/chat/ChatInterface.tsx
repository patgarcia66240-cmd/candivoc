import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// Interface locale pour éviter les problèmes d'export
interface Message {
  id: string;
  sessionId: string;
  content: string;
  speaker: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  isSpoken?: boolean;
  isSpeaking?: boolean;
  metadata?: {
    sentiment?: number;
    confidence?: number;
    duration?: number;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-br from-white to-slate-50 rounded-2xl shadow-2xl border border-slate-200/50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <div className="w-16 h-16 bg-linear-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <p className="text-lg font-medium text-slate-700">Commencez votre session d'entraînement</p>
            <p className="text-sm mt-2 text-slate-500">L'IA vous guidera à travers le scénario</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.speaker === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.speaker === 'ai' && (
                <div className="shrink-0 w-8 h-8 bg-linear-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  message.speaker === 'user'
                    ? 'bg-linear-to-br from-slate-600 to-slate-700 text-white'
                    : 'bg-linear-to-br from-slate-100 to-slate-200 text-slate-900 border border-slate-300/50'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <p
                    className={`text-xs ${
                      message.speaker === 'user' ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                  {message.speaker === 'ai' && (
                    <div className="flex items-center space-x-1">
                      {message.isSpeaking ? (
                        <>
                          <Volume2 className="w-3 h-3 text-blue-500 animate-pulse" />
                          <span className="text-xs text-blue-500">En cours...</span>
                        </>
                      ) : message.isSpoken ? (
                        <>
                          <Volume2 className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-500">Lu</span>
                        </>
                      ) : (
                        <VolumeX className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {message.speaker === 'user' && (
                <div className="shrink-0 w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200/50 p-6 bg-linear-to-r from-slate-50 to-white">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={disabled}
            className="flex-1 bg-white/80 border-slate-300/50 focus:border-slate-400 focus:ring-slate-400/20"
          />
          <Button
            type="submit"
            variant="gradient"
            disabled={!inputValue.trim() || disabled}
            size="md"
            className="px-6 shadow-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

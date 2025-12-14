'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Mic, MicOff, Send, X, ChevronDown, ChevronUp, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { speechManager, parseVoiceCommand, type SpeechRecognitionResult } from '@/lib/speech';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceAgentProps {
  onGenerateWorkflow: (prompt: string) => Promise<void>;
  onCommand?: (command: { type: string; params?: any }) => void;
}

export default function VoiceAgent({ onGenerateWorkflow, onCommand }: VoiceAgentProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hey! 👋 Ich bin dein KI-Workflow-Assistent. Sag mir was du bauen willst - per Sprache oder Text!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Check speech support
  const speechSupport = {
    recognition: speechManager.isRecognitionAvailable(),
    synthesis: speechManager.isSynthesisAvailable(),
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice input
  const toggleListening = () => {
    if (!speechSupport.recognition) {
      toast({
        variant: 'destructive',
        title: 'Spracherkennung nicht verfügbar',
        description: 'Dein Browser unterstützt keine Spracherkennung.',
      });
      return;
    }

    if (isListening) {
      speechManager.stopListening();
      setIsListening(false);
      
      // Send transcript if we have one
      if (transcript.trim()) {
        handleSendMessage(transcript, true);
        setTranscript('');
      }
    } else {
      setTranscript('');
      setIsListening(true);
      
      speechManager.startListening(
        (result: SpeechRecognitionResult) => {
          setTranscript(result.transcript);
          
          // Auto-send on final result
          if (result.isFinal && result.transcript.trim()) {
            speechManager.stopListening();
            setIsListening(false);
            handleSendMessage(result.transcript, true);
            setTranscript('');
          }
        },
        (error: string) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          toast({
            variant: 'destructive',
            title: 'Sprachfehler',
            description: `Fehler bei der Spracherkennung: ${error}`,
          });
        }
      );
    }
  };

  // Speak text
  const speakText = async (text: string) => {
    if (!speechSupport.synthesis || !speechEnabled) return;
    
    try {
      setIsSpeaking(true);
      await speechManager.speak(text, {
        lang: 'de-DE',
        rate: 1.1,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Toggle speech output
  const toggleSpeech = () => {
    if (isSpeaking) {
      speechManager.stopSpeaking();
      setIsSpeaking(false);
    }
    setSpeechEnabled(!speechEnabled);
  };

  // Add message
  const addMessage = (role: 'user' | 'assistant', content: string, isVoice = false) => {
    const message: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      isVoice,
    };
    
    setMessages(prev => [...prev, message]);
    
    // Speak assistant messages if enabled
    if (role === 'assistant' && speechEnabled) {
      speakText(content);
    }
  };

  // Handle send message
  const handleSendMessage = async (text: string, isVoice = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Add user message
    addMessage('user', trimmed, isVoice);
    setInput('');

    // Parse command
    const command = parseVoiceCommand(trimmed);
    
    // Handle specific commands
    if (command.type === 'add_node') {
      const nodeType = command.params?.nodeType;
      addMessage('assistant', nodeType 
        ? `Okay, ich füge einen ${nodeType} Node hinzu.`
        : 'Welchen Node-Typ möchtest du hinzufügen?'
      );
      
      if (nodeType && onCommand) {
        onCommand({ type: 'add_node', params: { nodeType } });
      }
      return;
    }

    if (command.type === 'run') {
      addMessage('assistant', 'Starte Workflow-Ausführung...');
      onCommand?.({ type: 'run' });
      return;
    }

    if (command.type === 'save') {
      addMessage('assistant', 'Speichere Workflow...');
      onCommand?.({ type: 'save' });
      return;
    }

    // Generate workflow
    setIsGenerating(true);
    addMessage('assistant', '⚡ Analysiere deine Anfrage und generiere Workflow...');

    try {
      await onGenerateWorkflow(trimmed);
      addMessage('assistant', '✨ Workflow erfolgreich generiert! Schau dir die Canvas an.');
    } catch (error) {
      console.error('Workflow generation error:', error);
      addMessage('assistant', '❌ Fehler beim Generieren des Workflows. Versuch es nochmal mit mehr Details.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle input submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  if (!isOpen) {
    return (
      <Button 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full h-14 w-14 shadow-neon-lg animate-glow-pulse btn-neon"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-3xl shadow-neon-lg transition-all duration-300 card-cyber',
        isMinimized ? 'h-16' : 'h-[600px] max-h-[80vh]'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="h-7 w-7 text-primary" />
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-cyan"></span>
              </span>
            )}
          </div>
          <div>
            <CardTitle className="font-headline text-lg text-neon flex items-center gap-2">
              KI Workflow Agent
              <Sparkles className="h-4 w-4 text-neon-yellow" />
            </CardTitle>
            {isListening && (
              <p className="text-xs text-neon-cyan animate-neon-flicker">
                🎤 Listening... {transcript}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {speechSupport.synthesis && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={toggleSpeech}
              title={speechEnabled ? 'Sprachausgabe deaktivieren' : 'Sprachausgabe aktivieren'}
            >
              {speechEnabled ? (
                <Volume2 className="h-4 w-4 text-neon-cyan" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col p-0 h-[calc(100%-4rem)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-cyber">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 animate-in slide-in-from-bottom-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary/20 border border-primary/30 text-primary-foreground'
                      : 'bg-card border border-border/50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {msg.isVoice && msg.role === 'user' && (
                      <Mic className="h-3 w-3 text-neon-cyan flex-shrink-0 mt-0.5" />
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {msg.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-neon-cyan">U</span>
                  </div>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-primary/20 p-3">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={inputRef}
                value={isListening ? transcript : input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Spreche jetzt...' : 'Beschreibe deinen Workflow... (oder drücke Mikrofon)'}
                className={cn(
                  'min-h-[60px] pr-24 resize-none input-cyber',
                  isListening && 'border-neon-cyan/50 shadow-neon-cyan'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isListening}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {speechSupport.recognition && (
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? 'default' : 'ghost'}
                    onClick={toggleListening}
                    disabled={isGenerating}
                    className={cn(
                      'h-9 w-9',
                      isListening && 'bg-neon-cyan/20 border-neon-cyan/50 shadow-neon-cyan animate-glow-pulse'
                    )}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 text-neon-cyan" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  type="submit"
                  size="icon"
                  disabled={isGenerating || isListening || !input.trim()}
                  className="h-9 w-9 btn-neon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              {speechSupport.recognition 
                ? '💡 Tipp: Drücke das Mikrofon für Spracheingabe'
                : '⌨️ Nur Texteingabe verfügbar'
              }
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

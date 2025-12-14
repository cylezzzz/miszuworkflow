'use client';

import { useState } from 'react';
import { Bot, ChevronDown, ChevronUp, Mic, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AiChatProps {
    onGenerateWorkflow: (prompt: string) => Promise<void>;
}

export default function AiChat({ onGenerateWorkflow }: AiChatProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!prompt) {
          toast({
            variant: 'destructive',
            title: 'Eingabe ist leer',
            description: 'Bitte beschreiben Sie den Workflow, den Sie erstellen möchten.',
          });
          return;
        }
        setIsGenerating(true);
        try {
            await onGenerateWorkflow(prompt);
            setPrompt('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    if (!isOpen) {
        return (
             <Button 
                className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full w-12 h-12"
                onClick={() => setIsOpen(true)}
            >
                <Bot />
            </Button>
        )
    }

    return (
        <Card
            className={cn(
                'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-2xl shadow-2xl transition-all duration-300',
                isMinimized ? 'h-16' : 'h-auto'
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between p-3">
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-lg">KI-Assistent</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            {!isMinimized && (
                <CardContent className="p-3 pt-0">
                    <div className="relative">
                        <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Beschreiben Sie einen Workflow Schritt für Schritt oder mit einem Plan..."
                            className="min-h-[80px] pr-20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerate();
                                }
                            }}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                             <Button variant="ghost" size="icon" disabled={isGenerating}>
                                <Mic className="h-4 w-4" />
                            </Button>
                            <Button size="icon" onClick={handleGenerate} disabled={isGenerating}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Sie können Workflows mit Ihrer Stimme oder durch Eingabe eines Plans erstellen.
                    </p>
                </CardContent>
            )}
        </Card>
    );
}

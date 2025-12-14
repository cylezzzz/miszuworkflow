'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestRelevantNodes } from '@/ai/flows/suggest-relevant-nodes';
import { NODE_REGISTRY } from '@/lib/mock-data';

interface AiToolsProps {
  onGenerateWorkflow: (prompt: string) => Promise<void>;
}

export default function AiTools({ onGenerateWorkflow }: AiToolsProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
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
    await onGenerateWorkflow(prompt);
    setIsGenerating(false);
  };
  
  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      // In a real app, you'd pass the current workflow state.
      // For this demo, we'll use a placeholder.
      const result = await suggestRelevantNodes({
        currentWorkflow: JSON.stringify({ nodes: [], edges: [] }),
        taskRequirements: "Create a workflow that gets data from an API and sends an email.",
      });
      
      const availableNodes = Object.keys(NODE_REGISTRY);
      const suggestions = result.suggestedNodes.filter(node => availableNodes.includes(node));

      toast({
        title: "KI-Vorschläge",
        description: (
          <div className="flex flex-col gap-2">
            <p>Die KI schlägt vor, diese Knoten hinzuzufügen:</p>
            <ul className="list-disc pl-5">
              {suggestions.map(node => <li key={node}>{NODE_REGISTRY[node]?.label || node}</li>)}
            </ul>
          </div>
        )
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Vorschlag fehlgeschlagen",
        description: "KI-Vorschläge konnten zu diesem Zeitpunkt nicht abgerufen werden.",
      });
    }
    setIsSuggesting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
          <Bot className="h-5 w-5 text-primary" />
          Mit KI generieren
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Beschreiben Sie den Workflow, den Sie erstellen möchten, und lassen Sie ihn von der KI erstellen.
        </p>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="z.B., 'Wenn sich ein neuer Benutzer anmeldet, senden Sie ihm eine Willkommens-E-Mail und fügen Sie ihn zum CRM hinzu.'"
          className="mt-2 min-h-[100px]"
        />
        <Button onClick={handleGenerate} disabled={isGenerating} className="mt-2 w-full">
          {isGenerating ? 'Wird generiert...' : <><Sparkles className="mr-2 h-4 w-4" /> Workflow generieren</>}
        </Button>
      </div>
      <div>
        <h3 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Knotenvorschläge
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
            Erhalten Sie Empfehlungen für den nächsten Knoten, den Sie Ihrem Workflow hinzufügen können.
        </p>
        <Button onClick={handleSuggest} disabled={isSuggesting} variant="outline" className="mt-2 w-full">
            {isSuggesting ? 'Denken...' : 'Knoten vorschlagen'}
        </Button>
      </div>
    </div>
  );
}

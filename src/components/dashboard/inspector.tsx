'use client';

import type { Node } from '@/lib/types';
import { NODE_REGISTRY } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import AiTools from './ai-tools';

interface InspectorProps {
  selectedNode: Node | null;
  onGenerateWorkflow: (prompt: string) => Promise<void>;
  onNodeDataChange: (nodeId: string, data: any) => void;
}

export function Inspector({ selectedNode, onGenerateWorkflow, onNodeDataChange }: InspectorProps) {
  const spec = selectedNode ? NODE_REGISTRY[selectedNode.type] : null;

  const handleDataChange = (key: string, value: any) => {
    if (selectedNode) {
      onNodeDataChange(selectedNode.id, { [key]: value });
    }
  };

  return (
    <aside className="w-80 border-l bg-card p-4 overflow-y-auto">
      <h2 className="font-headline text-xl font-semibold">Inspektor</h2>
      <Separator className="my-4" />

      {selectedNode && spec ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <spec.icon className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">{spec.label}</CardTitle>
            </div>
            <CardDescription>{spec.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="node-id">Node ID</Label>
              <Input id="node-id" value={selectedNode.id} readOnly />
            </div>
             {spec.inputs.filter(i => i.widget).map(input => (
              <div key={input.name} className="space-y-2">
                <Label htmlFor={`widget-${input.name}`}>{input.label || input.name}</Label>
                {input.widget === 'textarea' ? (
                   <Textarea
                    id={`widget-${input.name}`}
                    value={selectedNode.data?.[input.name] || ''}
                    onChange={(e) => handleDataChange(input.name, e.target.value)}
                    placeholder={input.placeholder}
                    className="min-h-[120px] font-mono text-xs"
                  />
                ) : (
                  <Input
                    id={`widget-${input.name}`}
                    type={input.widget === 'number' ? 'number' : 'text'}
                    value={selectedNode.data?.[input.name] || ''}
                    onChange={(e) => handleDataChange(input.name, e.target.value)}
                    placeholder={input.placeholder}
                  />
                )}
              </div>
            ))}
            {spec.inputs.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium">Eingänge</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {spec.inputs.map(input => <li key={input.name}>{input.name}: <span className="font-mono text-xs">{input.type}</span></li>)}
                    </ul>
                </div>
            )}
             {spec.outputs.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium">Ausgänge</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {spec.outputs.map(output => <li key={output.name}>{output.name}: <span className="font-mono text-xs">{output.type}</span></li>)}
                    </ul>
                </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <AiTools onGenerateWorkflow={onGenerateWorkflow} />
      )}
    </aside>
  );
}

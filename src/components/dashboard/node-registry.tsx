'use client';

import { NODE_REGISTRY } from '@/lib/mock-data';
import type { NodeCategory, NodeSpec } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

type NodeRegistryProps = {
  onAddNode: (nodeType: string) => void;
};

const categories: NodeCategory[] = ["Trigger", "Action", "Logic", "Output"];
const categoryTranslations: Record<NodeCategory, string> = {
    Trigger: "Auslöser",
    Action: "Aktion",
    Logic: "Logik",
    Output: "Ausgabe",
};


export function NodeRegistry({ onAddNode }: NodeRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredNodes = Object.values(NODE_REGISTRY).filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-80 border-r bg-card h-full flex flex-col">
      <div className="p-4">
        <h2 className="font-headline text-xl font-semibold">Knoten</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Knoten suchen..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4 pt-0">
          {categories.map((category) => {
             const nodesInCategory = filteredNodes.filter(node => node.category === category);
             if (nodesInCategory.length === 0) return null;

             return (
              <div key={category}>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{categoryTranslations[category]}</h3>
                <div className="space-y-2">
                  {nodesInCategory.map((node: NodeSpec) => (
                    <Card
                      key={node.type}
                      className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-primary active:cursor-pointer"
                      onDoubleClick={() => onAddNode(node.type)}
                      onClick={() => onAddNode(node.type)}
                    >
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-3">
                        <node.icon className="h-6 w-6 shrink-0 text-primary" />
                        <div>
                          <CardTitle className="text-sm font-semibold">{node.label}</CardTitle>
                          <CardDescription className="text-xs">{node.description}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

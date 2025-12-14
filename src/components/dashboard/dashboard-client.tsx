'use client';

import { useState, useCallback, useId } from 'react';
import type { Node, Edge } from '@/lib/types';
import { NodeRegistry } from './node-registry';
import { Canvas } from './canvas';
import { Inspector } from './inspector';
import { Button } from '@/components/ui/button';
import { Play, Share2, Save, Eraser, PanelLeft } from 'lucide-react';
import { generateWorkflowFromPrompt } from '@/ai/flows/generate-workflow-from-prompt';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AiChat from './ai-chat';

const initialNodes: Node[] = [
  { id: '1', type: 'trigger-http', position: { x: 50, y: 150 }, data: {} },
  { id: '3', type: 'action-function', position: { x: 350, y: 280 }, data: { code: 'return {\n  "message": "Hello from code!"\n};' } },
  { id: '2', type: 'action-log', position: { x: 650, y: 150 }, data: {} },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', sourceHandle: 'body', targetHandle: 'data' },
];

function DashboardLayout() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { toast } = useToast();
  const uniqueId = useId();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const addNode = useCallback((nodeType: string, position?: { x: number, y: number }) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: position || { x: Math.random() * 600, y: Math.random() * 400 },
      data: {},
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  const updateNodePosition = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, position: newPosition } : node
      )
    );
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, []);

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
    if(node) {
        setIsRightSidebarOpen(true);
    }
  }, []);

  const addEdge = useCallback((newEdge: Omit<Edge, 'id'>) => {
    setEdges((eds) => [...eds, { ...newEdge, id: `edge-${uniqueId}-${Math.random()}` }]);
  }, [uniqueId]);

  const generateWorkflow = async (prompt: string) => {
    try {
      const result = await generateWorkflowFromPrompt({ prompt });
      const workflow = JSON.parse(result.workflowJson);
      if (workflow.nodes && workflow.edges) {
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setSelectedNode(null);
        toast({
          title: "Workflow generiert",
          description: "Die KI hat einen neuen Workflow basierend auf Ihrer Eingabe erstellt.",
        });
      } else {
        throw new Error("Ungültiges Workflow-Format von der KI");
      }
    } catch (error) {
      console.error("Fehler beim Generieren des Workflows:", error);
      toast({
        variant: 'destructive',
        title: "Generierung fehlgeschlagen",
        description: "Die KI konnte aus Ihrer Eingabe keinen Workflow generieren. Bitte versuchen Sie es erneut.",
      });
    }
  }

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
     toast({
        title: "Arbeitsfläche geleert",
        description: "Bereit für einen Neuanfang!",
      });
  }

  const runWorkflow = () => {
    toast({
      title: "Workflow wird ausgeführt...",
      description: "Die Ausführung in Echtzeit wird in Kürze implementiert.",
    });
    // In a real implementation, you would send `nodes` and `edges` to a backend service for execution.
    console.log("Running workflow:", { nodes, edges });
  };


  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <div className="flex items-center justify-between border-b bg-background p-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger
            className="h-8 w-8"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          />
          <h1 className="font-headline text-lg font-semibold">Mein toller Workflow</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearCanvas}><Eraser className="mr-2 h-4 w-4" /> Leeren</Button>
          <Button variant="outline" size="sm"><Save className="mr-2 h-4 w-4" /> Speichern</Button>
          <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Teilen</Button>
          <Button size="sm" onClick={runWorkflow}><Play className="mr-2 h-4 w-4" /> Ausführen</Button>
        </div>
        <div className="flex items-center gap-2 px-4">
           <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          >
            <PanelLeft className="h-5 w-5 rotate-180" />
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <SidebarProvider open={isLeftSidebarOpen} onOpenChange={setIsLeftSidebarOpen}>
          <Sidebar>
            <NodeRegistry onAddNode={(nodeType) => addNode(nodeType, { x: 400, y: 300})} />
          </Sidebar>
        </SidebarProvider>
        <div className="flex-1 bg-background relative">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodeMove={updateNodePosition}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNode?.id}
            onConnect={addEdge}
            onNodeDataChange={updateNodeData}
            onAddNode={addNode}
          />
          <AiChat onGenerateWorkflow={generateWorkflow} />
        </div>
        <SidebarProvider open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen}>
            <Sidebar side="right">
                 <Inspector selectedNode={selectedNode} onGenerateWorkflow={generateWorkflow} onNodeDataChange={updateNodeData} />
            </Sidebar>
        </SidebarProvider>
      </div>
    </div>
  );
}

export function DashboardClient() {
  return (
    <SidebarProvider>
      <DashboardLayout />
    </SidebarProvider>
  );
}

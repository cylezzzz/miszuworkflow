'use client';

import { useState, useCallback, useId, useEffect } from 'react';
import type { Node, Edge } from '@/lib/types';
import { NodeRegistry } from './node-registry';
import { Canvas } from './canvas';
import { Inspector } from './inspector';
import { Button } from '@/components/ui/button';
import { Play, Share2, Save, Eraser, PanelLeft, Download, Upload, Sparkles } from 'lucide-react';
import { generateWorkflowFromPrompt } from '@/ai/flows/generate-workflow-from-prompt';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar';
import VoiceAgent from './voice-agent';
import { workflowDB } from '@/lib/db';

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
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Mein toller Workflow');
  const { toast } = useToast();
  const uniqueId = useId();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Load from local DB on mount
  useEffect(() => {
    const loadLastWorkflow = async () => {
      try {
        const workflows = await workflowDB.getAllWorkflows();
        if (workflows.length > 0) {
          const last = workflows[0];
          setNodes(last.nodes);
          setEdges(last.edges);
          setCurrentWorkflowId(last.id);
          setWorkflowName(last.name);
          
          toast({
            title: 'Workflow geladen',
            description: `"${last.name}" wurde wiederhergestellt.`,
          });
        }
      } catch (error) {
        console.error('Failed to load workflow:', error);
      }
    };

    loadLastWorkflow();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (nodes.length > 0) {
        try {
          const workflowId = currentWorkflowId || `workflow-${Date.now()}`;
          await workflowDB.saveWorkflow({
            id: workflowId,
            name: workflowName,
            description: `Auto-saved workflow with ${nodes.length} nodes`,
            nodes,
            edges,
          });
          
          if (!currentWorkflowId) {
            setCurrentWorkflowId(workflowId);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [nodes, edges, currentWorkflowId, workflowName]);

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
    if (node) {
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
          title: '✨ Workflow generiert',
          description: 'Die KI hat einen neuen Workflow basierend auf deiner Eingabe erstellt.',
        });
      } else {
        throw new Error('Ungültiges Workflow-Format von der KI');
      }
    } catch (error) {
      console.error('Fehler beim Generieren des Workflows:', error);
      toast({
        variant: 'destructive',
        title: 'Generierung fehlgeschlagen',
        description: 'Die KI konnte aus deiner Eingabe keinen Workflow generieren. Versuch es mit mehr Details.',
      });
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    toast({
      title: '🧹 Canvas geleert',
      description: 'Bereit für einen Neuanfang!',
    });
  };

  const saveWorkflow = async () => {
    try {
      const workflowId = currentWorkflowId || `workflow-${Date.now()}`;
      await workflowDB.saveWorkflow({
        id: workflowId,
        name: workflowName,
        description: `Workflow with ${nodes.length} nodes and ${edges.length} connections`,
        nodes,
        edges,
        verificationStatus: 'draft',
      });

      if (!currentWorkflowId) {
        setCurrentWorkflowId(workflowId);
      }

      toast({
        title: '💾 Workflow gespeichert',
        description: `"${workflowName}" wurde lokal gespeichert.`,
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        variant: 'destructive',
        title: 'Speichern fehlgeschlagen',
        description: 'Fehler beim Speichern des Workflows.',
      });
    }
  };

  const exportWorkflow = async () => {
    try {
      const data = await workflowDB.exportAll();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miszu-workflows-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: '📦 Export erfolgreich',
        description: 'Alle Workflows wurden exportiert.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export fehlgeschlagen',
      });
    }
  };

  const importWorkflow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await workflowDB.importAll(text);
        
        // Reload current workflow
        const workflows = await workflowDB.getAllWorkflows();
        if (workflows.length > 0) {
          const last = workflows[0];
          setNodes(last.nodes);
          setEdges(last.edges);
          setWorkflowName(last.name);
        }

        toast({
          title: '📥 Import erfolgreich',
          description: 'Workflows wurden importiert.',
        });
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          variant: 'destructive',
          title: 'Import fehlgeschlagen',
        });
      }
    };
    input.click();
  };

  const runWorkflow = async () => {
    const runId = `run-${Date.now()}`;
    
    // Add to history
    await workflowDB.addHistory({
      id: runId,
      workflowId: currentWorkflowId || 'unknown',
      workflowName,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    toast({
      title: '⚡ Workflow wird ausgeführt...',
      description: 'Die Ausführung in Echtzeit wird in Kürze implementiert.',
    });

    // Simulate execution
    setTimeout(async () => {
      await workflowDB.addHistory({
        id: runId,
        workflowId: currentWorkflowId || 'unknown',
        workflowName,
        status: 'success',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: '2.5s',
      });
    }, 2500);

    console.log('Running workflow:', { nodes, edges });
  };

  // Handle voice commands
  const handleVoiceCommand = (command: { type: string; params?: any }) => {
    switch (command.type) {
      case 'add_node':
        if (command.params?.nodeType) {
          addNode(command.params.nodeType, { x: 400, y: 300 });
          toast({
            title: '➕ Node hinzugefügt',
            description: `${command.params.nodeType} wurde erstellt.`,
          });
        }
        break;
      case 'run':
        runWorkflow();
        break;
      case 'save':
        saveWorkflow();
        break;
      case 'clear':
        clearCanvas();
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-sm p-2 panel-cyber">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger
            className="h-8 w-8"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="font-headline text-lg font-semibold bg-transparent border-none outline-none text-neon max-w-xs truncate"
          />
          <Sparkles className="h-4 w-4 text-neon-yellow" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={importWorkflow} className="btn-neon">
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={exportWorkflow} className="btn-neon">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearCanvas} className="btn-neon">
            <Eraser className="mr-2 h-4 w-4" /> Leeren
          </Button>
          <Button variant="outline" size="sm" onClick={saveWorkflow} className="btn-neon">
            <Save className="mr-2 h-4 w-4" /> Speichern
          </Button>
          <Button variant="outline" size="sm" className="btn-neon">
            <Share2 className="mr-2 h-4 w-4" /> Teilen
          </Button>
          <Button size="sm" onClick={runWorkflow} className="btn-neon shadow-neon-md">
            <Play className="mr-2 h-4 w-4" /> Ausführen
          </Button>
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
            <NodeRegistry onAddNode={(nodeType) => addNode(nodeType, { x: 400, y: 300 })} />
          </Sidebar>
        </SidebarProvider>
        <div className="flex-1 bg-cyber-grid relative scan-line">
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
          <VoiceAgent 
            onGenerateWorkflow={generateWorkflow}
            onCommand={handleVoiceCommand}
          />
        </div>
        <SidebarProvider open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen}>
          <Sidebar side="right">
            <Inspector 
              selectedNode={selectedNode} 
              onGenerateWorkflow={generateWorkflow} 
              onNodeDataChange={updateNodeData} 
            />
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

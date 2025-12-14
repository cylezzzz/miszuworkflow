'use client';

import { useState, useCallback, useRef, MouseEvent as ReactMouseEvent } from 'react';
import type { Node, Edge } from '@/lib/types';
import { NodeComponent, HANDLE_SIZE } from './node-component';
import { NODE_REGISTRY } from '@/lib/mock-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NodeRegistry } from './node-registry';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeSelect: (node: Node | null) => void;
  selectedNodeId?: string;
  onConnect: (edge: Omit<Edge, 'id'>) => void;
  onNodeDataChange: (nodeId: string, data: any) => void;
  onAddNode: (nodeType: string, position: { x: number; y: number }) => void;
}

const getHandlePosition = (node: Node, handleName: string, type: 'input' | 'output') => {
    const spec = NODE_REGISTRY[node.type];
    if (!spec) return { x: 0, y: 0 };

    const handles = type === 'input' ? spec.inputs : spec.outputs;
    const handleIndex = handles.findIndex(h => h.name === handleName);
    
    // Base position of first handle
    let yOffset = 40;

    for (let i = 0; i < handleIndex; i++) {
        const handleSpec = handles[i];
        if (handleSpec.widget) {
            yOffset += 40; // Add space for widget
        } else {
            yOffset += 24; // Default space for connection
        }
    }

    const x = type === 'input' ? node.position.x : node.position.x + (spec.width || 250);
    const y = node.position.y + yOffset;

    return { x, y };
};


const getEdgePath = (sourceNode: Node, sourceHandleName: string, targetNode: Node, targetHandleName:string) => {
    const sourcePos = getHandlePosition(sourceNode, sourceHandleName, 'output');
    const targetPos = getHandlePosition(targetNode, targetHandleName, 'input');
    
    const dx = Math.abs(sourcePos.x - targetPos.x);
    const handleOffset = Math.max(50, dx / 2);

    return `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + handleOffset} ${sourcePos.y}, ${targetPos.x - handleOffset} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
};


export function Canvas({ nodes, edges, onNodeMove, onNodeSelect, selectedNodeId, onConnect, onNodeDataChange, onAddNode }: CanvasProps) {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState<{ sourceId: string, sourceHandle: string, position: { x: number, y: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>, nodeId: string) => {
    if (e.target instanceof HTMLElement && (e.target.closest('.node-handle') || e.target.closest('.node-widget'))) {
        return; // Don't drag node if handle or widget is clicked
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (node && canvasRef.current) {
      setDraggingNode(nodeId);
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - canvasRect.left - node.position.x;
      const offsetY = e.clientY - canvasRect.top - node.position.y;
      setDragOffset({ x: offsetX, y: offsetY });
      onNodeSelect(node);
    }
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isConnecting && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        setIsConnecting({
            ...isConnecting,
            position: {
                x: e.clientX - canvasRect.left,
                y: e.clientY - canvasRect.top
            }
        });
    }
    if (!draggingNode || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    onNodeMove(draggingNode, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };
  
  const handleCanvasClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
        onNodeSelect(null);
    }
    if(isConnecting) {
        setIsConnecting(null);
    }
  };
  
  const handleDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target !== canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setPopoverPosition({ x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top });
    setPopoverOpen(true);
  };
  
  const handleAddNodeFromPopover = (nodeType: string) => {
    onAddNode(nodeType, popoverPosition);
    setPopoverOpen(false);
  };


  const onStartConnect = useCallback((sourceId: string, sourceHandle: string, e: ReactMouseEvent) => {
    if(!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    setIsConnecting({
      sourceId,
      sourceHandle,
      position: { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top },
    });
    e.stopPropagation();
  }, []);

  const onEndConnect = useCallback((targetId: string, targetHandle: string) => {
    if (isConnecting) {
      onConnect({
        source: isConnecting.sourceId,
        sourceHandle: isConnecting.sourceHandle,
        target: targetId,
        targetHandle,
      });
    }
    setIsConnecting(null);
  }, [isConnecting, onConnect]);
  
  const connectingPath = () => {
      if (!isConnecting) return null;
      const sourceNode = nodes.find(n => n.id === isConnecting.sourceId);
      if(!sourceNode) return null;

      const sourcePos = getHandlePosition(sourceNode, isConnecting.sourceHandle, 'output');
      const targetPos = isConnecting.position;
      
      const dx = Math.abs(sourcePos.x - targetPos.x);
      const handleOffset = Math.max(50, dx / 2);

      return `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + handleOffset} ${sourcePos.y}, ${targetPos.x - handleOffset} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
  }


  return (
    <div
      ref={canvasRef}
      className="h-full w-full bg-grid-slate-200/50 dark:bg-grid-slate-700/50"
      style={{ backgroundSize: '20px 20px' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDoubleClick={handleDoubleClick}
    >
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div style={{ position: 'absolute', left: popoverPosition.x, top: popoverPosition.y }}/>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" side="right" align="start">
              <NodeRegistry onAddNode={handleAddNodeFromPopover} />
          </PopoverContent>
      </Popover>
      {nodes.map((node) => (
        <NodeComponent
          key={node.id}
          node={node}
          onMouseDown={(e) => handleMouseDown(e, node.id)}
          isSelected={node.id === selectedNodeId}
          onStartConnect={onStartConnect}
          onEndConnect={onEndConnect}
          onDataChange={(newData) => onNodeDataChange(node.id, newData)}
        />
      ))}
       <svg className="absolute top-0 left-0 h-full w-full pointer-events-none">
        {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            
            const path = getEdgePath(sourceNode, edge.sourceHandle, targetNode, edge.targetHandle);

            return <path key={edge.id} d={path} stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />;
        })}
        {isConnecting && (
          <path
            d={connectingPath()}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  );
}

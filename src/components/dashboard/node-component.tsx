'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Node as NodeType } from '@/lib/types';
import { NODE_REGISTRY } from '@/lib/mock-data';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface NodeProps {
  node: NodeType;
  onMouseDown: (e: ReactMouseEvent) => void;
  isSelected: boolean;
  onStartConnect: (sourceId: string, sourceHandle: string, e: ReactMouseEvent) => void;
  onEndConnect: (targetId: string, targetHandle: string) => void;
  onDataChange: (data: any) => void;
}

export const HANDLE_SIZE = 10;

export function NodeComponent({ node, onMouseDown, isSelected, onStartConnect, onEndConnect, onDataChange }: NodeProps) {
  const spec = NODE_REGISTRY[node.type];
  if (!spec) return null;

  const renderWidget = (inputSpec: any) => {
    const value = node.data?.[inputSpec.name] || '';
    
    switch(inputSpec.widget) {
      case 'string':
        return (
          <div className="nodrag nopan space-y-1 node-widget">
            <Label className="text-xs px-1">{inputSpec.label || inputSpec.name}</Label>
            <Input 
              type="text" 
              value={value}
              onChange={(e) => onDataChange({ [inputSpec.name]: e.target.value })}
              className="h-8 text-xs"
              placeholder={inputSpec.placeholder}
            />
          </div>
        );
      case 'textarea':
         return (
          <div className="nodrag nopan space-y-1 node-widget">
            <Label className="text-xs px-1">{inputSpec.label || inputSpec.name}</Label>
            <Textarea
              value={value}
              onChange={(e) => onDataChange({ [inputSpec.name]: e.target.value })}
              className="text-xs font-mono min-h-[60px] resize-y"
              placeholder={inputSpec.placeholder}
            />
          </div>
        );
      case 'number':
        return (
           <div className="nodrag nopan space-y-1 node-widget">
            <Label className="text-xs px-1">{inputSpec.label || inputSpec.name}</Label>
            <Input 
              type="number" 
              value={value}
              onChange={(e) => onDataChange({ [inputSpec.name]: e.target.value })}
              className="h-8 text-xs"
              placeholder={inputSpec.placeholder}
            />
          </div>
        );
      default:
        return (
            <div className="text-xs text-muted-foreground flex items-center h-[24px]">{inputSpec.label || inputSpec.name}</div>
        );
    }
  }
  
  let yOffset = 40; // Initial offset for handles

  return (
    <Card
      className={cn(
        'absolute cursor-pointer select-none rounded-lg shadow-lg transition-all duration-200 border-2 border-transparent',
        isSelected ? 'border-primary shadow-primary/30' : 'hover:shadow-xl bg-card'
      )}
      style={{ left: node.position.x, top: node.position.y, width: spec.width || 250 }}
      onMouseDown={onMouseDown}
    >
      <CardHeader className="flex flex-row items-center space-x-2 space-y-0 bg-muted/50 p-2 rounded-t-md">
        <spec.icon className="h-4 w-4 text-primary" />
        <CardTitle className="truncate text-sm font-semibold">{spec.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-xs space-y-2">
         {spec.inputs.map((input) => {
             const height = input.widget ? 40 : 24;
             const component = (
                <div key={input.name} className="relative flex items-center" style={{ height: `${height}px` }}>
                    <div
                      className="node-handle absolute bg-background"
                      style={{
                        left: `-${HANDLE_SIZE / 2}px`,
                        top: `50%`,
                        transform: 'translateY(-50%)',
                        width: `${HANDLE_SIZE}px`,
                        height: `${HANDLE_SIZE}px`,
                        borderRadius: '50%',
                        border: '2px solid hsl(var(--primary))',
                      }}
                      onMouseUp={(e) => { e.stopPropagation(); onEndConnect(node.id, input.name)}}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    <div className="w-full pl-4">
                        {renderWidget(input)}
                    </div>
                </div>
             );
             yOffset += height;
             return component;
         })}
        
        {spec.outputs.map((output, index) => {
          const height = 24;
          const component = (
            <div key={output.name} className="relative flex items-center justify-end" style={{ height: `${height}px` }}>
                <div className="text-xs text-muted-foreground pr-4">{output.label || output.name}</div>
                 <div
                    className="node-handle absolute bg-background"
                    style={{
                        right: `-${HANDLE_SIZE / 2}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: `${HANDLE_SIZE}px`,
                        height: `${HANDLE_SIZE}px`,
                        borderRadius: '50%',
                        border: '2px solid hsl(var(--primary))',
                    }}
                    onMouseDown={(e) => onStartConnect(node.id, output.name, e)}
                />
            </div>
          );
          yOffset += height;
          return component;
        })}
      </CardContent>
    </Card>
  );
}

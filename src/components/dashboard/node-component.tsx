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

export const HANDLE_SIZE = 12;

export function NodeComponent({ node, onMouseDown, isSelected, onStartConnect, onEndConnect, onDataChange }: NodeProps) {
  const spec = NODE_REGISTRY[node.type];
  if (!spec) return null;

  const renderWidget = (inputSpec: any) => {
    const value = node.data?.[inputSpec.name] || '';
    
    switch(inputSpec.widget) {
      case 'string':
        return (
          <div className="nodrag nopan space-y-1 node-widget">
            <Label className="text-xs px-1 text-muted-foreground">{inputSpec.label || inputSpec.name}</Label>
            <Input 
              type="text" 
              value={value}
              onChange={(e) => onDataChange({ [inputSpec.name]: e.target.value })}
              className="h-8 text-xs input-cyber bg-background/30"
              placeholder={inputSpec.placeholder}
            />
          </div>
        );
      case 'textarea':
         return (
          <div className="nodrag nopan space-y-1 node-widget">
            <Label className="text-xs px-1 text-muted-foreground">{inputSpec.label || inputSpec.name}</Label>
            <Textarea
              value={value}
              onChange={(e) => onDataChange({ [inputSpec.name]: e.target.value })}
              className="text-xs font-mono min-h-[60px] resize-y input-cyber bg-background/30"
              placeholder={inputSpec.placeholder}
            />
          </div>
        );
      case 'number':
        return (
           <div className="nodrag nopan space-y-1 node-widget">
            <Label className="text-xs px-1 text-muted-foreground">{inputSpec.label || inputSpec.name}</Label>
            <Input 
              type="number" 
              value={value}
              onChange={(e) => onDataChange({ [inputSpec.name]: e.target.value })}
              className="h-8 text-xs input-cyber bg-background/30"
              placeholder={inputSpec.placeholder}
            />
          </div>
        );
      default:
        return (
          <div className="text-xs text-muted-foreground flex items-center h-[24px] px-1">
            {inputSpec.label || inputSpec.name}
          </div>
        );
    }
  };
  
  let yOffset = 40;

  // Get category color
  const getCategoryColor = () => {
    switch (spec.category) {
      case 'Trigger': return 'neon-cyan';
      case 'Action': return 'neon-green';
      case 'Logic': return 'neon-yellow';
      case 'Output': return 'neon-magenta';
      default: return 'primary';
    }
  };

  const categoryColor = getCategoryColor();

  return (
    <Card
      className={cn(
        'absolute cursor-pointer select-none rounded-xl shadow-xl transition-all duration-200 node-cyber',
        'border-2 backdrop-blur-sm',
        isSelected 
          ? `border-${categoryColor}/80 shadow-neon-lg ring-2 ring-${categoryColor}/30` 
          : `border-${categoryColor}/30 hover:border-${categoryColor}/50 hover:shadow-neon-md`,
        'bg-card/90'
      )}
      style={{ 
        left: node.position.x, 
        top: node.position.y, 
        width: spec.width || 250,
      }}
      onMouseDown={onMouseDown}
    >
      <CardHeader className={cn(
        "flex flex-row items-center space-x-2 space-y-0 p-2 rounded-t-xl",
        "bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm",
        `border-b border-${categoryColor}/20`
      )}>
        <div className={cn(
          "p-1.5 rounded-lg",
          `bg-${categoryColor}/10 border border-${categoryColor}/30`
        )}>
          <spec.icon className={`h-4 w-4 text-${categoryColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className={cn(
            "truncate text-sm font-semibold font-headline",
            `text-${categoryColor}`
          )}>
            {spec.label}
          </CardTitle>
          <p className="text-[10px] text-muted-foreground truncate">
            {spec.category}
          </p>
        </div>
        {isSelected && (
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            `bg-${categoryColor}`
          )} />
        )}
      </CardHeader>
      
      <CardContent className="p-2 text-xs space-y-2 scrollbar-cyber">
        {/* Inputs */}
        {spec.inputs.map((input) => {
          const height = input.widget ? 40 : 24;
          const component = (
            <div key={input.name} className="relative flex items-center group" style={{ height: `${height}px` }}>
              {/* Input Handle */}
              <div
                className={cn(
                  "node-handle absolute bg-card/90 cursor-crosshair transition-all z-10",
                  "border-2 group-hover:scale-125",
                  `border-${categoryColor}/50 hover:border-${categoryColor} hover:shadow-neon-sm`
                )}
                style={{
                  left: `-${HANDLE_SIZE / 2}px`,
                  top: `50%`,
                  transform: 'translateY(-50%)',
                  width: `${HANDLE_SIZE}px`,
                  height: `${HANDLE_SIZE}px`,
                  borderRadius: '50%',
                }}
                onMouseUp={(e) => { 
                  e.stopPropagation(); 
                  onEndConnect(node.id, input.name);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title={`${input.name} (${input.type})`}
              >
                <div className={cn(
                  "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  `bg-${categoryColor}/20 animate-ping`
                )} />
              </div>
              
              {/* Widget/Label */}
              <div className="w-full pl-4">
                {renderWidget(input)}
              </div>
            </div>
          );
          yOffset += height;
          return component;
        })}
        
        {/* Outputs */}
        {spec.outputs.map((output) => {
          const height = 24;
          const component = (
            <div key={output.name} className="relative flex items-center justify-end group" style={{ height: `${height}px` }}>
              <div className="text-xs text-muted-foreground pr-4 truncate" title={output.name}>
                {output.label || output.name}
              </div>
              
              {/* Output Handle */}
              <div
                className={cn(
                  "node-handle absolute bg-card/90 cursor-crosshair transition-all z-10",
                  "border-2 group-hover:scale-125",
                  `border-${categoryColor}/50 hover:border-${categoryColor} hover:shadow-neon-sm`
                )}
                style={{
                  right: `-${HANDLE_SIZE / 2}px`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${HANDLE_SIZE}px`,
                  height: `${HANDLE_SIZE}px`,
                  borderRadius: '50%',
                }}
                onMouseDown={(e) => onStartConnect(node.id, output.name, e)}
                title={`${output.name} (${output.type})`}
              >
                <div className={cn(
                  "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                  `bg-${categoryColor}/20 animate-ping`
                )} />
              </div>
            </div>
          );
          yOffset += height;
          return component;
        })}
      </CardContent>

      {/* Node ID Badge (only when selected) */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-card border border-primary/30 text-[10px] font-mono text-muted-foreground">
          {node.id.split('-')[0]}
        </div>
      )}
    </Card>
  );
}

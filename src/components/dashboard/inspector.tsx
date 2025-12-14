"use client"

import React from 'react'
import { Settings2, X, Trash2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NodeWidget {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea'
  value?: string | number | boolean
  options?: string[]
  placeholder?: string
}

interface SelectedNode {
  id: string
  type: string
  data: {
    label: string
    widgets?: NodeWidget[]
  }
}

interface PropertiesInspectorProps {
  selectedNode: SelectedNode | null
  onUpdateNode?: (nodeId: string, data: any) => void
  onDeleteNode?: (nodeId: string) => void
  onDuplicateNode?: (nodeId: string) => void
  onClose?: () => void
}

export function PropertiesInspector({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onClose
}: PropertiesInspectorProps) {
  const [copiedId, setCopiedId] = React.useState(false)
  
  const handleCopyId = () => {
    if (selectedNode) {
      navigator.clipboard.writeText(selectedNode.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }
  
  const handleWidgetChange = (widgetName: string, value: any) => {
    if (!selectedNode || !onUpdateNode) return
    
    const updatedWidgets = selectedNode.data.widgets?.map(w =>
      w.name === widgetName ? { ...w, value } : w
    )
    
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      widgets: updatedWidgets
    })
  }
  
  const renderWidget = (widget: NodeWidget) => {
    const value = widget.value ?? ''
    
    switch (widget.type) {
      case 'textarea':
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => handleWidgetChange(widget.name, e.target.value)}
            placeholder={widget.placeholder}
            className="input-cyber font-mono text-sm min-h-[100px]"
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={Number(value)}
            onChange={(e) => handleWidgetChange(widget.name, Number(e.target.value))}
            placeholder={widget.placeholder}
            className="input-cyber"
          />
        )
      
      case 'select':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleWidgetChange(widget.name, e.target.value)}
            className="input-cyber w-full"
          >
            <option value="">Auswählen...</option>
            {widget.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      
      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleWidgetChange(widget.name, e.target.checked)}
              className="w-4 h-4 rounded border-2 border-primary/30 bg-card 
                       checked:bg-primary checked:border-primary
                       focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">
              {value ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
        )
      
      default: // string
        return (
          <Input
            type="text"
            value={String(value)}
            onChange={(e) => handleWidgetChange(widget.name, e.target.value)}
            placeholder={widget.placeholder}
            className="input-cyber"
          />
        )
    }
  }
  
  if (!selectedNode) {
    return (
      <div className="panel-cyber h-full w-[320px] flex flex-col border-l">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Eigenschaften
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Settings2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-2">
              Kein Knoten ausgewählt
            </p>
            <p className="text-xs text-muted-foreground/60">
              Wähle einen Knoten aus um die Eigenschaften zu bearbeiten
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="panel-cyber h-full w-[320px] flex flex-col border-l">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            Eigenschaften
          </h2>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground border-b border-border/30 pb-2">
            Node Information
          </h3>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Typ</Label>
            <div className="text-sm font-medium text-foreground bg-muted/50 px-3 py-2 rounded border border-border/30">
              {selectedNode.data.label}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center justify-between">
              Node ID
              <button
                onClick={handleCopyId}
                className="text-primary hover:text-primary/80 transition-colors"
                title="ID kopieren"
              >
                {copiedId ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </Label>
            <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-2 rounded border border-border/30 truncate">
              {selectedNode.id}
            </div>
          </div>
        </div>
        
        {/* Widgets */}
        {selectedNode.data.widgets && selectedNode.data.widgets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border/30 pb-2">
              Konfiguration
            </h3>
            
            {selectedNode.data.widgets.map(widget => (
              <div key={widget.name} className="space-y-2">
                <Label htmlFor={widget.name} className="text-xs text-muted-foreground">
                  {widget.label}
                </Label>
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground border-b border-border/30 pb-2">
            Aktionen
          </h3>
          
          <div className="space-y-2">
            {onDuplicateNode && (
              <Button
                onClick={() => onDuplicateNode(selectedNode.id)}
                variant="outline"
                className="w-full justify-start gap-2 border-border/50 hover:border-primary/30"
              >
                <Copy className="w-4 h-4" />
                Duplizieren
              </Button>
            )}
            
            {onDeleteNode && (
              <Button
                onClick={() => onDeleteNode(selectedNode.id)}
                variant="outline"
                className="w-full justify-start gap-2 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Löschen
              </Button>
            )}
          </div>
        </div>
        
        {/* Help */}
        <div className="bg-muted/30 border border-border/30 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-foreground mb-2">
            💡 Tipps
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Knoten verschieben: Drag & Drop</li>
            <li>• Verbinden: Von Handle zu Handle ziehen</li>
            <li>• Löschen: Knoten auswählen + Entf-Taste</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export { PropertiesInspector as Inspector };

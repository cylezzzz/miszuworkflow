"use client"

import React from 'react'
import { 
  Download, 
  Upload, 
  Save, 
  Play, 
  Share2, 
  Settings,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  workflowName?: string
  onWorkflowNameChange?: (name: string) => void
  onImport?: () => void
  onExport?: () => void
  onSave?: () => void
  onRun?: () => void
  onShare?: () => void
  onSettings?: () => void
  isRunning?: boolean
  isSaving?: boolean
}

export function DashboardHeader({
  workflowName = 'Unbenannter Workflow',
  onWorkflowNameChange,
  onImport,
  onExport,
  onSave,
  onRun,
  onShare,
  onSettings,
  isRunning = false,
  isSaving = false
}: HeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedName, setEditedName] = React.useState(workflowName)
  
  const handleNameClick = () => {
    setIsEditing(true)
    setEditedName(workflowName)
  }
  
  const handleNameSubmit = () => {
    if (editedName.trim()) {
      onWorkflowNameChange?.(editedName.trim())
    }
    setIsEditing(false)
  }
  
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditedName(workflowName)
    }
  }
  
  return (
    <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 
                            border-2 border-primary/30 flex items-center justify-center
                            shadow-lg shadow-primary/20">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md -z-10" />
            </div>
            
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                MiSZU Workfield
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Workflow Builder
              </p>
            </div>
          </div>
          
          {/* Workflow Name */}
          <div className="h-10 flex items-center">
            <div className="h-full w-px bg-border/50 mx-2" />
            
            {isEditing ? (
              <Input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="h-8 w-[300px] bg-background/50 border-primary/30 focus:border-primary/50"
                autoFocus
              />
            ) : (
              <button
                onClick={handleNameClick}
                className="px-3 py-1.5 rounded-md hover:bg-muted/50 transition-colors
                         text-sm font-medium text-foreground group"
              >
                {workflowName}
                <span className="ml-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  ✏️
                </span>
              </button>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Import */}
          {onImport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onImport}
              className="gap-2 hover:bg-muted/50"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Import</span>
            </Button>
          )}
          
          {/* Export */}
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="gap-2 hover:bg-muted/50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
          )}
          
          {/* Save */}
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2 hover:bg-muted/50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
              <span className="hidden md:inline">
                {isSaving ? 'Speichert...' : 'Speichern'}
              </span>
            </Button>
          )}
          
          {/* Divider */}
          <div className="h-6 w-px bg-border/50 mx-1" />
          
          {/* Share */}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="gap-2 hover:bg-muted/50"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Teilen</span>
            </Button>
          )}
          
          {/* Settings */}
          {onSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="hover:bg-muted/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          
          {/* Divider */}
          <div className="h-6 w-px bg-border/50 mx-1" />
          
          {/* Run */}
          {onRun && (
            <Button
              onClick={onRun}
              disabled={isRunning}
              className="btn-neon gap-2 px-6"
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Läuft...' : 'Ausführen'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader;

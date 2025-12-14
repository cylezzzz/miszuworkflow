"use client"

import React from 'react'
import { 
  Zap, 
  Mail, 
  Database, 
  Code, 
  GitBranch, 
  Filter,
  MessageSquare,
  FileText,
  Server,
  Workflow
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Node {
  id: string
  type: string
  label: string
  description: string
  category: 'trigger' | 'action' | 'logic' | 'output'
  icon: React.ElementType
}

const NODES: Node[] = [
  // Triggers
  {
    id: 'trigger-http',
    type: 'trigger',
    label: 'HTTP Request',
    description: 'Triggers workflow on an incoming HTTP request',
    category: 'trigger',
    icon: Zap
  },
  {
    id: 'trigger-webhook',
    type: 'trigger',
    label: 'Webhook',
    description: 'Listen for webhook events',
    category: 'trigger',
    icon: Server
  },
  
  // Actions
  {
    id: 'action-log',
    type: 'action',
    label: 'Log to Console',
    description: 'Logs the input data to the console',
    category: 'action',
    icon: MessageSquare
  },
  {
    id: 'action-function',
    type: 'action',
    label: 'Function',
    description: 'Runs a JavaScript function',
    category: 'action',
    icon: Code
  },
  {
    id: 'action-email',
    type: 'action',
    label: 'Send Email',
    description: 'Sends an email using a configured SMTP service',
    category: 'action',
    icon: Mail
  },
  {
    id: 'action-db',
    type: 'action',
    label: 'Database Query',
    description: 'Executes a query against a connected database',
    category: 'action',
    icon: Database
  },
  
  // Logic
  {
    id: 'logic-router',
    type: 'logic',
    label: 'Router',
    description: 'Routes data to different branches based on conditions',
    category: 'logic',
    icon: GitBranch
  },
  {
    id: 'logic-if',
    type: 'logic',
    label: 'If/Else Branch',
    description: 'Splits the workflow based on a true/false condition',
    category: 'logic',
    icon: GitBranch
  },
  {
    id: 'logic-filter',
    type: 'logic',
    label: 'Filter Data',
    description: 'Filters an array of items based on a condition',
    category: 'logic',
    icon: Filter
  },
  {
    id: 'logic-code',
    type: 'logic',
    label: 'Run Code',
    description: 'Executes a custom JavaScript snippet',
    category: 'logic',
    icon: Code
  },
  
  // Output
  {
    id: 'output-response',
    type: 'output',
    label: 'HTTP Response',
    description: 'Sends a response back to the initial HTTP trigger',
    category: 'output',
    icon: MessageSquare
  },
  {
    id: 'output-file',
    type: 'output',
    label: 'Save File',
    description: 'Saves data to a file',
    category: 'output',
    icon: FileText
  }
]

const CATEGORY_COLORS: Record<string, string> = {
  trigger: 'neon-cyan',
  action: 'neon-green',
  logic: 'neon-yellow',
  output: 'neon-magenta'
}

interface NodeRegistryProps {
  onAddNode?: (nodeType: string) => void
}

export function NodeRegistry({ onAddNode }: NodeRegistryProps) {
  const [search, setSearch] = React.useState('')
  
  const filteredNodes = React.useMemo(() => {
    if (!search) return NODES
    const query = search.toLowerCase()
    return NODES.filter(node => 
      node.label.toLowerCase().includes(query) ||
      node.description.toLowerCase().includes(query) ||
      node.category.toLowerCase().includes(query)
    )
  }, [search])
  
  const groupedNodes = React.useMemo(() => {
    const groups: Record<string, Node[]> = {
      trigger: [],
      action: [],
      logic: [],
      output: []
    }
    
    filteredNodes.forEach(node => {
      groups[node.category].push(node)
    })
    
    return groups
  }, [filteredNodes])
  
  const handleNodeClick = (nodeType: string) => {
    onAddNode?.(nodeType)
  }
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      trigger: 'Auslöser',
      action: 'Aktion',
      logic: 'Logik',
      output: 'Ausgabe'
    }
    return labels[category] || category
  }
  
  return (
    <div className="panel-cyber h-full w-[280px] flex flex-col border-r">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-primary" />
          Knoten
        </h2>
        <p className="text-xs text-muted-foreground">
          Knoten suchen...
        </p>
      </div>
      
      {/* Search */}
      <div className="p-4">
        <Input
          type="text"
          placeholder="Knoten suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sidebar-search"
        />
      </div>
      
      {/* Node List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {Object.entries(groupedNodes).map(([category, nodes]) => {
          if (nodes.length === 0) return null
          
          return (
            <div key={category}>
              <div className="sidebar-category">
                {getCategoryLabel(category)}
              </div>
              
              <div className="space-y-2">
                {nodes.map(node => {
                  const Icon = node.icon
                  const colorClass = CATEGORY_COLORS[node.category]
                  
                  return (
                    <div
                      key={node.id}
                      className="sidebar-item"
                      onClick={() => handleNodeClick(node.type)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleNodeClick(node.type)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="sidebar-item-icon">
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="sidebar-item-title">
                            {node.label}
                          </div>
                          <div className="sidebar-item-description">
                            {node.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        
        {filteredNodes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Keine Knoten gefunden</p>
            <p className="text-xs mt-1">Versuche eine andere Suche</p>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-2">
            <span>Verfügbare Knoten:</span>
            <span className="font-bold text-primary">{NODES.length}</span>
          </div>
          <div className="text-[10px] opacity-60">
            💡 Tipp: Doppelklick auf Canvas für Schnellauswahl
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Plus } from 'lucide-react'

interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    inputs?: any[]
    outputs?: any[]
    widgets?: any[]
  }
}

interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

interface CanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onNodeClick?: (node: Node) => void
  onCanvasClick?: () => void
  onConnect?: (connection: { source: string; target: string }) => void
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onCanvasClick,
  onConnect
}: CanvasProps) {
  // Viewport State (Zoom & Pan)
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  // Node Dragging
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Connection
  const [connecting, setConnecting] = useState<{
    nodeId: string
    handleId: string
    handleType: 'source' | 'target'
  } | null>(null)
  const [connectionPos, setConnectionPos] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Screen to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (screenX - rect.left - viewport.x) / viewport.zoom,
      y: (screenY - rect.top - viewport.y) / viewport.zoom
    }
  }, [viewport])

  // Canvas to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    return {
      x: canvasX * viewport.zoom + viewport.x,
      y: canvasY * viewport.zoom + viewport.y
    }
  }, [viewport])

  // Zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 4)
    
    // Zoom towards mouse position
    const zoomRatio = newZoom / viewport.zoom
    const newX = mouseX - (mouseX - viewport.x) * zoomRatio
    const newY = mouseY - (mouseY - viewport.y) * zoomRatio

    setViewport({ x: newX, y: newY, zoom: newZoom })
  }, [viewport])

  // Pan canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Left mouse = Pan
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y })
    } else if (e.button === 0 && e.target === e.currentTarget) {
      // Left click on canvas background
      onCanvasClick?.()
    }
  }, [viewport, onCanvasClick])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setViewport(v => ({
        ...v,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }))
    } else if (draggedNode && onNodesChange) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      const updatedNodes = nodes.map(node =>
        node.id === draggedNode
          ? {
              ...node,
              position: {
                x: canvasPos.x - dragOffset.x,
                y: canvasPos.y - dragOffset.y
              }
            }
          : node
      )
      onNodesChange(updatedNodes)
    } else if (connecting) {
      setConnectionPos({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, draggedNode, connecting, panStart, nodes, onNodesChange, screenToCanvas, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggedNode(null)
    setConnecting(null)
  }, [])

  // Node drag start
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    if (e.button !== 0) return // Only left mouse button
    
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    const canvasPos = screenToCanvas(e.clientX, e.clientY)
    setDragOffset({
      x: canvasPos.x - node.position.x,
      y: canvasPos.y - node.position.y
    })
    setDraggedNode(nodeId)
    onNodeClick?.(node)
  }, [nodes, screenToCanvas, onNodeClick])

  // Reset viewport (Home button)
  const resetViewport = () => {
    setViewport({ x: 0, y: 0, zoom: 1 })
  }

  // Fit view to nodes
  const fitView = () => {
    if (nodes.length === 0) return
    
    const padding = 100
    const minX = Math.min(...nodes.map(n => n.position.x)) - padding
    const minY = Math.min(...nodes.map(n => n.position.y)) - padding
    const maxX = Math.max(...nodes.map(n => n.position.x + 200)) + padding
    const maxY = Math.max(...nodes.map(n => n.position.y + 150)) + padding
    
    const width = maxX - minX
    const height = maxY - minY
    
    const zoomX = canvasSize.width / width
    const zoomY = canvasSize.height / height
    const newZoom = Math.min(zoomX, zoomY, 1)
    
    setViewport({
      x: (canvasSize.width - width * newZoom) / 2 - minX * newZoom,
      y: (canvasSize.height - height * newZoom) / 2 - minY * newZoom,
      zoom: newZoom
    })
  }

  // Grid pattern
  const gridSize = 20
  const gridStyle = {
    backgroundSize: `${gridSize * viewport.zoom}px ${gridSize * viewport.zoom}px`,
    backgroundPosition: `${viewport.x}px ${viewport.y}px`
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 bg-cyber-grid cursor-grab active:cursor-grabbing"
        style={gridStyle}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform container */}
        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          {/* Edges */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
              <filter id="edge-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source)
              const targetNode = nodes.find(n => n.id === edge.target)
              if (!sourceNode || !targetNode) return null
              
              const startX = sourceNode.position.x + 200 // Node width
              const startY = sourceNode.position.y + 50
              const endX = targetNode.position.x
              const endY = targetNode.position.y + 50
              
              const controlPointOffset = Math.abs(endX - startX) * 0.5
              
              return (
                <path
                  key={edge.id}
                  d={`M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`}
                  stroke="url(#edge-gradient)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#edge-glow)"
                  className="transition-all duration-200"
                />
              )
            })}
            
            {/* Connecting line */}
            {connecting && (
              <line
                x1={connecting.nodeId ? (nodes.find(n => n.id === connecting.nodeId)?.position.x || 0) + 200 : 0}
                y1={connecting.nodeId ? (nodes.find(n => n.id === connecting.nodeId)?.position.y || 0) + 50 : 0}
                x2={(connectionPos.x - viewport.x) / viewport.zoom}
                y2={(connectionPos.y - viewport.y) / viewport.zoom}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute node-cyber rounded-lg p-4 cursor-move select-none"
              style={{
                left: node.position.x,
                top: node.position.y,
                width: 200,
                minHeight: 100
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <div className="text-sm font-semibold text-foreground mb-2">
                {node.data.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {node.type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={resetViewport}
          className="btn-neon px-3 py-2 rounded-lg text-sm font-medium"
          title="Reset View (Home)"
        >
          🏠
        </button>
        <button
          onClick={fitView}
          className="btn-neon px-3 py-2 rounded-lg text-sm font-medium"
          title="Fit View"
        >
          ⛶
        </button>
        <button
          onClick={() => setViewport(v => ({ ...v, zoom: Math.min(v.zoom * 1.2, 4) }))}
          className="btn-neon px-3 py-2 rounded-lg text-sm font-medium"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewport(v => ({ ...v, zoom: Math.max(v.zoom * 0.8, 0.1) }))}
          className="btn-neon px-3 py-2 rounded-lg text-sm font-medium"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-border/50">
        {Math.round(viewport.zoom * 100)}%
      </div>

      {/* Help text */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">Canvas ist leer</p>
            <p className="text-sm">Mausrad = Zoom | Shift + Ziehen = Pan | Linksklick = Node verschieben</p>
          </div>
        </div>
      )}
    </div>
  )
}
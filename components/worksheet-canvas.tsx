'use client'

import { useState, useCallback } from 'react'
import { 
  FileText, 
  Upload, 
  Sparkles, 
  BookOpen,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WorksheetCanvasProps {
  content: string
  onContentChange: (content: string) => void
  onSelectionChange?: (selection: string) => void
  isLoading?: boolean
}

// Sample study content for demo
const SAMPLE_CONTENT = `# Introduction to Photosynthesis

Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose.

## The Basic Equation

**6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂**

This equation shows that:
- Carbon dioxide (CO₂) and water (H₂O) are the reactants
- Glucose (C₆H₁₂O₆) and oxygen (O₂) are the products
- Light energy (usually from the sun) powers the reaction

## Two Main Stages

### 1. Light-Dependent Reactions
- Occur in the **thylakoid membranes**
- Require direct light
- Produce ATP and NADPH
- Split water molecules, releasing oxygen

### 2. Light-Independent Reactions (Calvin Cycle)
- Occur in the **stroma**
- Do not require direct light
- Use ATP and NADPH to fix carbon
- Produce glucose

## Key Vocabulary

| Term | Definition |
|------|------------|
| Chlorophyll | Green pigment that absorbs light |
| Chloroplast | Organelle where photosynthesis occurs |
| Stroma | Fluid-filled space inside chloroplast |
| Thylakoid | Membrane structures containing chlorophyll |

## Why It Matters

Photosynthesis is fundamental to life on Earth because it:
1. Produces oxygen for most living organisms
2. Creates food (glucose) that enters food chains
3. Removes carbon dioxide from the atmosphere
4. Forms the basis of most ecosystems`

export function WorksheetCanvas({ 
  content, 
  onContentChange, 
  onSelectionChange,
  isLoading 
}: WorksheetCanvasProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)

  const handleLoadSample = useCallback(() => {
    onContentChange(SAMPLE_CONTENT)
    setEditContent(SAMPLE_CONTENT)
  }, [onContentChange])

  const handleSaveEdit = useCallback(() => {
    onContentChange(editContent)
    setIsEditing(false)
  }, [editContent, onContentChange])

  const handleCancelEdit = useCallback(() => {
    setEditContent(content)
    setIsEditing(false)
  }, [content])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim() && onSelectionChange) {
      onSelectionChange(selection.toString().trim())
    }
  }, [onSelectionChange])

  // Empty state
  if (!content) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Study Material</h2>
              <p className="text-xs text-muted-foreground">Your learning workspace</p>
            </div>
          </div>
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No study material yet
            </h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Add your study content to get started. You can paste notes, upload documents, 
              or load a sample to see how Lumina works.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleLoadSample}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Load Sample Content
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-border/50 hover:bg-secondary/50"
                onClick={() => {
                  setIsEditing(true)
                  setEditContent('')
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Write Your Own
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                disabled
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Editing</h2>
              <p className="text-xs text-muted-foreground">Markdown supported</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancelEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveEdit}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-secondary/30 rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-sm leading-relaxed"
            placeholder="Paste or type your study material here...

You can use Markdown formatting:
# Heading 1
## Heading 2
**bold text**
- bullet points
1. numbered lists"
            autoFocus
          />
        </div>
      </div>
    )
  }

  // Content view
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Study Material</h2>
            <p className="text-xs text-muted-foreground">Select text to ask about it</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setEditContent(content)
            setIsEditing(true)
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>

      {/* Content */}
      <div 
        className={cn(
          "flex-1 overflow-y-auto p-6",
          isLoading && "opacity-50 pointer-events-none"
        )}
        onMouseUp={handleTextSelection}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  )
}

// Simple markdown renderer
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inTable = false
  let tableRows: string[][] = []
  let inCodeBlock = false
  let codeContent: string[] = []

  const processInlineFormatting = (text: string): React.ReactNode => {
    // Process bold, italic, code, etc.
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      // Code
      const codeMatch = remaining.match(/`([^`]+)`/)
      
      const matches = [
        boldMatch ? { match: boldMatch, type: 'bold' } : null,
        codeMatch ? { match: codeMatch, type: 'code' } : null,
      ].filter(Boolean).sort((a, b) => 
        (a?.match?.index ?? Infinity) - (b?.match?.index ?? Infinity)
      )

      if (matches.length > 0 && matches[0]) {
        const { match, type } = matches[0]
        const index = match?.index ?? 0
        
        if (index > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, index)}</span>)
        }
        
        if (type === 'bold' && match) {
          parts.push(<strong key={key++} className="font-semibold text-foreground">{match[1]}</strong>)
        } else if (type === 'code' && match) {
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 rounded bg-secondary/80 text-accent font-mono text-xs">
              {match[1]}
            </code>
          )
        }
        
        remaining = remaining.slice(index + (match?.[0]?.length ?? 0))
      } else {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }
    }

    return parts.length > 0 ? parts : text
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-secondary/50 rounded-lg p-4 overflow-x-auto my-4">
            <code className="text-sm font-mono text-foreground/90">
              {codeContent.join('\n')}
            </code>
          </pre>
        )
        codeContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Table handling
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim())
      if (cells.some(c => /^-+$/.test(c))) {
        continue // Skip separator row
      }
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(cells)
      continue
    } else if (inTable) {
      // End table
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {tableRows[0]?.map((cell, j) => (
                  <th key={j} className="text-left py-2 px-3 text-sm font-semibold text-foreground">
                    {processInlineFormatting(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, j) => (
                <tr key={j} className="border-b border-border/50">
                  {row.map((cell, k) => (
                    <td key={k} className="py-2 px-3 text-sm text-foreground/80">
                      {processInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableRows = []
      inTable = false
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-foreground mt-6 mb-4 font-serif">
          {processInlineFormatting(line.slice(2))}
        </h1>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl font-semibold text-foreground mt-5 mb-3 font-serif">
          {processInlineFormatting(line.slice(3))}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-foreground mt-4 mb-2">
          {processInlineFormatting(line.slice(4))}
        </h3>
      )
    }
    // Lists
    else if (line.match(/^[-*] /)) {
      elements.push(
        <li key={i} className="text-foreground/80 ml-4 my-1 list-disc">
          {processInlineFormatting(line.slice(2))}
        </li>
      )
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={i} className="text-foreground/80 ml-4 my-1 list-decimal">
          {processInlineFormatting(line.replace(/^\d+\. /, ''))}
        </li>
      )
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />)
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="text-foreground/80 leading-relaxed my-2">
          {processInlineFormatting(line)}
        </p>
      )
    }
  }

  // Handle remaining table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="table-end" className="overflow-x-auto my-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {tableRows[0]?.map((cell, j) => (
                <th key={j} className="text-left py-2 px-3 text-sm font-semibold text-foreground">
                  {processInlineFormatting(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, j) => (
              <tr key={j} className="border-b border-border/50">
                {row.map((cell, k) => (
                  <td key={k} className="py-2 px-3 text-sm text-foreground/80">
                    {processInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return <>{elements}</>
}

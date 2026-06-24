'use client'

import { useState, useCallback, useRef } from 'react'
import { 
  FileText, 
  Upload, 
  Sparkles, 
  BookOpen,
  Edit3,
  Save,
  X,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WorksheetCanvasProps {
  content: string
  onContentChange: (content: string) => void
  onSelectionChange?: (selection: string) => void
  isLoading?: boolean
  onImageUpload?: (base64Image: string) => void
  onImageAnalyzed?: (markdown: string, documentName?: string) => void
  externalFileInputRef?: React.RefObject<HTMLInputElement | null>
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
  isLoading,
  onImageUpload,
  onImageAnalyzed,
  externalFileInputRef
}: WorksheetCanvasProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const internalImageInputRef = useRef<HTMLInputElement>(null)
  
  // Use external ref if provided, otherwise use internal ref
  const imageInputRef = externalFileInputRef || internalImageInputRef

  const handleLoadSample = useCallback(() => {
    onContentChange(SAMPLE_CONTENT)
    setEditContent(SAMPLE_CONTENT)
  }, [onContentChange])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    const documentName = file.name
    setIsAnalyzing(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const base64 = event.target.result as string
          const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
          const mediaType = file.type || 'image/png'

          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data, mediaType }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to analyze image')
          }

          const data = await response.json()
          
          // Add the markdown content to the worksheet
          const newContent = content 
            ? `${content}\n\n---\n\n${data.markdown}`
            : data.markdown
          
          onContentChange(newContent)
          onImageAnalyzed?.(data.markdown, documentName)
        } catch (err) {
          console.error('Error analyzing image:', err)
          alert(err instanceof Error ? err.message : 'Failed to analyze image')
        } finally {
          setIsAnalyzing(false)
        }
      }
    }
    reader.onerror = () => {
      console.error('Failed to read image file')
      alert('Failed to read image file')
      setIsAnalyzing(false)
    }
    reader.readAsDataURL(file)

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }, [content, onContentChange, onImageAnalyzed])

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

  return (
    <div className="h-full flex flex-col">
      {/* Persistent hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
      />

      {!content ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-cream border border-beige-deep flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif font-semibold text-foreground text-lg">Study Material</h2>
                <p className="text-sm text-slate">Your learning workspace</p>
              </div>
            </div>
          </div>

          {/* Empty state content */}
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-xl bg-cream border border-beige-deep flex items-center justify-center mx-auto mb-8">
                <BookOpen className="w-10 h-10 text-slate" />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-3 text-balance">
                No study material yet
              </h3>
              <p className="text-slate text-base mb-8 leading-relaxed">
                Add your study content to get started. You can paste notes, upload documents, 
                or load a sample to see how OmniLearnAI works.
              </p>

              {/* Onboarding hints */}
              <div className="mb-6 space-y-2 text-left">
                <div className="flex items-center gap-2.5 text-sm text-slate">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Upload an image of your study material &rarr; AI extracts and formats it</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Chat with the AI to explain, summarize, or quiz you</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Export a study sheet with all your material and insights</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                                  onClick={handleLoadSample}
                                  className="w-full bg-primary hover:bg-primary-deep text-primary-foreground rounded-md h-11 text-base font-medium transition-editorial"
                                >
                                  <Sparkles className="w-5 h-5 mr-2" />
                                  Load Sample Content
                                </Button>
                <Button 
                  variant="outline"
                  className={cn(
                    "w-full rounded-md h-11 text-base border-border hover:bg-cream hover:border-beige-deep transition-editorial",
                    isAnalyzing && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Upload Image for AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Editing mode */}
      {content && isEditing ? (
        <>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-cream border border-beige-deep flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif font-semibold text-foreground text-lg">Editing</h2>
                <p className="text-sm text-slate">Markdown supported</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelEdit}
                className="rounded-md border-border hover:bg-cream hover:border-beige-deep text-slate hover:text-foreground transition-editorial"
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSaveEdit}
                className="bg-primary hover:bg-primary-deep text-primary-foreground rounded-md transition-editorial"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
          <div className="flex-1 p-8">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full bg-cream border border-beige-deep rounded-lg p-5 text-foreground placeholder:text-stone resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm leading-relaxed transition-editorial"
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
        </>
      ) : null}

      {/* Content view */}
      {content && !isEditing ? (
        <>
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-cream border border-beige-deep flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif font-semibold text-foreground text-lg">Study Material</h2>
                <p className="text-sm text-slate">Select text to ask about it</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setEditContent(content)
                setIsEditing(true)
              }}
              className="rounded-md border-border hover:bg-cream hover:border-beige-deep text-slate hover:text-foreground transition-editorial"
            >
              <Edit3 className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          </div>
          <div 
            className={cn(
              "flex-1 overflow-y-auto p-8",
              isLoading && "opacity-50 pointer-events-none"
            )}
            onMouseUp={handleTextSelection}
          >
            <div className="max-w-none space-y-6">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </>
      ) : null}
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
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
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
            <code key={key++} className="px-1.5 py-0.5 rounded-md bg-surface-code text-on-dark font-mono text-sm">
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
          <pre key={i} className="bg-surface-code rounded-lg p-5 overflow-x-auto my-5">
            <code className="text-sm font-mono text-on-dark">
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
        continue
      }
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(cells)
      continue
    } else if (inTable) {
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-5">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                {tableRows[0]?.map((cell, j) => (
                  <th key={j} className="text-left py-3 px-4 text-base font-semibold text-foreground">
                    {processInlineFormatting(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, j) => (
                <tr key={j} className="border-b border-border">
                  {row.map((cell, k) => (
                    <td key={k} className="py-3 px-4 text-base text-charcoal">
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
        <h1 key={i} className="text-4xl font-serif font-bold text-foreground mt-8 mb-5 first:mt-0 tracking-tight" style={{ letterSpacing: '-0.5px', lineHeight: '1.15' }}>
          {processInlineFormatting(line.slice(2))}
        </h1>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-2xl font-serif font-semibold text-foreground mt-7 mb-4" style={{ letterSpacing: '-0.5px', lineHeight: '1.2' }}>
          {processInlineFormatting(line.slice(3))}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold text-foreground mt-5 mb-3" style={{ lineHeight: '1.25' }}>
          {processInlineFormatting(line.slice(4))}
        </h3>
      )
    }
    // Lists
    else if (line.match(/^[-*] /)) {
      elements.push(
        <li key={i} className="text-charcoal ml-5 my-1.5 list-disc text-base" style={{ lineHeight: '1.55' }}>
          {processInlineFormatting(line.slice(2))}
        </li>
      )
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={i} className="text-charcoal ml-5 my-1.5 list-decimal text-base" style={{ lineHeight: '1.55' }}>
          {processInlineFormatting(line.replace(/^\d+\. /, ''))}
        </li>
      )
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-4" />)
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="text-charcoal text-base my-3" style={{ lineHeight: '1.55' }}>
          {processInlineFormatting(line)}
        </p>
      )
    }
  }

  // Handle remaining table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="table-end" className="overflow-x-auto my-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              {tableRows[0]?.map((cell, j) => (
                <th key={j} className="text-left py-3 px-4 text-base font-semibold text-foreground">
                  {processInlineFormatting(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, j) => (
              <tr key={j} className="border-b border-border">
                {row.map((cell, k) => (
                  <td key={k} className="py-3 px-4 text-base text-charcoal">
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

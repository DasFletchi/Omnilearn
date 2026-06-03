'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { 
  Send, 
  Lightbulb, 
  Minimize2, 
  HelpCircle,
  ListChecks,
  FileText,
  Sparkles,
  Bot,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QuickAction } from '@/lib/ai-provider'

interface ChatPanelProps {
  worksheetContent: string
  selectedText?: string
  onClearSelection?: () => void
  onMessagesUpdate?: (messages: Array<{ role: string; content: string }>) => void
}

const quickActions: { id: QuickAction; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'explain', label: 'Explain', icon: Lightbulb, description: 'Break it down for me' },
  { id: 'simplify', label: 'Simplify', icon: Minimize2, description: 'Make it easier' },
  { id: 'quiz', label: 'Quiz me', icon: HelpCircle, description: 'Test my knowledge' },
  { id: 'summarize', label: 'Summarize', icon: ListChecks, description: 'Key points only' },
  { id: 'examples', label: 'Examples', icon: FileText, description: 'Show real-world uses' },
]

export function ChatPanel({ worksheetContent, selectedText, onClearSelection, onMessagesUpdate }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [activeQuickAction, setActiveQuickAction] = useState<QuickAction | null>(null)

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    setInput,
    append,
    reload
  } = useChat({
    api: '/api/chat',
    body: {
      worksheetContext: worksheetContent,
      provider: 'mistral'
    },
  })

  // Auto-scroll to bottom and notify parent of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    onMessagesUpdate?.(messages.map(m => ({ role: m.role, content: m.content })))
  }, [messages, onMessagesUpdate])

  // Handle quick action click
  const handleQuickAction = useCallback(async (action: QuickAction) => {
    if (!worksheetContent && !selectedText) return
    
    setActiveQuickAction(action)
    const contextToUse = selectedText || worksheetContent
    
    const actionLabels: Record<QuickAction, string> = {
      explain: 'Explain this to me',
      simplify: 'Simplify this for me',
      quiz: 'Quiz me on this',
      summarize: 'Summarize this',
      examples: 'Give me examples for this'
    }
    
    await append({
      role: 'user',
      content: `${actionLabels[action]}:\n\n${contextToUse.slice(0, 2000)}${contextToUse.length > 2000 ? '...' : ''}`
    })
    
    setActiveQuickAction(null)
    onClearSelection?.()
  }, [worksheetContent, selectedText, append, onClearSelection])

  // Handle form submit
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!(input ?? '').trim()) return
    handleSubmit(e)
  }, [input, handleSubmit])

  // Handle textarea key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if ((input ?? '').trim()) {
        const form = e.currentTarget.form
        if (form) {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
          form.dispatchEvent(submitEvent)
        }
      }
    }
  }, [input])

  const showEmptyState = messages.length === 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-beige-deep bg-cream">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-foreground text-lg">Lumina</h2>
            <p className="text-sm text-slate">Your study companion</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => reload()}
            disabled={isLoading}
            className="text-slate hover:text-foreground hover:bg-cream-deeper rounded-md transition-editorial"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-cream-soft">
        {showEmptyState ? (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 rounded-xl bg-cream border border-beige-deep flex items-center justify-center mb-8">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-3 text-balance">
              Ready to help you learn
            </h3>
            <p className="text-slate text-base mb-8 max-w-sm leading-relaxed">
              Ask me anything about your study material, or use the quick actions below to get started.
            </p>
            
            {worksheetContent && (
              <div className="text-sm text-slate">
                <span className="text-primary font-medium">Tip:</span> Select text in the worksheet to ask about specific parts
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {messages.map((message, index) => (
              <MessageBubble 
                key={message.id || index} 
                role={message.role as 'user' | 'assistant'} 
                content={message.content} 
              />
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-cream border border-beige-deep flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 bg-cream border border-beige-deep rounded-lg rounded-tl-none p-5">
                  <div className="flex items-center gap-3 text-slate">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Selected text indicator */}
      {selectedText && (
        <div className="mx-6 mb-4 p-4 bg-cream border border-primary rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary mb-1.5">Selected text:</p>
              <p className="text-sm text-foreground line-clamp-2">
                {selectedText}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0 text-slate hover:text-foreground hover:bg-cream-deeper flex-shrink-0 rounded-md"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {worksheetContent && (
        <div className="px-6 pb-4 bg-cream-soft">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading || (!worksheetContent && !selectedText)}
                className={cn(
                  "flex-shrink-0 rounded-md border-border bg-background",
                  "hover:bg-cream hover:border-beige-deep",
                  "text-slate hover:text-foreground transition-editorial",
                  activeQuickAction === action.id && "bg-primary border-primary text-primary-foreground hover:bg-primary-deep hover:text-primary-foreground"
                )}
              >
                <action.icon className="w-3.5 h-3.5 mr-1.5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-6 border-t border-beige-deep bg-cream">
        <form onSubmit={onSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={worksheetContent 
              ? "Ask about your study material..." 
              : "Add study material to get started..."}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full bg-background rounded-md px-4 py-3 pr-14 text-foreground",
              "border border-border placeholder:text-stone",
              "resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[48px] max-h-[120px] transition-editorial"
            )}
            style={{ height: 'auto' }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !(input ?? '').trim()}
            className={cn(
              "absolute right-2 bottom-2 h-9 w-9 p-0 rounded-md",
              "bg-primary hover:bg-primary-deep text-primary-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-editorial"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Message bubble component
function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'

  return (
    <div className={cn("flex items-start gap-4", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
        isUser 
          ? "bg-ink border-ink" 
          : "bg-cream border-beige-deep"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-on-dark" />
        ) : (
          <Bot className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className={cn(
        "flex-1 rounded-lg p-5 max-w-[85%]",
        isUser 
          ? "bg-ink text-on-dark rounded-tr-none ml-auto" 
          : "bg-cream border border-beige-deep text-foreground rounded-tl-none"
      )}>
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <AssistantMessage content={content} />
        )}
      </div>
    </div>
  )
}

// Render assistant messages with formatting
function AssistantMessage({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

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
          parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>)
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

    if (line.startsWith('# ')) {
      elements.push(
        <h3 key={i} className="text-lg font-serif font-semibold mt-4 mb-2 first:mt-0">
          {processInlineFormatting(line.slice(2))}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h4 key={i} className="text-base font-semibold mt-4 mb-2 first:mt-0">
          {processInlineFormatting(line.slice(3))}
        </h4>
      )
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-primary pl-4 my-3 text-base italic text-slate">
          {processInlineFormatting(line.slice(2))}
        </blockquote>
      )
    } else if (line.match(/^[-*] /)) {
      elements.push(
        <li key={i} className="text-base ml-5 my-1 list-disc">
          {processInlineFormatting(line.slice(2))}
        </li>
      )
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={i} className="text-base ml-5 my-1 list-decimal">
          {processInlineFormatting(line.replace(/^\d+\. /, ''))}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />)
    } else {
      elements.push(
        <p key={i} className="text-base leading-relaxed my-2">
          {processInlineFormatting(line)}
        </p>
      )
    }
  }

  return <div className="space-y-1">{elements}</div>
}

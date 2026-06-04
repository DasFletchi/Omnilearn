'use client'

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
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
  RefreshCw,
  Copy,
  Check,
  Mic
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QuickAction } from '@/lib/ai-provider'
import { useSpeechToText } from '@/hooks/use-speech-to-text'

interface ChatPanelProps {
  worksheetContent: string
  selectedText?: string
  onClearSelection?: () => void
  onMessagesUpdate?: (messages: Array<{ role: string; content: string }>) => void
  onWorksheetUpdate?: (content: string) => void
  lastAnalyzedMarkdown?: string | null
  onAnalyzedContextConsumed?: () => void
}

const quickActions: { id: QuickAction; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'explain', label: 'Explain', icon: Lightbulb, description: 'Break it down for me' },
  { id: 'simplify', label: 'Simplify', icon: Minimize2, description: 'Make it easier' },
  { id: 'quiz', label: 'Quiz me', icon: HelpCircle, description: 'Test my knowledge' },
  { id: 'summarize', label: 'Summarize', icon: ListChecks, description: 'Key points only' },
  { id: 'examples', label: 'Examples', icon: FileText, description: 'Show real-world uses' },
]

export function ChatPanel({ worksheetContent, selectedText, onClearSelection, onMessagesUpdate, onWorksheetUpdate, lastAnalyzedMarkdown, onAnalyzedContextConsumed }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [activeQuickAction, setActiveQuickAction] = useState<QuickAction | null>(null)
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [hasSeenEmptyState, setHasSeenEmptyState] = useState(false)
  const [isProcessingAnalyzed, setIsProcessingAnalyzed] = useState(false)

  const {
    messages,
    sendMessage,
    regenerate,
    status,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onToolCall({ toolCall }) {
      if (toolCall.toolName === 'update_worksheet') {
        const content = toolCall.args.content as string
        onWorksheetUpdate?.(content)
      } else if (toolCall.toolName === 'append_to_worksheet') {
        const section = toolCall.args.section as string
        const content = toolCall.args.content as string
        const newContent = worksheetContent 
          ? `${worksheetContent}\n\n## ${section}\n\n${content}`
          : `## ${section}\n\n${content}`
        onWorksheetUpdate?.(newContent)
      }
    },
  })

  const { 
    isListening, 
    isSupported, 
    interimTranscript,
    startListening, 
    stopListening 
  } = useSpeechToText({
    onResult: (text) => {
      setInput(prev => prev + (prev ? ' ' : '') + text)
    },
    onEnd: () => {
      if (interimTranscript) {
        setInput(prev => prev + (prev ? ' ' : '') + interimTranscript)
      }
    }
  })

  // Trigger shimmer animation once on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasSeenEmptyState(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Send analyzed markdown context to chat when available
  useEffect(() => {
    if (lastAnalyzedMarkdown && !isProcessingAnalyzed) {
      setIsProcessingAnalyzed(true)
      
      try {
        sendMessage(
          { text: '📋 I just analyzed an image and added the content to the worksheet. Here\'s what I found:\n\n' + lastAnalyzedMarkdown },
          { body: { worksheetContext: worksheetContent } }
        ).then(() => {
          onAnalyzedContextConsumed?.()
          setIsProcessingAnalyzed(false)
        }).catch((err) => {
          console.error('Error sending analyzed context:', err)
          setIsProcessingAnalyzed(false)
          onAnalyzedContextConsumed?.()
        })
      } catch (err) {
        console.error('Failed to send analyzed context:', err)
        setIsProcessingAnalyzed(false)
        onAnalyzedContextConsumed?.()
      }
    }
  }, [lastAnalyzedMarkdown, isProcessingAnalyzed, sendMessage, worksheetContent, onAnalyzedContextConsumed])

  const isLoading = status === 'submitted' || status === 'streaming'

  // Auto-scroll to bottom and notify parent of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    onMessagesUpdate?.(messages.map(m => ({ role: m.role, content: getMessageText(m) })))
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

    await sendMessage(
      {
        text: `${actionLabels[action]}:\n\n${contextToUse.slice(0, 2000)}${contextToUse.length > 2000 ? '...' : ''}`,
      },
      {
        body: {
          worksheetContext: worksheetContent,
          provider: 'mistral',
        },
      },
    )

    setActiveQuickAction(null)
    onClearSelection?.()
  }, [worksheetContent, selectedText, sendMessage, onClearSelection])

  // Handle form submit
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    void sendMessage(
      { text: trimmedInput },
      {
        body: {
          worksheetContext: worksheetContent,
          provider: 'mistral',
        },
      },
    )
    setInput('')
  }, [input, sendMessage, worksheetContent])

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
    <div className="chat-panel h-full flex flex-col">
      {/* Header */}
      <div className="chat-panel-header flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3" aria-label="AI chat">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => regenerate({ body: { worksheetContext: worksheetContent, provider: 'mistral' } })}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="chat-messages flex-1 overflow-y-auto bg-background">
        {showEmptyState ? (
          <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-balance">
              Ready to help you learn
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
              Ask me anything about your study material, or use the quick actions below to get started.
            </p>

            {worksheetContent && (
              <div className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">Tip:</span> Select text in the worksheet to ask about specific parts
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                role={message.role as 'user' | 'assistant'}
                content={getMessageText(message)}
                onCopy={setCopiedCodeBlock}
                copiedId={copiedCodeBlock}
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 bg-secondary border border-border rounded-lg rounded-tl-none p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
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
        <div className="mx-3 sm:mx-4 mb-3 p-3 bg-accent-teal-light border border-primary rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary mb-1">Selected text:</p>
              <p className="text-sm text-foreground line-clamp-2">
                {selectedText}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-3 sm:mx-4 mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {/* Quick actions */}
      {worksheetContent && (
        <div className="px-3 sm:px-4 pb-3 bg-background">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading || (!worksheetContent && !selectedText)}
                className={cn(
                  "flex-shrink-0 h-8 text-xs whitespace-nowrap",
                  "text-muted-foreground hover:text-foreground",
                  activeQuickAction === action.id && "bg-primary border-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
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
      <div className="chat-input-area p-3 sm:p-4 border-t border-border bg-card">
        <form onSubmit={onSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={worksheetContent
              ? "Ask about your study material..."
              : "Add study material to get started..."}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full bg-background rounded-md px-4 py-3 pr-20 text-foreground text-sm",
              "border border-border placeholder:text-muted-foreground",
              "resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[44px] max-h-[120px]",
              !worksheetContent && hasSeenEmptyState ? "shimmer-once" : ""
            )}
            style={{ height: 'auto' }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            {/* Microphone button */}
            {isSupported && (
              <div className={cn("mic-btn-container", isListening && "listening")}>
                <div className="mic-btn-ring" />
                <div className="mic-btn-ring" />
                <div className="mic-btn-ring" />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full",
                    isListening 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? (
                    <div className="relative">
                      <Mic className="w-4 h-4" />
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-primary-foreground rounded-full" />
                    </div>
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !(input ?? '').trim()}
              className={cn(
                "h-8 w-8 p-0",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        {/* Show interim transcript while listening */}
        {isListening && interimTranscript && (
          <div className="mt-2 px-1 text-sm text-muted-foreground animate-pulse">
            {interimTranscript}
          </div>
        )}
      </div>
    </div>
  )
}

// Message bubble component
function getMessageText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .filter(Boolean)
    .join('')
}

function MessageBubble({ 
  role, 
  content,
  onCopy,
  copiedId 
}: { 
  role: 'user' | 'assistant'
  content: string
  onCopy?: (id: number | null) => void
  copiedId?: number | null
}) {
  const isUser = role === 'user'

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
        isUser
          ? "bg-foreground border-foreground"
          : "bg-secondary border-border"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-background" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className={cn(
        "flex-1 rounded-lg p-3 sm:p-4 min-w-0",
        isUser
          ? "bg-foreground text-background rounded-tr-none ml-auto max-w-[85%] sm:max-w-[70%]"
          : "bg-secondary border border-border text-foreground rounded-tl-none max-w-[85%] sm:max-w-[70%]"
      )}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <AssistantMessage content={content} onCopy={onCopy} copiedId={copiedId} />
        )}
      </div>
    </div>
  )
}

// Render assistant messages with full markdown support
function AssistantMessage({ 
  content,
  onCopy,
  copiedId
}: { 
  content: string
  onCopy?: (id: number | null) => void
  copiedId?: number | null
}) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let codeBlockIndex = 0
  let i = 0

  const processInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      const italicMatch = remaining.match(/\*(.+?)\*/)
      const codeMatch = remaining.match(/`([^`]+)`/)

      const matches = [
        boldMatch ? { match: boldMatch, type: 'bold', index: boldMatch.index ?? 0 } : null,
        italicMatch ? { match: italicMatch, type: 'italic', index: italicMatch.index ?? 0 } : null,
        codeMatch ? { match: codeMatch, type: 'code', index: codeMatch.index ?? 0 } : null,
      ].filter(Boolean).sort((a, b) =>
        (a?.index ?? Infinity) - (b?.index ?? Infinity)
      )

      if (matches.length > 0 && matches[0]) {
        const { match, type, index } = matches[0]

        if (index > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, index)}</span>)
        }

        if (type === 'bold' && match) {
          parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>)
        } else if (type === 'italic' && match) {
          parts.push(<em key={key++} className="italic">{match[1]}</em>)
        } else if (type === 'code' && match) {
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 rounded bg-foreground/10 font-mono text-xs break-words">
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

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks - triple backticks
    if (line.startsWith('```')) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }

      elements.push(
        <CodeBlock 
          key={`code-${codeBlockIndex}`}
          code={codeLines.join('\n')}
          language={language}
          id={codeBlockIndex}
          onCopy={onCopy}
          isCopied={copiedId === codeBlockIndex}
        />
      )
      codeBlockIndex++
      i++ // Skip closing ```
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-lg sm:text-xl font-bold mt-4 mb-3 first:mt-0 text-foreground">
          {processInlineFormatting(line.slice(2))}
        </h2>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-base sm:text-lg font-bold mt-3 mb-2 first:mt-0 text-foreground">
          {processInlineFormatting(line.slice(3))}
        </h3>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-sm sm:text-base font-semibold mt-2 mb-1 first:mt-0 text-foreground">
          {processInlineFormatting(line.slice(4))}
        </h4>
      )
    }
    // Blockquotes
    else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-primary pl-3 sm:pl-4 my-2 text-sm italic text-muted-foreground bg-foreground/5 py-2 rounded">
          {processInlineFormatting(line.slice(2))}
        </blockquote>
      )
    }
    // Bullet points
    else if (line.match(/^[-*]\s/)) {
      elements.push(
        <div key={i} className="flex gap-2 ml-2 sm:ml-4 my-1">
          <span className="text-foreground">•</span>
          <span className="text-sm leading-relaxed text-foreground">
            {processInlineFormatting(line.slice(2))}
          </span>
        </div>
      )
    }
    // Numbered lists
    else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)/)
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 ml-2 sm:ml-4 my-1">
            <span className="text-foreground font-medium min-w-fit">{match[1]}.</span>
            <span className="text-sm leading-relaxed text-foreground">
              {processInlineFormatting(match[2])}
            </span>
          </div>
        )
      }
    }
    // Empty lines
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
    }
    // Regular paragraphs
    else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed my-1 text-foreground break-words">
          {processInlineFormatting(line)}
        </p>
      )
    }

    i++
  }

  return <div className="space-y-1 sm:space-y-2">{elements}</div>
}

// Code block component with copy button
function CodeBlock({ 
  code, 
  language, 
  id,
  onCopy,
  isCopied
}: { 
  code: string
  language?: string
  id: number
  onCopy?: (id: number | null) => void
  isCopied?: boolean
}) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    if (onCopy) {
      onCopy(id)
      setTimeout(() => onCopy(null), 2000)
    }
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden bg-foreground/5 border border-border">
      <div className="flex items-center justify-between bg-foreground/10 px-3 py-2">
        <span className="text-xs font-mono text-muted-foreground">
          {language || 'code'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 px-2 text-xs gap-1"
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs sm:text-sm">
        <code className="font-mono text-foreground/90 break-words whitespace-pre-wrap">
          {code}
        </code>
      </pre>
    </div>
  )
}

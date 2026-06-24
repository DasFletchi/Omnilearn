'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  PanelLeftClose,
  PanelLeft,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorksheetCanvas } from '@/components/worksheet-canvas'
import { ChatPanel } from '@/components/chat-panel'
import { StudySheet } from '@/components/study-sheet'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

export function LearningWorkspace() {
  const [worksheetContent, setWorksheetContent] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showStudySheet, setShowStudySheet] = useState(false)
  const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [showIntro, setShowIntro] = useState(false)
  const [lastAnalyzedMarkdown, setLastAnalyzedMarkdown] = useState<string | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ id: string; name: string; thumbnail?: string; uploadedAt: Date }>>([])
  const imageUploadRef = useRef<HTMLInputElement>(null)
  const hasPlayedIntro = useRef(false)
  const { showIntroLoader } = useTheme()

  // Callback when image is analyzed - store the markdown for AI context
  const handleImageAnalyzed = useCallback((markdown: string, documentName?: string) => {
    setLastAnalyzedMarkdown(markdown)
    
    // Track uploaded document
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: documentName || 'New Document',
      thumbnail: undefined,
      uploadedAt: new Date()
    }
    setUploadedDocuments(prev => [...prev, newDoc])
  }, [])

  // Handle document upload from study sheet
  const handleStudySheetUpload = useCallback(() => {
    imageUploadRef.current?.click()
  }, [])

  useEffect(() => {
    if (!showIntroLoader || hasPlayedIntro.current) {
      setShowIntro(false)
      return
    }

    hasPlayedIntro.current = true
    setShowIntro(true)

    const timeout = window.setTimeout(() => {
      setShowIntro(false)
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [showIntroLoader])

  const handleMessagesUpdate = useCallback((messages: Array<{ role: string; content: string }>) => {
    setChatMessages(messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })))
  }, [])

  const handleSelectionChange = useCallback((selection: string) => {
    setSelectedText(selection)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedText('')
  }, [])

  return (
    <div className="learning-workspace relative isolate h-screen flex flex-col bg-background overflow-hidden">
      {showIntro && <IntroLoader />}
      {/* Sunset stripe - only shows in Mistral theme */}
      <div className="sunset-stripe relative z-10 w-full flex-shrink-0" />

      {/* Top header bar - empty, no buttons */}
      <header className="workspace-header relative z-10 flex items-center justify-end px-4 py-2 border-b border-border bg-card">
      </header>

      {/* Main content area - split screen */}
      <main className="workspace-main relative z-10 flex-1 flex overflow-hidden">
        {/* Worksheet canvas (left side) */}
        <div className={cn(
          "worksheet-panel border-r border-border bg-card transition-all duration-300 ease-in-out flex flex-col",
          isCanvasCollapsed ? "w-0 opacity-0" : "w-1/2 opacity-100"
        )}>
          {!isCanvasCollapsed && (
            <WorksheetCanvas
              content={worksheetContent}
              onContentChange={setWorksheetContent}
              onSelectionChange={handleSelectionChange}
              onImageAnalyzed={handleImageAnalyzed}
              externalFileInputRef={imageUploadRef}
            />
          )}
        </div>

        {/* Resize handle / collapse toggle */}
        <div className="relative flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCanvasCollapsed(!isCanvasCollapsed)}
            className={cn(
              "h-12 w-6 p-0 rounded-none border-y border-border",
              "bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground",
              "flex items-center justify-center"
            )}
          >
            {isCanvasCollapsed ? (
              <PanelLeft className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {/* Chat panel (right side) */}
        <div className={cn(
          "chat-shell bg-background flex flex-col transition-all duration-300 ease-in-out",
          isCanvasCollapsed ? "flex-1" : "w-1/2"
        )}>
          <ChatPanel
            worksheetContent={worksheetContent}
            selectedText={selectedText}
            onClearSelection={handleClearSelection}
            onMessagesUpdate={handleMessagesUpdate}
            onWorksheetUpdate={setWorksheetContent}
            lastAnalyzedMarkdown={lastAnalyzedMarkdown}
            onAnalyzedContextConsumed={() => setLastAnalyzedMarkdown(null)}
          />
        </div>
      </main>

      {/* Bottom sunset stripe - only shows in Mistral theme */}
      <div className="sunset-stripe relative z-10 w-full flex-shrink-0" />

      {/* Study sheet modal */}
      {showStudySheet && (
        <StudySheet
          worksheetContent={worksheetContent}
          chatHistory={chatMessages}
          onClose={() => setShowStudySheet(false)}
          uploadedDocuments={uploadedDocuments}
          onUploadDocument={handleStudySheetUpload}
        />
      )}
    </div>
  )
}

function IntroLoader() {
  return (
    <div className="intro-loader" role="status" aria-live="polite" aria-label="Loading workspace">
      <div className="intro-loader-card">
        <div className="intro-loader-orbit" aria-hidden="true">
          <Sparkles className="intro-loader-sparkle" />
        </div>
        <p className="intro-loader-kicker">AI Learning Assistant</p>
        <h1 className="intro-loader-title">Lerne smarter.</h1>
        <p className="intro-loader-subtitle">Dein Workspace wird vorbereitet.</p>
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { 
  GraduationCap, 
  FileText, 
  Settings,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorksheetCanvas } from '@/components/worksheet-canvas'
import { ChatPanel } from '@/components/chat-panel'
import { StudySheet } from '@/components/study-sheet'
import { cn } from '@/lib/utils'

export function LearningWorkspace() {
  const [worksheetContent, setWorksheetContent] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showStudySheet, setShowStudySheet] = useState(false)
  const [isCanvasCollapsed, setIsCanvasCollapsed] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Sunset stripe - Mistral's signature element */}
      <div className="sunset-stripe w-full flex-shrink-0" />
      
      {/* Top header bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-foreground tracking-tight">Lumina</h1>
            <p className="text-sm text-slate">AI Learning Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStudySheet(true)}
            disabled={!worksheetContent && chatMessages.length === 0}
            className="rounded-md border-border hover:bg-cream hover:border-beige-deep transition-editorial"
          >
            <FileText className="w-4 h-4 mr-2" />
            Study Sheet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate hover:text-foreground hover:bg-cream rounded-md transition-editorial"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content area - split screen */}
      <main className="flex-1 flex overflow-hidden">
        {/* Worksheet canvas (left side) */}
        <div className={cn(
          "border-r border-border bg-background transition-all duration-300 ease-in-out flex flex-col",
          isCanvasCollapsed ? "w-0 opacity-0" : "w-1/2 opacity-100"
        )}>
          {!isCanvasCollapsed && (
            <WorksheetCanvas
              content={worksheetContent}
              onContentChange={setWorksheetContent}
              onSelectionChange={handleSelectionChange}
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
              "bg-cream hover:bg-cream-deeper text-slate hover:text-foreground",
              "flex items-center justify-center transition-editorial"
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
          "bg-surface-cream flex flex-col transition-all duration-300 ease-in-out",
          isCanvasCollapsed ? "flex-1" : "w-1/2"
        )}>
          <ChatPanel
            worksheetContent={worksheetContent}
            selectedText={selectedText}
            onClearSelection={handleClearSelection}
            onMessagesUpdate={handleMessagesUpdate}
          />
        </div>
      </main>

      {/* Bottom sunset stripe */}
      <div className="sunset-stripe w-full flex-shrink-0" />

      {/* Study sheet modal */}
      {showStudySheet && (
        <StudySheet
          worksheetContent={worksheetContent}
          chatHistory={chatMessages}
          onClose={() => setShowStudySheet(false)}
        />
      )}
    </div>
  )
}

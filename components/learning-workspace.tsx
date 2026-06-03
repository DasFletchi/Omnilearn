'use client'

import { useState, useCallback } from 'react'
import { useChat } from 'ai/react'
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

  const { messages } = useChat({
    api: '/api/chat',
    body: {
      worksheetContext: worksheetContent,
      provider: 'mistral'
    },
  })

  const handleSelectionChange = useCallback((selection: string) => {
    setSelectedText(selection)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedText('')
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top header bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Lumina</h1>
            <p className="text-xs text-muted-foreground">AI Learning Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStudySheet(true)}
            disabled={!worksheetContent && messages.length === 0}
            className="border-border/50 hover:bg-secondary/50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Study Sheet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content area - split screen */}
      <main className="flex-1 flex overflow-hidden">
        {/* Worksheet canvas (left side) */}
        <div className={cn(
          "border-r border-border/50 bg-card/30 transition-all duration-300 ease-in-out flex flex-col",
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
              "h-12 w-6 p-0 rounded-none border-y border-border/30",
              "bg-secondary/30 hover:bg-secondary/50 text-muted-foreground",
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
          "bg-card/20 flex flex-col transition-all duration-300 ease-in-out",
          isCanvasCollapsed ? "flex-1" : "w-1/2"
        )}>
          <ChatPanel
            worksheetContent={worksheetContent}
            selectedText={selectedText}
            onClearSelection={handleClearSelection}
          />
        </div>
      </main>

      {/* Study sheet modal */}
      {showStudySheet && (
        <StudySheet
          worksheetContent={worksheetContent}
          chatHistory={messages.map(m => ({ 
            role: m.role as 'user' | 'assistant', 
            content: m.content 
          }))}
          onClose={() => setShowStudySheet(false)}
        />
      )}
    </div>
  )
}

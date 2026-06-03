'use client'

import { X, Palette, Check, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme, type ThemeVariant } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

interface SettingsModalProps {
  onClose: () => void
}

const themes: { id: ThemeVariant; name: string; description: string; colors: string[] }[] = [
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Minimal, warm neutrals with teal accent',
    colors: ['#271a00', '#fdfbfa', '#016a71', '#d6d5d4'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Dark cinematic Mistral look with angular UI',
    colors: ['#141519', '#FF6A2A', '#FACC15', '#5A1D12'],
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Calm dark mode with high contrast surfaces',
    colors: ['#0B0F14', '#111827', '#F9FAFB', '#38BDF8'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Minimal',
    description: 'Centered, flat, Arial-first interface with quiet loading states',
    colors: ['#FFFFFF', '#000000', '#8E8EA0', '#F48120'],
  },
]

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, setTheme, showIntroLoader, setShowIntroLoader } = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background rounded-lg border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Palette className="w-4 h-4" />
                <span>Theme</span>
              </div>

              <div className="space-y-3">
                {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "w-full p-4 border text-left transition-all",
                    theme === t.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
                    theme === 'mistral' ? 'rounded-none' : 'rounded-lg'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.description}</div>
                    </div>
                    {theme === t.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Color preview */}
                  <div className="flex gap-1.5 mt-3">
                    {t.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 border border-border/50"
                        style={{ 
                          backgroundColor: color,
                          borderRadius: theme === 'mistral' ? '0px' : '8px'
                        }}
                      />
                    ))}
                  </div>
                </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Start animation</span>
              </div>
              <div className={cn(
                "flex items-center justify-between gap-4 border p-4",
                "bg-muted/20",
                theme === 'mistral' ? 'rounded-none' : 'rounded-lg'
              )}>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">Mini loading screen</div>
                  <p className="text-sm text-muted-foreground">
                    Shows a short premium intro before the workspace appears.
                  </p>
                </div>
                <Switch
                  checked={showIntroLoader}
                  onCheckedChange={setShowIntroLoader}
                  aria-label="Toggle mini loading screen"
                />
              </div>
            </section>

            {/* New Liquid Morph Button Section for Mistral Theme */}
            {theme === 'mistral' && (
              <section className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Approach</span>
                </div>
                <div className="p-4 border rounded-none bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-4">
                    Try the new liquid morphing button with fluid shape-shifting animation
                  </p>
                  <Button 
                    className={cn(
                      "liquid-morph-btn w-full font-semibold text-white",
                      "rounded-none border-0"
                    )}
                  >
                    <span className="relative z-10">New Approach</span>
                  </Button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "px-6 py-4 border-t border-border bg-muted/20",
          theme === 'mistral' ? 'rounded-b-none' : 'rounded-b-lg'
        )}>
          <p className="text-xs text-muted-foreground text-center">
            Theme preference is saved automatically
          </p>
        </div>
      </div>
    </div>
  )
}

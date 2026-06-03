import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/lib/theme-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumina | AI Learning Assistant',
  description: 'Your intelligent study companion that explains, simplifies, and helps you master any subject with structured learning artifacts.',
  generator: 'v0.app',
  keywords: ['AI', 'learning', 'study', 'education', 'assistant', 'tutor'],
}

export const viewport: Viewport = {
  themeColor: '#016a71',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="en" 
      data-theme="perplexity"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

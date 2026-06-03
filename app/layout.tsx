import type { Metadata, Viewport } from 'next'
import { Inter, Lora, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/lib/theme-context'
import './globals.css'

// Inter for UI (Perplexity uses pplxSans, Inter is close)
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

// Lora for editorial display (Mistral theme)
const lora = Lora({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

// JetBrains Mono for code blocks
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

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
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}
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

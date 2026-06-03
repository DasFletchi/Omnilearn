import type { Metadata, Viewport } from 'next'
import { Inter, Lora, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Inter for UI prose (body, navigation, buttons, labels)
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

// Lora as PP Editorial Old substitute (elegant serif for display)
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
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

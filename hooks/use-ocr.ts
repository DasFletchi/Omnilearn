'use client'

import { useState, useCallback } from 'react'

interface UseOCROptions {
  onSuccess?: (text: string) => void
  onError?: (error: string) => void
}

interface UseOCRError {
  isLoading: boolean
  error: string | null
  processImage: (file: File) => Promise<string | null>
  processUrl: (url: string) => Promise<string | null>
}

export function useOCR({ onSuccess, onError }: UseOCROptions = {}): UseOCRError {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processUrl = useCallback(async (url: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'OCR processing failed')
      }

      const data = await response.json()
      onSuccess?.(data.text)
      return data.text
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR processing failed'
      setError(message)
      onError?.(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [onSuccess, onError])

  const processImage = useCallback(async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        // Remove data URL prefix
        const base64Data = base64.split(',')[1] || base64
        
        setIsLoading(true)
        setError(null)

        try {
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: base64Data })
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'OCR processing failed')
          }

          const data = await response.json()
          onSuccess?.(data.text)
          resolve(data.text)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'OCR processing failed'
          setError(message)
          onError?.(message)
          resolve(null)
        } finally {
          setIsLoading(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read file')
        onError?.('Failed to read file')
        resolve(null)
      }
      reader.readAsDataURL(file)
    })
  }, [onError, onSuccess])

  return {
    isLoading,
    error,
    processImage,
    processUrl
  }
}

// Supported file types for OCR
export const OCR_SUPPORTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'application/pdf'
]

export const OCR_MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
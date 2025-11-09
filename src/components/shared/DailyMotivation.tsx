'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLoading } from '@/components/ui/loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sparkles } from 'lucide-react'

type QuoteData = {
  text: string
  author?: string
  date: string
}

const STORAGE_KEY = 'daily-motivation-data'
const LAST_SHOWN_KEY = 'daily-motivation-last-shown'

const FALLBACK_QUOTE: QuoteData = {
  text: 'La persistencia es el camino al éxito.',
  author: 'Charles Chaplin',
  date: '',
}

async function fetchDailyQuote(): Promise<Omit<QuoteData, 'date'>> {
  try {
    const response = await fetch('/api/daily-quote', {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Respuesta no válida del servicio de frases')
    }

    const payload = await response.json()
    const text = payload?.text ?? payload?.frase ?? ''
    const author = payload?.author ?? payload?.autor ?? ''

    if (!text) {
      throw new Error('El servicio no devolvió una frase válida')
    }

    return {
      text: text.trim(),
      author: author?.trim() || 'Anónimo',
    }
  } catch (error) {
    console.error('Error obteniendo la frase motivacional:', error)
    return {
      text: FALLBACK_QUOTE.text,
      author: FALLBACK_QUOTE.author,
    }
  }
}

export const DailyMotivation = () => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  const loadQuote = useCallback(
    async (forceRefresh = false) => {
      setLoading(true)
      try {
        const storedRaw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
        const storedData: QuoteData | null = storedRaw ? JSON.parse(storedRaw) : null

        let dataToUse = storedData

        if (!storedData || storedData.date !== today || forceRefresh) {
          const newQuote = await fetchDailyQuote()
          dataToUse = {
            text: newQuote.text,
            author: newQuote.author,
            date: today,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToUse))
          if (forceRefresh) {
            localStorage.removeItem(LAST_SHOWN_KEY)
          }
        }

        setQuote(dataToUse)

        const lastShown = localStorage.getItem(LAST_SHOWN_KEY)
        if (forceRefresh || lastShown !== today) {
          setOpen(true)
        }
      } catch (error) {
        console.error('Error cargando la frase motivacional:', error)
        setQuote({
          ...FALLBACK_QUOTE,
          date: today,
        })
        setOpen(true)
      } finally {
        setHasInitialized(true)
        setLoading(false)
      }
    },
    [today]
  )

  useEffect(() => {
    loadQuote().catch((error) => {
      console.error('Error inicializando la frase motivacional:', error)
    })
  }, [loadQuote])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        localStorage.setItem(LAST_SHOWN_KEY, today)
      }
    },
    [today]
  )

  const handleManualOpen = useCallback(() => {
    if (!quote && !loading && hasInitialized) {
      loadQuote().catch((error) => {
        console.error('Error recargando la frase motivacional:', error)
      })
      return
    }

    setOpen(true)
  }, [hasInitialized, loadQuote, loading, quote])

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleManualOpen}
        disabled={loading && !quote}
        title="Ver la frase motivacional diaria"
      >
        <Sparkles className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
        Frase diaria
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              Inspiración del día
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Empieza tu jornada con una dosis de motivación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loading && !quote ? (
              <div className="flex justify-center py-6">
                <ButtonLoading size="md" />
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                  “{quote?.text ?? FALLBACK_QUOTE.text}”
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-right italic">
                  — {quote?.author ?? FALLBACK_QUOTE.author}
                </p>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button onClick={() => handleOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


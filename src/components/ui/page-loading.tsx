'use client'

import { useEffect, useState } from 'react'
import { Loading } from './loading'

interface PageLoadingProps {
  delay?: number
  text?: string
}

export const PageLoading = ({ delay = 200, text = 'Cargando página...' }: PageLoadingProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
        <Loading 
          variant="dots"
          size="lg"
          text={text}
        />
      </div>
    </div>
  )
}

// Hook para manejar loading de navegación
export const usePageLoading = () => {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return { isLoading, startLoading, stopLoading }
}

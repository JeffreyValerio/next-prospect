'use client'

import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  text?: string
  fullScreen?: boolean
}

export const Loading = ({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text,
  fullScreen = false 
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const renderSpinner = () => (
    <div className={cn(
      'animate-spin rounded-full border-2 border-t-transparent',
      'border-gray-300 dark:border-gray-600',
      sizeClasses[size]
    )} />
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div className={cn(
      'rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse-glow',
      sizeClasses[size]
    )} />
  )

  const renderSkeleton = () => (
    <div className="animate-fade-in-up">
      <div className="flex items-center space-x-4">
        <div className={cn(
          'rounded-full skeleton',
          sizeClasses[size]
        )} />
        <div className="space-y-2 flex-1">
          <div className="h-4 skeleton rounded w-3/4"></div>
          <div className="h-4 skeleton rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'skeleton':
        return renderSkeleton()
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      className
    )}>
      {renderLoader()}
      {text && (
        <p className={cn(
          'text-gray-600 dark:text-gray-400 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {content}
        </div>
      </div>
    )
  }

  return content
}

// Componente específico para botones
export const ButtonLoading = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className={cn(
    'animate-spin rounded-full border-2 border-t-transparent border-white',
    size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
  )} />
)

// Componente para loading de tabla
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-fade-in-up flex space-x-4" style={{ animationDelay: `${i * 0.1}s` }}>
        <div className="rounded-full skeleton h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 skeleton rounded w-3/4"></div>
          <div className="h-4 skeleton rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
)

// Componente para loading de formulario
export const FormSkeleton = () => (
  <div className="space-y-6 animate-fade-in-up">
    <div className="space-y-2">
      <div className="h-4 skeleton rounded w-1/4"></div>
      <div className="h-10 skeleton rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 skeleton rounded w-1/3"></div>
      <div className="h-10 skeleton rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 skeleton rounded w-1/2"></div>
      <div className="h-20 skeleton rounded"></div>
    </div>
    <div className="flex space-x-4">
      <div className="h-10 skeleton rounded flex-1"></div>
      <div className="h-10 skeleton rounded flex-1"></div>
    </div>
  </div>
)

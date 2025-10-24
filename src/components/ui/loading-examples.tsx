'use client'

import { Loading, ButtonLoading, TableSkeleton, FormSkeleton } from './loading'

/**
 * Componente de ejemplos para mostrar todas las variantes de loading disponibles
 * Este archivo es solo para demostración y puede ser eliminado en producción
 */
export const LoadingExamples = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Ejemplos de Loading Components</h1>
      
      {/* Loading básico */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Básico</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Spinner (Default)</h3>
            <Loading size="sm" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Dots</h3>
            <Loading variant="dots" size="sm" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Pulse</h3>
            <Loading variant="pulse" size="sm" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Skeleton</h3>
            <Loading variant="skeleton" size="sm" />
          </div>
        </div>
      </section>

      {/* Loading con texto */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading con Texto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Con texto personalizado</h3>
            <Loading 
              variant="pulse" 
              size="md" 
              text="Cargando datos..." 
            />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Diferentes tamaños</h3>
            <div className="space-y-2">
              <Loading size="sm" text="Pequeño" />
              <Loading size="md" text="Mediano" />
              <Loading size="lg" text="Grande" />
            </div>
          </div>
        </div>
      </section>

      {/* Loading para botones */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading para Botones</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2">
            <ButtonLoading size="sm" />
            <span>Cargando...</span>
          </button>
          <button className="px-6 py-3 bg-green-500 text-white rounded flex items-center gap-2">
            <ButtonLoading size="md" />
            <span>Procesando...</span>
          </button>
        </div>
      </section>

      {/* Skeleton loading */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Skeleton Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Tabla Skeleton</h3>
            <TableSkeleton rows={3} />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Formulario Skeleton</h3>
            <FormSkeleton />
          </div>
        </div>
      </section>

      {/* Loading fullscreen */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Fullscreen</h2>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Para usar loading fullscreen, usa el componente con prop fullScreen=true
          </p>
          <code className="text-xs bg-gray-100 p-2 rounded block">
            {`<Loading variant="pulse" size="lg" text="Cargando aplicación..." fullScreen={true} />`}
          </code>
        </div>
      </section>

      {/* Loading de página */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading de Página</h2>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Para loading de navegación entre páginas
          </p>
          <code className="text-xs bg-gray-100 p-2 rounded block">
            {`<PageLoading text="Cargando página..." delay={200} />`}
          </code>
        </div>
      </section>
    </div>
  )
}

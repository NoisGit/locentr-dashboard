import { Component } from 'react'
import Button from '@/components/ui/Button'
import { captureException } from '@/services/TelemetryService'
import type { ErrorInfo, ReactNode } from 'react'

type AppErrorBoundaryProps = {
    children: ReactNode
}

type AppErrorBoundaryState = {
    hasError: boolean
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = {
        hasError: false,
    }

    static getDerivedStateFromError(): AppErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        captureException(error, {
            source: 'react.error-boundary',
            componentStack: info.componentStack ?? '',
        })
    }

    render() {
        if (!this.state.hasError) return this.props.children

        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
                <section className="max-w-lg text-center">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Locentr
                    </div>
                    <h1 className="mb-3 text-2xl font-semibold">No pudimos mostrar esta vista</h1>
                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                        El incidente fue registrado sin incluir contraseñas ni tokens. Recarga la
                        aplicación para continuar.
                    </p>
                    <Button variant="solid" onClick={() => window.location.reload()}>
                        Recargar aplicación
                    </Button>
                </section>
            </main>
        )
    }
}

export default AppErrorBoundary

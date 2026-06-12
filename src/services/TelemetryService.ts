import { onCLS, onINP, onLCP } from 'web-vitals'

type TelemetryLevel = 'info' | 'warning' | 'error'

type TelemetryContext = Record<string, boolean | number | string | null | undefined>

type TelemetryEvent = {
    name: string
    level: TelemetryLevel
    timestamp: string
    path: string
    context?: Record<string, boolean | number | string | null>
}

const telemetryEndpoint = import.meta.env.VITE_TELEMETRY_ENDPOINT?.trim()
const SENSITIVE_VALUE_PATTERN =
    /(bearer\s+[a-z0-9._-]+|reset_token|access_token|refresh_token|password)/gi

function safePath() {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname
}

function sanitizeContext(context?: TelemetryContext) {
    if (!context) return undefined

    return Object.fromEntries(
        Object.entries(context)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [
                key,
                typeof value === 'string'
                    ? value.replace(SENSITIVE_VALUE_PATTERN, '[redacted]').slice(0, 500)
                    : (value ?? null),
            ]),
    )
}

function dispatchLocally(event: TelemetryEvent) {
    if (typeof window === 'undefined') return
    window.dispatchEvent(
        new CustomEvent('locentr:telemetry', {
            detail: event,
        }),
    )
}

async function transmit(event: TelemetryEvent) {
    if (!telemetryEndpoint) return

    try {
        await fetch(telemetryEndpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(event),
            credentials: 'omit',
            keepalive: true,
        })
    } catch {
        // Observability must never interrupt the product flow.
    }
}

export function createRequestId() {
    return globalThis.crypto?.randomUUID?.() ?? `locentr-${Date.now()}`
}

export function captureEvent(
    name: string,
    context?: TelemetryContext,
    level: TelemetryLevel = 'info',
) {
    const event: TelemetryEvent = {
        name,
        level,
        timestamp: new Date().toISOString(),
        path: safePath(),
        context: sanitizeContext(context),
    }

    dispatchLocally(event)
    void transmit(event)

    if (import.meta.env.DEV && level === 'error') {
        console.error(`[Locentr] ${name}`, event.context)
    }
}

export function captureException(error: unknown, context?: TelemetryContext) {
    const normalizedError =
        error instanceof Error
            ? {
                  errorName: error.name,
                  errorMessage: error.message,
              }
            : { errorMessage: String(error) }

    captureEvent('frontend.exception', { ...normalizedError, ...context }, 'error')
}

export function installGlobalErrorHandlers() {
    if (typeof window === 'undefined') return () => undefined

    const onError = (event: ErrorEvent) => {
        captureException(event.error ?? event.message, {
            source: 'window.error',
            line: event.lineno,
            column: event.colno,
        })
    }
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
        captureException(event.reason, {
            source: 'window.unhandledrejection',
        })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
        window.removeEventListener('error', onError)
        window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
}

export function observeWebVitals() {
    const report = (metric: { name: string; value: number; rating: string }) => {
        captureEvent('frontend.web_vital', {
            metric: metric.name,
            value: Number(metric.value.toFixed(3)),
            rating: metric.rating,
        })
    }

    onCLS(report)
    onINP(report)
    onLCP(report)
}

const TelemetryService = {
    captureEvent,
    captureException,
    createRequestId,
    installGlobalErrorHandlers,
    observeWebVitals,
}

export default TelemetryService

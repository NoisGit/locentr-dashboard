// src/main.tsx (o src/index.tsx)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AppErrorBoundary from '@/components/shared/AppErrorBoundary'
import {
    installGlobalErrorHandlers,
    observeWebVitals,
} from '@/services/TelemetryService'
import './index.css'

const root = createRoot(document.getElementById('root')!)

installGlobalErrorHandlers()
observeWebVitals()

const app = (
    <AppErrorBoundary>
        <App />
    </AppErrorBoundary>
)

if (import.meta.env.DEV) {
    root.render(app)
} else {
    root.render(<StrictMode>{app}</StrictMode>)
}

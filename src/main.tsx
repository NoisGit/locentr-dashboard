// src/main.tsx (o src/index.tsx)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const root = createRoot(document.getElementById('root')!)

const app = <App />

if (import.meta.env.DEV) {
  root.render(app)
} else {
  root.render(<StrictMode>{app}</StrictMode>)
}

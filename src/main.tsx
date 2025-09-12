// src/main.tsx (o src/index.tsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

const app = <App />

if (import.meta.env.DEV) {
  root.render(app)
} else {
  root.render(<React.StrictMode>{app}</React.StrictMode>)
}

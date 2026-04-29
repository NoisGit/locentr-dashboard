import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DemoApp from './DemoApp'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
    <StrictMode>
        <DemoApp />
    </StrictMode>,
)

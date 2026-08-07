import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { RouterProvider } from 'react-router-dom'
import { router } from './app/router/index.tsx'

import { GlobalMessage } from "./shared/components/feedback/GlobalMessage";


import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalMessage />
    <RouterProvider router={router} />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { BrowserRouter as Router } from 'react-router-dom'
import ThemeProvider from '@/contexts/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthProvider'
import { queryClient } from '@/utils/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './contexts/CartProvider'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
              <Router>
                <AuthProvider>
                  <CartProvider>
                    <ThemeProvider>
                      <App />
                    </ThemeProvider>
                  </CartProvider>
                </AuthProvider>
              </Router>
        </QueryClientProvider >
    </StrictMode>
)

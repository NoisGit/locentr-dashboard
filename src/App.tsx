// src/App.tsx
import { BrowserRouter } from 'react-router'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import { SWRConfig } from 'swr'
import { useEffect } from 'react'
import { hydrateCompaniesFromStorage } from '@/store/companies/CompaniesStore'
import './locales'

function App() {
  useEffect(() => {
    hydrateCompaniesFromStorage()
  }, [])

  return (
    <SWRConfig value={{
      dedupingInterval: 2000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }}>
      <Theme>
        <BrowserRouter>
          <AuthProvider>
            <Layout>
              <Views />
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </Theme>
    </SWRConfig>
  )
}

export default App

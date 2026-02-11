import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

;(async () => {
  const LDProvider = await asyncWithLDProvider({
    clientSideID: import.meta.env.VITE_LD_CLIENT_ID as string,
    context: {
      kind: 'user',
      key: 'anonymous',
    },
  })

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <LDProvider>
        <App />
      </LDProvider>
    </StrictMode>,
  )
})()

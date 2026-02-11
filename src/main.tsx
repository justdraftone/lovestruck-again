import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk'
import { StrictMode, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

const renderApp = (Wrapper: React.ComponentType<{ children: React.ReactNode }> | typeof Fragment) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Wrapper>
        <App />
      </Wrapper>
    </StrictMode>,
  )
}

;(async () => {
  const clientSideID = import.meta.env.VITE_LD_CLIENT_ID as string
  if (!clientSideID) {
    renderApp(Fragment)
    return
  }

  try {
    const LDProvider = await asyncWithLDProvider({
      clientSideID,
      context: { kind: 'user', key: 'anonymous' },
    })
    renderApp(LDProvider)
  } catch {
    renderApp(Fragment)
  }
})()

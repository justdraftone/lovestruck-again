import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import { detectQuestionSet } from './lib/geoDetect'
import { useQuizStore } from './store/quizStore'
import { useVisitTracking } from './hooks/useVisitTracking'
import { trackSourceWhenIdle } from './lib/ld'

// Home stays eager — it is the LCP route for essentially all traffic, and
// lazy-loading it would add a round-trip to the thing we care most about.
//
// The letters pages are imported by path rather than through
// `./features/letters`, because that barrel also re-exports `useLetterStore`;
// importing through it would drag the whole feature back into the entry chunk
// and the split would silently no-op.
const SoloQuiz = lazy(() => import('./pages/SoloQuiz'))
const CouplesModeSelect = lazy(() => import('./pages/CouplesModeSelect'))
const CouplesQuizLocal = lazy(() => import('./pages/CouplesQuizLocal'))
const CouplesQuizRemote = lazy(() => import('./pages/CouplesQuizRemote'))
const Results = lazy(() => import('./pages/Results'))
const CardEditor = lazy(() => import('./pages/CardEditor'))
const Admin = lazy(() => import('./pages/Admin'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

const LetterHome = lazy(() => import('./features/letters/pages/LetterHome'))
const CreateLetter = lazy(() => import('./features/letters/pages/CreateLetter'))
const SendLetter = lazy(() => import('./features/letters/pages/SendLetter'))
const OpenLetter = lazy(() => import('./features/letters/pages/OpenLetter'))
const ViewLetter = lazy(() => import('./features/letters/pages/ViewLetter'))

function AppContent() {
  const setQuestionSet = useQuizStore((s) => s.setQuestionSet)

  useVisitTracking()

  useEffect(() => {
    detectQuestionSet().then(setQuestionSet)
  }, [])

  useEffect(() => trackSourceWhenIdle(), [])

  // Warm the two most likely next chunks once the homepage is idle, so the
  // route transition feels instant without costing anything at load time.
  useEffect(() => {
    const warm = () => {
      import('./pages/SoloQuiz')
      import('./pages/CouplesModeSelect')
    }
    const idle = typeof requestIdleCallback === 'function'
    const id = idle ? requestIdleCallback(warm, { timeout: 3000 }) : window.setTimeout(warm, 2000)
    return () => {
      if (idle && typeof cancelIdleCallback === 'function') cancelIdleCallback(id as number)
      else clearTimeout(id as number)
    }
  }, [])

  return (
    // `fallback` is a bare gradient page, not a spinner: chunk fetches are
    // 20-50ms on a warm connection and a flashed spinner reads worse than
    // nothing, but an empty fallback would flash the body background.
    <Suspense fallback={<div className="page gradient-love" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<SoloQuiz />} />
        <Route path="/couples" element={<CouplesModeSelect />} />
        <Route path="/couples/together" element={<CouplesQuizLocal />} />
        <Route path="/couples/remote" element={<CouplesQuizRemote />} />
        <Route path="/results/:mode" element={<Results />} />
        <Route path="/card-editor" element={<CardEditor />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Valentine's Letter Writer */}
        <Route path="/letters" element={<LetterHome />} />
        <Route path="/letters/create" element={<CreateLetter />} />
        <Route path="/letters/send/:letterId" element={<SendLetter />} />
        <Route path="/letters/open" element={<OpenLetter />} />
        <Route path="/letters/view/:letterId" element={<ViewLetter />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

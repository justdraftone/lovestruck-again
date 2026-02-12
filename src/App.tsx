import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SoloQuiz from './pages/SoloQuiz'
import CouplesModeSelect from './pages/CouplesModeSelect'
import CouplesQuizLocal from './pages/CouplesQuizLocal'
import CouplesQuizRemote from './pages/CouplesQuizRemote'
import Results from './pages/Results'
import CardEditor from './pages/CardEditor'
import NoiseOverlay from './components/NoiseOverlay'
import {
  LetterHome,
  CreateLetter,
  SendLetter,
  OpenLetter,
  ViewLetter
} from './features/letters'
import { detectQuestionSet } from './lib/geoDetect'
import { useQuizStore } from './store/quizStore'
import { useVisitTracking } from './hooks/useVisitTracking'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'

function AppContent() {
  const setQuestionSet = useQuizStore((s) => s.setQuestionSet)

  useVisitTracking()

  useEffect(() => {
    detectQuestionSet().then(setQuestionSet)
  }, [])

  return (
    <>
      <NoiseOverlay />
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
      </Routes>
    </>
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

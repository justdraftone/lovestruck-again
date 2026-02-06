import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SoloQuiz from './pages/SoloQuiz'
import CouplesModeSelect from './pages/CouplesModeSelect'
import CouplesQuizLocal from './pages/CouplesQuizLocal'
import CouplesQuizRemote from './pages/CouplesQuizRemote'
import Results from './pages/Results'
import NoiseOverlay from './components/NoiseOverlay'
import {
  LetterHome,
  CreateLetter,
  SendLetter,
  OpenLetter,
  ViewLetter
} from './features/letters'
import { Agentation } from 'agentation'

function App() {
  return (
    <BrowserRouter>
      <NoiseOverlay />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<SoloQuiz />} />
        <Route path="/couples" element={<CouplesModeSelect />} />
        <Route path="/couples/together" element={<CouplesQuizLocal />} />
        <Route path="/couples/remote" element={<CouplesQuizRemote />} />
        <Route path="/results/:mode" element={<Results />} />

        {/* Valentine's Letter Writer */}
        <Route path="/letters" element={<LetterHome />} />
        <Route path="/letters/create" element={<CreateLetter />} />
        <Route path="/letters/send/:letterId" element={<SendLetter />} />
        <Route path="/letters/open" element={<OpenLetter />} />
        <Route path="/letters/view/:letterId" element={<ViewLetter />} />
      </Routes>
      {import.meta.env.MODE === 'development' && <Agentation />}
    </BrowserRouter>
  )
}

export default App

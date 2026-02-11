import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from './quizStore'

beforeEach(() => {
  // Reset store and clear persisted state before each test
  useQuizStore.getState().reset()
  localStorage.clear()
})

describe('quizStore', () => {
  it('has correct initial state after reset', () => {
    const state = useQuizStore.getState()
    expect(state.mode).toBeNull()
    expect(state.currentQuestion).toBe(0)
    expect(state.answers).toEqual({})
    expect(state.currentPartner).toBe(1)
    expect(state.partner1Answers).toEqual({})
    expect(state.partner2Answers).toEqual({})
    expect(state.lobbyId).toBeNull()
    expect(state.partnerId).toBeNull()
  })

  it('setMode updates mode and resets question/answers', () => {
    const { setMode, addAnswer } = useQuizStore.getState()
    setMode('solo')
    addAnswer(1, 'right')
    setMode('couples-local')
    const state = useQuizStore.getState()
    expect(state.mode).toBe('couples-local')
    expect(state.currentQuestion).toBe(0)
    expect(state.answers).toEqual({})
  })

  it('addAnswer stores answer for solo mode', () => {
    useQuizStore.getState().setMode('solo')
    useQuizStore.getState().addAnswer(3, 'right')
    useQuizStore.getState().addAnswer(7, 'left')
    const { answers } = useQuizStore.getState()
    expect(answers[3]).toBe('right')
    expect(answers[7]).toBe('left')
  })

  it('addAnswer stores answer for partner 1 in couples-local mode', () => {
    useQuizStore.getState().setMode('couples-local')
    useQuizStore.getState().addAnswer(5, 'right')
    expect(useQuizStore.getState().partner1Answers[5]).toBe('right')
    expect(useQuizStore.getState().partner2Answers[5]).toBeUndefined()
  })

  it('addAnswer stores answer for partner 2 after switchPartner', () => {
    useQuizStore.getState().setMode('couples-local')
    useQuizStore.getState().switchPartner()
    useQuizStore.getState().addAnswer(5, 'left')
    expect(useQuizStore.getState().partner2Answers[5]).toBe('left')
    expect(useQuizStore.getState().partner1Answers[5]).toBeUndefined()
  })

  it('nextQuestion increments currentQuestion', () => {
    useQuizStore.getState().nextQuestion()
    useQuizStore.getState().nextQuestion()
    expect(useQuizStore.getState().currentQuestion).toBe(2)
  })

  it('switchPartner toggles between 1 and 2', () => {
    expect(useQuizStore.getState().currentPartner).toBe(1)
    useQuizStore.getState().switchPartner()
    expect(useQuizStore.getState().currentPartner).toBe(2)
    useQuizStore.getState().switchPartner()
    expect(useQuizStore.getState().currentPartner).toBe(1)
  })

  it('setPartnerNames updates partner name fields', () => {
    useQuizStore.getState().setPartnerNames('Alice', 'Bob')
    const { partner1Name, partner2Name } = useQuizStore.getState()
    expect(partner1Name).toBe('Alice')
    expect(partner2Name).toBe('Bob')
  })

  it('setLobbyId stores the lobby id', () => {
    useQuizStore.getState().setLobbyId('room-abc')
    expect(useQuizStore.getState().lobbyId).toBe('room-abc')
  })

  it('uses "lovestruck-quiz" as the persistence key', () => {
    useQuizStore.getState().setMode('solo')
    // Zustand persist writes synchronously to localStorage
    const stored = localStorage.getItem('lovestruck-quiz')
    expect(stored).not.toBeNull()
    expect(stored).toContain('solo')
  })
})

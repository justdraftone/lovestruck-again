import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuestionSet } from '../data/questions';

interface QuizState {
  mode: 'solo' | 'couples-local' | 'couples-remote' | null;
  currentQuestion: number;
  answers: Record<number, 'left' | 'right'>;
  questionSet: QuestionSet;
  selectedQuestionIds: number[];

  // Couples mode (local)
  currentPartner: 1 | 2;
  partner1Name: string;
  partner2Name: string;
  partner1Answers: Record<number, 'left' | 'right'>;
  partner2Answers: Record<number, 'left' | 'right'>;

  // Couples mode (remote)
  lobbyId: string | null;
  partnerId: 1 | 2 | null;
  partnerReady: boolean;

  // Actions
  setMode: (mode: 'solo' | 'couples-local' | 'couples-remote') => void;
  setQuestionSet: (set: QuestionSet) => void;
  setSelectedQuestions: (ids: number[]) => void;
  setLobbyId: (id: string) => void;
  setPartnerId: (id: 1 | 2) => void;
  setPartnerNames: (partner1: string, partner2: string) => void;
  addAnswer: (questionId: number, answer: 'left' | 'right') => void;
  nextQuestion: () => void;
  switchPartner: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      mode: null,
      currentQuestion: 0,
      answers: {},
      questionSet: 'global',
      selectedQuestionIds: [],
      currentPartner: 1,
      partner1Name: 'Partner 1',
      partner2Name: 'Partner 2',
      partner1Answers: {},
      partner2Answers: {},
      lobbyId: null,
      partnerId: null,
      partnerReady: false,

      setMode: (mode) => set({ mode, currentQuestion: 0, answers: {} }),

      setQuestionSet: (questionSet) => set({ questionSet }),

      setSelectedQuestions: (ids) => set({ selectedQuestionIds: ids }),

      setLobbyId: (id) => set({ lobbyId: id }),

      setPartnerId: (id) => set({ partnerId: id }),

      setPartnerNames: (partner1, partner2) =>
        set({ partner1Name: partner1, partner2Name: partner2 }),

      addAnswer: (questionId, answer) => set((state) => {
        if (state.mode === 'solo') {
          return { answers: { ...state.answers, [questionId]: answer } };
        } else if (state.mode === 'couples-local') {
          const key = state.currentPartner === 1 ? 'partner1Answers' : 'partner2Answers';
          return { [key]: { ...state[key], [questionId]: answer } };
        } else {
          // For remote mode, handle via Supabase (not implemented in MVP)
          return {};
        }
      }),

      nextQuestion: () => set((state) => ({
        currentQuestion: state.currentQuestion + 1
      })),

      switchPartner: () => set((state) => ({
        currentPartner: state.currentPartner === 1 ? 2 : 1
      })),

      reset: () => set({
        mode: null,
        currentQuestion: 0,
        answers: {},
        currentPartner: 1,
        partner1Answers: {},
        partner2Answers: {},
        lobbyId: null,
        partnerId: null,
        partnerReady: false,
        selectedQuestionIds: [],
      }),
    }),
    { name: 'lovestruck-quiz' }
  )
);

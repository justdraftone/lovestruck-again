import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ImageData {
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
}

export type StickerData = ImageData;

export interface Letter {
  id: string;
  recipientName: string;
  senderName: string;
  content: string;
  image?: ImageData;
  stickers?: StickerData[];
  createdAt: number;
}

interface LetterStore {
  letters: Record<string, Letter>;
  currentLetter: Letter | null;

  // Actions
  createLetter: (content: string, recipientName: string, senderName: string, image?: ImageData, stickers?: StickerData[]) => string;
  setRecipientName: (id: string, name: string) => void;
  getLetter: (id: string) => Letter | null;
  setCurrentLetter: (letter: Letter | null) => void;
  clearCurrentLetter: () => void;
}

// Generate a random 6-character letter ID
const generateLetterId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useLetterStore = create<LetterStore>()(
  persist(
    (set, get) => ({
      letters: {},
      currentLetter: null,

      createLetter: (content: string, recipientName: string, senderName: string, image?: ImageData, stickers?: StickerData[]) => {
        const id = generateLetterId();
        const letter: Letter = {
          id,
          recipientName,
          senderName,
          content,
          image,
          stickers,
          createdAt: Date.now(),
        };
        set((state) => ({
          letters: { ...state.letters, [id]: letter },
          currentLetter: letter,
        }));
        return id;
      },

      setRecipientName: (id: string, name: string) => {
        set((state) => {
          const letter = state.letters[id];
          if (!letter) return state;
          const updatedLetter = { ...letter, recipientName: name };
          return {
            letters: { ...state.letters, [id]: updatedLetter },
            currentLetter: updatedLetter,
          };
        });
      },

      getLetter: (id: string) => {
        return get().letters[id] || null;
      },

      setCurrentLetter: (letter: Letter | null) => {
        set({ currentLetter: letter });
      },

      clearCurrentLetter: () => {
        set({ currentLetter: null });
      },
    }),
    {
      name: 'valentine-letters',
    }
  )
);

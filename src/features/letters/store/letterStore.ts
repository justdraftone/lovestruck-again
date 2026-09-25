import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../../lib/supabase';

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
  createLetter: (content: string, recipientName: string, senderName: string, image?: ImageData, stickers?: StickerData[]) => Promise<string>;
  setRecipientName: (id: string, name: string) => void;
  getLetter: (id: string) => Promise<Letter | null>;
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

      createLetter: async (content: string, recipientName: string, senderName: string, image?: ImageData, stickers?: StickerData[]) => {
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

        // Save to Supabase for sharing across devices
        try {
          const { error } = await supabase.from('letters').insert({
            id: letter.id,
            recipient_name: letter.recipientName,
            sender_name: letter.senderName,
            content: letter.content,
            image: letter.image || null,
            stickers: letter.stickers || null,
            created_at: new Date(letter.createdAt).toISOString(),
          });

          if (error) {
            console.error('❌ Supabase insert error:', error);
            alert(`Failed to save letter to cloud: ${error.message}`);
          } else {
            console.log('✅ Letter saved to Supabase successfully');
          }
        } catch (error) {
          console.error('❌ Failed to save letter to Supabase:', error);
          alert('Failed to save letter to cloud. It will only work on this device.');
          // Continue anyway - letter will still be saved to localStorage
        }

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

      getLetter: async (id: string) => {
        // First check localStorage cache
        const cachedLetter = get().letters[id];
        if (cachedLetter) {
          return cachedLetter;
        }

        // If not in cache, fetch from Supabase
        try {
          const { data, error } = await supabase
            .from('letters')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching letter from Supabase:', error);
            return null;
          }

          if (!data) {
            // Letter not found - this is normal, not an error
            return null;
          }

          // Convert Supabase data to Letter format
          const letter: Letter = {
            id: data.id,
            recipientName: data.recipient_name,
            senderName: data.sender_name,
            content: data.content,
            image: data.image || undefined,
            stickers: data.stickers || undefined,
            createdAt: new Date(data.created_at).getTime(),
          };

          // Cache it in localStorage for future access
          set((state) => ({
            letters: { ...state.letters, [id]: letter },
          }));

          return letter;
        } catch (error) {
          console.error('Error fetching letter from Supabase:', error);
          return null;
        }
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

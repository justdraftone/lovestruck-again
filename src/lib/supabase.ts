import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Room/Lobby types
export interface Room {
  id: string;
  code: string;
  partner1_name: string;
  partner1_id: string;
  partner2_name: string | null;
  partner2_id: string | null;
  current_question: number;
  current_turn: 1 | 2;
  partner1_answers: Record<number, 'left' | 'right'>;
  partner2_answers: Record<number, 'left' | 'right'>;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
}

// Generate a random 6-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate a unique player ID
export function generatePlayerId(): string {
  return crypto.randomUUID();
}

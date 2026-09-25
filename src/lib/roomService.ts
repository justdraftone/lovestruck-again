import { supabase, Room, generateRoomCode, generatePlayerId } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Create a new room
export async function createRoom(playerName: string): Promise<{ room: Room; playerId: string } | null> {
  const code = generateRoomCode();
  const playerId = generatePlayerId();

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      partner1_name: playerName,
      partner1_id: playerId,
      current_question: 0,
      current_turn: 1,
      partner1_answers: {},
      partner2_answers: {},
      status: 'waiting',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating room. Error details:', {
      error: error,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    });
    return null;
  }

  return { room: data as Room, playerId };
}

// Join an existing room by code
export async function joinRoom(
  code: string,
  playerName: string
): Promise<{ room: Room; playerId: string; partnerNum: 1 | 2 } | null> {
  const playerId = generatePlayerId();

  // First, find the room
  const { data: existingRoom, error: findError } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .single();

  if (findError || !existingRoom) {
    console.error('Room not found. Error details:', {
      error: findError,
      message: findError?.message,
      details: findError?.details,
      hint: findError?.hint,
      code: findError?.code
    });
    return null;
  }

  // Check if room is full
  if (existingRoom.partner2_id) {
    // Room is full, check if we're reconnecting as partner 1 or 2
    console.error('Room is full');
    return null;
  }

  // Join as partner 2
  const { data, error } = await supabase
    .from('rooms')
    .update({
      partner2_name: playerName,
      partner2_id: playerId,
      status: 'playing',
    })
    .eq('id', existingRoom.id)
    .select()
    .single();

  if (error) {
    console.error('Error joining room. Error details:', {
      error: error,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    });
    return null;
  }

  return { room: data as Room, playerId, partnerNum: 2 };
}

// Get room by code
export async function getRoomByCode(code: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    console.error('Error getting room:', error);
    return null;
  }

  return data as Room;
}

// Subscribe to room changes
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: Room) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as Room);
        }
      }
    )
    .subscribe();

  return channel;
}

// Submit an answer
export async function submitAnswer(
  roomId: string,
  partnerNum: 1 | 2,
  questionIndex: number,
  answer: 'left' | 'right',
  totalQuestions: number
): Promise<boolean> {
  // Get current room state
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select()
    .eq('id', roomId)
    .single();

  if (fetchError || !room) {
    console.error('Error fetching room:', fetchError);
    return false;
  }

  const answersKey = partnerNum === 1 ? 'partner1_answers' : 'partner2_answers';
  const otherAnswersKey = partnerNum === 1 ? 'partner2_answers' : 'partner1_answers';
  const currentAnswers = room[answersKey] || {};
  const otherAnswers = room[otherAnswersKey] || {};

  // Update answers
  const newAnswers = { ...currentAnswers, [questionIndex]: answer };

  // Determine next turn
  const nextTurn = partnerNum === 1 ? 2 : 1;

  // Check if the other partner has already answered this question
  const otherPartnerAnswered = otherAnswers[questionIndex] !== undefined;

  // Only increment question if BOTH partners have now answered it
  const nextQuestion = otherPartnerAnswered ? questionIndex + 1 : questionIndex;

  // Game is finished when we've gone through all questions AND both have answered
  const newStatus = nextQuestion >= totalQuestions && otherPartnerAnswered ? 'finished' : room.status;

  const { error } = await supabase
    .from('rooms')
    .update({
      [answersKey]: newAnswers,
      current_turn: nextTurn,
      current_question: nextQuestion,
      status: newStatus,
    })
    .eq('id', roomId);

  if (error) {
    console.error('Error submitting answer:', error);
    return false;
  }

  return true;
}

// Unsubscribe from room
export function unsubscribeFromRoom(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}

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
    console.error('Error creating room:', error);
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
    console.error('Room not found:', findError);
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
    console.error('Error joining room:', error);
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
  const currentAnswers = room[answersKey] || {};

  // Update answers
  const newAnswers = { ...currentAnswers, [questionIndex]: answer };

  // Determine next turn and question
  const nextTurn = partnerNum === 1 ? 2 : 1;
  const isLastQuestion = questionIndex >= totalQuestions - 1;
  const nextQuestion = isLastQuestion ? questionIndex : questionIndex + 1;
  const newStatus = isLastQuestion && partnerNum === 2 ? 'finished' : room.status;

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

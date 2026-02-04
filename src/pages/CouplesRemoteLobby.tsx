import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createRoom, joinRoom, subscribeToRoom, unsubscribeFromRoom } from '../lib/roomService';
import { Room } from '../lib/supabase';

export default function CouplesRemoteLobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get('code');

  const [mode, setMode] = useState<'choose' | 'create' | 'join' | 'waiting'>('choose');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [partnerNum, setPartnerNum] = useState<1 | 2 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (joinCode) {
      setRoomCode(joinCode);
      setMode('join');
    }
  }, [joinCode]);

  useEffect(() => {
    if (!room) return;

    const channel = subscribeToRoom(room.id, (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom.status === 'playing' && updatedRoom.partner2_id) {
        sessionStorage.setItem('remoteQuiz', JSON.stringify({
          roomId: updatedRoom.id,
          playerId,
          partnerNum,
          roomCode: updatedRoom.code,
        }));
        navigate('/couples/remote/play');
      }
    });

    return () => {
      unsubscribeFromRoom(channel);
    };
  }, [room, playerId, partnerNum, navigate]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setError(null);

    const result = await createRoom(playerName.trim());
    if (result) {
      setRoom(result.room);
      setPlayerId(result.playerId);
      setPartnerNum(1);
      setMode('waiting');
    } else {
      setError('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter the room code');
      return;
    }
    setError(null);

    const result = await joinRoom(roomCode.trim(), playerName.trim());
    if (result) {
      setRoom(result.room);
      setPlayerId(result.playerId);
      setPartnerNum(result.partnerNum);

      sessionStorage.setItem('remoteQuiz', JSON.stringify({
        roomId: result.room.id,
        playerId: result.playerId,
        partnerNum: result.partnerNum,
        roomCode: result.room.code,
      }));
      navigate('/couples/remote/play');
    } else {
      setError('Room not found or is full. Please check the code.');
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/couples/remote?code=${room?.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const link = `${window.location.origin}/couples/remote?code=${room?.code}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my Love or Lies quiz!',
        text: `${playerName} wants to play Love or Lies with you!`,
        url: link,
      });
    } else {
      copyLink();
    }
  };

  if (mode === 'waiting' && room) {
    return (
      <div className="page page--centered gradient-love">
        
        <div className="card text-center">
          <h2 className="title title--md">Waiting for your partner...</h2>
          <p style={{ color: '#4b5563', marginBottom: '24px' }}>
            Share this code with your partner to join:
          </p>

          <div className="room-code">
            <p className="room-code__code">{room.code}</p>
          </div>

          <div className="btn-group mb-6">
            <button onClick={shareLink} className="btn btn--gradient btn-icon">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Link
            </button>
            <button onClick={copyLink} className="btn btn--gray btn-icon">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="loading-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'choose') {
    return (
      <div className="page page--centered gradient-love">
        <div className="card">
          <h2 className="title title--md">Play Remotely</h2>
          <p className="text-center mb-6" style={{ color: '#4b5563' }}>
            Play with someone on another device
          </p>

          <div className="btn-group">
            <button onClick={() => setMode('create')} className="btn btn--gradient">
              Create a Room
            </button>
            <button onClick={() => setMode('join')} className="btn btn--outline">
              Join a Room
            </button>
            <button onClick={() => navigate('/couples')} className="btn btn--ghost">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--centered gradient-love">
      <div className="card">
        <h2 className="title title--md">
          {mode === 'create' ? 'Create a Room' : 'Join a Room'}
        </h2>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label className="label">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
            placeholder="Enter your name"
          />
        </div>

        {mode === 'join' && (
          <div className="form-group">
            <label className="label">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input input--code"
              placeholder="XXXXXX"
              maxLength={6}
            />
          </div>
        )}

        <div className="btn-group mt-4">
          <button
            onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
            className="btn btn--gradient"
          >
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </button>
          <button onClick={() => setMode('choose')} className="btn btn--ghost">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

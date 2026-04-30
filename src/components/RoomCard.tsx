import type { Room } from '../types';

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div key={room.name} style={{
      padding: '10px',
      border: '1px solid #555',
      borderRadius: '4px',
      backgroundColor: '#222',
      color: 'white'
    }}><h1>{room.name}</h1>
      {
        room.trials.map((trial) => (
          <div key={trial.name} style={{
            padding: '10px',
            border: '1px solid #555',
            borderRadius: '4px',
            backgroundColor: '#222',
            color: 'white'
          }}>
            <b>{trial.name}</b> - <b>[{trial.game}]</b><i>{trial.description}</i>
          </div>
        ))
      }
    </div>
  );
}
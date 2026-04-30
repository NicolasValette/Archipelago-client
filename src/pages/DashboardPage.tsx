import TrialCard from '../components/TrialCard';
import type { Room } from '../types';
// Exemple de données (plus tard, elles viendront d'une API ou d'un State)
const mockRooms: Room[] = [
  { 
    id: '1',
    name: "Room 1",
    constraint: "Contrainte",
    requiredKeys:[],
    trials: [{ id: 't1', name: 'Énigme Laser'}] 
  },
];

export function DashboardPage() {
  return (
    <main style={{ padding: '20px' }}>
      <h1>Liste des Salles et Épreuves</h1>
      
      {mockRooms.map((room) => (
        <section key={room.id} style={{ marginBottom: '30px' }}>
          <h2>Salle {room.name}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {room.trials.map((trial) => (
              <TrialCard key={trial.id} trial={trial} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
};
import  type { Trial } from '../types';

interface TrialCardProps {
  trial: Trial;
}

export function TrialCard({ trial}: TrialCardProps ) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', borderRadius: '8px' }}>
      <h4>{trial.name}</h4>
    </div>
  );
};

export default TrialCard;
import type { Trial } from '../types';
import copyIcon from '../assets/copy-solid-full.svg';

interface GameCardProps {
    game: string;
    trials: Trial[];
    onValidateTrial: (trialId: number) => void
}

export function GameCard({ game, trials, onValidateTrial }: GameCardProps) {

const handleValidateClick = (event: React.MouseEvent<HTMLButtonElement>, trialId: string) => {
    if (event.ctrlKey || event.metaKey) {
      console.log(`Validation du trial avec l'ID : ${trialId}`);
      onValidateTrial(parseInt(trialId));

    } else {
      alert("Action sécurisée : Maintenez la touche Ctrl enfoncée et cliquez pour valider !");
    }
  };

   return (
    <div key={game} style={{
      padding: '10px',
      border: '1px solid #555',
      borderRadius: '4px',
      backgroundColor: '#222',
      color: 'white'
    }}><h2>{game}</h2>
      {
        trials.map((trial) => (
          <div 
            key={trial.name} 
            style={{
              display: 'flex',          // 💡 Active Flexbox
              alignItems: 'center',     // 💡 Aligne verticalement le texte et le bouton au centre
              justifyContent: 'space-between', // 💡 Repousse le texte à gauche et le bouton à droite
              gap: '15px',              // 
              padding: '10px',
              border: '1px solid #555',
              borderRadius: '4px',
              backgroundColor: '#222',
              color: 'white'
            }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', color: '#ffb703' }}>[{trial.game}]</span>{' '}
              <span  style={{fontSize:'small', color: '#a7a59f'}}>{trial.name}</span>
              {trial.constraint?.length > 0 ?  <p  style={{fontSize:'small', color: '#a7a59f'}}>{trial.constraint}</p> : null}
              <p>{trial.description && <span style={{ color: '#ffffff', marginLeft: '8px' }}>{trial.description}</span>}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  const textToCopy = `> **${trial.description}** ${trial.constraint.length > 0 ? `(${trial.constraint})` : ''}\n> ${trial.game}\n> -# (*${trial.name}*)`;
                  navigator.clipboard.writeText(textToCopy);
                }}
                title="copy"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#7e0101',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap' // 💡 Empêche le texte du bouton de revenir à la ligne sur petit écran
                }}
              >
                <img 
                  src={copyIcon} 
                  alt="Copier" 
                  style={{ width: '16px', height: '16px' }} // 💡 Gère la taille de ton icône ici
                />
              </button>
              <button
                onClick={(e) => handleValidateClick(e, trial.id)}
                title="Ctrl + Clic pour valider"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#7e0101',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap' // 💡 Empêche le texte du bouton de revenir à la ligne sur petit écran
                }}
              >
                Valider (Ctrl+Clic)
              </button>
            </div>
          </div>
        ))
      }
    </div>
  );
}


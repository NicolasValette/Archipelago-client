import type { Client, Item } from 'archipelago.js';
import type { Room } from '../types';
import { useState } from 'react';
import { TrialsView } from './TrialsView';
import { RoomsView } from './RoomsView';
import { TestPage } from '../pages/TestPage';
import { RoomTracker } from './RoomTracker';

type TrackerTab = 'rooms' | 'trials';// | 'Test';

interface TrackerProps {
    client: Client;
    title: string;
    items: Item[];
    rooms: Room[];
    trials: string[]
    gameList: Set<string>
    trialDesc: string[];
    locationChecked: string[];
    lockCominations: Record<string, string[]>;
    allKeysColor: Record<string, string>;
    onBack: () => void; // Une fonction pour revenir à l'accueil
    sendCheck: (locationId: number) => void;
}



export const Tracker: React.FC<TrackerProps> = ({ rooms, items, lockCominations, client,onBack, sendCheck, allKeysColor, gameList, locationChecked }) => {
    const [currentTab, setCurrentTab] = useState<TrackerTab>('rooms');

    

    const renderTabContent = () => {
    switch (currentTab) {
        case 'rooms':
            return <RoomsView
                rooms={rooms}
                items={items} 
                lockCominations={lockCominations} 
                allKeysColor={allKeysColor}
                sendCheck={sendCheck} />;
        case 'trials':
            return <RoomTracker
                        title="Mes Trials & Rooms"
                        items={items} // Ici on passe tes messages ou ta liste d'items
                        client={client}
                        trials={[]}
                        rooms={rooms}
                        trialDesc={[]}
                        gameList={gameList}
                        locationChecked={locationChecked}
                        onBack={() => onBack}
                        sendCheck={sendCheck}
                    />;
        // case 'Test':
        //     return <TestPage client={client} />;
        default:
            return <div>Onglet inconnu</div>;
    }
};
    
    
    return (
        <div>
            <div>
                <button onClick={onBack} style={{ marginBottom: '20px' }}>
                    ⬅ Back to menu
                </button>
            </div>
            <nav>
                <button 
                onClick={() => setCurrentTab('rooms')}
                style={{ borderBottom: currentTab === 'rooms' ? '2px solid #00d4ff' : 'none'}}
                >
                    Rooms
                </button>
                <button 
                onClick={() => setCurrentTab('trials')}
                style={{ borderBottom: currentTab === 'trials' ? '2px solid #00d4ff' : 'none'}}
                >
                    Trials
                </button>
                {/* <button 
                onClick={() => setCurrentTab('Test')}
                style={{ borderBottom: currentTab === 'Test' ? '2px solid #00d4ff' : 'none'}}
                >
                    Test
                </button> */}
            </nav>
            <main style={{ marginTop: '20px' }}>
                {renderTabContent()}
            </main>
        </div>
     );
}
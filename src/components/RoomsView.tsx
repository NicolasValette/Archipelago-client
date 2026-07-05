import type { Item } from 'archipelago.js';
import type { Room } from "../types";
import { useMemo } from 'react';

interface RoomsViewProps {
    rooms: Room[];
    items: Item[];
    lockCominations: Record<string, string[]>;
    allKeysColor: Record<string, string>;
    sendCheck: (locationId: number) => void;
}

export const RoomsView = ({ rooms, items, lockCominations, allKeysColor, sendCheck }: RoomsViewProps) => {
    
    const ownedItemNames = useMemo(() => {
        return new Set(items.map(item => item.name)); 
    }, [items]);

    const roomState = (room: Room) => {
        const keys = lockCominations[room.name]?.filter((key: any) => !ownedItemNames.has(key));
        const coloredKeys = keys ? keys.map((key: any, index: number) => (
            <span key={key} style={{ color: allKeysColor[key] || 'white' }}> 
                {key}
                {index < keys.length - 1 && ', '}
            </span>
        )) : null;
        const unlockable = lockCominations[room.name]== null|| lockCominations[room.name]?.every((key: any) => ownedItemNames.has(key));
        const isOpen = ownedItemNames.has('Unlock: ' + room.name);
        if (isOpen) {
            return (
                <div style={{ color: 'green', fontWeight: 'bold' }}>
                    Room unlocked
                </div>
            );
        }
        return (
            <div>
                {!unlockable && coloredKeys && (
                    <div>
                        <b>Keys :</b> {coloredKeys}
                    </div>
                )}
                <button 
                    disabled={!unlockable} 
                    style={{ marginTop: '10px', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => sendCheck(parseInt(room.id))}
                >
                    {unlockable ? 'Unlock' : 'Locked'}
                </button>
            </div>
        )}

    return (
        <div>
            <h2>Liste des rooms</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div key={room.name} style={{
                            padding: '10px',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            backgroundColor: '#222',
                            color: 'white'
                            }}>
                                <h2><span style={{ color: '#ffffff' }}>{room.name}</span> <span style={{ fontSize: '0.5em', color: '#868686', fontStyle:'italic', fontWeight: 'normal' }}>({room.id})</span></h2>
                                {roomState(room)}
                            </div>
                    ))
                ) : (
                    <p>Aucun élément trouvé pour le moment...</p>
                )}
            </div>
        </div>
    );
}
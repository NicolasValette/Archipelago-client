import type { Item } from 'archipelago.js';
import type { Room } from "../types";
import { useMemo, useState } from 'react';

interface RoomsViewProps {
    rooms: Room[];
    items: Item[];
    lockCominations: Record<string, string[]>;
    allKeysColor: Record<string, string>;
    sendCheck: (locationId: number) => void;
}

export const RoomsView = ({ rooms, items, lockCominations, allKeysColor, sendCheck }: RoomsViewProps) => {
    const [isOpenHided, setIsOpenHided] = useState(true);

    const ownedItemNames = useMemo(() => {
        return new Set(items.map(item => item.name)); 
    }, [items]);

    const sortedRooms = useMemo(() => {
        return [...rooms]
        .filter(room => !isOpenHided || !ownedItemNames.has('Unlock: ' + room.name) )
        .sort((a, b) => {
            const aKeys = lockCominations[a.name]?.filter((key: any) => !ownedItemNames.has(key)) || [];
            const bKeys = lockCominations[b.name]?.filter((key: any) => !ownedItemNames.has(key)) || [];
            return aKeys.length - bKeys.length;
        });
    }, [rooms, lockCominations, ownedItemNames, isOpenHided]);

    const isRoomOpen = (room: Room) => {
        return ownedItemNames.has('Unlock: ' + room.name);
    }
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
    
    const numberOfKeysNeeded = (room: Room) => {
        const keys = lockCominations[room.name]?.filter((key: any) => !ownedItemNames.has(key));
        if (ownedItemNames.has('Unlock: ' + room.name)) return -1;
        return keys ? keys.length : 0;
    }

    return (
        <div>
            <h2>Liste des rooms ({sortedRooms.length})</h2>
             <div className="hideOpen" style={{ position: 'relative', width: '250px' }}>
                {/* Le bouton qui simule le select */}
                <label key="hideToggle" style={styles.dropdownItem}>
                    <input 
                        style={styles.checkbox}
                        type="checkbox" 
                        checked={isOpenHided}
                        onChange={() => setIsOpenHided(!isOpenHided)}
                    />
                    <span style={{ marginLeft: '8px' }}>Hide already opened rooms</span>
                </label>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
                {sortedRooms.length > 0 ? (
                    sortedRooms.map((room) => (  
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
const styles = {
    dropdownButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#2a2a2a',
        color: 'white',
        border: '1px solid #444',
        borderRadius: '4px',
        textAlign: 'left' as const,
        display: 'flex',
        justifyContent: 'space-between',
        cursor: 'pointer'
    },
    dropdownMenu: {
        position: 'absolute' as const,
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1e1e1e',
        border: '1px solid #444',
        borderRadius: '4px',
        marginTop: '4px',
        maxHeight: '250px',
        overflowY: 'auto' as const,
        zIndex: 1000,
        boxShadow: '0px 4px 10px rgba(0,0,0,0.5)'
    },
    dropdownItem: {
        fontSize: '0.85rem',
        lineHeight: '1.2',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        borderBottom: '1px solid #333'
    },
    checkbox: {
        transform: 'scale(0.85)',
        marginRight: '8px',
        cursor: 'pointer'
    }
};
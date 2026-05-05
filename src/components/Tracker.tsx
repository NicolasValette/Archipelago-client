import type { Client, Item } from 'archipelago.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Room } from '../types';
import { RoomCard } from './RoomCard';

// On définit ce dont le Tracker a besoin pour travailler
interface TrackerProps {
    title: string;
    items: Item[];
    rooms: Room[];
    trials: string[]
    gameList: Set<string>
    trialDesc: string[];
    client: Client;
    locationChecked: string[];
    onBack: () => void; // Une fonction pour revenir à l'accueil
}

export const Tracker: React.FC<TrackerProps> = ({ title, items, rooms, gameList, locationChecked, onBack }) => {

    const [selectedGame, setSelectedGame] = useState<string[]>(["All"]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => { /* Gestion du clic en dehors du dropdown pour le fermer */
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const availableGame = useMemo(() => {
        const sortedGames = Array.from(gameList).sort()
        return ["All", ...sortedGames]
    }, [gameList]);
    // const roomsTmp: Room[] = [];
    // rooms.forEach((item) => {
    //     RoomRecord[item.name] = item;
    //     item.trials.forEach((trial) => {
    //         TrialRecord[trial.name] = trial.description
    //     });
    // });

    // items.forEach((itm) => {
    //     if (itm.name.includes("Unlock")) {
    //         const unlockRoom = itm.name.split(':')[1].trim();
    //         const room = RoomRecord[unlockRoom]
    //         roomsTmp.push(room);
    //     }
    // });


    // const filteredRoom = useMemo(() => {
    //     // On crée un dictionnaire pour accéder aux salles par nom rapidement (O(1))
    //     const roomLookup: Record<string, Room> = {};
    //     rooms.forEach(r => roomLookup[r.name] = r);

    //     // On filtre les items pour trouver les unlocks et on récupère la salle correspondante
    //     return items
    //         .filter(itm => itm.name.includes("Unlock"))
    //         .map(itm => {
    //             const roomName = itm.name.split(':')[1]?.trim();
    //             return roomLookup[roomName];
    //         })
    //         .filter(room => room !== undefined); // On enlève les erreurs si une salle n'est pas trouvée
    // }, [items, rooms]);



    const filteredRooms = useMemo(() => {
        // Étape A : On récupère d'abord les noms des salles débloquées via les items
        const unlockedRoomNames = new Set(
            items
                .filter(itm => itm.name.includes("Unlock"))
                .map(itm => itm.name.split(':')[1]?.trim())
        );

      // B. On filtre et on transforme les données
        return rooms
            .filter(room => unlockedRoomNames.has(room.name)) // Garder uniquement les salles débloquées
            .map(room => {
                // Pour chaque salle, on filtre ses propres trials selon le jeu sélectionné
                const matchingTrials = selectedGame.includes("All")
                    ? room.trials.filter(t => !locationChecked.includes(t.name))
                    : room.trials.filter(t => !locationChecked.includes(t.name) && selectedGame.includes(t.game));

                // On renvoie une copie de la salle avec uniquement les trials filtrés
                return { ...room, trials: matchingTrials };
            })
            // C. On retire la salle si aucun trial ne correspond au filtre
            .filter(room => room.trials.length > 0);

    }, [items, rooms, locationChecked,selectedGame]);
    
    const toggleGame = (game: string) => {
        setSelectedGame(prev => 
            prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
        );
    };

    // Texte dynamique pour le bouton
    const buttonText = selectedGame.length === 0 
        ? "Tous les jeux" 
        : `${selectedGame.length} jeu(x) sélectionné(s)`;

    return (
        <div style={{ padding: '20px', textAlign: 'left' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>
                ⬅ Retour au menu
            </button>

            <h2>{title}</h2>

            {/* Dropdown pour filtrer par jeu */}
            <div className="custom-dropdown" ref={dropdownRef} style={{ position: 'relative', width: '250px' }}>
                {/* Le bouton qui simule le select */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    style={styles.dropdownButton}
                >
                    {buttonText} 
                    <span>{isOpen ? ' ▲' : ' ▼'}</span>
                </button>

                {/* La liste déroulante (conditionnelle) */}
                {isOpen && (
                    <div style={styles.dropdownMenu}>
                        {availableGame.map(game => (
                            <label key={game} style={styles.dropdownItem}>
                                <input 
                                    style={styles.checkbox}
                                    type="checkbox" 
                                    checked={selectedGame.includes(game)}
                                    onChange={() => toggleGame(game)}
                                />
                                <span style={{ marginLeft: '8px' }}>{game}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>


            <div style={{ display: 'grid', gap: '10px' }}>
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <RoomCard room={room} />
                    ))
                ) : (
                    <p>Aucun élément trouvé pour le moment...</p>
                )}
            </div>
        </div>
    );
};

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
        zIndex: 1000, // Pour passer au-dessus du contenu
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
        // RÉDUCTION ICI : On réduit un peu la taille de la case elle-même
        transform: 'scale(0.85)',
        marginRight: '8px',
        cursor: 'pointer'
    }
};
import type { Client, Item } from 'archipelago.js';
import React, { useEffect, useMemo, useState } from 'react';
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

    const [selectedGame, setSelectedGame] = useState("All")
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
                const matchingTrials = selectedGame === "All"
                    ? room.trials.filter(t => !locationChecked.includes(t.name))
                    : room.trials.filter(t => !locationChecked.includes(t.name) && t.game === selectedGame);

                // On renvoie une copie de la salle avec uniquement les trials filtrés
                return { ...room, trials: matchingTrials };
            })
            // C. On retire la salle si aucun trial ne correspond au filtre
            .filter(room => room.trials.length > 0);

    }, [items, rooms, locationChecked,selectedGame]);
    //setPlayerRoom(roomsTmp);
    return (
        <div style={{ padding: '20px', textAlign: 'left' }}>
            <button onClick={onBack} style={{ marginBottom: '20px' }}>
                ⬅ Retour au menu
            </button>

            <h2>{title}</h2>

            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333' }}>
                <label htmlFor="game-select" style={{ marginRight: '10px' }}>Filtrer par jeu :</label>
                <select
                    id="game-select"
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#2a2a2a', color: 'white', border: '1px solid #555' }}
                >
                    {availableGame.map(game => (
                        <option key={game} value={game}>{game}</option>
                    ))}
                </select>
                <small style={{ marginLeft: '15px', color: '#aaa' }}>
                    {filteredRooms.length} salle(s) visible(s)
                </small>
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
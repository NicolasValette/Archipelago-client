import { useEffect, useState, useRef, useMemo } from 'react'
import { Client, clientStatuses, Item } from 'archipelago.js'
import './App.css'
import { Terminal } from './Client/Terminal';
import { Tracker } from './components/Tracker';
import type { Room } from './types';

const client = new Client();

function App() {
  const isSubscribed = useRef(false);
  const [isConnected, setConnected] = useState(false)
  const [serverHostAndPort, setServerAndPort] = useState(
    localStorage.getItem("ap_host") || ""
  );
  const [slotName, setSlotName] = useState(
    localStorage.getItem("ap_slot") || ""
  );
  const [locationCheck, setLocactionCheck] = useState<number[]>([])
  const [passwd, setPassword] = useState("")
  const [messages, setMessages] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([])
  const [currentPage, setCurrentPage] = useState<'login' | 'tracker'>('login')
  const [rooms, setRooms] = useState<Room[]>([])
  const [gamesList, setGamesList] = useState<Set<string>>(new Set())
  const [locationId, setLocationId] = useState<Record<number, string>>({})
  const [errorMsg, setError] = useState("")
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const itemNames = useMemo(() => items.map(item => item.name), [items]);

  useEffect(() => {
    // On ne remonte que si la page change réellement
    window.scrollTo(0, 0);
  }, [currentPage]);



  useEffect(() => {
    if (isSubscribed.current) return;
    function handleLocationCheck(locationIds: number[]) {
      setLocactionCheck((prev) => [...new Set([...prev, ...locationIds])]);
    }
    function handleItems(itemsList: Item[]) {
      //console.log("Ajout d'un objet : " + itemsList)
      setItems((items) => [...items, ...itemsList]);
    }
    const handleMessage = (text: string) => {
      console.log("Message reçu par l'écouteur : " + text);
      setMessages((messages) => [...messages, text]);
    };

    client.messages.on("message", handleMessage);
    client.items.on("itemsReceived", handleItems);
    client.room.on("locationsChecked", handleLocationCheck)

    isSubscribed.current = true;

    return () => {
      client.messages.off("message", handleMessage);
      client.items.off("itemsReceived", handleItems);
      client.room.off("locationsChecked", handleLocationCheck)

      isSubscribed.current = false;
    };
  }, []);

  const locationNamesChecked = useMemo(() => {
    return locationCheck.map(id => locationId[id] || `Unknown Location (${id})`);
  }, [locationCheck, locationId]);

  const Connect = async () => {
    console.log("Connect")
    // 1. On indique que la connexion commence (pour désactiver le bouton)
    setMessages([]);
    setItems([])
    if (!serverHostAndPort || !slotName) {
      console.error("Host and/or slot name is missing");
      return;
    }
    try {
      setError(""); // Réinitialise les erreurs précédentes
      localStorage.setItem("ap_host", serverHostAndPort);
      localStorage.setItem("ap_slot", slotName);
      console.log("Tentative de connexion à :", serverHostAndPort);
      await client.login(serverHostAndPort, slotName, "", { tags: ["Niko Client", "Tracker"], slotData: true });
      setConnected(true);
      //handleItems(client.items.received);
      console.log("Récupération des données du package " + client.game);
      const tempData = await client.players.self.fetchSlotData() // Récupère les données du slot pour avoir toute les info nécéssaire
      const area = tempData['area_trials'];
      const areaGameDict = tempData?.['area_games'] as Record<string, string>
      const objectivesDict = tempData?.['area_trial_game_objectives'] as Record<string, any>
      const gamesSet = new Set<string>();
      const dataPackage = await client.package.findPackage(client.game);
      if (dataPackage) {
        // On récupère la table qui transforme l'ID en Nom
        const locTable = dataPackage.reverseLocationTable as Record<number, string>;
        setLocationId(locTable);
      }
      const loc = dataPackage?.reverseLocationTable as Record<number, string>
      setLocationId(loc);
      const areaList: Room[] = Object.entries(area as Record<string, any>).map(([roomKey, trialsData]) => {
        return {
          id: roomKey,
          name: roomKey,
          trials: Object.entries(trialsData as Record<string, any>).map(([key2, trialGameName]) => {
            const description = objectivesDict[trialGameName as string];
            let trialGame;
            // console.log("game : " + game);
            if (areaGameDict[roomKey] as string === "Game Medley") {
              //    console.log("description : " + description as string);
              trialGame = (description as string).split("->")[0].trim();
            }
            else {
              trialGame = areaGameDict[roomKey];
            }
            //console.log("Ajout du jeu : " + trialGame as string) 
            gamesSet.add(trialGame as string);
            return {
              id: key2,
              name: trialGameName as string,
              description: description,
              game: trialGame as string
            }
          })
        };
      });
      setRooms(areaList);
      setGamesList(gamesSet);

      // await getStoredData(client.game);
      // await setupTrackerData(client.game);
      console.log("recup")
      setCurrentPage('tracker'); // On change d'état pour changer de page
    }
    catch (erreur) {
      console.error("Erreur : ", (erreur as Error).message);
      setError((erreur as Error).message);
      setConnected(false); // On réactive le bouton en cas d'échec
      setCurrentPage('login'); // On reste sur la page de connexion en cas d'erreur
      Disconnect();
    }

  };

  const Disconnect = () => {
    console.log("Disonnect")
    setConnected(false);
    window.scrollTo(0, 0);

    try {
      /* deconnection */
      console.log("Deconnexion :", serverHostAndPort);
      client.updateStatus(clientStatuses.disconnected);
      client.socket.disconnect();
      setMessages([]);
      setItems([])

    } catch (erreur) {
      console.error("La connexion a échoué", erreur);
      setConnected(false); // On réactive le bouton en cas d'échec
    }
  };

  
  return (
    <div className="App">
      {currentPage === 'login' ?
        (
          <div>
            <h1>Client Archipelago</h1>
            <p>Serveur Host & Port</p>
            <input type="text" placeholder='Ex: archipelago.gg:38281' value={serverHostAndPort} onChange={(e) => setServerAndPort(e.target.value)} />
            <p>Player Name</p>
            <input type="text" placeholder='SlotName' value={slotName} onChange={(e) => setSlotName(e.target.value)} />
            <p>Password</p>
            <input type="password" placeholder='leave blank if no password' value={passwd} onChange={(e) => setPassword(e.target.value)} />
            <p>Statut : {isConnected ? "Connecté ✅" : "Déconnecté ❌"} {errorMsg ? errorMsg : ""}</p>
            {/* Le bouton pour se connecter */}
            <div style={{ marginTop: '10px' }}>
              {!isConnected ? (
                <button onClick={Connect}>Se connecter</button>
              ) : (
                <button onClick={Disconnect}>Se déconnecter</button>
              )}
            </div>

            <Terminal title="Log du serveur" messages={messages} />

            <Terminal title="Liste des objets" messages={itemNames} />

          </div>
        ) :
        (
          <Tracker
            title="Mes Trials & Rooms"
            items={items} // Ici on passe tes messages ou ta liste d'items
            client={client}
            trials={[]}
            rooms={rooms}
            trialDesc={[]}
            gameList={gamesList}
            locationChecked={locationNamesChecked}
            onBack={() => setCurrentPage('login')}
          />
        )
      }
      <div style={{ fontSize: '0.7em', color: '#666' }}>
        <p>Version : {appVersion}</p>
        <p style={{ fontSize: '0.6em' }}><i>NoNiDev - 2026</i></p>
      </div>
    </div>
  );
}
export default App

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
  // const [serverHostAndPort, setServerAndPort] = useState("webhost.etsuna.ovh:53828")
  // const [slotName, setSlotName] = useState("BigKeep")
  // const [serverHostAndPort, setServerAndPort] = useState("localhost:38281")
  // const [slotName, setSlotName] = useState("Niko")
  const [serverHostAndPort, setServerAndPort] = useState("")
  const [slotName, setSlotName] = useState("")
  const [locationCheck, setLocactionCheck] = useState<number[]>([])
  const [passwd, setPassword] = useState("")
  const [messages, setMessages] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([])
  const [currentPage, setCurrentPage] = useState<'login' | 'tracker'>('login')
  const [rooms, setRooms] = useState<Room[]>([])
  const [gamesList, setGamesList] = useState<Set<string>>(new Set())
  const [locationId, setLocationId] = useState<Record<number, string>>({})
  const appVersion = import.meta.env.VITE_APP_VERSION;

  useEffect(() => {
    // On ne remonte que si la page change réellement
    window.scrollTo(0, 0);
  }, [currentPage]);


  
  useEffect(() => {
    if (isSubscribed.current) return;
    function handleLocationCheck(locationIds: number[])
    {
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
    setConnected(true);
    try {
      // C'est ici que la magie opère avec archipelago.js
      console.log("Tentative de connexion à :", serverHostAndPort);
      await client.login(serverHostAndPort, slotName, "", { tags: ["Niko Client", "Tracker"], slotData: true });
      //handleItems(client.items.received);
    } catch (erreur) {
      console.error("La connexion a échoué", erreur);
      setConnected(false); // On réactive le bouton en cas d'échec
      Disconnect();
    }
    try {
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
    }
    catch (erreur) {
      console.error("Récupération des données échouées : " + erreur)
    }
    setCurrentPage('tracker'); // On change d'état pour changer de page
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

  // const setupTrackerData = async (gameName: string) => {
  //   // 1. Récupérer le dictionnaire complet du jeu
  //   const dataPackage = await client.package.fetchPackage([gameName]);
  //   var st = client.storage.fetchItemNameGroups(gameName);

  //   if (dataPackage) {
  //     // Liste de tous les items possibles dans le jeu

  //     const allPossibleItems = Object.entries(dataPackage.games[gameName]).map(([id, name]) => ({
  //       id: parseInt(id),
  //       name: name
  //     }));

  //     // // Liste de tous les lieux (Trials, Keys, etc.)
  //     // const allLocations = Object.entries(dataPackage.location_id_to_name).map(([id, name]) => ({
  //     //   id: parseInt(id),
  //     //   name: name
  //     // }));

  //     console.log("Données chargées pour le tracker !");
  //     // C'est ici que tu filtrerais pour ne garder que "Keymaster's Keep", etc.
  //     setAllItems(allPossibleItems.map(item => client.package.lookupItemName(gameName, item.id)))
  //   }
  // };
  // const getStoredData = async (gameName: string) => {
  //   const data = await client.storage.fetchItemNameGroups(gameName);
  //   const data2 = await client.storage.fetchLocationNameGroups(gameName);
  //   const data5 = client.storage.store
  //   const data3 = await client.storage.fetch('slot_data');
  //   const data4 = await client.storage.fetch('area_trial_game_objectives');
  //   console.log("recup");
  // }


  return (
    <div className="App">
      {currentPage === 'login' ?
        (
          <div>
            <h1>Client Archipelago</h1>
            <p>Serveur Host & Port</p>
            <input type="text" value={serverHostAndPort} onChange={(e) => setServerAndPort(e.target.value)} />
            <p>Player Name</p>
            <input type="text" value={slotName} onChange={(e) => setSlotName(e.target.value)} />
            <p>Password</p>
            <input type="text" value={passwd} onChange={(e) => setPassword(e.target.value)} />
            <p>Statut : {isConnected ? "Connecté ✅" : "Déconnecté ❌"}</p>
            {/* Le bouton pour se connecter */}
            <div style={{ marginTop: '10px' }}>
              {!isConnected ? (
                <button onClick={Connect}>Se connecter</button>
              ) : (
                <button onClick={Disconnect}>Se déconnecter</button>
              )}
            </div>

            <Terminal title="Log du serveur" messages={messages} />

            <Terminal title="Liste des objets" messages={(items.map(item => item.name))} />

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
      <div style={{ fontSize: '0.8em', color: '#666' }}>
        Version : {appVersion}
      </div>
    </div>
  );
}
export default App

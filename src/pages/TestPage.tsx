import { clientStatuses, type Client, type LocationChecksPacket } from 'archipelago.js';
import { useState } from 'react';
interface TrackerProps {
    client: Client;
}

export const TestPage : React.FC<TrackerProps> = ({ client }) => {
    const [customValue, setCustomValue] = useState('Lancer le test');
    const [customResult, setCustomResult] = useState('');

    const testScoutItem = async () => {
        console.log("Test Scout item button clicked!")
        const ids = [parseInt(customValue)]
        const itms = await client.scout(ids, 0)
        const listName = itms.map(item => item.name).join(", ");
        setCustomResult(listName);
    }
    const testCheckItem = () => {
        console.log("Test Check item button clicked!")
        const pack :LocationChecksPacket = {
            cmd: "LocationChecks",
            locations: [parseInt(customValue)]}
            
        client.check(parseInt(customValue))
        var t = client.socket.send(pack);
        
        setCustomResult(`Check sent for location ID: ${customValue}`);
    }
    const testGoal = () => {
        console.log("Test Goal button clicked!")
        //client.goal();
        client.updateStatus(clientStatuses.goal);
        setCustomResult(`Goal sent !`);
        client.socket.send()
    }


    return (
        <main style={{ padding: '20px' }}>
            <h1>Divers Test</h1>
            <section style={{ marginBottom: '30px' }}>
                <input type="text" placeholder='customValue' value={customValue} onChange={(e) => setCustomValue(e.target.value)} />
                <div style={{ marginBottom: '10px' }}>
                <button onClick={testScoutItem}>
                    Test Scout item
                </button></div>
                <div style={{ marginBottom: '10px' }}>
                    <button onClick={testCheckItem}>
                        Test Check item
                    </button>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <button onClick={testGoal}>
                        Test Goal
                    </button>
                </div>
                <textarea
                    readOnly
                    value={`Custom Result: ${customResult}`}
                    style={{ width: '100%', height: '100px', marginTop: '10px' }}
                />
            </section>
            <section style={{ marginBottom: '30px' }}>
                <h2>Autres tests</h2>
                <p>À venir...</p>
            </section>

        </main>
    );
};
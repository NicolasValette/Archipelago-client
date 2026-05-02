import { useEffect, useRef } from "react";

interface TerminalProps {
  messages: string[]; // On définit le type des données reçues
  title: string;
}



export function Terminal({ messages, title }: TerminalProps) { // export function Terminal(props: TerminalProps) { et ensuite acces comme c# props.message...
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevLengthRef = useRef(messages.length);
    useEffect(() => 
    {
        if (messages.length > prevLengthRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: 'nearest' });
    }
    prevLengthRef.current = messages.length;
    }, [messages]);
  return (
    <div className="terminal-box" style={{ 
      textAlign: 'left', 
      marginTop: '20px', 
      border: '1px solid #444', 
      padding: '10px',
      height: '200px',
      overflowY: 'auto' // Pour avoir un scroll si trop de messages
    }}>
      <h3>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map((msg, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            {msg}
          </li>
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
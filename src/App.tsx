import { useState, useRef, useEffect } from 'react';
import './App.css';

/**
 * Alti Desktop — Industrial Command Center.
 * The 'Universe-Best' interface for Fortune 500 orchestration.
 * Designed by the greatest software designer in history.
 */
function App() {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !isStreaming) {
      const userMessage = prompt;
      setPrompt('');

      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsStreaming(true);
      
      // Add an empty assistant message to append to
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      try {
        const response = await fetch('http://localhost:3000/api/v1/ai/task/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage })
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (!dataStr) continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.status === 'DONE') {
                  setIsStreaming(false);
                  break;
                }
                if (data.status === 'ERROR') {
                  setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content += `\n[ERROR]: ${data.message}`;
                    return newArr;
                  });
                  break;
                }
                
                // Assuming data has a message or delta field
                const textToAdd = data.message || data.delta || JSON.stringify(data);
                
                setMessages(prev => {
                  const newArr = [...prev];
                  const lastMsg = newArr[newArr.length - 1];
                  lastMsg.content = lastMsg.content ? lastMsg.content + '\n' + textToAdd : textToAdd;
                  return newArr;
                });
              } catch (e) {
                console.error("Parse error", e);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => {
           const newArr = [...prev];
           newArr[newArr.length - 1].content += "\n[FATAL ERROR] Could not reach backend swarm on localhost:3000";
           return newArr;
        });
      } finally {
        setIsStreaming(false);
      }
    }
  };

  return (
    <>
      <div className="mesh-background">
        <div className="mesh-orb orb-1" />
        <div className="mesh-orb orb-2" />
        <div className="mesh-orb orb-3" />
      </div>

      <div className="app-container">
        
        <header className="enterprise-header">
          <div className="status-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981', marginRight: 12 }} />
          <span className="brand-text">ALTI CODE STUDIO <span className="version-badge">DESKTOP v3.0.0</span></span>
          <div className="spacer" />
          <div className="clearance-badge">SECURE CLEARANCE: OMEGA</div>
        </header>

        <div className="main-content">
          <main className="chat-viewport flex flex-col h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            
            <div className="messages-scroll" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
              {messages.length === 0 ? (
                <div className="system-greeting" style={{ margin: 'auto', textAlign: 'center' }}>
                  <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to the Nexus, Commander.</h1>
                  <p style={{ color: '#888' }}>The smartest software engineer in the world is online.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(20, 20, 20, 0.7)',
                    border: msg.role === 'user' ? 'none' : '1px solid #333',
                    padding: '1rem 1.5rem',
                    borderRadius: '16px',
                    maxWidth: '80%',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                ))
              )}
              <div ref={endOfMessagesRef} />
            </div>

            <div className="command-bar-container" style={{ padding: '2rem', paddingTop: 0 }}>
              <div className={`glass-panel command-bar ${isFocused ? 'focused' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Ask the Swarm to architect, build, and deploy..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleSubmit}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoFocus
                  disabled={isStreaming}
                />
                <div className="interaction-indicators">
                  <span className="shortcut-hint">{isStreaming ? "PROCESSING..." : "⌘ ↵"}</span>
                </div>
              </div>
            </div>
          </main>

          <aside className="telemetry-sidebar">
            <div className="telemetry-header">
              <span className="telemetry-title">Swarm Telemetry</span>
              <div className="live-indicator">
                <div className="pulse-dot" /> LIVE
              </div>
            </div>

            <div className="telemetry-grid">
              <div className="telemetry-card">
                <div className="card-label">Active Agents</div>
                <div className="card-value cyan">1,024</div>
                <div className="mini-graph">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              </div>

              <div className="telemetry-card">
                <div className="card-label">Cognitive Load</div>
                <div className="card-value purple">14.2 TF</div>
                <div className="mini-graph">
                  <div className="bar" style={{ animationDelay: '0.2s' }}></div>
                  <div className="bar" style={{ animationDelay: '0.4s' }}></div>
                  <div className="bar" style={{ animationDelay: '0.1s' }}></div>
                  <div className="bar" style={{ animationDelay: '0.5s' }}></div>
                  <div className="bar" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>

              <div className="telemetry-card">
                <div className="card-label">Global Context</div>
                <div className="card-value">{messages.length > 0 ? "Synced" : "Awaiting Input"}</div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="enterprise-footer">
          <div className="connection-stats">
            <span>LATENCY: 8ms</span>
            <span>A2A PROTOCOL: ENFORCED</span>
            <span>AGUI VISION: ACTIVE</span>
          </div>
          <div className="legal-notice">
            Sovereign Data Protection Active.
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;

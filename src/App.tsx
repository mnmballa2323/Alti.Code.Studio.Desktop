import { useState } from 'react';
import './App.css';

/**
 * Alti Desktop — Industrial Command Center.
 * The 'Universe-Best' interface for Fortune 500 orchestration.
 * Designed by the greatest software designer in history.
 */
function App() {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
          <main className="chat-viewport">
            <div className="system-greeting">
              <h1>Welcome to the Nexus, Commander.</h1>
              <p>The smartest software engineer in the world is online.</p>
            </div>

            <div className="command-bar-container">
              <div className={`glass-panel command-bar ${isFocused ? 'focused' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Ask the Swarm to architect, build, and deploy..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoFocus
                />
                <div className="interaction-indicators">
                  <span className="shortcut-hint">⌘ ↵</span>
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
                <div className="card-value">Synced</div>
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

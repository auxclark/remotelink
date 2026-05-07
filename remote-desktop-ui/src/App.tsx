import { useEffect, useRef, useState } from "react";
import { Monitor, Eye, Plus, ArrowRight, ArrowLeft, Copy, Check, Shield, Wifi, WifiOff, Radio, PhoneOff, Loader } from "lucide-react";
import { useSignalR } from "./hooks/useSignalR";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --bg2: #0d1117;
    --bg3: #161b22;
    --bg4: #21262d;
    --border: #30363d;
    --border2: #3d444d;
    --text: #e6edf3;
    --text2: #8b949e;
    --text3: #6e7681;
    --green: #00ff88;
    --green2: #00cc6a;
    --green-dim: rgba(0,255,136,0.08);
    --green-glow: rgba(0,255,136,0.15);
    --blue: #58a6ff;
    --red: #ff4444;
    --yellow: #e3b341;
    --mono: 'Space Mono', monospace;
    --sans: 'DM Sans', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Grid background */
  .app-bg {
    min-height: 100vh;
    background:
      linear-gradient(var(--bg) 0%, transparent 100%),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(48,54,61,0.3) 39px, rgba(48,54,61,0.3) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(48,54,61,0.3) 39px, rgba(48,54,61,0.3) 40px);
    background-color: var(--bg);
  }

  /* Topbar */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 56px;
    border-bottom: 1px solid var(--border);
    background: rgba(8,12,16,0.9);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.05em;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    background: var(--green);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon svg { width: 16px; height: 16px; }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-family: var(--mono);
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid;
    transition: all 0.3s;
  }

  .status-pill.connected {
    color: var(--green);
    border-color: rgba(0,255,136,0.3);
    background: var(--green-dim);
  }

  .status-pill.disconnected {
    color: var(--text3);
    border-color: var(--border);
    background: transparent;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .status-pill.connected .status-dot {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  /* Main content */
  .main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 60px 32px;
  }

  /* Hero */
  .hero {
    text-align: center;
    margin-bottom: 64px;
    animation: fadeUp 0.6s ease both;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--green);
    border: 1px solid rgba(0,255,136,0.3);
    background: var(--green-dim);
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 24px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .hero h1 {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }

  .hero h1 span {
    color: var(--green);
    font-family: var(--mono);
  }

  .hero p {
    font-size: 16px;
    color: var(--text2);
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.6;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Cards grid */
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border2), transparent);
  }

  .card:hover {
    border-color: var(--border2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  .card.host-card:hover { border-color: rgba(0,255,136,0.3); }
  .card.viewer-card:hover { border-color: rgba(88,166,255,0.3); }

  .card-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 20px;
  }

  .host-card .card-icon { background: var(--green-dim); }
  .viewer-card .card-icon { background: rgba(88,166,255,0.08); }

  .card h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .card p {
    font-size: 13px;
    color: var(--text2);
    line-height: 1.5;
    margin-bottom: 24px;
  }

  /* Buttons */
  .btn {
    width: 100%;
    padding: 12px 20px;
    border-radius: 10px;
    border: none;
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-green {
    background: var(--green);
    color: #000;
  }

  .btn-green:hover {
    background: var(--green2);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px var(--green-glow);
  }

  .btn-blue {
    background: rgba(88,166,255,0.15);
    color: var(--blue);
    border: 1px solid rgba(88,166,255,0.3);
  }

  .btn-blue:hover {
    background: rgba(88,166,255,0.25);
    transform: translateY(-1px);
  }

  .btn-ghost {
    background: var(--bg3);
    color: var(--text2);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover {
    border-color: var(--border2);
    color: var(--text);
  }

  /* Input */
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .input-label {
    font-size: 11px;
    font-family: var(--mono);
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .code-input {
    width: 100%;
    padding: 12px 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: var(--mono);
    font-size: 18px;
    letter-spacing: 0.15em;
    text-align: center;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .code-input:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(88,166,255,0.1);
  }

  .code-input::placeholder {
    color: var(--text3);
    letter-spacing: 0.05em;
    font-size: 14px;
  }

  /* Host waiting state */
  .host-waiting {
    text-align: center;
    animation: fadeUp 0.4s ease both;
  }

  .session-code-display {
    margin: 40px auto;
    max-width: 480px;
  }

  .session-code-label {
    font-size: 11px;
    font-family: var(--mono);
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
  }

  .session-code-box {
    background: var(--bg2);
    border: 1px solid rgba(0,255,136,0.3);
    border-radius: 16px;
    padding: 32px;
    position: relative;
    box-shadow: 0 0 40px rgba(0,255,136,0.05);
  }

  .session-code-number {
    font-family: var(--mono);
    font-size: clamp(28px, 6vw, 44px);
    font-weight: 700;
    color: var(--green);
    letter-spacing: 0.2em;
    margin-bottom: 8px;
  }

  .session-code-hint {
    font-size: 12px;
    color: var(--text3);
  }

  .copy-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 11px;
    font-family: var(--mono);
    color: var(--text2);
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-btn:hover { color: var(--green); border-color: rgba(0,255,136,0.3); }

  .waiting-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text3);
    margin-top: 24px;
  }

  .waiting-dots span {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text3);
    animation: dot 1.4s infinite;
  }

  .waiting-dots span:nth-child(2) { animation-delay: 0.2s; }
  .waiting-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot {
    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1); }
  }

  /* Steps */
  .steps {
    display: flex;
    gap: 24px;
    margin-top: 40px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text3);
  }

  .step-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 10px;
    flex-shrink: 0;
  }

  /* Viewer / stream */
  .viewer-panel {
    animation: fadeUp 0.4s ease both;
  }

  .stream-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 14px 20px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 12px;
  }

  .stream-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stream-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--red);
    background: rgba(255,68,68,0.1);
    border: 1px solid rgba(255,68,68,0.3);
    padding: 3px 10px;
    border-radius: 20px;
  }

  .stream-badge .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--red);
    animation: pulse 1s infinite;
  }

  .stream-title {
    font-size: 13px;
    font-weight: 500;
  }

  .stream-code {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text3);
  }

  .stream-controls {
    display: flex;
    gap: 8px;
  }

  .control-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg3);
    color: var(--text2);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-btn:hover { color: var(--text); border-color: var(--border2); }

  .control-btn.danger:hover {
    color: var(--red);
    border-color: rgba(255,68,68,0.4);
    background: rgba(255,68,68,0.08);
  }

  .canvas-wrapper {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: #000;
    position: relative;
  }

  .canvas-wrapper canvas {
    width: 100%;
    display: block;
  }

  .canvas-placeholder {
    aspect-ratio: 16/9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text3);
    font-size: 13px;
    background: var(--bg2);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--border);
    border-top-color: var(--green);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer */
  .footer {
    text-align: center;
    padding: 32px;
    font-size: 11px;
    font-family: var(--mono);
    color: var(--text3);
    border-top: 1px solid var(--border);
    margin-top: 80px;
  }

  @media (max-width: 600px) {
    .cards { grid-template-columns: 1fr; }
    .main { padding: 40px 16px; }
    .topbar { padding: 0 16px; }
  }
`;

export default function App() {
  const { isConnected, sessionCode, createSession, joinSession, onReceiveFrame, onSessionEnded } = useSignalR();
  const [inputCode, setInputCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [mode, setMode] = useState<"host" | "viewer" | null>(null);
  const [copied, setCopied] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    onReceiveFrame((frameData: ArrayBuffer) => {
      const blob = new Blob([frameData], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.naturalWidth || 1280;
        canvas.height = img.naturalHeight || 720;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setFrameCount(f => f + 1);
      };
      img.src = url;
    });

    onSessionEnded(() => {
      setJoined(false);
      setMode(null);
    });
  }, [isConnected]);

  const handleHost = async () => {
    setMode("host");
    await createSession();
  };

  const handleJoin = async () => {
    const success = await joinSession(inputCode);
    if (success) { setMode("viewer"); setJoined(true); }
    else alert("Session not found. Check the code and try again.");
  };

  const handleCopy = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    setMode(null);
    setJoined(false);
    setFrameCount(0);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-bg">
        {/* Topbar */}
        <header className="topbar">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="1" y="2" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5"/>
                <path d="M5 14h6M8 12v2" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            REMOTELINK
          </div>
          <div className={`status-pill ${isConnected ? "connected" : "disconnected"}`}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? "SERVER ONLINE" : "DISCONNECTED"}
          </div>
        </header>

        <main className="main">
          {/* Home screen */}
          {!mode && (
            <>
              <div className="hero">
                <div className="hero-badge">
                  <Shield size={11} /> Secure Remote Access
                </div>
                <h1>Control any PC<br/>from your <span>browser</span></h1>
                <p>Share your screen or connect to a remote machine instantly. No plugins, no setup — just a session code.</p>
              </div>

              <div className="cards">
                {/* Host card */}
                <div className="card host-card">
                  <div className="card-icon"><Monitor size={20} color="var(--green)" /></div>
                  <h2>Host a session</h2>
                  <p>Share your screen with a remote viewer. A unique session code will be generated.</p>
                  <button className="btn btn-green" onClick={handleHost}>
                    <Plus size={16} /> Create Session
                  </button>
                </div>

                {/* Viewer card */}
                <div className="card viewer-card">
                  <div className="card-icon"><Eye size={20} color="var(--blue)" /></div>
                  <h2>Join a session</h2>
                  <p>Enter the 9-digit code shared by the host to view their screen remotely.</p>
                  <div className="input-group">
                    <label className="input-label">Session Code</label>
                    <input
                      className="code-input"
                      placeholder="000 000 000"
                      value={inputCode}
                      maxLength={9}
                      onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    />
                  </div>
                  <button className="btn btn-blue" onClick={handleJoin} disabled={inputCode.length < 9}>
                    Connect <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Host waiting */}
          {mode === "host" && (
            <div className="host-waiting">
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Waiting for viewer</h2>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>Share this code with the person you want to give access to</p>

              <div className="session-code-display">
                <div className="session-code-label">Your session code</div>
                <div className="session-code-box">
                  <button className="copy-btn" onClick={handleCopy}>
                    {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                  </button>
                  <div className="session-code-number">
                    {sessionCode ? sessionCode.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : "Generating..."}
                  </div>
                  <div className="session-code-hint">Valid for this session only</div>
                </div>
              </div>

              <div className="waiting-indicator">
                <span>Waiting for connection</span>
                <span className="waiting-dots">
                  <span/><span/><span/>
                </span>
              </div>

              <div className="steps">
                <div className="step"><span className="step-num">1</span>Run the Agent app on this PC</div>
                <div className="step"><span className="step-num">2</span>Share the code above</div>
                <div className="step"><span className="step-num">3</span>Viewer enters code to connect</div>
              </div>

              <button className="btn btn-ghost" style={{ maxWidth: 200, margin: "40px auto 0" }} onClick={() => setMode(null)}>
                <ArrowLeft size={15} /> Back
              </button>
            </div>
          )}

          {/* Viewer stream */}
          {mode === "viewer" && joined && (
            <div className="viewer-panel">
              <div className="stream-header">
                <div className="stream-info">
                  <div className="stream-badge">
                    <Radio size={10} />
                    LIVE
                  </div>
                  <div>
                    <div className="stream-title">Remote Session</div>
                    <div className="stream-code">Code: {inputCode}</div>
                  </div>
                </div>
                <div className="stream-controls">
                  <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)", alignSelf: "center" }}>
                    {frameCount} frames
                  </span>
                  <button className="control-btn danger" onClick={handleDisconnect}>
                    <PhoneOff size={13} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="canvas-wrapper">
                {frameCount === 0 && (
                  <div className="canvas-placeholder">
                    <Loader size={28} color="var(--green)" style={{ animation: "spin 0.8s linear infinite" }} />
                    <span>Waiting for stream to begin...</span>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: frameCount > 0 ? "block" : "none" }}/>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          REMOTELINK v0.1.0 — Built with ASP.NET Core + SignalR + React
        </footer>
      </div>
    </>
  );
}
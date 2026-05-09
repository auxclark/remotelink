import { useEffect, useRef, useState } from "react";
import {
  Monitor, Eye, Plus, ArrowRight, ArrowLeft,
  Copy, Check, Shield, Wifi, WifiOff, Radio,
  PhoneOff, MousePointer, MousePointer2,
  ShieldCheck, ShieldX, ShieldAlert
} from "lucide-react";
import { useSignalR } from "./hooks/useSignalR";
import { useScreenCapture } from "./hooks/useScreenCapture";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c10; --bg2: #0d1117; --bg3: #161b22; --bg4: #21262d;
    --border: #30363d; --border2: #3d444d;
    --text: #e6edf3; --text2: #8b949e; --text3: #6e7681;
    --green: #00ff88; --green2: #00cc6a;
    --green-dim: rgba(0,255,136,0.08); --green-glow: rgba(0,255,136,0.15);
    --blue: #58a6ff; --red: #ff4444; --yellow: #e3b341;
    --mono: 'Space Mono', monospace; --sans: 'DM Sans', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }
  .app-bg {
    min-height: 100vh;
    background: repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(48,54,61,0.3) 39px, rgba(48,54,61,0.3) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(48,54,61,0.3) 39px, rgba(48,54,61,0.3) 40px);
    background-color: var(--bg);
  }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px; border-bottom: 1px solid var(--border);
    background: rgba(8,12,16,0.9); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 14px; font-weight: 700; }
  .logo-icon { width: 28px; height: 28px; background: var(--green); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .status-pill { display: flex; align-items: center; gap: 6px; font-size: 12px; font-family: var(--mono); padding: 4px 12px; border-radius: 20px; border: 1px solid; transition: all 0.3s; }
  .status-pill.connected { color: var(--green); border-color: rgba(0,255,136,0.3); background: var(--green-dim); }
  .status-pill.disconnected { color: var(--text3); border-color: var(--border); }
  .main { max-width: 1000px; margin: 0 auto; padding: 60px 32px; }
  .hero { text-align: center; margin-bottom: 64px; animation: fadeUp 0.6s ease both; }
  .hero-badge { display: inline-flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; color: var(--green); border: 1px solid rgba(0,255,136,0.3); background: var(--green-dim); padding: 4px 12px; border-radius: 20px; margin-bottom: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
  .hero h1 { font-size: clamp(36px, 6vw, 56px); font-weight: 600; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 16px; }
  .hero h1 span { color: var(--green); font-family: var(--mono); }
  .hero p { font-size: 16px; color: var(--text2); max-width: 480px; margin: 0 auto; line-height: 1.6; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; animation: fadeUp 0.6s 0.1s ease both; }
  .card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 32px; transition: border-color 0.2s, box-shadow 0.2s; position: relative; overflow: hidden; }
  .card:hover { border-color: var(--border2); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .card.host-card:hover { border-color: rgba(0,255,136,0.3); }
  .card.viewer-card:hover { border-color: rgba(88,166,255,0.3); }
  .card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .host-card .card-icon { background: var(--green-dim); }
  .viewer-card .card-icon { background: rgba(88,166,255,0.08); }
  .card h2 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .card p { font-size: 13px; color: var(--text2); line-height: 1.5; margin-bottom: 24px; }
  .btn { width: 100%; padding: 12px 20px; border-radius: 10px; border: none; font-family: var(--sans); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-green { background: var(--green); color: #000; }
  .btn-green:hover { background: var(--green2); transform: translateY(-1px); box-shadow: 0 4px 20px var(--green-glow); }
  .btn-blue { background: rgba(88,166,255,0.15); color: var(--blue); border: 1px solid rgba(88,166,255,0.3); }
  .btn-blue:hover { background: rgba(88,166,255,0.25); transform: translateY(-1px); }
  .btn-ghost { background: var(--bg3); color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
  .btn-red { background: rgba(255,68,68,0.15); color: var(--red); border: 1px solid rgba(255,68,68,0.3); }
  .btn-red:hover { background: rgba(255,68,68,0.25); }
  .btn-yellow { background: rgba(227,179,65,0.15); color: var(--yellow); border: 1px solid rgba(227,179,65,0.3); }
  .btn-yellow:hover { background: rgba(227,179,65,0.25); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .input-label { font-size: 11px; font-family: var(--mono); color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; }
  .code-input { width: 100%; padding: 12px 14px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--mono); font-size: 18px; letter-spacing: 0.15em; text-align: center; outline: none; transition: border-color 0.2s; }
  .code-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(88,166,255,0.1); }
  .code-input::placeholder { color: var(--text3); font-size: 14px; }
  .host-waiting { text-align: center; animation: fadeUp 0.4s ease both; }
  .session-code-box { background: var(--bg2); border: 1px solid rgba(0,255,136,0.3); border-radius: 16px; padding: 32px; position: relative; max-width: 480px; margin: 24px auto; }
  .session-code-number { font-family: var(--mono); font-size: clamp(28px, 6vw, 44px); font-weight: 700; color: var(--green); letter-spacing: 0.2em; margin-bottom: 8px; }
  .session-code-hint { font-size: 12px; color: var(--text3); }
  .copy-btn { position: absolute; top: 12px; right: 12px; background: var(--bg3); border: 1px solid var(--border); border-radius: 6px; padding: 6px 12px; font-size: 11px; font-family: var(--mono); color: var(--text2); cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; }
  .copy-btn:hover { color: var(--green); border-color: rgba(0,255,136,0.3); }
  .waiting-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: var(--text3); margin-top: 24px; }
  .waiting-dots span { display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: var(--text3); animation: dot 1.4s infinite; }
  .waiting-dots span:nth-child(2) { animation-delay: 0.2s; }
  .waiting-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
  .steps { display: flex; gap: 24px; margin-top: 40px; flex-wrap: wrap; justify-content: center; }
  .step { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text3); }
  .step-num { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 10px; }
  .stream-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 14px 20px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; flex-wrap: wrap; gap: 12px; }
  .stream-info { display: flex; align-items: center; gap: 12px; }
  .stream-badge { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; color: var(--red); background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3); padding: 3px 10px; border-radius: 20px; }
  .stream-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .control-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg3); color: var(--text2); font-size: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; font-family: var(--sans); }
  .control-btn:hover { color: var(--text); border-color: var(--border2); }
  .control-btn.danger:hover { color: var(--red); border-color: rgba(255,68,68,0.4); background: rgba(255,68,68,0.08); }
  .control-btn.active-control { color: var(--green); border-color: rgba(0,255,136,0.3); background: var(--green-dim); }
  .canvas-wrapper { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #000; position: relative; cursor: crosshair; }
  .canvas-wrapper canvas { width: 100%; display: block; }
  .canvas-placeholder { aspect-ratio: 16/9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text3); font-size: 13px; background: var(--bg2); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 28px; height: 28px; border: 2px solid var(--border); border-top-color: var(--green); border-radius: 50%; animation: spin 0.8s linear infinite; }

  /* Permission popup */
  .permission-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(4px); animation: fadeUp 0.2s ease; }
  .permission-box { background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px; padding: 40px; max-width: 420px; width: 90%; text-align: center; }
  .permission-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(227,179,65,0.1); border: 1px solid rgba(227,179,65,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .permission-box h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
  .permission-box p { font-size: 13px; color: var(--text2); margin-bottom: 28px; line-height: 1.5; }
  .permission-actions { display: flex; gap: 12px; }
  .permission-actions .btn { flex: 1; }

  /* Control badge */
  .control-badge { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; color: var(--green); background: var(--green-dim); border: 1px solid rgba(0,255,136,0.3); padding: 3px 10px; border-radius: 20px; }

  .footer { text-align: center; padding: 32px; font-size: 11px; font-family: var(--mono); color: var(--text3); border-top: 1px solid var(--border); margin-top: 80px; }
  @media (max-width: 600px) { .cards { grid-template-columns: 1fr; } .main { padding: 40px 16px; } .topbar { padding: 0 16px; } }
`;

export default function App() {
  const {
    isConnected, sessionCode,
    createSession, joinSession,
    requestControl, respondToControl, revokeControl,
    sendFrame, sendInput, on, off
  } = useSignalR();

  const { isCapturing, startCapture, stopCapture } = useScreenCapture();

  const [inputCode, setInputCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [mode, setMode] = useState<"host" | "viewer" | null>(null);
  const [copied, setCopied] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [controlStatus, setControlStatus] = useState<"none" | "requested" | "granted" | "denied">("none");
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [currentSessionCode, setCurrentSessionCode] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    on("ReceiveFrame", (data: any) => {
      const binary = atob(typeof data === "string" ? data : "");
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setFrameCount(f => f + 1);
      };
      img.src = url;
    });

    on("SessionEnded", () => { handleDisconnect(); });
    on("PermissionRequested", () => { setShowPermissionPopup(true); });
    on("PermissionGranted", () => { setControlStatus("granted"); });
    on("PermissionDenied", () => { setControlStatus("denied"); setTimeout(() => setControlStatus("none"), 3000); });
    on("ControlRevoked", () => { setControlStatus("none"); });

    return () => {
      off("ReceiveFrame"); off("SessionEnded");
      off("PermissionRequested"); off("PermissionGranted");
      off("PermissionDenied"); off("ControlRevoked");
    };
  }, [isConnected]);

  const handleHost = async () => {
    setMode("host");
    const code = await createSession();
    setCurrentSessionCode(code);

    try {
      await startCapture(async (base64Frame) => {
        if (code) await sendFrame(code, base64Frame);
      });
    } catch {
      setMode(null);
    }
  };

  const handleJoin = async () => {
    const success = await joinSession(inputCode);
    if (success) {
      setMode("viewer");
      setJoined(true);
      setCurrentSessionCode(inputCode);
    } else {
      alert("Session not found. Check the code and try again.");
    }
  };

  const handleRequestControl = async () => {
    if (!currentSessionCode) return;
    setControlStatus("requested");
    await requestControl(currentSessionCode);
  };

  const handleAcceptControl = async () => {
    if (!currentSessionCode) return;
    setShowPermissionPopup(false);
    await respondToControl(currentSessionCode, true);
  };

  const handleDenyControl = async () => {
    if (!currentSessionCode) return;
    setShowPermissionPopup(false);
    await respondToControl(currentSessionCode, false);
  };

  const handleRevokeControl = async () => {
    if (!currentSessionCode) return;
    await revokeControl(currentSessionCode);
    setControlStatus("none");
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (controlStatus !== "granted" || !currentSessionCode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    sendInput(currentSessionCode, {
      type: "mousemove",
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
      button: 0
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (controlStatus !== "granted" || !currentSessionCode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    sendInput(currentSessionCode, {
      type: "mousedown",
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
      button: e.button
    });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (controlStatus !== "granted" || !currentSessionCode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    sendInput(currentSessionCode, {
      type: "mouseup",
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
      button: e.button
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (controlStatus !== "granted" || !currentSessionCode) return;
    sendInput(currentSessionCode, { type: "keydown", key: e.key, x: 0, y: 0, button: 0 });
  };

  const handleDisconnect = () => {
    stopCapture();
    setMode(null);
    setJoined(false);
    setFrameCount(0);
    setControlStatus("none");
    setCurrentSessionCode(null);
    setShowPermissionPopup(false);
  };

  const handleCopy = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-bg">

        {/* Permission popup */}
        {showPermissionPopup && (
          <div className="permission-overlay">
            <div className="permission-box">
              <div className="permission-icon">
                <ShieldAlert size={24} color="var(--yellow)" />
              </div>
              <h3>Control Request</h3>
              <p>The viewer is requesting permission to control your mouse and keyboard. Only accept if you trust them.</p>
              <div className="permission-actions">
                <button className="btn btn-red" onClick={handleDenyControl}>
                  <ShieldX size={15} /> Deny
                </button>
                <button className="btn btn-green" onClick={handleAcceptControl}>
                  <ShieldCheck size={15} /> Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topbar */}
        <header className="topbar">
          <div className="logo">
            <div className="logo-icon">
              <Monitor size={16} color="#000" />
            </div>
            REMOTELINK
          </div>
          <div className={`status-pill ${isConnected ? "connected" : "disconnected"}`}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? "SERVER ONLINE" : "DISCONNECTED"}
          </div>
        </header>

        <main className="main">

          {/* Home */}
          {!mode && (
            <>
              <div className="hero">
                <div className="hero-badge">
                  <Shield size={11} /> No Installation Required
                </div>
                <h1>Control any PC<br />from your <span>browser</span></h1>
                <p>Share your screen or connect to a remote machine instantly. No plugins, no downloads — just open the link and go.</p>
              </div>

              <div className="cards">
                <div className="card host-card">
                  <div className="card-icon"><Monitor size={20} color="var(--green)" /></div>
                  <h2>Share your screen</h2>
                  <p>Your browser will ask permission to capture your screen. Share the generated code with the viewer.</p>
                  <button className="btn btn-green" onClick={handleHost} disabled={!isConnected}>
                    <Plus size={16} /> Start Sharing
                  </button>
                </div>

                <div className="card viewer-card">
                  <div className="card-icon"><Eye size={20} color="var(--blue)" /></div>
                  <h2>View a screen</h2>
                  <p>Enter the 9-digit code shared by the host to view their screen. No download needed.</p>
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
                  <button className="btn btn-blue" onClick={handleJoin} disabled={inputCode.length < 9 || !isConnected}>
                    Connect <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Host sharing */}
          {mode === "host" && (
            <div className="host-waiting">
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                {isCapturing ? "Screen is being shared" : "Starting screen share..."}
              </h2>
              <p style={{ color: "var(--text2)", fontSize: 14 }}>Share this code with the viewer</p>

              <div className="session-code-box">
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                </button>
                <div className="session-code-number">
                  {sessionCode ? sessionCode.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : "Generating..."}
                </div>
                <div className="session-code-hint">Valid for this session only</div>
              </div>

              <div className="waiting-indicator">
                <span>Waiting for viewer to connect</span>
                <span className="waiting-dots"><span /><span /><span /></span>
              </div>

              <div className="steps">
                <div className="step"><span className="step-num">1</span> Share the code above</div>
                <div className="step"><span className="step-num">2</span> Viewer opens the link</div>
                <div className="step"><span className="step-num">3</span> Viewer enters the code</div>
              </div>

              <button className="btn btn-ghost" style={{ maxWidth: 200, margin: "40px auto 0" }} onClick={handleDisconnect}>
                <ArrowLeft size={15} /> Stop Sharing
              </button>
            </div>
          )}

          {/* Viewer */}
          {mode === "viewer" && joined && (
            <div tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: "none" }}>
              <div className="stream-header">
                <div className="stream-info">
                  <div className="stream-badge">
                    <Radio size={10} /> LIVE
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Remote Session</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>
                      Code: {currentSessionCode}
                    </div>
                  </div>
                  {controlStatus === "granted" && (
                    <div className="control-badge">
                      <MousePointer size={10} /> Control Active
                    </div>
                  )}
                </div>

                <div className="stream-controls">
                  <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                    {frameCount} frames
                  </span>

                  {/* Request Control button */}
                  {controlStatus === "none" && (
                    <button className="control-btn" onClick={handleRequestControl}>
                      <MousePointer size={13} /> Request Control
                    </button>
                  )}
                  {controlStatus === "requested" && (
                    <button className="control-btn" disabled>
                      <ShieldAlert size={13} /> Waiting for approval...
                    </button>
                  )}
                  {controlStatus === "granted" && (
                    <button className="control-btn active-control" onClick={handleRevokeControl}>
                     <MousePointer2 size={13} /> Stop Control
                    </button>
                  )}
                  {controlStatus === "denied" && (
                    <button className="control-btn" disabled style={{ color: "var(--red)" }}>
                      <ShieldX size={13} /> Request Denied
                    </button>
                  )}

                  <button className="control-btn danger" onClick={handleDisconnect}>
                    <PhoneOff size={13} /> Disconnect
                  </button>
                </div>
              </div>

              <div className="canvas-wrapper">
                {frameCount === 0 && (
                  <div className="canvas-placeholder">
                    <div className="spinner" />
                    <span>Waiting for stream to begin...</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  style={{ display: frameCount > 0 ? "block" : "none", cursor: controlStatus === "granted" ? "crosshair" : "default" }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseUp={handleCanvasMouseUp}
                />
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          REMOTELINK v0.2.0 — Built with ASP.NET Core + SignalR + React
        </footer>
      </div>
    </>
  );
}
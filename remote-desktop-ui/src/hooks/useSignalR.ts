import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "/hubs/remote";

export const useSignalR = () => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => setIsConnected(true))
      .catch((err) => console.error("SignalR connection error:", err));

    return () => { connection.stop(); };
  }, []);

  const createSession = async (): Promise<string | null> => {
    if (!connectionRef.current) return null;
    const code = await connectionRef.current.invoke<string>("CreateSession");
    setSessionCode(code);
    return code;
  };

  const joinSession = async (code: string): Promise<boolean> => {
    if (!connectionRef.current) return false;
    return await connectionRef.current.invoke<boolean>("JoinSession", code);
  };

 const onReceiveFrame = (callback: (frameData: ArrayBuffer) => void) => {
    connectionRef.current?.on("ReceiveFrame", (data: any) => {
        // SignalR sends binary as a base64 string or Uint8Array
        if (typeof data === "string") {
            // base64 string — convert to ArrayBuffer
            const binary = atob(data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            callback(bytes.buffer);
        } else if (data instanceof ArrayBuffer) {
            callback(data);
        } else if (data?.type === "Buffer" && Array.isArray(data.data)) {
            const bytes = new Uint8Array(data.data);
            callback(bytes.buffer);
        } else {
            // Try treating as array of numbers
            const bytes = new Uint8Array(data);
            callback(bytes.buffer);
        }
    });
};

  const onSessionEnded = (callback: () => void) => {
    connectionRef.current?.on("SessionEnded", callback);
  };

  return { isConnected, sessionCode, createSession, joinSession, onReceiveFrame, onSessionEnded };
};
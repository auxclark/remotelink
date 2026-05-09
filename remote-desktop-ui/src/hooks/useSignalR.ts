import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "https://remotelink-production.up.railway.app/hubs/remote";

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
      .catch((err) => console.error("SignalR error:", err));

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

  const requestControl = async (code: string) => {
    await connectionRef.current?.invoke("RequestControl", code);
  };

  const respondToControl = async (code: string, granted: boolean) => {
    await connectionRef.current?.invoke("RespondToControl", code, granted);
  };

  const revokeControl = async (code: string) => {
    await connectionRef.current?.invoke("RevokeControl", code);
  };

  const sendFrame = async (code: string, frameBase64: string) => {
    await connectionRef.current?.invoke("SendFrame", code, frameBase64);
  };

  const sendInput = async (code: string, input: object) => {
    await connectionRef.current?.invoke("SendInput", code, input);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    connectionRef.current?.on(event, callback);
  };

  const off = (event: string) => {
    connectionRef.current?.off(event);
  };

  return {
    isConnected, sessionCode,
    createSession, joinSession,
    requestControl, respondToControl, revokeControl,
    sendFrame, sendInput, on, off
  };
};
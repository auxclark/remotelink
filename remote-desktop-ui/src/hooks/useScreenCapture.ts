import { useRef, useState } from "react";

export const useScreenCapture = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCapture = async (onFrame: (base64: string) => void) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false
      });

      streamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      videoRef.current = video;

      video.onloadedmetadata = () => {
        setIsCapturing(true);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        intervalRef.current = window.setInterval(() => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL("image/jpeg", 0.4).split(",")[1];
            onFrame(base64);
          }
        }, 33); // 30 FPS
      };

      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };

    } catch (err) {
      console.error("Screen capture error:", err);
      throw err;
    }
  };

  const stopCapture = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsCapturing(false);
  };

  return { isCapturing, startCapture, stopCapture };
};
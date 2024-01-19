import { useEffect, useRef, useCallback } from "react";
import axios from "axios";
import WebSocket from "ws";
import io from "socket.io-client";
let interval;
const useVideoRecorder = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socket = useRef(null);

  const startVideoRec = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });

    socket.current = io("http://localhost:8000");

    socket.current.on("connect", () => {
      console.log("Socket connected");
    });

    socket.current.on("disconnect", () => {
      console.log("Socket disconnected");
      clearInterval(interval);
    });

    socket.current.on("processed_frames", (data) => {
      console.log("image :", data.image);
      let modifiedImage = data.image;
      let img = new Image();
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      img.onload = () =>
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = modifiedImage;
    });

    interval = setInterval(() => {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        let dataUrl = canvas.toDataURL("image/jpeg", 1.0);

        socket.current.emit("image_data", { image: dataUrl });
      }
    }, 300);
  }, []);

  const stopVideoRec = useCallback(() => {
    videoRef.current?.srcObject?.getVideoTracks?.()?.[0]?.stop();
    clearInterval(interval);

    // Close the WebSocket connection
    if (socket.current) {
      socket.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopVideoRec();
    };
  }, [stopVideoRec]);

  return {
    videoRef,
    canvasRef,
    stopVideoRec,
    startVideoRec,
  };
};

export default useVideoRecorder;

import React, { useEffect, useRef } from "react";
import axios from "axios";

const VideoRecorder = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });

    const interval = setInterval(async () => {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        let dataUrl = canvas.toDataURL("image/jpeg", 1.0);
        let response = await axios.post("/api/detect", { image: dataUrl });
        let modifiedImage = response.data.image;
        let img = new Image();
        img.onload = () =>
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = modifiedImage;
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas ref={canvasRef} width="500" height="440"></canvas>
    </>
  );
};

export default VideoRecorder;

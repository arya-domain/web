import React, { useContext, useEffect, useRef } from "react";

import DataContext from "../context/dataContext";

const VideoRecorder = () => {
  const { videoRef, mediaRecorderRef, startRecording } =
    useContext(DataContext);
  const canvasRef = useRef(null); // Create a ref for the canvas

  useEffect(() => {
    startRecording();

    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [mediaRecorderRef, startRecording]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
        const frame = canvas.toDataURL("image/jpeg");
        fetch("/api/detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: frame }),
        })
          .then((response) => response.json())
          .then((data) => {
            // Display the returned image with bounding box
            var img = document.querySelector("img");
            img.src = data.image;
          });
      }
    }, 5000);

    return () => clearInterval(intervalId); // Clear the interval when the component is unmounted
  }, []);

  return (
    <>
      {/* <video
        ref={videoRef}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        playsInline
        muted
      /> */}
      <canvas ref={canvasRef} style={{ display: "none" }} />{" "}
    </>
  );
};

export default VideoRecorder;

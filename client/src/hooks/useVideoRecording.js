import { useState, useEffect, useRef } from "react";
import { saveVideoRecAPI } from "../apis/responses.apis";

let videoChunks = [];

const useVideoRecording = (question_id) => {
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef();
  const mediaRecorderRef = useRef();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      // videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
        console.log("video recording started...");
      };

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("video recording stopped");
        setIsRecording(false);
        const blobObj = new Blob(videoChunks, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blobObj);

        //send this form data to server
        const formData = new FormData();
        formData.append("video", blobObj, "recorded_video.mp4");
        formData.append("question_id", question_id);

        try {
          const response = await saveVideoRecAPI(formData);
          console.log("Server Response:", response.data);
        } catch (error) {
          console.error("Error sending audio to the server:", error);
        }

        //download the video file
        // const a = document.createElement("a");
        // document.body.appendChild(a);
        // a.style = "display: none";
        // a.href = videoUrl;
        // a.download = "recorded_audio.mp4";
        // a.click();
        // window.URL.revokeObjectURL(videoUrl);
        videoChunks = [];
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  if (question_id && !isRecording) {
    startRecording();
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    // videoRef,
  };
};

export default useVideoRecording;

// import { useState, useEffect, useRef } from "react";
// import { saveVideoRecAPI } from "../apis/responses.apis";

// let videoChunks = [];
// const maxBufferSize = 100; // Adjust the buffer size based on your requirements

// const useVideoRecording = (question_id) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const videoRef = useRef();
//   const mediaRecorderRef = useRef();

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });

//       mediaRecorderRef.current = new MediaRecorder(stream);

//       mediaRecorderRef.current.onstart = () => {
//         setIsRecording(true);
//         console.log("video recording started...");
//       };

//       mediaRecorderRef.current.ondataavailable = async (event) => {
//         if (event.data.size > 0) {
//           addToBuffer(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         console.log("video recording stopped");
//         setIsRecording(false);
//         const blobObj = new Blob(videoChunks, { type: "video/webm" });
//         const videoUrl = URL.createObjectURL(blobObj);

//         // Send this form data to the server
//         const formData = new FormData();
//         formData.append("video", blobObj, "recorded_video.mp4");
//         formData.append("question_id", question_id);

//         try {
//           const response = await saveVideoRecAPI(formData);
//           console.log("Server Response:", response.data);
//         } catch (error) {
//           console.error("Error sending video to the server:", error);
//         }

//         // Clear the buffer after saving
//         clearBuffer();
//       };

//       mediaRecorderRef.current.start();
//     } catch (error) {
//       console.error("Error accessing media devices:", error);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop();
//   };

//   useEffect(() => {
//     return () => {
//       mediaRecorderRef.current?.stop();
//       // Clear the buffer when the component is unmounted
//       clearBuffer();
//     };
//   }, []);

//   if (question_id && !isRecording) {
//     startRecording();
//   }

//   return {
//     isRecording,
//     startRecording,
//     stopRecording,
//   };
// };

// export default useVideoRecording;

// // Helper functions
// const addToBuffer = (data) => {
//   videoChunks.push(data);

//   if (videoChunks.length > maxBufferSize) {
//     videoChunks.shift(); // Remove the oldest element if buffer exceeds the limit
//   }
// };

// const clearBuffer = () => {
//   videoChunks = [];
// };

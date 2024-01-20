import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import { saveVideoRecAPI } from "../apis/responses.apis";

let videoChunks = [];

const useVideoRecorder = (question_id) => {
	const [isRecording, setIsRecording] = useState(false);
	const videoRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const canvasRef = useRef(null);
	const socketRef = useRef(null);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			videoRef.current.srcObject = stream;
			videoRef.current.play();

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

				const formData = new FormData();
				formData.append("video", blobObj, "recorded_video.mp4");
				formData.append("question_id", question_id);

				try {
					const response = await saveVideoRecAPI(formData);
					console.log("Server Response:", response.data);
				} catch (error) {
					console.error("Error sending video to the server:", error);
				}

				videoChunks = [];
			};

			mediaRecorderRef.current.start();

			socketRef.current = io("http://localhost:8000");

			socketRef.current.on("connect", () => {
				console.log("Socket connected");
			});

			socketRef.current.on("disconnect", () => {
				console.log("Socket disconnected");
			});

			socketRef.current.on("processed_frames", (data) => {
				console.log("image :", data.image);
				let modifiedImage = data.image;
				let img = new Image();
				const canvas = canvasRef.current;
				const context = canvas.getContext("2d");
				img.onload = () =>
					context.drawImage(img, 0, 0, canvas.width, canvas.height);
				img.src = modifiedImage;
			});
		} catch (error) {
			console.error("Error accessing media devices:", error);
		}
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		videoRef.current?.srcObject?.getVideoTracks?.()?.[0]?.stop();
		socketRef.current?.disconnect();
	};

	useEffect(() => {
		return () => {
			stopRecording();
		};
	}, []);

	if (question_id && !isRecording) {
		startRecording();
	}

	return {
		isRecording,
		startRecording,
		stopRecording,
		videoRef,
		canvasRef,
	};
};

export default useVideoRecorder;

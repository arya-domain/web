import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { saveVideoRecAPI } from "../apis/responses.apis";
import { toast } from "react-toastify";

import useTimer from "./useTimer";

// let videoChunks = [];
let interval;

const useVideoRecording = (question_id, nextQuestion) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isSaving, setisSaving] = useState(false);

	const videoRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const canvasRef = useRef(null);
	const socketRef = useRef(null);
	const videoChunks = useRef([]);
	const animationFrameRef = useRef(null);

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		videoRef.current?.srcObject.getVideoTracks()[0].stop();
		socketRef.current?.disconnect();
	};

	const { startTimer, stopTimer } = useTimer(stopRecording);

	const captureFrame = async () => {
		if (
			videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA &&
			mediaRecorderRef.current?.state === "recording"
		) {
			console.log("Frame");
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");
			context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
			let dataUrl = canvas.toDataURL("image/jpeg", 1.0);
			socketRef.current.emit("image_data", { image: dataUrl });
		}
		animationFrameRef.current = requestAnimationFrame(captureFrame);
	};

	const startRecording = async () => {
		try {
			videoChunks.current = [];

			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
				videoRef.current.srcObject.getVideoTracks()[0].stop();
			}

			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			mediaRecorderRef.current = new MediaRecorder(stream);

			mediaRecorderRef.current.onstart = () => {
				setIsRecording(true);
				startTimer();
				videoRef.current.srcObject = stream;
				videoRef.current.play();
				console.log("video recording started...");
			};

			mediaRecorderRef.current.ondataavailable = async (event) => {
				if (event.data.size > 0) {
					videoChunks.current.push(event.data);
				}
			};

			mediaRecorderRef.current.onstop = async () => {
				console.log("video recording stopped");

				setisSaving(true);
				setIsRecording(false);

				stopTimer();

				const blobObj = new Blob(videoChunks.current, { type: "video/webm" });
				const videoUrl = URL.createObjectURL(blobObj);

				const formData = new FormData();
				formData.append("video", blobObj, "recorded_video.mp4");
				formData.append("question_id", question_id);

				try {
					await saveVideoRecAPI(formData);
					nextQuestion();
				} catch (error) {
					toast.error("Failed to submit your answer!, retry!");
					console.error("Error sending video to the server:", error);
				}

				setisSaving(false);

				videoChunks.current = [];
			};

			mediaRecorderRef.current.start();

			socketRef.current = io("http://localhost:8001");

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

			// interval = setInterval(() => {
			// 	if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
			// 		const canvas = canvasRef.current;
			// 		const context = canvas.getContext("2d");
			// 		context.drawImage(
			// 			videoRef.current,
			// 			0,
			// 			0,
			// 			canvas.width,
			// 			canvas.height
			// 		);
			// 		let dataUrl = canvas.toDataURL("image/jpeg", 1.0);

			// 		socketRef.current.emit("image_data", { image: dataUrl });
			// 	}
			// }, 500);
			animationFrameRef.current = requestAnimationFrame(captureFrame);
		} catch (error) {
			console.error("Error accessing media devices:", error);
		}
	};

	//when question are not being saved and its not recording then start the recoriding
	if (!isRecording && !isSaving && question_id) {
		startRecording();
	}

	useEffect(() => {
		return () => {
			console.log("clearing interval");
			stopRecording();
			clearInterval(interval);

			// Stop and clear mediaRecorder
			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
				mediaRecorderRef.current = null;
			}

			videoChunks.current = [];
			cancelAnimationFrame(animationFrameRef.current);
		};
	}, []);

	return {
		isSaving,
		stopRecording,
		videoRef,
		canvasRef,
	};
};

export default useVideoRecording;

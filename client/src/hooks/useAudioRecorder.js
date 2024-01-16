import { useState, useEffect, useCallback } from "react";

import { saveAudioRecAPI } from "../apis/responses.apis";

let audioRecorder;
let audioChunks = [];

const useAudioRecorder = (question_id) => {
	const [isRecording, setIsRecording] = useState(false);

	const startRecording = () => {
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				audioRecorder = new MediaRecorder(stream);

				audioRecorder.onstart = () => {
					console.log("audio recording started....");
					audioChunks = [];
					setIsRecording(true);
				};

				audioRecorder.onstop = async () => {
					console.log("audio recording stopped.");
					setIsRecording(false);

					const blobObj = new Blob(audioChunks, { type: "audio/webm" });
					// const audioUrl = URL.createObjectURL(blobObj);

					const formData = new FormData();
					formData.append("audio", blobObj, "recorded_audio.mp3");
					formData.append("question_id", question_id);

					try {
						const response = await saveAudioRecAPI(formData);

						console.log("Server Response:", response.data);
					} catch (error) {
						console.error("Error sending audio to the server:", error);
					}

					// const a = document.createElement("a");
					// document.body.appendChild(a);
					// a.style = "display: none";
					// a.href = audioUrl;
					// a.download = "recorded_audio.mp3";
					// a.click();
					// window.URL.revokeObjectURL(audioUrl);
					audioChunks = [];
				};

				// dataavailable event is fired when the recording is stopped
				audioRecorder.addEventListener("dataavailable", (e) => {
					console.log(e.data);
					audioChunks.push(e.data);
				});

				audioRecorder.start();
			})
			.catch((err) => {
				console.log("Error: " + err);
			});
	};

	const stopRecording = useCallback(() => {
		audioRecorder?.stop();
	}, []);

	useEffect(() => {
		return () => {
			audioRecorder?.stop();
		};
	}, []);

	if (question_id && !isRecording) {
		startRecording();
	}

	return {
		isRecording,
		startRecording,
		stopRecording,
	};
};

export default useAudioRecorder;

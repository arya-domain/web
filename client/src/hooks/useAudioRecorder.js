// import { useState, useEffect } from "react";
import { saveAudioRecording } from "../apis/recordings.apis";

// const useAudioRecorder = () => {
// 	const [mediaRecorder, setMediaRecorder] = useState(null);
// 	const [audioChunks, setAudioChunks] = useState([]);
// 	const [isRecording, setIsRecording] = useState(false);

// 	useEffect(() => {
// 		navigator.mediaDevices
// 			.getUserMedia({ audio: true })
// 			.then((stream) => {
// 				const recorder = new MediaRecorder(stream);

// 				recorder.ondataavailable = (e) => {
// 					if (e.data.size > 0) {
// 						setAudioChunks((prevChunks) => [...prevChunks, e.data]);
// 					}
// 				};

// 				setMediaRecorder(recorder);
// 			})
// 			.catch((error) => {
// 				console.error("Error accessing microphone:", error);
// 			});
// 	}, []);

// 	const startRecording = () => {
// 		if (mediaRecorder) {
// 			setAudioChunks([]);
// 			mediaRecorder.start();
// 			setIsRecording(true);
// 		}
// 	};

// 	const stopRecording = async () => {
// 		console.log({ state: mediaRecorder.state });

// 		if (mediaRecorder && mediaRecorder.state === "recording") {
// 			mediaRecorder.stop();
// 			setIsRecording(false);

// 			const audioBlob = getAudioBlob();

// 			const formData = new FormData();
// 			formData.append("audio", audioBlob, "recorded_audio.wav");

// 			try {
// 				const response = await saveAudioRecording(formData);

// 				console.log("Server Response:", response.data);
// 			} catch (error) {
// 				console.error("Error sending audio to the server:", error);
// 			}
// 		}
// 	};

// 	const getAudioBlob = () => {
// 		return new Blob(audioChunks, { type: "audio/wav" });
// 	};

// 	return { startRecording, stopRecording, getAudioBlob, isRecording };
// };

// export default useAudioRecorder;

import { useState, useEffect } from "react";

let audioRecorder;
let audioChunks = [];

const useAudioRecorder = (questionId = 0) => {
	const [isRecording, setIsRecording] = useState(false);

	const startRecording = () => {
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				// Initialize the media recorder object
				audioRecorder = new MediaRecorder(stream);

				audioRecorder.onstart = () => {
					// setAudioChunks([]);
					audioChunks = [];
					console.log("recording...");
				};

				audioRecorder.onstop = async () => {
					console.log("stopping");

					console.log(audioChunks);

					const blobObj = new Blob(audioChunks, { type: "audio/webm" });
					const audioUrl = URL.createObjectURL(blobObj);

					const formData = new FormData();
					formData.append("audio", blobObj, "recorded_audio.mp3");
					formData.append("questionId", questionId);

					try {
						const response = await saveAudioRecording(formData);

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
					// setAudioChunks([]);
					audioChunks = [];
				};

				// dataavailable event is fired when the recording is stopped
				audioRecorder.addEventListener("dataavailable", (e) => {
					console.log(e.data);
					// setAudioChunks((prev) => [...prev, e.data]);
					audioChunks.push(e.data);
				});

				audioRecorder.start();
			})
			.catch((err) => {
				// If the user denies permission to record audio, then display an error.
				console.log("Error: " + err);
			});
	};

	// const startRecording = () => {
	// 	const handleDataAvailable = (event) => {
	// 		console.log(event.data);
	// 		// if (event.data.size > 0) {
	// 		setAudioChunks((prevChunks) => [...prevChunks, event.data]);
	// 		// }
	// 	};
	// 	navigator.mediaDevices
	// 		.getUserMedia({ audio: true })
	// 		.then((stream) => {
	// 			audioStream = stream;
	// 			mediaRecorder = new MediaRecorder(stream);
	// 			mediaRecorder.onstart = () => {
	// 				console.log("start");
	// 			};
	// 			mediaRecorder.ondataavailable = handleDataAvailable;
	// 			mediaRecorder.onstop = handleRecordingStop;
	// 			mediaRecorder.start();
	// 			setIsRecording(true);
	// 		})
	// 		.catch((error) => {
	// 			console.error("Error accessing microphone:", error);
	// 		});
	// };

	const stopRecording = () => {
		// if (mediaRecorder && isRecording) {
		// 	mediaRecorder.stop();
		// 	// audioStream.getTracks().forEach((track) => track.stop());
		// 	setIsRecording(false);
		// }

		audioRecorder.stop();
	};

	// const handleRecordingStop = () => {
	// 	console.log("ended");

	// 	const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
	// 	const audioUrl = URL.createObjectURL(audioBlob);
	// 	setAudioBlob(audioBlob);
	// 	setAudioUrl(audioUrl);

	// 	if (audioUrl) {
	// 		const a = document.createElement("a");
	// 		document.body.appendChild(a);
	// 		a.style = "display: none";
	// 		a.href = audioUrl;
	// 		a.download = "recorded_audio.mp3";
	// 		a.click();
	// 		window.URL.revokeObjectURL(audioUrl);
	// 	}
	// };

	// const downloadAudio = () => {
	// 	return;
	// 	if (audioUrl) {
	// 		const a = document.createElement("a");
	// 		document.body.appendChild(a);
	// 		a.style = "display: none";
	// 		a.href = audioUrl;
	// 		a.download = "recorded_audio.wav";
	// 		a.click();
	// 		window.URL.revokeObjectURL(audioUrl);
	// 	}
	// };

	useEffect(() => {
		return () => {
			audioRecorder?.stop();
		};
	}, []);

	return {
		isRecording,
		startRecording,
		stopRecording,
		downloadAudio: () => null,
	};
};

export default useAudioRecorder;

import { useState, useEffect } from "react";

const useSpeechRecognition = (onTextReceived) => {
	const [isListening, setIsListening] = useState(true);

	useEffect(() => {
		var Recognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new Recognition();

		recognition.lang = "en-US";
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = () => {
			console.log("Speech recognition started");
		};

		recognition.onresult = (event) => {
			const result = event.results[event.results.length - 1];
			const transcription = result[0].transcript.trim().toLowerCase();

			console.log({ transcription });

			onTextReceived(transcription);
		};

		recognition.onerror = (error) => {
			console.error("Speech recognition error:", error.error, error.message);
		};

		recognition.onend = () => {
			console.log("ended");
		};

		if (isListening) {
			recognition.start();
		} else {
			recognition.stop();
		}

		return () => {
			recognition.stop();
		};
	}, [isListening, onTextReceived]);

	const startListening = () => {
		setIsListening(true);
	};

	const stopListening = () => {
		setIsListening(false);
	};

	return { isListening, startListening, stopListening };
};

export default useSpeechRecognition;

import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

import useSWR from "swr";

import { getQuestions } from "../apis/quizes.apis";
import { saveResponse } from "../apis/responses.apis";
import { saveRecording } from "../apis/recordings.apis";

import useAudioRecorder from "../hooks/useAudioRecorder";

export const DataContext = createContext({});

export const DataProvider = ({ children }) => {
	const { id: quizId } = useParams();

	const {
		data: questions,
		isLoading,
		error,
	} = useSWR(quizId ? `/quiz/${quizId}/questions` : null, getQuestions);

	const {
		startRecording: startAudioRecording,
		stopRecording: stopAudioRecording,
		isRecording,
		downloadAudio,
	} = useAudioRecorder();

	// All Quizs, Current Question, Index of Current Question, Answer, Selected Answer, Total Marks
	// const [quizs, setQuizs] = useState([]);
	const quizs = questions ? questions : [];
	const [isSaving, setisSaving] = useState(false);
	const [question, setQuesion] = useState({});
	const [questionIndex, setQuestionIndex] = useState(0);
	const [correctAnswer, setCorrectAnswer] = useState("");
	const [selectedAnswer, setSelectedAnswer] = useState("");
	const [marks, setMarks] = useState(0);

	// Display Controlling States
	const [showStart, setShowStart] = useState(true);
	const [showQuiz, setShowQuiz] = useState(false);
	const [showResult, setShowResult] = useState(false);

	//recorder
	const videoRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const [recordedChunks, setRecordedChunks] = useState([]);

	// Set a Single Question
	useEffect(() => {
		if (quizs.length > questionIndex) {
			setQuesion(quizs[questionIndex]);
		}
	}, [quizs, questionIndex]);

	// Start Quiz
	const startQuiz = () => {
		setShowStart(false);
		setShowQuiz(true);
		// saveRecording();
		startAudioRecording();
	};

	// Check Answer
	const checkAnswer = (selected) => {
		setSelectedAnswer({
			selectedOptionId: selected.id,
			questionId: question.id,
		});

		const options = document.querySelectorAll(".option");
		const checkBtn = document.getElementById("opt-btn-" + selected.id);

		options.forEach((e) => {
			e.classList.remove("bg-info");
		});

		checkBtn.classList.toggle("bg-info");

		// if (selected === question.answer) {
		// 	event.target.classList.add("bg-success");
		// 	setMarks(marks + 5);
		// } else {
		// 	event.target.classList.add("bg-danger");
		// }
	};

	// Next Quesion
	const nextQuestion = async () => {
		try {
			stopAudioRecording();
			setisSaving(true);
			await saveResponse(
				selectedAnswer
					? { ...selectedAnswer, quizId }
					: { selectedOptionId: null, questionId: question.id, quizId }
			);

			setCorrectAnswer("");
			setSelectedAnswer(null);

			const wrongBtn = document.querySelector("button.bg-danger");
			wrongBtn?.classList.remove("bg-danger");
			wrongBtn?.classList.remove("bg-info");
			const rightBtn = document.querySelector("button.bg-success");
			rightBtn?.classList.remove("bg-success");
			rightBtn?.classList.remove("bg-info");

			const newIndex = questionIndex + 1;

			if (newIndex === quizs.length) {
				showTheResult();
				return 0;
			}
			setQuestionIndex(newIndex);
			toast.info("Question No." + newIndex + " Saved successfully!");
			// startAudioRecording();
		} catch (error) {
			console.log(error);
			toast.error("error saving the response!");
		} finally {
			setisSaving(false);
		}
	};

	// Show Result
	const showTheResult = () => {
		setShowResult(true);
		setShowStart(false);
		setShowQuiz(false);
	};

	// Start Over
	const startOver = () => {
		setShowStart(false);
		setShowResult(false);
		setShowQuiz(true);
		setCorrectAnswer("");
		setSelectedAnswer("");
		setQuestionIndex(0);
		setMarks(0);
		const wrongBtn = document.querySelector("button.bg-danger");
		wrongBtn?.classList.remove("bg-danger");
		const rightBtn = document.querySelector("button.bg-success");
		rightBtn?.classList.remove("bg-success");
	};

	const stopRecording = useCallback(() => {
		console.log("stopping...");
		console.log(mediaRecorderRef.current.state);
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === "recording"
		) {
			console.log("if...");
			mediaRecorderRef.current.stop();

			// Get the MediaStream object from the video element
			const mediaStream = videoRef.current.srcObject;

			// Stop all tracks in the stream
			if (mediaStream) {
				mediaStream.getTracks().forEach((track) => track.stop());
			}

			// Set the srcObject to null to stop the camera feed
			videoRef.current.srcObject = null;

			const blob = new Blob(recordedChunks, { type: "video/webm" });

			const formData = new FormData();
			formData.append("quizId", quizId);
			formData.append("recording", blob);

			saveRecording(formData);
		}
	}, [quizId, recordedChunks]);

	const downloadRecording = () => {
		if (recordedChunks.length === 0) {
			console.warn("No recording available");
			return;
		}

		const blob = recordedChunks[0];
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "recording.webm";
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const startRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
			videoRef.current.srcObject = stream;
			mediaRecorderRef.current = new MediaRecorder(stream);
			const chunks = [];

			mediaRecorderRef.current.ondataavailable = async (event) => {
				if (event.data.size > 0) {
					const blob = new Blob([event.data], { type: "video/webm" });

					try {
						// const formData = new FormData();
						// formData.append("userId", "1"); // Replace with the actual user ID
						// formData.append("quizId", quizId + ""); // Replace with the actual quiz ID
						// // formData.append("recording", blob);

						// await saveRecording(formData);

						console.log("Recording chunk sent to server successfully");
					} catch (error) {
						console.error("Error sending recording chunk to server:", error);
					}
				}
			};

			mediaRecorderRef.current.onstop = () => {
				const blob = new Blob(chunks, { type: "video/webm" });
				setRecordedChunks([blob]);
			};

			mediaRecorderRef.current.start();
		} catch (error) {
			console.error("Error accessing media devices:", error);
		}
	}, []);

	if (error) {
		console.log(error);
	}

	console.log(quizs);

	return (
		<DataContext.Provider
			value={{
				startQuiz,
				showStart,
				showQuiz,
				question,
				quizs,
				checkAnswer,
				correctAnswer,
				selectedAnswer,
				questionIndex,
				nextQuestion,
				showTheResult,
				showResult,
				marks,
				startOver,
				videoRef,
				mediaRecorderRef,
				startRecording,
				stopRecording,
				isLoading,
				isSaving,
			}}>
			{children}
		</DataContext.Provider>
	);
};

export default DataContext;

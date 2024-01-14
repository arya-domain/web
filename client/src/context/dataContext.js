import { createContext, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import useVideoRecorder from "../hooks/useVideoRecorder";

import { getQuestions } from "../apis/quizes.apis";

export const DataContext = createContext({});

export const DataProvider = ({ children }) => {
	const { id: quizId } = useParams();

	const {
		data: questions,
		isLoading,
		error,
	} = useSWR(quizId ? `/quiz/${quizId}/questions` : null, getQuestions);

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

	const {
		canvasRef,
		videoRef: videoEleRef,
		stopVideoRec,
		startVideoRec,
	} = useVideoRecorder(showQuiz);

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
		startVideoRec();
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
			setisSaving(true);

			const answerData = selectedAnswer
				? { ...selectedAnswer, quizId }
				: { selectedOptionId: null, questionId: question.id, quizId };

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

	if (error) {
		console.log(error);
	}

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
				canvasRef,
				videoEleRef,
				mediaRecorderRef,
				isLoading,
				isSaving,
				stopVideoRec,
			}}>
			{children}
		</DataContext.Provider>
	);
};

export default DataContext;

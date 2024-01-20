import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { getQuestions } from "../apis/quizes.apis";
import useVideoRecording from "../hooks/useVideoRecording";

export const DataContext = createContext({});

export const DataProvider = ({ children }) => {
	const { id: quizId } = useParams();

	const {
		data: quizs,
		isLoading,
		error,
	} = useSWR(quizId ? `/quiz/${quizId}/questions` : null, getQuestions);

	const [questionIndex, setQuestionIndex] = useState(0);

	const question = quizs?.[questionIndex] ? quizs[questionIndex] : {};

	const activeQuesNo = quizs?.indexOf(question) + 1;
	const totalQues = quizs?.length;

	// Next Quesion
	const nextQuestion = async () => {
		const newIndex = questionIndex + 1;

		//all questions has been answered!
		if (newIndex === quizs.length) {
			window.location.href = "/quiz/" + quizId + "/processing";
			return 0;
		}
		setQuestionIndex(newIndex);
		toast.success("Question No." + newIndex + " Saved successfully!");
	};

	const { stopRecording, videoRef, canvasRef, isSaving } = useVideoRecording(
		question?.id,
		nextQuestion
	);

	if (error) {
		console.log(error);
	}

	return (
		<DataContext.Provider
			value={{
				question,
				quizs,
				activeQuesNo,
				totalQues,
				questionIndex,
				nextQuestion,
				videoRef,
				canvasRef,
				isLoading,
				isSaving,
				stopRecording,
			}}>
			{children}
		</DataContext.Provider>
	);
};

export default DataContext;

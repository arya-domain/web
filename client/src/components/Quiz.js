import React, { useContext, useState, useCallback } from "react";
import Alert from "react-bootstrap/Alert";

import DataContext from "../context/dataContext";
import VideoRecorder from "./video";
import useTimer from "../hooks/useTimer";
import useSpeechToText from "../hooks/useSpeechToText";
import useAudioRecorder from "../hooks/useAudioRecorder";
import useVideoRecording from "../hooks/useVideoRecording";

const Quiz = () => {
	const { activeQuesNo, totalQues, question, isSaving } =
		useContext(DataContext);

	const [showHelperText, setShowHelperText] = useState(true);

	// const videoRecordingState = useVideoRecording(question?.id);

	// videoRecordingState.stopRecording

	// const handleTextRecive = useCallback(
	// 	(text) => {
	// 		console.log({ text });

	// 		const foundOption = question?.options?.find(
	// 			(v) => v.text.toLowerCase() === text
	// 		);

	// 		if (foundOption) {
	// 			checkAnswer(foundOption);
	// 		}
	// 	},
	// 	[question?.options, checkAnswer]
	// );

	// useSpeechToText(handleTextRecive);

	return (
		<section className="bg-dark text-white">
			<div className="vh-100 d-flex align-items-center justify-content-center">
				<div className="container">
					{showHelperText && (
						<Alert
							variant={"info"}
							onClose={() => setShowHelperText(false)}
							dismissible>
							Your response will be recorded through voice recognition. No
							clicking is required. Just Say Your Answer Out Loud.
						</Alert>
					)}
					<div className="row align-items-stretch">
						<div className="col-lg-5">
							<div>
								<VideoRecorder />
							</div>
						</div>
						<div className="col-lg-7" style={{ height: "auto" }}>
							{isSaving ? (
								<h1>Saving your response...</h1>
							) : (
								<div
									className="card p-4"
									style={{ background: "#3d3d3d", borderColor: "#646464" }}>
									<h4 className="text-danger fw-bold">
										<span id={"timer-span"}></span>
										{/* <span className="m-2 lead text-white">
												Minutes is remaining for this question
											</span> */}
									</h4>

									<div className="d-flex justify-content-between gap-md-3">
										<h5 className="mb-2 fs-normal lh-base">
											{question?.question}
										</h5>
										<h5
											style={{
												color: "#60d600",
												width: "100px",
												textAlign: "right",
											}}>
											{activeQuesNo} / {totalQues}
										</h5>
									</div>
									<div>
										{question?.options?.map((item, index) => (
											<button
												key={index}
												id={"opt-btn-" + item.id}
												className={`option w-100 text-start btn text-white py-2 px-3 mt-3 rounded btn-dark`}
												disabled>
												{item.text}
											</button>
										))}
									</div>
									{/* {questionIndex + 1 !== quizs.length ? (
										<button
											className="btn py-2 w-100 mt-3 bg-primary text-light fw-bold"
											onClick={() => {
												resetTimer();
												nextQuestion();
												// stopRecording();
											}}
											disabled>
											Next Question
										</button>
									) : (
										<button
											className="btn py-2 w-100 mt-3 bg-primary text-light fw-bold"
											onClick={showTheResult}
											disabled={!selectedAnswer}>
											Show Result
										</button>
									)} */}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Quiz;

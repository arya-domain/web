import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import DataContext from "../context/dataContext";

import { startQuiz as startQuizApi } from "../apis/quizes.apis";

const Start = () => {
	const { startQuiz, showStart } = useContext(DataContext);
	const [isLoading, setisLoading] = useState(false);

	const { id: quizId } = useParams();

	const checkMediaAccess = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			stream.getTracks().forEach((track) => track.stop());
			return true; // Media access granted
		} catch (error) {
			console.error("Error accessing media devices:", error);
			return false; // Media access denied
		}
	};

	const handleStart = async () => {
		try {
			setisLoading(true);
			const isAcessGranted = await checkMediaAccess();
			if (!isAcessGranted) {
				toast.error("Please allow access to camera and audio!");
				return;
			}

			await startQuizApi(quizId);

			startQuiz();
		} catch (error) {
			if (error.response?.data?.message) {
				toast.error(error.response?.data?.message);
				return;
			}

			toast.error("something went wrong!");
		} finally {
			setisLoading(false);
		}
	};

	return (
		<section
			className="text-white text-center bg-dark"
			style={{ display: `${showStart ? "block" : "none"}` }}>
			<div className="container">
				<div className="row vh-100 align-items-center justify-content-center">
					<div className="col-lg-8">
						<div className="mb-4">
							<h1 className="fw-bold ">All The Best!</h1>
							<h5>Start the test by clicking below button</h5>
						</div>
						<button
							onClick={handleStart}
							className="btn px-4 py-2 bg-light text-dark fw-bold"
							disabled={isLoading}>
							{isLoading ? "Loading..." : "Start Test"}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Start;

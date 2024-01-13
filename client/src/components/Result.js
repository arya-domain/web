import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import DataContext from "../context/dataContext";
import { endQuiz as endQuizApi } from "../apis/quizes.apis";

const Result = () => {
	const { showResult, stopRecording } = useContext(DataContext);
	const [isLoading, setisLoading] = useState(false);
	const [isSuccess, setisSuccess] = useState(false);
	const [isError, setisError] = useState(false);
	const { id: quizId } = useParams();

	const navigate = useNavigate();

	const handleEnd = () => {
		navigate("/");
	};

	useEffect(() => {
		if (showResult) {
			stopRecording();

			async function endTest() {
				try {
					setisLoading(true);

					await endQuizApi(quizId);

					toast.success("Test submitted successfully!");

					setisSuccess(true);
					setisError(false);
				} catch (error) {
					if (error.response?.data?.message) {
						toast.error(error.response?.data?.message);
						return;
					}

					setisError(true);
					setisSuccess(false);
					toast.error("something went wrong!");
				} finally {
					setisLoading(false);
				}
			}

			endTest();
		}
	}, [stopRecording, showResult, quizId]);

	return (
		<section
			className="bg-dark text-white"
			style={{ display: `${showResult ? "block" : "none"}` }}>
			<div className="container">
				<div className="row vh-100 align-items-center justify-content-center">
					<div className="col-lg-6">
						{isLoading && <h3 className="mb-3 fw-bold">Loading...</h3>}
						<div
							className={`text-light text-center p-5 rounded ${
								isSuccess ? "bg-success" : isError ? "bg-danger" : "bg-info"
							}`}>
							<h1 className="mb-2 fw-bold">{"Nice"}</h1>
							{isSuccess && (
								<h3 className="mb-3 fw-bold">Test Submitted successfully</h3>
							)}
							{isError && (
								<h3 className="mb-3 fw-bold">Failed To Submit Your Test</h3>
							)}

							<button
								onClick={handleEnd}
								className="btn py-2 px-4 btn-light fw-bold d-inline">
								End
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Result;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import { processResponseAPI } from "../apis/responses.apis";

const Processing = () => {
	const [isLoading, setisLoading] = useState(false);
	const [isSuccess, setisSuccess] = useState(true);
	const [isError, setisError] = useState(false);
	const [score, setscore] = useState(null);
	const { id: quizId } = useParams();

	const navigate = useNavigate();

	const handleEnd = () => {
		navigate("/");
	};

	useEffect(() => {
		processResponseAPI()
			// .then((dt) => {
			// 	setisSuccess(true);
			// 	setscore(dt.score);
			// })
			// .catch((e) => {
			// 	setisError(true);
			// 	console.log(e);
			// })
			.finally(() => {
				// setisLoading(false);
			});
	}, []);

	return (
		<section className="bg-dark text-white">
			<div className="container">
				<div className="row vh-100 align-items-center justify-content-center">
					<div className="col-lg-6">
						{isLoading && (
							<h3 className="mb-3 fw-bold">
								Your response is being processed please wait...
							</h3>
						)}
						{!isLoading && (
							<div
								className={`text-light text-center p-5 rounded ${
									isSuccess ? "bg-success" : isError ? "bg-danger" : "bg-info"
								}`}>
								{isSuccess && (
									<div>
										<h1 className="mb-2 fw-bold">
											Thank you for taking the test!
										</h1>
										<h3 className="mb-3 fw-bold">
											we will email you the score. Stay Tuned.
										</h3>
										<button
											onClick={handleEnd}
											className="btn py-2 px-4 btn-light fw-bold d-inline">
											Go To Dashboard
										</button>
									</div>
								)}
								{isError && (
									<>
										<h3 className="mb-3 fw-bold">
											Failed To Process Your Response
										</h3>
										<h4>
											We have saved your response but we are unable to display
											the result due to unknown error
										</h4>
									</>
								)}

								{/* <button
									onClick={handleEnd}
									className="btn py-2 px-4 btn-light fw-bold d-inline">
									Exit
								</button> */}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Processing;

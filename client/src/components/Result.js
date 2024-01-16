import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import DataContext from "../context/dataContext";

const Result = () => {
	const { showResult, stopVideoRec } = useContext(DataContext);
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
			stopVideoRec();

			async function endTest() {
				try {
					setisLoading(true);

					toast.success("Test submitted successfully!");

					setisSuccess(true);
					setisError(false);
				} catch (error) {
					setisError(true);
					setisSuccess(false);
					toast.error("something went wrong!");
				} finally {
					setisLoading(false);
				}
			}

			endTest();
		}
	}, [stopVideoRec, showResult, quizId]);

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
							{isSuccess && (
								<div>
									<h1 className="mb-2 fw-bold">
										Thank you for taking the test!
									</h1>
									<h3 className="mb-3 fw-bold">Test Submitted successfully</h3>
								</div>
							)}
							{isError && (
								<h3 className="mb-3 fw-bold">Failed To Submit Your Test</h3>
							)}

							<button
								onClick={handleEnd}
								className="btn py-2 px-4 btn-light fw-bold d-inline">
								Exit
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Result;

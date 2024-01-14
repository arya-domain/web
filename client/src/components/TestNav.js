import React, { useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { endQuiz as endQuizApi } from "../apis/quizes.apis";
import DataContext from "../context/dataContext";

const TestNav = () => {
	const { id: quizId } = useParams();
	const [isloading, setisloading] = useState(false);

	const { stopVideoRec } = useContext(DataContext);

	const navigate = useNavigate();

	const handleEndTest = async () => {
		if (!window.confirm("are you sure you want to end this test?")) {
			return;
		}

		try {
			setisloading(true);

			const d = await endQuizApi(quizId);
			stopVideoRec();
			toast.success("Test ended!");

			navigate("/");
		} catch (error) {
			console.log(error);
			if (error.response?.data?.message) {
				toast.error(error.response?.data?.message);
				return;
			}

			toast.error("something went wrong!");
		} finally {
			setisloading(false);
		}
	};

	return (
		<nav className="container navbar navbar-expand-lg navbar-light bg-light">
			<Link className="navbar-brand" to="#">
				<img src="/coop_logo.png" alt="company logo" height={40} /> Corporate
				Name
			</Link>
			<button
				className="navbar-toggler"
				type="button"
				data-toggle="collapse"
				data-target="#navbarText"
				aria-controls="navbarText"
				aria-expanded="false"
				aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			</button>
			<div className="collapse navbar-collapse" id="navbarText">
				{/* <ul className="navbar-nav mr-auto">
					<li className="nav-item active">
						<a className="nav-link" href="#">
							Home <span className="sr-only">(current)</span>
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" href="#">
							Features
						</a>
					</li>
					<li className="nav-item">
						<a className="nav-link" href="#">
							Pricing
						</a>
					</li>
				</ul> */}
			</div>
			<button
				onClick={handleEndTest}
				className="btn btn-danger my-2 my-sm-0"
				type="submit"
				disabled={isloading}>
				{isloading ? "Loading..." : "End Test"}
			</button>
		</nav>
	);
};

export default TestNav;

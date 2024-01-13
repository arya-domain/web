import React from "react";
import Start from "../components/Start";
import Quiz from "../components/Quiz";
import Result from "../components/Result";
import { DataProvider, DataContext } from "../context/dataContext";
import TestNav from "../components/TestNav";

function QuizPage() {
	return (
		<DataProvider>
			<DataContext.Consumer>
				{({ showQuiz, isLoading }) => {
					if (isLoading) {
						return <h1>Loading...</h1>;
					}

					return (
						<>
							{showQuiz && <TestNav />}

							<Start />

							{showQuiz && <Quiz />}

							<Result />
						</>
					);
				}}
			</DataContext.Consumer>
		</DataProvider>
	);
}

export default QuizPage;

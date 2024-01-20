import React from "react";
import Quiz from "../components/Quiz";
import { DataProvider, DataContext } from "../context/dataContext";
import TestNav from "../components/TestNav";

function QuizPage() {
	return (
		<DataProvider>
			<DataContext.Consumer>
				{({ isLoading }) => {
					if (isLoading) {
						return <h1>Loading...</h1>;
					}

					return (
						<>
							<TestNav />
							<Quiz />
						</>
					);
				}}
			</DataContext.Consumer>
		</DataProvider>
	);
}

export default QuizPage;

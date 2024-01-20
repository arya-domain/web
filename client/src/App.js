import React from "react";
import {
	createBrowserRouter,
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider from "./context/AuthProvider";

import Quiz from "./pages/Quiz";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import StartQuiz from "./pages/StartQuiz";
import Processing from "./pages/Processing";

import VideoRecorder from "./components/video";
function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/register" element={<SignUp />} />
					<Route path="/video" element={<VideoRecorder />} />
					<Route path="/login" element={<Login />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<Home />} />
						<Route path="/quiz/:id/start" element={<StartQuiz />} />
						<Route path="/quiz/:id/appearing" element={<Quiz />} />
						<Route path="/quiz/:id/processing" element={<Processing />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;

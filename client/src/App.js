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

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/register" element={<SignUp />} />
					<Route path="/login" element={<Login />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<Home />} />
						<Route path="/quiz/:id" element={<Quiz />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;

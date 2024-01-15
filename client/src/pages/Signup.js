import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthProvider";
import { register } from "../apis/users.apis";

function Registration() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isloading, setisloading] = useState(false);

	const { isAuth } = useAuth();

	const navigate = useNavigate();

	const handleSubmit = async (event) => {
		try {
			setisloading(true);
			event.preventDefault();

			// Perform validations
			if (
				!firstName.trim() ||
				!lastName.trim() ||
				!email.trim() ||
				!password.trim()
			) {
				toast.error("Please fill in all required fields.");
				return;
			}

			// Validate email format (replace with more robust validation)
			if (!email.includes("@")) {
				toast.error("Please enter a valid email address.");
				return;
			}

			await register({
				email: email.trim(),
				password: password.trim(),
				firstName: firstName.trim(),
				lastName: lastName.trim(),
			});

			toast.success("Registration successful!");

			navigate("/login");
		} catch (error) {
			if (error.response?.data?.message) {
				toast.error(error.response?.data?.message);
				return;
			}

			toast.error("something went wrong!");
		} finally {
			setisloading(false);
		}
	};

	if (isAuth) {
		return <Navigate to={"/"} />;
	}

	return (
		<section className="bg-dark">
			<Container
				className="d-flex justify-content-center align-items-center"
				style={{ height: "100vh" }}>
				<div className="w-50 p-4 rounded-3 bg-light">
					<Row>
						<Col>
							<h2 className="text-center mb-4">Registration</h2>
							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-3">
									<Form.Label>First Name</Form.Label>
									<Form.Control
										type="text"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Last Name</Form.Label>
									<Form.Control
										type="text"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Email</Form.Label>
									<Form.Control
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label>Password</Form.Label>
									<Form.Control
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={5}
									/>
								</Form.Group>
								<Button variant="primary" type="submit" disabled={isloading}>
									{isloading ? "Loading..." : "Register"}
								</Button>
							</Form>
							<div className="mt-3">
								<span>If you have an account</span>{" "}
								<span>
									<Link to="/login">login here.</Link>
								</span>
							</div>
						</Col>
					</Row>
				</div>
			</Container>
		</section>
	);
}

export default Registration;

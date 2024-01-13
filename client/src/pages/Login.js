import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

import { login } from "../apis/users.apis";

import { useAuth } from "../context/AuthProvider";

function Login() {
	const [email, setemail] = useState("");
	const [password, setPassword] = useState("");
	const [isloading, setisloading] = useState(false);

	const navigate = useNavigate();
	const { setAuth } = useAuth();

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			setisloading(true);
			event.preventDefault();

			const d = await login({
				email: email.trim(),
				password: password.trim(),
			});

			setAuth({ ...d, isAuth: true });

			toast.success("Login successful!");

			navigate("/");
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

	return (
		<section className="bg-dark">
			<Container
				className="d-flex justify-content-center align-items-center"
				style={{ height: "100vh" }}>
				<Row className="w-25 p-4 rounded-3 bg-light">
					<Col>
						<h2 className="text-center mb-4">Login</h2>
						<Form onSubmit={handleSubmit}>
							<Form.Group className="mb-3">
								<Form.Label>email</Form.Label>
								<Form.Control
									type="email"
									value={email}
									onChange={(e) => setemail(e.target.value)}
								/>
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label>Password</Form.Label>
								<Form.Control
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</Form.Group>
							<Button variant="primary" type="submit" disabled={isloading}>
								{isloading ? "Loading..." : "Login"}
							</Button>
						</Form>
					</Col>
				</Row>
			</Container>
		</section>
	);
}

export default Login;

import React from "react";
import { Outlet, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthProvider";

const ProtectedRoute = () => {
	const { isAuth } = useAuth();

	if (!isAuth) {
		return <Navigate to="/login" />;
	}
	return <Outlet />;
};

export default ProtectedRoute;

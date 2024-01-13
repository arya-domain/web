import React, { createContext, useContext, useState, useCallback } from "react";

import { getUser, setUser, removeUser } from "../utils/storage.utils";

const initialState = { isAuth: false };

export const AuthContext = createContext(initialState);

const AuthProvider = ({ children }) => {
	const [authState, setauthState] = useState(getUser());

	const setAuth = useCallback((user = {}) => {
		setauthState(user);
		setUser(user);
	}, []);

	const logOut = useCallback(() => {
		setauthState({ isAuth: false });
		removeUser();
	}, []);

	const value = {
		...authState,
		setAuth,
		logOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);

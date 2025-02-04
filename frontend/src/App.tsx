import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { createContext, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { lookInSession } from "./services/sessionService";
import { checkAuthorization } from "./services/authService";

export const UserContext = createContext({});

function App() {
  const { userAuth, setUserAuth } = useAuth();

  useEffect(() => {
    checkAuthorization(userAuth, setUserAuth);
  }, []);

  return (
    <Routes>
      <Route index element={userAuth?.accessToken ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/login" element={!userAuth?.accessToken ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!userAuth?.accessToken ? <RegisterPage /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;

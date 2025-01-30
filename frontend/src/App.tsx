import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { createContext, useState } from "react";
import { AuthProvider } from "./context/AuthContext";

export const UserContext = createContext({});

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<RegisterPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

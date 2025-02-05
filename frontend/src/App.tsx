import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { useEffect} from "react";
import { useAuth } from "./context/AuthContext";
import { checkAuthorization } from "./services/authService";

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

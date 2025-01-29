import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { createContext, useState } from "react";

export const UserContext = createContext({});

function App() {
  const [userAuth, setUserAuth] = useState({});

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/movie" element={<HomePage />} />
      </Routes>
    </UserContext.Provider>
  );
}

export default App;

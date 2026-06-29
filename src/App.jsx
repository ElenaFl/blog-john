import {useState} from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from "./components/ui/Header/Header.jsx";
import { Footer } from "./components/ui/Footer/Footer.jsx";
import "./App.css";

export const  App = () => {

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div>
      <Header />
      <Outlet context={{ token, setToken, handleLogout }} />
      <Footer/>
    </div>
  );
}


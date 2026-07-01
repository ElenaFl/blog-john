import { Outlet } from 'react-router-dom';
import { Header } from "./components/ui/Header/Header.jsx";
import { Footer } from "./components/ui/Footer/Footer.jsx";
import "./App.css";

export const  App = () => {

  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}


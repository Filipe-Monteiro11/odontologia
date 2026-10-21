import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Booking from "./pages/Booking.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Booking from "./pages/Booking.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminAvailability from "./pages/AdminAvailability.jsx";
import AdminAppointments from "./pages/AdminAppointments.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<Booking />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/disponibilidade"element={<AdminAvailability />}/>
        <Route path="/admin/consultas"element={<AdminAppointments />}/>
      </Routes>
    </BrowserRouter>
  );
}
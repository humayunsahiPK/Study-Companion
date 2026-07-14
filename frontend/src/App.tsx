import Sidebar from "./pages/components/sidebar.tsx";
import Dashboard from "./pages/dashboard/dashboard.tsx";
import Review from "./pages/review/review.tsx";
import Library from "./pages/library/library.tsx";
import Settings from "./pages/settings/settings.tsx";
import Login from "./pages/login/login.tsx";
import { Routes, Route, useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="app">
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/review" element={<Review />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

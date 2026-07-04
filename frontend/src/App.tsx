import Sidebar from "./pages/components/sidebar.tsx";
import Dashboard from "./pages/dashboard/dashboard.tsx";
import Review from "./pages/review/review.tsx";
import Library from "./pages/library/library.tsx";
import Settings from "./pages/settings/settings.tsx";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <div className="app">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </>
  );
}

export default App;

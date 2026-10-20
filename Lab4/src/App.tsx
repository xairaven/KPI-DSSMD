import { HashRouter, Route, Routes } from "react-router-dom";
import { Home } from "./screens/Home";
import { Students } from "./screens/Students";
import { Failing } from "./screens/Failing";
import { Threshold } from "./screens/Threshold";
import { TopN } from "./screens/TopN";
import "./App.css";

// HashRouter gives each screen a real URL and browser-history back-stack
// (the closest available parallel to Android's startActivity/finish() —
// Tauri's WebView is a single Activity, so there's no such thing as a
// literal second Activity here; see README for the full MVC mapping).
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/failing" element={<Failing />} />
        <Route path="/threshold" element={<Threshold />} />
        <Route path="/top-n" element={<TopN />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme before render to avoid flash
const stored = localStorage.getItem("nexus-theme");
const theme = stored === "light" ? "light" : "dark";
document.documentElement.classList.add(theme);
document.documentElement.classList.remove(theme === "light" ? "dark" : "light");

createRoot(document.getElementById("root")!).render(<App />);

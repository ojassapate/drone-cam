import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DroneStreamProvider } from "./context/DroneStreamContext";

createRoot(document.getElementById("root")!).render(
  <DroneStreamProvider>
    <App />
  </DroneStreamProvider>
);

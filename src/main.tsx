import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanupOldStorageKeys } from "@/lib/vagasPersistence";
import "./seed.ts";

cleanupOldStorageKeys();

createRoot(document.getElementById("root")!).render(<App />);

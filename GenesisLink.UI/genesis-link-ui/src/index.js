import AppRoutes from "./components/AppRoutes";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SmartContractProvider } from "./context/SmartContractContext";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <SmartContractProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </SmartContractProvider>
);

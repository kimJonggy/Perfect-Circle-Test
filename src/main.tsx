import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { Web3Providers } from "./Web3Provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Web3Providers>
      <AppWrapper>
        <App />
      </AppWrapper>
    </Web3Providers>
  </StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import AppGlobalStyles from "./styles/globalStyles";
import { ensureI18nInitialized } from "./lib/i18n";
import { installResultsEscapeShortcut } from "./lib/resultsEscapeShortcut";

ensureI18nInitialized();
installResultsEscapeShortcut();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppGlobalStyles />
    <App />
  </React.StrictMode>
);

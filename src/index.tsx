import "./wdyr";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./providers/App";
import reportHandler from "./reportHandler";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const container = document.getElementById("root");

if (container) {
    createRoot(container).render(<App />);
}

serviceWorkerRegistration.register();

reportWebVitals(reportHandler);

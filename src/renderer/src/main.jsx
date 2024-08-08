import "./assets/index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import ToastContext, { ToastProvider } from "./contexts/ToastContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <FluentProvider theme={webLightTheme}>
    <ToastProvider value={ToastContext.toast}>
      <App />
    </ToastProvider>
  </FluentProvider>
);

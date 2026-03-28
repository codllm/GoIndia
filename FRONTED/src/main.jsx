import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import CaptionContextProvider from "./context/captionContext";
import UserContextProvider from "./context/userContext";
import { RidingDataProvider } from "./context/ridingDataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RidingDataProvider>
    <CaptionContextProvider>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </CaptionContextProvider>
    </RidingDataProvider>
  </React.StrictMode>
);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
          style: {
            background: "#10b981",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
          style: {
            background: "#ef4444",
          },
        },
      }}
    />
  </StrictMode>
);

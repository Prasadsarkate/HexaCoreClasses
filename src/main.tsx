import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

// Google Client ID
const GOOGLE_CLIENT_ID = "13190575168-2riotu11ckf2mkrv256l69vq19jm7ukm.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppWrapper>
        <App />
      </AppWrapper>
    </GoogleOAuthProvider>
  </StrictMode>
);

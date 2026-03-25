import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      );

    if ("caches" in window) {
      void caches
        .keys()
        .then((cacheKeys) => Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey))));
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

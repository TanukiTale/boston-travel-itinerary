import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const RECOVERY_FLAG_KEY = "boston-time-recovery-attempted";
const APP_STORAGE_KEYS = [
  "boston-companion-theme",
  "boston-day-adjustments-v1",
  "boston-removed-stops-v1",
  "boston-added-stops-v1",
  "boston-locked-stops-v1",
  "boston-hidden-stops-v1"
];

function clearAppStorage() {
  for (const key of APP_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch() {
    const hasRecovered = window.sessionStorage.getItem(RECOVERY_FLAG_KEY) === "1";
    if (!hasRecovered) {
      window.sessionStorage.setItem(RECOVERY_FLAG_KEY, "1");
      clearAppStorage();
      window.location.reload();
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>Boston Time</p>
          <p style={{ margin: "0.55rem 0 0", maxWidth: "32rem", lineHeight: 1.4 }}>
            The app hit a loading issue. Tap Reset to clear old cached trip data and
            reload.
          </p>
          <button
            type="button"
            onClick={() => {
              clearAppStorage();
              window.location.reload();
            }}
            style={{
              marginTop: "0.8rem",
              borderRadius: "999px",
              border: "1px solid #7a5f46",
              background: "#f3e5c9",
              padding: "0.45rem 0.9rem",
              fontWeight: 700
            }}
          >
            Reset and Reload
          </button>
        </div>
      </div>
    );
  }
}

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
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);

import React, { useEffect, useState } from "react";

function isIos() {
  return (
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
    !window.navigator.standalone
  );
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isSamsungBrowser() {
  return /samsungbrowser/i.test(window.navigator.userAgent);
}

function isDesktop() {
  const ua = window.navigator.userAgent.toLowerCase();
  return !/iphone|ipad|ipod|android/.test(ua);
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isSamsung, setIsSamsung] = useState(false);

  useEffect(() => {
    // Android: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: check if device and not installed
    if (isIos() && !isInStandaloneMode()) {
      setIsIosDevice(true);
      setShowPrompt(true);
    }

    // Samsung Internet: show prompt if not standalone and not iOS
    if (
      !isIos() &&
      isSamsungBrowser() &&
      !isInStandaloneMode()
    ) {
      setIsSamsung(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      maxWidth: 550,
      borderRadius: 30,
      position: "fixed",
      top: "32px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#000",
      color: "#fff",
      border: "1px solid #333",
      padding: "24px 16px",
      zIndex: 1000,
      textAlign: "center",
      boxShadow: "0 4px 24px rgba(0,0,0,0.25)"
    }}>
      {isIosDevice ? (
        <div>
          <b>Install this app on your iOS device:</b>
          <div style={{ marginTop: 8 }}>
            Tap <span style={{fontWeight:600}}>&#x2191;</span> (Share) and then "Add to Home Screen"
          </div>
          <button style={{ marginTop: 12, background: "#fff", color: "#000", border: "none", padding: "6px 16px", borderRadius: "4px" }} onClick={() => setShowPrompt(false)}>Dismiss</button>
        </div>
      ) : isSamsung ? (
        <div>
          <b>Install this app for a better experience!</b>
          <div style={{ marginTop: 8 }}>
            Tap <b>Menu</b> (<span style={{fontWeight:600}}>&#9776;</span>) and then "Add page to" &rarr; "Home screen"
          </div>
          <button style={{ marginTop: 12, background: "#fff", color: "#000", border: "none", padding: "6px 16px", borderRadius: "4px" }} onClick={() => setShowPrompt(false)}>Dismiss</button>
        </div>
      ) : (
        <div>
          <b>Install this app for a better experience!</b>
          <div>
            <button style={{ margin: "12px 8px 0 0", background: "#fff", color: "#000", border: "none", padding: "6px 16px", borderRadius: "4px" }} onClick={handleInstallClick}>Install</button>
            <button style={{ marginTop: 12, background: "#fff", color: "#000", border: "none", padding: "6px 16px", borderRadius: "4px" }} onClick={() => setShowPrompt(false)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PwaInstallPrompt;

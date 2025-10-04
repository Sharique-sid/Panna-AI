"use client";

import { useEffect } from "react";

export default function EmergencyResetPage() {
  useEffect(() => {
    // Nuclear option - clear everything immediately
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });

      // Force reload
      window.location.href = "/auth/signin?reset=true&t=" + Date.now();
    } catch (error) {
      console.error("Emergency reset error:", error);
      // Fallback - just redirect
      window.location.href = "/auth/signin";
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Resetting storage...</p>
      </div>
    </div>
  );
}


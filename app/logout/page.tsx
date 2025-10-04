"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, LogOut } from "lucide-react";

export default function LogoutPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Signing you out...");
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout API
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Successfully signed out! Redirecting...");
          
          // Clear any remaining localStorage
          localStorage.clear();
          sessionStorage.clear();
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        setStatus("error");
        setMessage("Failed to sign out. Please try again.");
      }
    };

    performLogout();
  }, [router]);

  const handleManualLogout = async () => {
    setStatus("loading");
    setMessage("Signing you out...");
    
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Successfully signed out!");
        localStorage.clear();
        sessionStorage.clear();
        router.push("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Sign Out
          </CardTitle>
          <CardDescription>
            This will completely sign you out and clear all session data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="text-sm">{message}</span>
          </div>

          {status === "error" && (
            <Button onClick={handleManualLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {status === "success" && (
            <div className="text-center text-sm text-muted-foreground">
              You will be redirected to the home page shortly.
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Signs you out on the server</li>
              <li>Clears all auth cookies</li>
              <li>Clears localStorage and sessionStorage</li>
              <li>Redirects to home page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


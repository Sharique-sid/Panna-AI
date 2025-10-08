"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";

export default function ClearCookiesPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Clearing cookies...");
  const [cookiesCleared, setCookiesCleared] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const clearAllCookies = async () => {
      try {
        // First, call the server-side logout
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Server logout failed");
        }

        // Then clear cookies on the client side
        const cookiesToClear = [
          "sb-iuvvmbtqbaauvtojnxjd-auth-token",
          "sb-localhost-auth-token",
          "sb-auth-token",
          "supabase-auth-token",
          "_next_hmr_refresh_hash_",
        ];

        const cleared: string[] = [];
        
        cookiesToClear.forEach(cookieName => {
          // Clear with different domain/path combinations
          const domains = ["localhost", ".localhost", window.location.hostname];
          const paths = ["/", "/dashboard", "/auth"];
          
          domains.forEach(domain => {
            paths.forEach(path => {
              document.cookie = `${cookieName}=; expires=Thu, 01 Oct 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
              document.cookie = `${cookieName}=; expires=Thu, 01 Oct 1970 00:00:00 GMT; path=${path}`;
            });
          });
          
          cleared.push(cookieName);
        });

        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        setCookiesCleared(cleared);
        setStatus("success");
        setMessage("Successfully cleared all cookies and storage!");
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/");
        }, 3000);

      } catch (error) {
        console.error("Cookie clearing error:", error);
        setStatus("error");
        setMessage("Failed to clear cookies. Please try again.");
      }
    };

    clearAllCookies();
  }, [router]);

  const handleManualClear = async () => {
    setStatus("loading");
    setMessage("Clearing cookies...");
    
    try {
      // Clear cookies manually
      const cookiesToClear = [
        "sb-iuvvmbtqbaauvtojnxjd-auth-token",
        "sb-localhost-auth-token",
        "sb-auth-token",
        "supabase-auth-token",
        "_next_hmr_refresh_hash_",
      ];

      const cleared: string[] = [];
      
      cookiesToClear.forEach(cookieName => {
        // Clear with different domain/path combinations
        const domains = ["localhost", ".localhost", window.location.hostname];
        const paths = ["/", "/dashboard", "/auth"];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Oct 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Oct 1970 00:00:00 GMT; path=${path}`;
          });
        });
        
        cleared.push(cookieName);
      });

      localStorage.clear();
      sessionStorage.clear();

      setCookiesCleared(cleared);
      setStatus("success");
      setMessage("Successfully cleared all cookies and storage!");
      
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error) {
      setStatus("error");
      setMessage("Failed to clear cookies. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Clear Cookies
          </CardTitle>
          <CardDescription>
            This will aggressively clear all cookies and storage to fix the 431 error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
            <span className="text-sm">{message}</span>
          </div>

          {cookiesCleared.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Cookies cleared:</p>
              <ul className="list-disc list-inside space-y-1">
                {cookiesCleared.map((cookie, index) => (
                  <li key={index}>{cookie}</li>
                ))}
              </ul>
            </div>
          )}

          {status === "error" && (
            <Button onClick={handleManualClear} className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Try Manual Clear
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
              <li>Calls server-side logout</li>
              <li>Clears all Supabase auth cookies</li>
              <li>Clears localStorage and sessionStorage</li>
              <li>Uses multiple domain/path combinations</li>
              <li>Redirects to home page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


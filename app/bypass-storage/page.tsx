"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, RefreshCw, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BypassStoragePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set a flag to disable persistence
    sessionStorage.setItem('bypass-persistence', 'true');
  }, []);

  const bypassAndLogin = () => {
    setIsProcessing(true);
    
    try {
      // Clear everything
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Oct 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Oct 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Oct 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });

      // Set bypass flag
      sessionStorage.setItem('bypass-persistence', 'true');
      sessionStorage.setItem('force-refresh', Date.now().toString());
      
      setIsComplete(true);
      
      // Redirect to signin with cache busting
      setTimeout(() => {
        window.location.href = "/auth/signin?bypass=true&t=" + Date.now();
      }, 2000);

    } catch (error) {
      console.error("Error in bypass:", error);
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Bypass Complete!</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting to sign in page...
            </p>
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Please wait...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Storage Bypass
          </CardTitle>
          <CardDescription>
            This will completely clear all storage and bypass persistence to fix login issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>What this does:</strong>
            </p>
            <ul className="text-xs text-orange-700 dark:text-orange-300 mt-2 space-y-1">
              <li>• Clears all localStorage and sessionStorage</li>
              <li>• Removes all cookies</li>
              <li>• Disables data persistence temporarily</li>
              <li>• Redirects to sign in page</li>
            </ul>
          </div>

          <Button 
            onClick={bypassAndLogin} 
            className="w-full"
            disabled={isProcessing}
          >
            <User className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing..." : "Bypass Storage & Sign In"}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            This will log you out and clear all local data, but should fix the login issue.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


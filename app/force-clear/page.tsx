"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react";

export default function ForceClearPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {

    const info = {
      localStorage: {},
      sessionStorage: {},
      cookies: document.cookie,
      totalSize: 0
    };

    // Check localStorage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        info.localStorage[key] = {
          size: value.length,
          preview: value.substring(0, 100) + (value.length > 100 ? '...' : '')
        };
        info.totalSize += value.length + key.length;
      }
    }

    // Check sessionStorage
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        const value = sessionStorage[key];
        info.sessionStorage[key] = {
          size: value.length,
          preview: value.substring(0, 100) + (value.length > 100 ? '...' : '')
        };
        info.totalSize += value.length + key.length;
      }
    }

    setStorageInfo(info);
  }, []);

  const forceClearAll = async () => {
    setIsClearing(true);
    
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Oct 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Oct 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Oct 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      });

      // Force reload with cache busting
      setIsCleared(true);
      
      setTimeout(() => {
        window.location.href = "/?t=" + Date.now();
      }, 2000);

    } catch (error) {
      console.error("Error clearing storage:", error);
      setIsClearing(false);
    }
  };

  const clearSpecificKeys = () => {
    setIsClearing(true);
    
    try {
      // Clear specific problematic keys
      const keysToRemove = [
        'notes-store',
        'supabase.auth.token',
        'sb-' + window.location.hostname + '-auth-token',
        'supabase.auth.refresh_token'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      setIsCleared(true);
      
      setTimeout(() => {
        window.location.href = "/?t=" + Date.now();
      }, 2000);

    } catch (error) {
      console.error("Error clearing specific keys:", error);
      setIsClearing(false);
    }
  };

  if (isCleared) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Storage Cleared Successfully!</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting you to the home page...
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Force Clear Storage
          </CardTitle>
          <CardDescription>
            Your browser storage is causing 431 errors. This tool will completely clear all storage data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {storageInfo && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Current Storage Status:</h3>
              <p className="text-sm">
                <strong>Total Size:</strong> {Math.round(storageInfo.totalSize / 1024)} KB
              </p>
              <p className="text-sm">
                <strong>LocalStorage Keys:</strong> {Object.keys(storageInfo.localStorage).length}
              </p>
              <p className="text-sm">
                <strong>SessionStorage Keys:</strong> {Object.keys(storageInfo.sessionStorage).length}
              </p>
              
              {Object.keys(storageInfo.localStorage).length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">LocalStorage Contents:</p>
                  {Object.entries(storageInfo.localStorage).map(([key, value]: [string, any]) => (
                    <div key={key} className="text-xs text-muted-foreground">
                      <strong>{key}:</strong> {Math.round(value.size / 1024)} KB
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={clearSpecificKeys} 
              className="w-full"
              variant="outline"
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear App Data Only
            </Button>
            
            <Button 
              onClick={forceClearAll} 
              className="w-full"
              variant="destructive"
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? "Clearing..." : "Force Clear All Storage"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Option 1:</strong> Clear only app-related data (safer)</p>
            <p><strong>Option 2:</strong> Clear ALL browser storage (more thorough)</p>
            <p className="text-red-600 font-medium">⚠️ This will log you out and clear all local data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


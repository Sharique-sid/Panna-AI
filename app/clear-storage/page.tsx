"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Trash2 } from "lucide-react";

export default function ClearStoragePage() {
  const [storageSize, setStorageSize] = useState<number>(0);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    // Calculate localStorage size
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    setStorageSize(totalSize);
  }, []);

  const clearStorage = () => {
    try {
      // Clear all localStorage data
      localStorage.clear();
      setIsCleared(true);
      setStorageSize(0);
      
      // Redirect to home after clearing
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  const clearNotesStore = () => {
    try {
      // Clear only the notes store
      localStorage.removeItem("notes-store");
      setIsCleared(true);
      
      // Recalculate size
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      setStorageSize(totalSize);
      
      // Redirect to home after clearing
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Error clearing notes store:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Storage Issue Detected
          </CardTitle>
          <CardDescription>
            Your browser storage has grown too large, causing the 431 error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Current storage size:</strong> {Math.round(storageSize / 1024)} KB
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Large storage can cause "Request Header Fields Too Large" errors.
            </p>
          </div>

          {isCleared ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Storage cleared! Redirecting...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={clearNotesStore} 
                className="w-full"
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Notes Data Only
              </Button>
              
              <Button 
                onClick={clearStorage} 
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Storage Data
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>Option 1:</strong> Clear only notes data (recommended)</p>
            <p><strong>Option 2:</strong> Clear all browser storage (more thorough)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


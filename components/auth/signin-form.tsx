"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isExtension, setIsExtension] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    // Check if opened from extension
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('extension') === 'true') {
      setIsExtension(true);
    }
  }, []);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to sign in");
        return;
      }

      toast.success("You have been signed in successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      if (isExtension) {
        // For extension, use a different redirect URL that will send the session back
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?extension=true`
          }
        });

        if (error) {
          // Send error back to extension
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: error.message
            }, window.location.origin);
          }
          return;
        }
      } else {
        // Normal web app flow
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          toast.error(error.message);
          return;
        }
      }
    } catch (error) {
      if (isExtension && window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'Failed to sign in with Google'
        }, window.location.origin);
      } else {
        toast.error("Failed to sign in with Google");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/123-removebg-preview.png"
            alt="Panna.ai"
            className="h-10 w-10 object-contain dark:invert"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = '1';
                target.src = '/123-removebg-preview.jpg';
              }
            }}
          />
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back
          </h1>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full bg-black text-white border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Collapsible Email Form */}
        {showEmailForm && (
          <div className="overflow-hidden">
            <div className="animate-smooth-slide-in">
              <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm underline underline-offset-4 text-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </Form>
            </div>
          </div>
        )}
        
        {!showEmailForm && (
          <div className="animate-smooth-fade-in">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white text-black border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
              onClick={() => setShowEmailForm(!showEmailForm)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Continue with Email
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Account Link */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium underline underline-offset-4 text-foreground hover:text-primary"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-balance text-muted-foreground">
        By continuing, you agree to our{" "}
        <a
          href="#"
          className="underline underline-offset-4 text-foreground hover:text-primary"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline underline-offset-4 text-foreground hover:text-primary"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}

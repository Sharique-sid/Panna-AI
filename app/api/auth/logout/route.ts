import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Sign out the user on the server side
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return NextResponse.json(
        { error: "Failed to sign out user" },
        { status: 500 }
      );
    }

    // Create a response that clears the auth cookie
    const response = NextResponse.json(
      { message: "Successfully signed out" },
      { status: 200 }
    );

    // Clear all possible Supabase auth cookies
    const possibleCookieNames = [
      "sb-localhost-auth-token",
      "sb-auth-token", 
      "supabase-auth-token",
      "sb-iuvvmbtqbaauvtojnxjd-auth-token", // Your specific project cookie
      "sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + "-auth-token"
    ];

    possibleCookieNames.forEach(cookieName => {
      if (cookieName) {
        response.cookies.set({
          name: cookieName,
          value: "",
          expires: new Date(0),
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
    });

    // Also clear any cookies that might exist with the current domain
    const hostname = request.headers.get("host") || "localhost";
    const domain = hostname.includes("localhost") ? "localhost" : `.${hostname.split('.').slice(-2).join('.')}`;
    
    // Clear with different domain/path combinations
    const domainVariations = [domain, "localhost", ".localhost", undefined];
    const pathVariations = ["/", "/dashboard", "/auth"];
    
    possibleCookieNames.forEach(cookieName => {
      domainVariations.forEach(domainVar => {
        pathVariations.forEach(pathVar => {
          response.cookies.set({
            name: cookieName,
            value: "",
            expires: new Date(0),
            path: pathVar,
            domain: domainVar,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        });
      });
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}

// Also support GET requests for easy browser access
export async function GET(request: NextRequest) {
  return POST(request);
}

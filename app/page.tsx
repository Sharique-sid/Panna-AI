import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomePage } from "@/components/home/home-page";

// Updated: January 7, 2025 - Panna.ai v2.0.0
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  // Show landing page for non-authenticated users
  return <HomePage />;
}

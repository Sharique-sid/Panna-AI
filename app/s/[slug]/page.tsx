import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("title")
    .eq("public_share_id", r.slug)
    .eq("is_public", true)
    .single();
  return {
    title: data?.title ? `${data.title} – Panna.ai` : "Shared Note – Panna.ai",
  };
}

export default async function SharedNotePage({ params }: Props) {
  const r = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("title, content, updated_at")
    .eq("public_share_id", r.slug)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center">
        <h1 className="text-2xl font-semibold">Link not found</h1>
        <p className="text-muted-foreground">This shared note is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">{data.title || "Untitled"}</h1>
      <article className="prose max-w-none whitespace-pre-wrap break-words">
        {data.content}
      </article>
      <p className="mt-8 text-xs text-muted-foreground">Last updated: {new Date(data.updated_at).toLocaleString()}</p>
    </div>
  );
}


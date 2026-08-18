import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { ChatMessage } from "@/types";

export async function getLatestConversation(userId: string): Promise<ChatMessage[]> {
  const { data: latest } = await supabaseAdmin
    .from("chat_messages")
    .select("conversation_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ conversation_id: string }>();

  if (!latest) return [];

  const { data } = await supabaseAdmin
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .eq("conversation_id", latest.conversation_id)
    .order("created_at", { ascending: true });

  return data ?? [];
}

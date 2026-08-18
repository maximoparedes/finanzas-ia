import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { client, CHAT_MODEL, buildFinancialContext, buildSystemPrompt } from "@/lib/ai/chat";
import { getTransactionsForMonth } from "@/lib/queries/transactions";
import { getBudgetsForMonth } from "@/lib/queries/budgets";
import { getCurrentMonth } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const message: string = body.message;
  const conversationId: string = body.conversationId;

  if (!message?.trim() || !conversationId) {
    return NextResponse.json({ error: "Falta el mensaje o el ID de conversación" }, { status: 400 });
  }

  const userId = session.user.id;
  const month = getCurrentMonth();

  const [transactions, budgets, { data: history }] = await Promise.all([
    getTransactionsForMonth(userId, month),
    getBudgetsForMonth(userId, month),
    supabaseAdmin
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20)
      .returns<ChatMessage[]>(),
  ]);

  await supabaseAdmin
    .from("chat_messages")
    .insert({ user_id: userId, conversation_id: conversationId, role: "user", content: message });

  const systemPrompt = buildSystemPrompt(buildFinancialContext(month, transactions, budgets));
  const messages = [
    ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: CHAT_MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          output_config: { effort: "medium" },
          messages,
        });

        stream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        const finalMessage = await stream.finalMessage();
        const fullText = finalMessage.content
          .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
          .map((b) => b.text)
          .join("");

        if (fullText) {
          await supabaseAdmin
            .from("chat_messages")
            .insert({ user_id: userId, conversation_id: conversationId, role: "assistant", content: fullText });
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[Hubo un error al generar la respuesta. Probá de nuevo.]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

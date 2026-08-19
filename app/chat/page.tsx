import { auth } from "@/auth";
import { AppShell } from "@/components/layout/AppShell";
import { ChatClient } from "@/components/chat/ChatClient";
import { getLatestConversation } from "@/lib/queries/chat";

export default async function ChatPage() {
  const session = await auth();
  const messages = session?.user?.id ? await getLatestConversation(session.user.id) : [];

  return (
    <AppShell>
      <ChatClient initialMessages={messages} />
    </AppShell>
  );
}

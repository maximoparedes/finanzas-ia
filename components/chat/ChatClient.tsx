'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/types';

interface Props {
  initialMessages: ChatMessage[];
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatClient({ initialMessages }: Props) {
  const [conversationId] = useState(() => initialMessages[0]?.conversation_id ?? crypto.randomUUID());
  const [messages, setMessages] = useState<DisplayMessage[]>(
    initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content }))
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text },
      { id: `assistant-${Date.now()}`, role: 'assistant', content: '' },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId }),
      });

      if (!res.body) throw new Error('Sin respuesta');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: 'No se pudo conectar con el asistente. Probá de nuevo.' };
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 gap-4 max-w-3xl w-full mx-auto min-h-0">
      <h1 className="text-xl font-semibold text-fg">Asistente</h1>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 flex-1 text-center text-fg-subtle">
            <div className="p-3 rounded-2xl bg-accent/10">
              <Sparkles size={22} className="text-accent" aria-hidden />
            </div>
            <p className="text-sm max-w-xs">Preguntame sobre tus gastos, tu presupuesto o pedime consejos.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isStreaming = isLast && sending && m.role === 'assistant';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn('flex items-end gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role === 'assistant' && (
                  <div className="h-6 w-6 shrink-0 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                    <Sparkles size={12} />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed',
                    m.role === 'user' ? 'bg-accent text-white' : 'bg-surface border border-edge text-fg',
                  )}
                >
                  {m.content}
                  {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-accent/70 ml-0.5 -mb-0.5 animate-pulse" />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribí tu pregunta..."
          disabled={sending}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-surface-raised border border-edge text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all disabled:opacity-60"
        />
        <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label="Enviar">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    <div className="flex flex-1 flex-col p-6 gap-4 max-w-3xl w-full mx-auto">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Asistente</h1>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 flex-1 text-center text-slate-400">
            <Sparkles size={24} aria-hidden />
            <p className="text-sm">Preguntame sobre tus gastos, tu presupuesto o pedime consejos.</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              )}
            >
              {m.content || (sending && m.role === 'assistant' ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2">
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
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="p-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:hover:bg-violet-500 text-white transition-colors"
          aria-label="Enviar"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

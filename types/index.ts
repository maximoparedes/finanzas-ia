import type {
  Category,
  CategorySource,
  PaymentMethod,
  TransactionSource,
  TransactionType,
} from '@/lib/types';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  telegram_chat_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: Category;
  date: string; // "YYYY-MM-DD"
  payment_method: PaymentMethod;
  type: TransactionType;
  source: TransactionSource;
  mp_transaction_id: string | null;
  dedupe_hash: string;
  category_source: CategorySource;
  category_confidence: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudget {
  id: string;
  user_id: string;
  month: string; // "YYYY-MM"
  category: Category | null; // null = presupuesto general
  amount: number;
  created_at: string;
}

export interface BudgetAlertLog {
  id: string;
  user_id: string;
  month: string;
  category: Category | null;
  threshold_pct: number;
  sent_at: string;
  channel: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

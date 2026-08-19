import { auth } from '@/auth';
import { AppShell } from '@/components/layout/AppShell';
import { BudgetsClient } from '@/components/budgets/BudgetsClient';
import { getBudgetsForMonth } from '@/lib/queries/budgets';
import { getTransactionsForMonth } from '@/lib/queries/transactions';
import { getCurrentMonth } from '@/lib/utils';

export default async function PresupuestosPage() {
  const session = await auth();
  const month = getCurrentMonth();
  const userId = session?.user?.id;

  const [budgets, transactions] = userId
    ? await Promise.all([getBudgetsForMonth(userId, month), getTransactionsForMonth(userId, month)])
    : [[], []];

  return (
    <AppShell>
      <BudgetsClient initialMonth={month} initialBudgets={budgets} initialTransactions={transactions} />
    </AppShell>
  );
}

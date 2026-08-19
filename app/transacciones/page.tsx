import { auth } from '@/auth';
import { AppShell } from '@/components/layout/AppShell';
import { TransactionsClient } from '@/components/transactions/TransactionsClient';
import { getTransactionsForMonth } from '@/lib/queries/transactions';
import { getCurrentMonth } from '@/lib/utils';

export default async function TransaccionesPage() {
  const session = await auth();
  const month = getCurrentMonth();
  const transactions = session?.user?.id ? await getTransactionsForMonth(session.user.id, month) : [];

  return (
    <AppShell>
      <TransactionsClient initialMonth={month} initialTransactions={transactions} />
    </AppShell>
  );
}

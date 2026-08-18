import { auth } from '@/auth';
import { Nav } from '@/components/layout/Nav';
import { BudgetsClient } from '@/components/budgets/BudgetsClient';
import { getBudgetsForMonth } from '@/lib/queries/budgets';
import { getCurrentMonth } from '@/lib/utils';

export default async function PresupuestosPage() {
  const session = await auth();
  const month = getCurrentMonth();
  const budgets = session?.user?.id ? await getBudgetsForMonth(session.user.id, month) : [];

  return (
    <>
      <Nav />
      <BudgetsClient initialMonth={month} initialBudgets={budgets} />
    </>
  );
}

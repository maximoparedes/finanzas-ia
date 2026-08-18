import { auth } from "@/auth";
import { Nav } from "@/components/layout/Nav";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getTransactionsForMonth } from "@/lib/queries/transactions";
import { getBudgetsForMonth } from "@/lib/queries/budgets";
import { getCurrentMonth } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const month = getCurrentMonth();
  const userId = session?.user?.id;

  const [transactions, budgets] = userId
    ? await Promise.all([getTransactionsForMonth(userId, month), getBudgetsForMonth(userId, month)])
    : [[], []];

  return (
    <>
      <Nav />
      <DashboardClient
        nombre={session?.user?.name ?? session?.user?.email ?? ""}
        initialMonth={month}
        initialTransactions={transactions}
        initialBudgets={budgets}
      />
    </>
  );
}

import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Hola, {session?.user?.name ?? session?.user?.email}
        </h1>
        <SignOutButton />
      </div>
      <p className="text-sm text-neutral-500">
        Dashboard en construcción — próximo paso: CRUD de transacciones y presupuestos.
      </p>
    </main>
  );
}

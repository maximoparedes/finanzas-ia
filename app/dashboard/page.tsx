import { auth } from "@/auth";
import { Nav } from "@/components/layout/Nav";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <>
      <Nav />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold">
          Hola, {session?.user?.name ?? session?.user?.email}
        </h1>
        <p className="text-sm text-neutral-500">
          Dashboard en construcción — próximo paso: proyecciones y gráficos.
        </p>
      </main>
    </>
  );
}

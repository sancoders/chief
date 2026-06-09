import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/forms";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  if (await getSession()) redirect("/panel");
  const { rol } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-900">Crear cuenta</h1>
      <p className="mt-1 text-stone-600">
        Es gratis, tanto para buscar ayuda como para ofrecer tus servicios.
      </p>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <RegisterForm initialRole={rol === "trabajadora" ? "WORKER" : "CLIENT"} />
      </div>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{" "}
        <Link href="/ingresar" className="font-medium text-emerald-700 hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}

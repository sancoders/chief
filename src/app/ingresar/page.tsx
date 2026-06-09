import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/forms";

export const metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (await getSession()) redirect("/panel");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-900">Ingresar</h1>
      <p className="mt-1 text-stone-600">Bienvenida/o de vuelta.</p>
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-medium text-emerald-700 hover:underline">
          Registrate gratis
        </Link>
      </p>
    </div>
  );
}

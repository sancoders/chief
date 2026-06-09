import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAddress } from "@/app/actions/addresses";
import { AddressForm } from "@/components/forms";

export const metadata = { title: "Mis direcciones" };

export default async function AddressesPage() {
  const session = await requireSession();
  const addresses = await db.address.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/perfil" className="text-base text-stone-500 hover:underline">
        ← Mi perfil
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900">Mis direcciones</h1>
      <p className="mt-1 text-base text-stone-600">
        Guardalas una vez y reservá más rápido.
      </p>

      <div className="mt-6 space-y-3">
        {addresses.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-base text-stone-500">
            Todavía no guardaste ninguna dirección.
          </p>
        )}
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div>
              <p className="text-base font-semibold text-stone-900">{address.label}</p>
              <p className="text-base text-stone-600">
                {address.street} · {address.zone}
              </p>
              {address.details && (
                <p className="text-sm text-stone-500">{address.details}</p>
              )}
            </div>
            <form action={deleteAddress}>
              <input type="hidden" name="addressId" value={address.id} />
              <button
                type="submit"
                className="rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Eliminar
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Agregar dirección</h2>
        <div className="mt-4">
          <AddressForm />
        </div>
      </div>
    </div>
  );
}

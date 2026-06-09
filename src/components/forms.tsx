"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { login, register, type FormState } from "@/app/actions/auth";
import { createBooking } from "@/app/actions/bookings";
import { createReview } from "@/app/actions/reviews";
import { updateProfile } from "@/app/actions/profile";
import {
  BOOKING_TYPES,
  SERVICES,
  ZONES,
  calcFee,
  estimateSubtotal,
  formatARS,
  type BookingType,
} from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const labelClass = "block text-sm font-medium text-stone-700 mb-1";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? "Enviando…" : children}
    </button>
  );
}

function ErrorMessage({ state }: { state: FormState }) {
  if (!state.error) return null;
  return (
    <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Contraseña</label>
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>
      <ErrorMessage state={state} />
      <SubmitButton>Ingresar</SubmitButton>
    </form>
  );
}

function WorkerFields({
  defaults,
}: {
  defaults?: {
    bio: string;
    hourlyRate: number;
    yearsExperience: number;
    zones: string[];
    services: string[];
  };
}) {
  return (
    <>
      <div>
        <label htmlFor="bio" className={labelClass}>Sobre vos</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          required
          defaultValue={defaults?.bio}
          placeholder="Contá tu experiencia, qué te gusta hacer y por qué pueden confiar en vos"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="hourlyRate" className={labelClass}>Tarifa por hora (ARS)</label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min={1000}
            step={500}
            required
            defaultValue={defaults?.hourlyRate ?? 6000}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="yearsExperience" className={labelClass}>Años de experiencia</label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            required
            defaultValue={defaults?.yearsExperience ?? 0}
            className={inputClass}
          />
        </div>
      </div>
      <fieldset>
        <legend className={labelClass}>Servicios que ofrecés</legend>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SERVICES).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                name="services"
                value={key}
                defaultChecked={defaults?.services.includes(key)}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={labelClass}>Zonas donde trabajás</legend>
        <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-stone-200 p-3 sm:grid-cols-3">
          {ZONES.map((zone) => (
            <label key={zone} className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                name="zones"
                value={zone}
                defaultChecked={defaults?.zones.includes(zone)}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              {zone}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

export function RegisterForm({ initialRole }: { initialRole: "CLIENT" | "WORKER" }) {
  const [state, action] = useActionState(register, {});
  const [role, setRole] = useState<"CLIENT" | "WORKER">(initialRole);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
        {(
          [
            ["CLIENT", "Busco ayuda"],
            ["WORKER", "Quiero trabajar"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              role === value ? "bg-white text-emerald-700 shadow-sm" : "text-stone-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input type="hidden" name="role" value={role} />
      <div>
        <label htmlFor="name" className={labelClass}>Nombre completo</label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Teléfono / WhatsApp</label>
          <input id="phone" name="phone" type="tel" required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          className={inputClass}
        />
      </div>
      {role === "WORKER" && <WorkerFields />}
      {role === "WORKER" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Después de registrarte vamos a coordinar una entrevista y validación de
          identidad (DNI y referencias) para activar tu perfil como verificada.
        </p>
      )}
      <ErrorMessage state={state} />
      <SubmitButton>Crear cuenta</SubmitButton>
    </form>
  );
}

export function ProfileForm({
  defaults,
}: {
  defaults: {
    bio: string;
    hourlyRate: number;
    yearsExperience: number;
    zones: string[];
    services: string[];
  };
}) {
  const [state, action] = useActionState(updateProfile, {});
  return (
    <form action={action} className="space-y-4">
      <WorkerFields defaults={defaults} />
      <ErrorMessage state={state} />
      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}

export function BookingForm({
  workerId,
  hourlyRate,
  workerZones,
}: {
  workerId: string;
  hourlyRate: number;
  workerZones: string[];
}) {
  const [state, action] = useActionState(createBooking, {});
  const [type, setType] = useState<BookingType>("HORA");
  const [hours, setHours] = useState(4);

  const subtotal = estimateSubtotal(type, hourlyRate, hours);
  const fee = calcFee(subtotal);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="workerId" value={workerId} />
      <div>
        <span className={labelClass}>Tipo de servicio</span>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(BOOKING_TYPES).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key as BookingType)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                type === key
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            {type === "MENSUAL" ? "Fecha de inicio" : "Fecha"}
          </label>
          <input id="date" name="date" type="date" required className={inputClass} />
        </div>
        {type === "HORA" ? (
          <div>
            <label htmlFor="hours" className={labelClass}>Horas</label>
            <input
              id="hours"
              name="hours"
              type="number"
              min={2}
              max={12}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value) || 2)}
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <span className={labelClass}>Duración</span>
            <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
              {type === "DIA" ? "Día completo (8 horas)" : "4 visitas de día completo por mes"}
            </p>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="zone" className={labelClass}>Zona</label>
        <select id="zone" name="zone" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Elegí tu zona
          </option>
          {workerZones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="address" className={labelClass}>Dirección</label>
        <input
          id="address"
          name="address"
          required
          placeholder="Calle y número, piso/depto"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="notes" className={labelClass}>Notas (opcional)</label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Mascotas, llaves, qué priorizar, etc."
          className={inputClass}
        />
      </div>
      <div className="space-y-1 rounded-xl bg-stone-50 p-4 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>
            Trabajo estimado{type === "MENSUAL" && " (por mes)"}
          </span>
          <span>{formatARS(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Tarifa de servicio (15%)</span>
          <span>{formatARS(fee)}</span>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-1 font-semibold text-stone-900">
          <span>Total estimado</span>
          <span>{formatARS(subtotal + fee)}</span>
        </div>
        <p className="pt-1 text-xs text-stone-500">
          Por ahora el pago se coordina directo con la trabajadora (efectivo o
          Mercado Pago). La tarifa de servicio aplica cuando activemos pagos online.
        </p>
      </div>
      <ErrorMessage state={state} />
      <SubmitButton>Enviar solicitud</SubmitButton>
    </form>
  );
}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, action] = useActionState(createReview, {});
  const [rating, setRating] = useState(0);

  return (
    <form action={action} className="space-y-3 rounded-xl bg-stone-50 p-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        <span className="mr-2 text-sm font-medium text-stone-700">Tu calificación:</span>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} estrellas`}
            className={`text-2xl transition ${value <= rating ? "text-amber-500" : "text-stone-300 hover:text-amber-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={2}
        required
        placeholder="¿Cómo fue el servicio?"
        className={inputClass}
      />
      <ErrorMessage state={state} />
      <SubmitButton>Publicar reseña</SubmitButton>
    </form>
  );
}
